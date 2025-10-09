# test_google_sheet.py me ye complete code replace karo
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
from classes.models import ClassRoom, Grade, Level
from teachers.models import Teacher

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

# ---- Helper: Teacher Assignment ----
def assign_teachers_to_classrooms():
    """Assign teachers to classrooms based on campus and grade"""
    from django.db.models import Q
    
    # Get all classrooms without teachers
    classrooms_without_teachers = ClassRoom.objects.filter(class_teacher__isnull=True)
    print(f"Found {classrooms_without_teachers.count()} classrooms without teachers")
    
    assigned_count = 0
    
    for classroom in classrooms_without_teachers:
        try:
            # Find teachers for this campus and grade
            campus = classroom.grade.level.campus
            grade_name = classroom.grade.name
            
            # Try to find a teacher for this specific grade
            teacher = Teacher.objects.filter(
                current_campus=campus,
                current_subjects__icontains=grade_name
            ).first()
            
            # If no specific teacher found, find any teacher for this campus
            if not teacher:
                teacher = Teacher.objects.filter(
                    current_campus=campus
                ).first()
            
            if teacher:
                classroom.class_teacher = teacher
                classroom.save()
                print(f"Assigned {teacher.name} to {classroom}")
                assigned_count += 1
            else:
                print(f"No teacher found for {classroom}")
                
        except Exception as e:
            print(f"Error assigning teacher to {classroom}: {e}")
    
    print(f"Assigned teachers to {assigned_count} classrooms")

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
print("Available campuses in database:")
for campus in Campus.objects.all():
    print(f"  - ID: {campus.id}, Name: {campus.campus_name}, Code: {campus.campus_code}")

print("\n" + "="*50 + "\n")

# ---- Import students with classroom assignment ----
success_count = 0
error_count = 0

for row in records:
    try:
        # Get campus name
        campus_name = (
            row.get("Campus") or 
            row.get("Campus Name") or 
            row.get("campus") or
            row.get("Campus_Name") or
            row.get("CAMPUS")
        )
        
        if not campus_name:
            print(f"Skipped {row.get('Name')} | No campus given")
            error_count += 1
            continue

        # Find campus
        try:
            campus_obj = Campus.objects.get(campus_name__iexact=campus_name.strip())
        except Campus.DoesNotExist:
            print(f"Campus '{campus_name}' not found")
            error_count += 1
            continue

        # Get grade and section
        grade_name = safe_string(row.get("Current grade") or row.get("Current Grade/Class"))
        section_name = safe_string(row.get("Section"))
        
        # Create student data with BOTH campus and classroom
        student_data = {
            'name': safe_string(row.get("Name") or row.get("Student Name")),
            'campus': campus_obj,  # Keep campus field
            'current_grade': grade_name,  # Keep grade field
            'section': section_name,  # Keep section field
            'is_draft': False,
        }
        
        # Try to find classroom for assignment
        if grade_name and section_name:
            try:
                # Find grade with multiple variations
                grade_name_variations = [
                    grade_name.strip(),
                    grade_name.strip().replace('-', ' '),
                    grade_name.strip().replace(' ', '-'),
                    f"Grade {grade_name.strip().replace('Grade', '').strip()}",
                    grade_name.strip().replace('KG-', 'KG '),
                    grade_name.strip().replace('KG ', 'KG-'),
                    grade_name.strip().replace('KG-I', 'KG 1'),
                    grade_name.strip().replace('KG-II', 'KG 2'),
                    grade_name.strip().replace('KG 1', 'KG-I'),
                    grade_name.strip().replace('KG 2', 'KG-II'),
                    grade_name.strip().replace('KG-1', 'KG-I'),
                    grade_name.strip().replace('KG-2', 'KG-II'),
                    grade_name.strip().replace('KG1', 'KG-I'),
                    grade_name.strip().replace('KG2', 'KG-II'),
                    # Add more variations for better matching
                    grade_name.strip().replace('KG-1', 'KG-I'),
                    grade_name.strip().replace('KG-2', 'KG-II'),
                    grade_name.strip().replace('KG1', 'KG-I'),
                    grade_name.strip().replace('KG2', 'KG-II'),
                    grade_name.strip().replace('KG 1', 'KG-I'),
                    grade_name.strip().replace('KG 2', 'KG-II'),
                ]
                
                grade = None
                for grade_var in grade_name_variations:
                    try:
                        grade = Grade.objects.get(
                            name__iexact=grade_var,
                            level__campus=campus_obj
                        )
                        break
                    except Grade.DoesNotExist:
                        continue
                
                if not grade:
                    print(f"Grade '{grade_name}' not found in campus '{campus_name}'")
                    # Continue without classroom assignment
                else:
                    # Find or create classroom
                    classroom, created = ClassRoom.objects.get_or_create(
                        grade=grade,
                        section=section_name.strip(),
                        defaults={
                            'capacity': 30,
                            'shift': 'morning'  # Default shift
                        }
                    )
                    
                    # Assign classroom
                    student_data['classroom'] = classroom
                    
                    if created:
                        print(f"Created classroom: {classroom}")
                        
            except Exception as e:
                print(f"Error finding classroom: {e}")
                # Continue without classroom assignment
        
        # Add other fields
        if safe_string(row.get("Gender")):
            student_data['gender'] = safe_string(row.get("Gender")).lower()
        
        if parse_date(row.get("DOB") or row.get("Date of Birth")):
            student_data['dob'] = parse_date(row.get("DOB") or row.get("Date of Birth"))
        
        if safe_string(row.get("Father name") or row.get("Father Name")):
            student_data['father_name'] = safe_string(row.get("Father name") or row.get("Father Name"))
        
        if safe_string(row.get("Father contact") or row.get("Father Contact Number")):
            student_data['father_contact'] = safe_string(row.get("Father contact") or row.get("Father Contact Number"))
        
        if safe_string(row.get("Mother name") or row.get("Mother Name")):
            student_data['mother_name'] = safe_string(row.get("Mother name") or row.get("Mother Name"))
        
        if safe_string(row.get("Address")):
            student_data['address'] = safe_string(row.get("Address"))
        
        if safe_integer(row.get("To year") or row.get("Year of Admission")):
            student_data['enrollment_year'] = safe_integer(row.get("To year") or row.get("Year of Admission"))
        
        if safe_string(row.get("Old GR No")):
            student_data['gr_no'] = safe_string(row.get("Old GR No"))

        # Create student
        student = Student.objects.create(**student_data)
        
        # Generate student code if classroom assigned
        if student.classroom:
            try:
                from utils.id_generator import IDGenerator
                student.student_code = IDGenerator.generate_unique_student_code(
                    student.classroom, student.enrollment_year or 2025
                )
                student.save()
            except Exception as e:
                print(f"Could not generate student code: {e}")
        
        print(f"Added: {student.name} → {campus_obj.campus_name} ({student.current_grade}-{student.section})")
        if student.classroom:
            print(f"   Classroom: {student.classroom} (Code: {student.student_code})")
        
        success_count += 1
        
    except Exception as e:
        print(f"Error adding student: {row.get('Name') or 'Unknown'} | {e}")
        error_count += 1

print(f"\nImport completed!")
print(f"Success: {success_count} students")
print(f"Errors: {error_count} students")

# Assign teachers to classrooms
print(f"\nAssigning teachers to classrooms...")
assign_teachers_to_classrooms()