import os
import django
import gspread
from google.oauth2.service_account import Credentials
from dateutil import parser
import re
from decimal import Decimal, InvalidOperation

# ---- Django setup ----
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from campus.models import Campus
from students.models import Student


# ---- Helper: date parsing ----
def parse_date(value):
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    try:
        return parser.parse(str(value)).date()
    except Exception:
        return None


# ---- Helper: decimal parsing ----
def parse_decimal(value):
    if not value:
        return None
    try:
        val = str(value).replace(",", "").strip()
        if "-" in val:
            val = val.split("-")[0]
        if not re.match(r"^\d+(\.\d+)?$", val):
            return None
        return Decimal(val)
    except (InvalidOperation, ValueError):
        return None


# ---- Helper: safe string parsing ----
def safe_string(value):
    """Safely convert value to string, return None if empty"""
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    return str(value).strip()


# ---- Helper: safe boolean parsing ----
def safe_boolean(value):
    """Safely convert value to boolean"""
    if not value:
        return False  # Default to False instead of None
    return str(value).lower() in ["yes", "true", "1", "y"]


# ---- Helper: safe integer parsing ----
def safe_integer(value):
    """Safely convert value to integer"""
    if not value:
        return None
    try:
        return int(str(value).strip())
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
spreadsheet_id = "1sRIR0vtRzl6E6ZScN_Keqimz6qgn3jwd4PBNvvhPy-4"
sheet = client.open_by_key(spreadsheet_id).sheet1
records = sheet.get_all_records()

# ---- Debug: Check available campus names ----
print("🔍 Available campuses in database:")
for campus in Campus.objects.all():
    print(f"  - ID: {campus.id}, Name: {campus.campus_name}, Code: {campus.campus_code}")

print("\n" + "="*50 + "\n")

# ---- Import students (campus wise) ----
success_count = 0
error_count = 0

