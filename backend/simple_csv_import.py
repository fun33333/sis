# simple_csv_import.py - CSV import without pandas dependency
import os
import django
import csv
import re
from datetime import datetime
from django.utils.crypto import get_random_string

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from campus.models import Campus

def clean_phone(phone):
    """Clean phone number"""
    if not phone or str(phone).strip() == "" or str(phone) == "00" or str(phone) == "NA":
        return ""
    cleaned = re.sub(r'[^\d+]', '', str(phone))
    return cleaned if cleaned else ""

def clean_email(email):
    """Clean email address"""
    if not email or str(email).strip() == "" or str(email) == "00" or str(email) == "NA":
        return ""
    return str(email).strip().lower()

def parse_date(date_str):
    """Parse date from various formats"""
    if not date_str or str(date_str).strip() == "":
        return None
    
    try:
        date_str = str(date_str).strip()
        if "/" in date_str:
            return datetime.strptime(date_str, "%m/%d/%Y").date()
        elif "-" in date_str:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            return None
    except:
        return None

def parse_year(year_str):
    """Parse year from date string"""
    if not year_str or str(year_str).strip() == "":
        return None
    
    try:
        date_obj = parse_date(year_str)
        return date_obj.year if date_obj else None
    except:
        return None

def clean_boolean(value):
    """Convert to boolean"""
    if not value:
        return False
    
    value_str = str(value).strip().lower()
    if value_str in ['true', 'yes', 'available', '1']:
        return True
    elif value_str in ['false', 'no', 'not available', '0', 'nil', 'nothing']:
        return False
    return False

def clean_number(value):
    """Clean and convert to integer"""
    if not value or str(value).strip() == "" or str(value) == "00" or str(value) == "NA":
        return 0
    
    try:
        cleaned = re.sub(r'[^\d.]', '', str(value))
        return int(float(cleaned)) if cleaned else 0
    except:
        return 0

def generate_campus_code(campus_name, city):
    """Generate unique campus code"""
    name_part = re.sub(r'[^a-zA-Z0-9]', '', campus_name)[:3].upper()
    city_part = re.sub(r'[^a-zA-Z0-9]', '', city)[:2].upper() if city else "XX"
    random_part = get_random_string(3, allowed_chars='0123456789')
    return f"{name_part}{city_part}{random_part}"

