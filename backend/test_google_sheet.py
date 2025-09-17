import os
import django
import gspread
from google.oauth2.service_account import Credentials
from dateutil import parser
import re
from decimal import Decimal, InvalidOperation

# ---- Django setup ----
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "testing.settings")
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

# ---- Import students (campus wise) ----
for row in records:
    try:
        campus_name = row.get("Campus") or row.get("Campus Name") or row.get("campus")
        if not campus_name:
            print(f"⚠️ Skipped {row.get('Name')} | No campus given")
            continue

        try:
            campus_obj = Campus.objects.get(name__iexact=campus_name.strip())
        except Campus.DoesNotExist:
            print(f"⚠️ Skipped {row.get('Name')} | Campus '{campus_name}' not found")
            continue

        student = Student.objects.create(
            name=row.get("Name") or row.get("Student Name"),
            gender=(row.get("Gender") or "").strip().lower() if row.get("Gender") else None,
            dob=parse_date(row.get("DOB") or row.get("Date of Birth")),
            place_of_birth=row.get("Place of birth") or row.get("Place of Birth"),
            religion=row.get("Religion"),
            mother_tongue=row.get("Mother tongue") or row.get("Mother Tongue"),
            emergency_contact=row.get("Emergency contact") or row.get("Emergency Contact Number"),
            primary_phone=row.get("Primary phone") or row.get("Father Contact Number"),
            father_name=row.get("Father name") or row.get("Father Name"),
            father_cnic=row.get("Father CNIC"),
            father_contact=row.get("Father contact") or row.get("Father Contact Number"),
            father_occupation=row.get("Father occupation") or row.get("Father Occupation"),
            secondary_phone=row.get("Secondary phone"),
            guardian_name=row.get("Guardian name") or row.get("Guardian Name"),
            guardian_cnic=row.get("Guardian CNIC"),
            guardian_occupation=row.get("Guardian occupation") or row.get("Guardian Occupation"),
            mother_name=row.get("Mother name") or row.get("Mother Name"),
            mother_cnic=row.get("Mother CNIC"),
            mother_status=row.get("Mother status") or row.get("Mother Status: "),
            mother_contact=row.get("Mother contact") or row.get("Mother Contact Number"),
            mother_occupation=row.get("Mother occupation") or row.get("Mother Occupation"),
            zakat_status=row.get("Zakat status") or row.get("Zakat Status:"),
            address=row.get("Address"),
            family_income=parse_decimal(row.get("Family income") or row.get("Family Income")),
            house_owned=True if str(row.get("House owned") or row.get("House Owned")).lower() in ["yes", "true", "1"] else False,
            rent_amount=parse_decimal(row.get("Rent amount") or row.get("House rent")),
            current_state=row.get("Current state") or "active",
            campus=campus_obj,
            current_grade=row.get("Current grade") or row.get("Current Grade/Class"),
            section=row.get("Section"),
            reason_for_transfer=row.get("Reason for transfer"),
            to_year=row.get("To year") or row.get("Year of Admission"),
            from_year=row.get("From year"),
            last_class_passed=row.get("Last class passed") or row.get("Last Class Passed"),
            last_school_name=row.get("Last school name") or row.get("Last School Name"),
            old_gr_no=row.get("Old GR No"),
            is_draft=False,
        )
        print(f"✅ Added: {student.name} → {campus_obj.name}")
    except Exception as e:
        print(f"❌ Error adding student: {row.get('Name') or row.get('Student Name')} | {e}")

print("🎉 Import completed (GR No skipped)!")

