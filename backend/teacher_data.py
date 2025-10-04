import os
import django
import gspread
from google.oauth2.service_account import Credentials
from dateutil import parser
import re

# ---- Django setup ----
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from campus.models import Campus
from teachers.models import Teacher


# ---- Helper: date parsing ----
def parse_date(value):
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    try:
        return parser.parse(str(value)).date()
    except Exception:
        return None


# ---- Helper: safe string parsing ----
def safe_string(value):
    """Safely convert value to string, return None if empty"""
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    return str(value).strip()


# ---- Helper: safe integer parsing ----
def safe_integer(value):
    """Safely convert value to integer, return None if invalid"""
    if not value or str(value).strip() == "":
        return None
    try:
        # Extract year from various formats
        val = str(value).strip()
        
        # Handle cases like "2018 Octubar", "Octubar 25", "25/6/2001", "17-09-1988"
        if any(month in val.lower() for month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
            # Extract year from text like "2018 Octubar"
            year_match = re.search(r'\b(19|20)\d{2}\b', val)
            if year_match:
                return int(year_match.group())
        
        # Handle date formats like "25/6/2001", "17-09-1988"
        if '/' in val or '-' in val:
            # Try to extract year from date
            year_match = re.search(r'\b(19|20)\d{2}\b', val)
            if year_match:
                return int(year_match.group())
        
        # Handle pure year
        if val.isdigit() and len(val) == 4:
            return int(val)
        
        # Handle other numeric formats
        return int(float(val))
    except (ValueError, TypeError):
        return None


# ---- Google Sheets auth ----
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
client = gspread.authorize(creds)

# ---- Open the sheet ----
spreadsheet_id = "1nFdTVKD6nWZGbnmzA6Bja9PvZpf5M9syjlBCyz31EBk"
sheet = client.open_by_key(spreadsheet_id).worksheet("Teacher Form")

# ---- Clean expected headers (exact from sheet) ----
expected_headers = [
    "Timestamp",
    "Full Name:",
    "Date of Birth:",
    "Gender:",
    "Contact Number:",
    "Email Address:",
    "Permanent Address:",
    "Temporary Address (if different):",
    "Marital Status:",
    "Level",
    "Last Institute Name",
    " Year of Passing",   # space ke sath
    "Specialization",
    "Grade",
    "Last Education",
    "Last Organization Name",
    "Position/Designation",
    "Last work Start Date",
    "Subjects/Classes Taught (If any)",
    "Responsibilities/Assignments",
    "Date of Joining of Current School",
    "Classes",
    "Subjects Taught",
    "Additional Responsibilities",
    "Shift:",
    "Select Campus",
    "Emergency Contact Number",
    "Emergency Contact Name and Relationship",
    "Last day of Previous work",
    "CNIC",
    "Issue Date of CNIC",
    "Expiry date of CNIC",
    "Email address",
    "Class teacher of class",
    "If class teacher",
    "Section",
    "B-Form/ Birth Certificate",
]

records = sheet.get_all_records(expected_headers=expected_headers)

# ---- Import teachers ----
success_count = 0
error_count = 0

for row in records:
    try:
        # Skip if no email (required field)
        email = row.get("Email Address:") or row.get("Email address")
        if not email or not safe_string(email):
            print(f"⚠️ Skipped {row.get('Full Name:')} | No email provided")
            error_count += 1
            continue

        # Campus fetch
        campus_name = row.get("Select Campus") or row.get("Campus")
        campus_obj = None
        if campus_name:
            try:
                campus_obj = Campus.objects.get(campus_name__iexact=campus_name.strip())
            except Campus.DoesNotExist:
                print(f"⚠️ Skipped {row.get('Full Name:')} | Campus '{campus_name}' not found")
                error_count += 1
                continue

        # Create teacher data with only valid fields
        teacher_data = {
            'email': email,
            'save_status': 'final',  # Set as final instead of draft
            # SKIP employee_code - will be assigned manually later
        }
        
        # Only add fields if they have valid values
        if safe_string(row.get("Full Name:")):
            teacher_data['full_name'] = safe_string(row.get("Full Name:"))
        
        if parse_date(row.get("Date of Birth:")):
            teacher_data['dob'] = parse_date(row.get("Date of Birth:"))
        
        if safe_string(row.get("Gender:")):
            teacher_data['gender'] = safe_string(row.get("Gender:")).lower()
        
        if safe_string(row.get("Contact Number:")):
            teacher_data['contact_number'] = safe_string(row.get("Contact Number:"))
        
        if safe_string(row.get("Permanent Address:")):
            teacher_data['permanent_address'] = safe_string(row.get("Permanent Address:"))
        
        if safe_string(row.get("Temporary Address (if different):")):
            teacher_data['current_address'] = safe_string(row.get("Temporary Address (if different):"))
        
        if safe_string(row.get("Marital Status:")):
            teacher_data['marital_status'] = safe_string(row.get("Marital Status:")).lower()
        
        # Education Information
        if safe_string(row.get("Level")):
            teacher_data['education_level'] = safe_string(row.get("Level"))
        
        if safe_string(row.get("Last Institute Name")):
            teacher_data['institution_name'] = safe_string(row.get("Last Institute Name"))
        
        if safe_integer(row.get(" Year of Passing")):
            teacher_data['year_of_passing'] = safe_integer(row.get(" Year of Passing"))
        
        if safe_string(row.get("Specialization")):
            teacher_data['education_subjects'] = safe_string(row.get("Specialization"))
        
        if safe_string(row.get("Grade")):
            teacher_data['education_grade'] = safe_string(row.get("Grade"))
        
        # Experience Information
        if safe_string(row.get("Last Organization Name")):
            teacher_data['previous_institution_name'] = safe_string(row.get("Last Organization Name"))
        
        if safe_string(row.get("Position/Designation")):
            teacher_data['previous_position'] = safe_string(row.get("Position/Designation"))
        
        if parse_date(row.get("Last work Start Date")):
            teacher_data['experience_from_date'] = parse_date(row.get("Last work Start Date"))
        
        if parse_date(row.get("Last day of Previous work")):
            teacher_data['experience_to_date'] = parse_date(row.get("Last day of Previous work"))
        
        if safe_string(row.get("Subjects/Classes Taught (If any)")):
            teacher_data['experience_subjects_classes_taught'] = safe_string(row.get("Subjects/Classes Taught (If any)"))
        
        if safe_string(row.get("Responsibilities/Assignments")):
            teacher_data['previous_responsibilities'] = safe_string(row.get("Responsibilities/Assignments"))
        
        # Current Role Information
        if parse_date(row.get("Date of Joining of Current School")):
            teacher_data['role_start_date'] = parse_date(row.get("Date of Joining of Current School"))
        
        if safe_string(row.get("Classes")):
            teacher_data['current_classes_taught'] = safe_string(row.get("Classes"))
        
        if safe_string(row.get("Subjects Taught")):
            teacher_data['current_subjects'] = safe_string(row.get("Subjects Taught"))
        
        if safe_string(row.get("Additional Responsibilities")):
            teacher_data['current_extra_responsibilities'] = safe_string(row.get("Additional Responsibilities"))
        
        if campus_obj:
            teacher_data['current_campus'] = campus_obj

        # Use get_or_create instead of update_or_create to avoid duplicate key issues
        teacher, created = Teacher.objects.get_or_create(
            email=email,
            defaults=teacher_data
        )

        if created:
            print(f"✅ Added New Teacher: {teacher.full_name} (Email: {teacher.email})")
        else:
            print(f"🔄 Teacher already exists: {teacher.full_name} (Email: {teacher.email})")
        success_count += 1

    except Exception as e:
        print(f"❌ Error processing teacher {row.get('Full Name:')} | {e}")
        error_count += 1

print(f"\n🎉 Teacher Import Completed!")
print(f"✅ Success: {success_count} teachers")
print(f"❌ Errors: {error_count} teachers")
print(f"\n📝 Note: Employee codes will be assigned manually later")