for row in records:
    try:
        # Get campus name from various possible column names
        campus_name = (
            row.get("Campus") or 
            row.get("Campus Name") or 
            row.get("campus") or
            row.get("Campus_Name") or
            row.get("CAMPUS")
        )
        
        if not campus_name:
            print(f"⚠️ Skipped {row.get('Name')} | No campus given")
            error_count += 1
            continue

        # Try to find campus by new field name (campus_name)
        try:
            campus_obj = Campus.objects.get(campus_name__iexact=campus_name.strip())
        except Campus.DoesNotExist:
            print(f"⚠️ Campus '{campus_name}' not found. Available campuses:")
            for campus in Campus.objects.all():
                print(f"    - {campus.campus_name} (Code: {campus.campus_code})")
            error_count += 1
            continue

        # Create student with all fields optional
        student_data = {
            'campus': campus_obj,
            'is_draft': False,
        }
        
        # Only add fields if they have values - using CORRECT field names
        if safe_string(row.get("Name") or row.get("Student Name")):
            student_data['name'] = safe_string(row.get("Name") or row.get("Student Name"))
        
        if safe_string(row.get("Gender")):
            student_data['gender'] = safe_string(row.get("Gender")).lower()
        
        if parse_date(row.get("DOB") or row.get("Date of Birth")):
            student_data['dob'] = parse_date(row.get("DOB") or row.get("Date of Birth"))
        
        if safe_string(row.get("Place of birth") or row.get("Place of Birth")):
            student_data['place_of_birth'] = safe_string(row.get("Place of birth") or row.get("Place of Birth"))
        
        if safe_string(row.get("Religion")):
            student_data['religion'] = safe_string(row.get("Religion"))
        
        if safe_string(row.get("Mother tongue") or row.get("Mother Tongue")):
            student_data['mother_tongue'] = safe_string(row.get("Mother tongue") or row.get("Mother Tongue"))
        
        if safe_string(row.get("Emergency contact") or row.get("Emergency Contact Number")):
            student_data['emergency_contact'] = safe_string(row.get("Emergency contact") or row.get("Emergency Contact Number"))
        
        # FIXED: primary_phone -> father_contact
        if safe_string(row.get("Primary phone") or row.get("Father Contact Number")):
            student_data['father_contact'] = safe_string(row.get("Primary phone") or row.get("Father Contact Number"))
        
        if safe_string(row.get("Father name") or row.get("Father Name")):
            student_data['father_name'] = safe_string(row.get("Father name") or row.get("Father Name"))
        
        if safe_string(row.get("Father CNIC")):
            student_data['father_cnic'] = safe_string(row.get("Father CNIC"))
        
        if safe_string(row.get("Father contact") or row.get("Father Contact Number")):
            student_data['father_contact'] = safe_string(row.get("Father contact") or row.get("Father Contact Number"))
        
        if safe_string(row.get("Father occupation") or row.get("Father Occupation")):
            student_data['father_occupation'] = safe_string(row.get("Father occupation") or row.get("Father Occupation"))
        
        # FIXED: secondary_phone -> guardian_contact (if exists) or skip
        if safe_string(row.get("Secondary phone")):
            student_data['guardian_contact'] = safe_string(row.get("Secondary phone"))
        
        if safe_string(row.get("Guardian name") or row.get("Guardian Name")):
            student_data['guardian_name'] = safe_string(row.get("Guardian name") or row.get("Guardian Name"))
        
        if safe_string(row.get("Guardian CNIC")):
            student_data['guardian_cnic'] = safe_string(row.get("Guardian CNIC"))
        
        if safe_string(row.get("Guardian occupation") or row.get("Guardian Occupation")):
            student_data['guardian_occupation'] = safe_string(row.get("Guardian occupation") or row.get("Guardian Occupation"))
        
        if safe_string(row.get("Mother name") or row.get("Mother Name")):
            student_data['mother_name'] = safe_string(row.get("Mother name") or row.get("Mother Name"))
        
        if safe_string(row.get("Mother CNIC")):
            student_data['mother_cnic'] = safe_string(row.get("Mother CNIC"))
        
        if safe_string(row.get("Mother status") or row.get("Mother Status: ")):
            student_data['mother_status'] = safe_string(row.get("Mother status") or row.get("Mother Status: "))
        
        if safe_string(row.get("Mother contact") or row.get("Mother Contact Number")):
            student_data['mother_contact'] = safe_string(row.get("Mother contact") or row.get("Mother Contact Number"))
        
        if safe_string(row.get("Mother occupation") or row.get("Mother Occupation")):
            student_data['mother_occupation'] = safe_string(row.get("Mother occupation") or row.get("Mother Occupation"))
        
        if safe_string(row.get("Zakat status") or row.get("Zakat Status:")):
            student_data['zakat_status'] = safe_string(row.get("Zakat status") or row.get("Zakat Status:"))
        
        if safe_string(row.get("Address")):
            student_data['address'] = safe_string(row.get("Address"))
        
        if parse_decimal(row.get("Family income") or row.get("Family Income")):
            student_data['family_income'] = parse_decimal(row.get("Family income") or row.get("Family Income"))
        
        # FIXED: Always provide house_owned with default value
        house_owned_value = row.get("House owned") or row.get("House Owned")
        student_data['house_owned'] = safe_boolean(house_owned_value)
        
        if parse_decimal(row.get("Rent amount") or row.get("House rent")):
            student_data['rent_amount'] = parse_decimal(row.get("Rent amount") or row.get("House rent"))
        
        if safe_string(row.get("Current state")):
            student_data['current_state'] = safe_string(row.get("Current state"))
        
        if safe_string(row.get("Current grade") or row.get("Current Grade/Class")):
            student_data['current_grade'] = safe_string(row.get("Current grade") or row.get("Current Grade/Class"))
        
        if safe_string(row.get("Section")):
            student_data['section'] = safe_string(row.get("Section"))
        
        if safe_string(row.get("Reason for transfer")):
            student_data['reason_for_transfer'] = safe_string(row.get("Reason for transfer"))
        
        # FIXED: to_year -> enrollment_year
        if safe_integer(row.get("To year") or row.get("Year of Admission")):
            student_data['enrollment_year'] = safe_integer(row.get("To year") or row.get("Year of Admission"))
        
        if safe_integer(row.get("From year")):
            student_data['from_year'] = safe_integer(row.get("From year"))
        
        if safe_string(row.get("Last class passed") or row.get("Last Class Passed")):
            student_data['last_class_passed'] = safe_string(row.get("Last class passed") or row.get("Last Class Passed"))
        
        if safe_string(row.get("Last school name") or row.get("Last School Name")):
            student_data['last_school_name'] = safe_string(row.get("Last school name") or row.get("Last School Name"))
        
        # FIXED: old_gr_no -> gr_no
        if safe_string(row.get("Old GR No")):
            student_data['gr_no'] = safe_string(row.get("Old GR No"))

        # Create student with only the fields that have values
        student = Student.objects.create(**student_data)
        print(f"✅ Added: {student.name or 'Unnamed'} → {campus_obj.campus_name}")
        success_count += 1
        
    except Exception as e:
        print(f"❌ Error adding student: {row.get('Name') or row.get('Student Name') or 'Unknown'} | {e}")
        error_count += 1

print(f"\n🎉 Import completed!")
print(f"✅ Success: {success_count} students")
print(f"❌ Errors: {error_count} students")