def import_campus_from_csv(csv_file_path):
    """Import campus data from CSV file"""
    print("🚀 Starting CSV Campus Data Import...")
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            # Read all lines first to handle multiline headers
            lines = file.readlines()
            
        # Clean the header line (remove newlines from column names)
        header_line = lines[0].replace('\n', '').replace('\r', '')
        header_line = header_line.replace('"Enter campus name \n"', '"Enter campus name"')
        
        # Create a new CSV content with cleaned header
        csv_content = header_line + '\n' + ''.join(lines[1:])
        
        # Parse CSV from string
        csv_reader = csv.DictReader(csv_content.split('\n'))
        rows = list(csv_reader)
        
        print(f"📊 Found {len(rows)} records in CSV")
        print(f"📋 Headers: {list(rows[0].keys())[:5]}...")  # Show first 5 headers
        
        success_count = 0
        error_count = 0
        
        for index, row in enumerate(rows):
            try:
                # Try different possible column names for campus name
                campus_name = None
                for col_name in ['Enter campus name ', 'Enter campus name', 'Campus Name', 'campus_name']:
                    if col_name in row and row[col_name]:
                        campus_name = str(row[col_name]).strip()
                        break
                
                if not campus_name or campus_name == "nan" or campus_name == "":
                    print(f"⚠ Row {index + 1}: Skipped - No campus name found")
                    print(f"   Available columns: {list(row.keys())[:5]}...")
                    error_count += 1
                    continue
                
                print(f"\n📝 Processing row {index + 1}: {campus_name}")
                
                # Basic Info
                city = str(row.get('City', '')).strip()
                district = str(row.get('District', '')).strip()
                postal_code = str(row.get('Postal Code', '00000')).strip()
                address = str(row.get('Address', '')).strip()
                
                # Contact Info
                primary_phone = clean_phone(row.get('School Primary phone', ''))
                secondary_phone = clean_phone(row.get('School Secondary phone', ''))
                official_email = clean_email(row.get('Enter school official email', ''))
                
                # Administration
                campus_head_name = str(row.get('Enter campus head name', '')).strip()
                campus_head_phone = clean_phone(row.get('Enter Campus Head Phone Number', ''))
                campus_head_email = clean_email(row.get('Enter campus head email', ''))
                
                # Staff Numbers
                total_staff = clean_number(row.get('Enter Total Staff Members', 0))
                total_teachers = clean_number(row.get('Enter Total Teachers', 0))
                total_coordinators = clean_number(row.get('Enter Total Coordinators', 0))
                total_maids = clean_number(row.get('Enter Total Maids', 0))
                total_guards = clean_number(row.get('Enter Total Guards', 0))
                
                # Students
                student_capacity = clean_number(row.get('Enter Total Students capacity', 0))
                current_students = clean_number(row.get('Enter Current Students capacity', 0))
                
                # Infrastructure
                total_rooms = clean_number(row.get('Enter Total No of Rooms', 0))
                total_classrooms = clean_number(row.get('Enter Total no of classrooms', 0))
                avg_class_size = clean_number(row.get('What is  Average Class Size', 0))
                num_computer_labs = clean_number(row.get('No.of Computer Lab', 0))
                num_science_labs = clean_number(row.get('No. of Science Lab', 0))
                
                # Washrooms
                boys_washrooms = clean_number(row.get('Boys Washrooms', 0))
                girls_washrooms = clean_number(row.get('Girls Washrooms', 0))
                male_washrooms = clean_number(row.get('Male Washrooms', 0))
                female_washrooms = clean_number(row.get('Female  Washrooms', 0))
                
                # Dates
                academic_year_start = parse_date(row.get('Academic Year Start'))
                academic_year_end = parse_date(row.get('Academic Year End'))
                established_year = parse_year(row.get('Enter Campus Established Year'))
                
                # Boolean fields
                library_available = clean_boolean(row.get('Any other room', ''))
                power_backup = clean_boolean(row.get('Facilities', ''))
                teacher_transport = clean_boolean(row.get('Teacher Transport facility', ''))
                canteen_facility = clean_boolean(row.get('Canteen facility', ''))
                meal_program = clean_boolean(row.get('Meal Programs', ''))
                sports_facility = clean_boolean(row.get('Sports facilities', ''))
                
                # Sports available
                sports_available = str(row.get('Sports facilities', '')).strip()
                if sports_available and sports_available != "nan":
                    sports_available = sports_available.replace('"', '').strip()
                else:
                    sports_available = ""
                
                # Grades available
                grades_available = str(row.get('Current Grade/Class', '')).strip()
                if grades_available and grades_available != "nan":
                    grades_available = grades_available.replace('"', '').strip()
                else:
                    grades_available = ""
                
                # Shift
                shift_str = str(row.get('Shift Available', 'Morning')).strip()
                if 'morning' in shift_str.lower() and 'afternoon' in shift_str.lower():
                    shift_available = 'both'
                elif 'afternoon' in shift_str.lower():
                    shift_available = 'afternoon'
                else:
                    shift_available = 'morning'
                
                # Status
                status_str = str(row.get('Status', 'Active')).strip().lower()
                if 'active' in status_str:
                    status = 'active'
                elif 'inactive' in status_str:
                    status = 'inactive'
                else:
                    status = 'active'
                
                # Language
                instruction_language = str(row.get('Language(s) of Instruction', 'English')).strip()
                
                # Registration number
                registration_number = str(row.get('Enter campus  registration number', '')).strip()
                if registration_number == "00" or registration_number == "nan":
                    registration_number = ""
                
                # Create campus data
                campus_data = {
                    'campus_name': campus_name,
                    'campus_code': generate_campus_code(campus_name, city),
                    'campus_type': 'main',
                    'instruction_language': instruction_language,
                    'academic_year_start': academic_year_start or datetime.now().date(),
                    'academic_year_end': academic_year_end or datetime.now().date(),
                    'established_year': established_year,
                    'registration_number': registration_number,
                    'address_full': address or f"{city}, Pakistan",
                    'postal_code': postal_code,
                    'city': city,
                    'district': district if district != "nan" else None,
                    'primary_phone': primary_phone or "00000000000",
                    'secondary_phone': secondary_phone,
                    'official_email': official_email or f"campus{index+1}@example.com",
                    'campus_head_name': campus_head_name or "Not Provided",
                    'campus_head_phone': campus_head_phone,
                    'campus_head_email': campus_head_email,
                    'total_staff_members': total_staff,
                    'total_teachers': total_teachers,
                    'total_coordinators': total_coordinators,
                    'total_maids': total_maids,
                    'total_guards': total_guards,
                    'total_students': current_students,
                    'student_capacity': student_capacity,
                    'avg_class_size': avg_class_size,
                    'shift_available': shift_available,
                    'grades_available': grades_available,
                    'total_classrooms': total_classrooms,
                    'num_computer_labs': num_computer_labs,
                    'num_science_labs': num_science_labs,
                    'library_available': library_available,
                    'power_backup': power_backup,
                    'teacher_transport': teacher_transport,
                    'canteen_facility': canteen_facility,
                    'meal_program': meal_program,
                    'male_student_washrooms': boys_washrooms,
                    'female_student_washrooms': girls_washrooms,
                    'male_staff_washrooms': male_washrooms,
                    'female_staff_washrooms': female_washrooms,
                    'status': status,
                    'sports_facility': sports_facility,
                    'sports_available': sports_available,
                }
                
                # Create campus
                campus = Campus.objects.create(**campus_data)
                print(f"✅ Created: {campus.campus_name} ({campus.campus_code})")
                success_count += 1
                
            except Exception as e:
                print(f"❌ Error creating campus in row {index + 1}: {e}")
                error_count += 1
                continue
        
        print(f"\n🎉 Import completed!")
        print(f"✅ Success: {success_count} campuses")
        print(f"❌ Errors: {error_count} campuses")
        
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")

if __name__ == "__main__":
    # Update this path to your CSV file
    csv_file_path = r"c:\Users\emp9\Downloads\Campus Detail Form (Responses) - Form Responses 1.csv"
    import_campus_from_csv(csv_file_path)
