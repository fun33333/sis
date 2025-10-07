import os
import django
import gspread
from google.oauth2.service_account import Credentials
from dateutil import parser
import re
from django.utils.crypto import get_random_string

# ---- Django setup ----
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from campus.models import Campus


# ---- Helper functions ----
def parse_date(value):
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    try:
        return parser.parse(str(value)).date()
    except Exception:
        return None


def safe_string(value):
    """Safely convert value to string, return None if empty"""
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    return str(value).strip()


def safe_integer(value):
    """Safely convert value to integer"""
    if not value or str(value).strip() == "":
        return None
    try:
        val = str(value).strip()
        # Handle year or numeric formats
        year_match = re.search(r'\b(19|20)\d{2}\b', val)
        if year_match:
            return int(year_match.group())
        return int(float(val))
    except (ValueError, TypeError):
        return None


def safe_boolean(value):
    """Convert Yes/No or True/False strings to boolean"""
    if not value:
        return False
    val = str(value).strip().lower()
    return val in ["yes", "true", "1", "y", "available"]


def get_field(row, *possible_names):
    """Try multiple possible header names"""
    for name in possible_names:
        for key in row.keys():
            if key.strip().lower() == name.strip().lower():
                return row[key]
    return None


def generate_campus_code(campus_name, city):
    """Generate unique campus code"""
    prefix = (city or "CITY")[:3].upper()
    suffix = get_random_string(4).upper()
    return f"{prefix}-{suffix}"


# ---- Google Sheets auth ----
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
client = gspread.authorize(creds)

# ---- Open the sheet ----
spreadsheet_id = "1kA7hT5-7X8eNq3Cq-eSepB4y_D2TM1iYFqjLsvvz-ic"
sheet = client.open_by_key(spreadsheet_id).worksheet("Form Responses 1")

# ---- Fetch records ----
records = sheet.get_all_records()
if not records:
    print("⚠ No data found in Google Sheet.")
    exit()

print("🧾 Sheet Columns:", list(records[0].keys()))

success_count = 0
error_count = 0

for row in records:
    try:
        campus_name = safe_string(get_field(row, "Enter campus name", "Campus Name", "Campus"))
        if not campus_name:
            print("⚠ Skipped row: No campus name provided")
            error_count += 1
            continue

        city = safe_string(get_field(row, "City"))
        postal_code = safe_string(get_field(row, "Postal Code", "Zip Code")) or "00000"

        campus_data = {
            "campus_name": campus_name,
            "registration_number": safe_string(get_field(row, "Enter campus registration number")),
            "instruction_language": safe_string(get_field(row, "Language(s) of Instruction", "Language")),
            "academic_year_start": parse_date(get_field(row, "Academic Year Start")),
            "academic_year_end": parse_date(get_field(row, "Academic Year End")),
            "address_full": safe_string(get_field(row, "Address", "Address ")),
            "city": city,
            "district": safe_string(get_field(row, "District")),
            "postal_code": postal_code,
            "primary_phone": safe_string(get_field(row, "School Primary phone")),
            "secondary_phone": safe_string(get_field(row, "School Secondary phone")),
            "official_email": safe_string(get_field(row, "Enter school official email")),
            "campus_head_name": safe_string(get_field(row, "Enter campus head name")),
            "campus_head_phone": safe_string(get_field(row, "Enter Campus Head Phone Number")),
            "campus_head_email": safe_string(get_field(row, "Enter campus head email")),
            "total_staff_members": safe_integer(get_field(row, "Enter Total Staff Members")) or 0,
            "total_teachers": safe_integer(get_field(row, "Enter Total Teachers")) or 0,
            "total_coordinators": safe_integer(get_field(row, "Enter Total Coordinators")) or 0,
            "total_maids": safe_integer(get_field(row, "Enter Total Maids")) or 0,
            "total_guards": safe_integer(get_field(row, "Enter Total Guards")) or 0,
            "established_year": safe_integer(get_field(row, "Enter Campus Established Year")),
            "shift_available": safe_string(get_field(row, "Shift Available")) or "Morning",
            "grades_available": safe_string(get_field(row, "Education Level Available")),
            "student_capacity": safe_integer(get_field(row, "Enter Total Students capacity")) or 0,
            "total_students": safe_integer(get_field(row, "Enter Current Students capacity")) or 0,
            "status": safe_string(get_field(row, "Status")) or "Active",
            "total_rooms": safe_integer(get_field(row, "Enter Total No of Rooms")) or 0,
            "total_classrooms": safe_integer(get_field(row, "Enter Total no of classrooms")) or 0,
            "avg_class_size": safe_integer(get_field(row, "What is  Average Class Size")) or 0,
            "num_computer_labs": safe_integer(get_field(row, "No.of Computer Lab")) or 0,
            "num_science_labs": safe_integer(get_field(row, "No. of Science Lab")) or 0,
            "sports_facility": safe_boolean(get_field(row, "Sports facilities")),
            "teacher_transport": safe_boolean(get_field(row, "Teacher Transport facility")),
            "canteen_facility": safe_boolean(get_field(row, "Canteen facility")),
            "meal_program": safe_boolean(get_field(row, "Meal Programs")),
            "male_staff_washrooms": safe_integer(get_field(row, "Male Washrooms")) or 0,
            "female_staff_washrooms": safe_integer(get_field(row, "Female  Washrooms")) or 0,
            "male_student_washrooms": safe_integer(get_field(row, "Boys Washrooms")) or 0,
            "female_student_washrooms": safe_integer(get_field(row, "Girls Washrooms")) or 0,
        }

        # ✅ Generate a campus_code if not provided or duplicate
        campus_code = generate_campus_code(campus_name, city)
        campus_data["campus_code"] = campus_code

        # ✅ Create or update campus safely
        campus, created = Campus.objects.get_or_create(
            campus_name=campus_name,
            defaults=campus_data
        )

        if created:
            print(f"✅ Added Campus: {campus.campus_name}")
        else:
            print(f"🔄 Updated Campus: {campus.campus_name}")
            for key, value in campus_data.items():
                setattr(campus, key, value)
            campus.save()

        success_count += 1

    except Exception as e:
        print(f"❌ Error importing campus '{campus_name}' | {e}")
        error_count += 1

print("\n🎉 Campus Import Completed!")
print(f"✅ Success: {success_count}")
print(f"❌ Errors: {error_count}")
