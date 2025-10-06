import os
import django
from datetime import date, timedelta
import random

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from students.models import Student
from teachers.models import Teacher
from campus.models import Campus

def create_campuses():
    """Create sample campuses"""
    campus1, created = Campus.objects.get_or_create(
        campus_name="Campus 1",
        defaults={
            'campus_code': 'C01',
            'status': 'active',
            'address_full': '123 Main Street, City',
            'postal_code': '75080',
            'city': 'Karachi',
            'district': 'East',
            'primary_phone': '021-1234567',
            'official_email': 'campus1@school.edu.pk',
            'campus_head_name': 'Principal 1',
            'campus_head_phone': '0300-1234567',
            'campus_head_email': 'principal1@school.edu.pk',
            'instruction_language': 'English, Urdu',
            'academic_year_start': date(2024, 4, 1),
            'academic_year_end': date(2025, 3, 31),
            'established_year': 2020,
            'grades_available': 'Nursery, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12',
            'shift_available': 'morning',
            'student_capacity': 500,
            'total_classrooms': 20,
            'total_offices': 5,
            'library_available': True,
            'power_backup': True,
            'internet_available': True,
            'is_draft': False
        }
    )
    
    campus2, created = Campus.objects.get_or_create(
        campus_name="Campus 2", 
        defaults={
            'campus_code': 'C02',
            'status': 'active',
            'address_full': '456 Oak Avenue, City',
            'postal_code': '54000',
            'city': 'Lahore',
            'district': 'Central',
            'primary_phone': '042-1234567',
            'official_email': 'campus2@school.edu.pk',
            'campus_head_name': 'Principal 2',
            'campus_head_phone': '0300-7654321',
            'campus_head_email': 'principal2@school.edu.pk',
            'instruction_language': 'English',
            'academic_year_start': date(2024, 4, 1),
            'academic_year_end': date(2025, 3, 31),
            'established_year': 2018,
            'grades_available': 'Nursery, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
            'shift_available': 'morning',
            'student_capacity': 300,
            'total_classrooms': 15,
            'total_offices': 3,
            'library_available': True,
            'power_backup': False,
            'internet_available': True,
            'is_draft': False
        }
    )
    
    return campus1, campus2

def create_students(count=100):
    """Create sample students"""
    campus1, campus2 = create_campuses()
    
    first_names = ['Ahmed', 'Fatima', 'Ali', 'Aisha', 'Hassan', 'Zainab', 'Omar', 'Maryam', 'Yusuf', 'Khadija', 'Muhammad', 'Ayesha', 'Usman', 'Sara', 'Bilal', 'Amina', 'Tariq', 'Nadia', 'Imran', 'Saima']
    last_names = ['Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Sheikh', 'Raza', 'Syed', 'Butt', 'Chaudhry', 'Qureshi', 'Hashmi', 'Abbasi', 'Jafri', 'Naqvi']
    grades = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
    religions = ['Islam', 'Christianity', 'Hinduism', 'Sikhism']
    mother_tongues = ['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'English']
    occupations = ['Business', 'Teacher', 'Engineer', 'Doctor', 'Government', 'Farmer', 'Shopkeeper']
    
    students_created = 0
    
    for i in range(count):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        gender = random.choice(['male', 'female'])
        campus = random.choice([campus1, campus2])
        
        student = Student.objects.create(
            name=f"{first_name} {last_name}",
            gender=gender,
            dob=date.today() - timedelta(days=random.randint(365*5, 365*18)),
            place_of_birth=random.choice(['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']),
            religion=random.choice(religions),
            mother_tongue=random.choice(mother_tongues),
            emergency_contact=f"03{random.randint(10000000, 99999999)}",
            primary_phone=f"03{random.randint(10000000, 99999999)}",
            father_name=f"Mr. {random.choice(first_names)} {last_name}",
            father_cnic=f"{random.randint(1000000000000, 9999999999999)}",
            father_contact=f"03{random.randint(10000000, 99999999)}",
            father_occupation=random.choice(occupations),
            mother_name=f"Mrs. {random.choice(first_names)} {last_name}",
            mother_cnic=f"{random.randint(1000000000000, 9999999999999)}",
            mother_contact=f"03{random.randint(10000000, 99999999)}",
            mother_occupation=random.choice(['Housewife', 'Teacher', 'Nurse', 'Business', 'Doctor']),
            address=f"{random.randint(1, 100)} Street {random.randint(1, 50)}, Sector {random.randint(1, 20)}",
            family_income=random.randint(30000, 200000),
            house_owned=random.choice([True, False]),
            current_state='active',
            campus=campus,
            current_grade=random.choice(grades),
            section=random.choice(['A', 'B', 'C', 'D']),
            gr_no=f"GR{random.randint(1000, 9999)}",
            is_draft=False
        )
        
        # Update campus counts
        campus.total_students += 1
        if gender == 'male':
            campus.male_students += 1
        else:
            campus.female_students += 1
        campus.save()
        
        students_created += 1
        if students_created % 10 == 0:
            print(f"Created {students_created} students...")
    
    return students_created

def create_teachers(count=20):
    """Create sample teachers"""
    campus1, campus2 = create_campuses()
    
    first_names = ['Ahmed', 'Fatima', 'Ali', 'Aisha', 'Hassan', 'Zainab', 'Omar', 'Maryam', 'Yusuf', 'Khadija', 'Muhammad', 'Ayesha', 'Usman', 'Sara', 'Bilal', 'Amina', 'Tariq', 'Nadia', 'Imran', 'Saima']
    last_names = ['Khan', 'Ahmed', 'Ali', 'Hassan', 'Malik', 'Sheikh', 'Raza', 'Syed', 'Butt', 'Chaudhry', 'Qureshi', 'Hashmi', 'Abbasi', 'Jafri', 'Naqvi']
    subjects = ['Mathematics', 'English', 'Science', 'Urdu', 'Islamiat', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology']
    education_levels = ['Masters', 'Bachelors', 'MPhil', 'PhD']
    
    teachers_created = 0
    
    for i in range(count):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        gender = random.choice(['male', 'female'])
        campus = random.choice([campus1, campus2])
        
        teacher = Teacher.objects.create(
            full_name=f"{first_name} {last_name}",
            dob=date.today() - timedelta(days=random.randint(365*25, 365*60)),
            gender=gender,
            contact_number=f"03{random.randint(10000000, 99999999)}",
            email=f"{first_name.lower()}.{last_name.lower()}{i}@school.edu.pk",
            permanent_address=f"{random.randint(1, 100)} Street {random.randint(1, 50)}, Sector {random.randint(1, 20)}",
            current_address=f"{random.randint(1, 100)} Street {random.randint(1, 50)}, Sector {random.randint(1, 20)}",
            marital_status=random.choice(['single', 'married', 'divorced']),
            education_level=random.choice(education_levels),
            institution_name=random.choice(['University of Karachi', 'Lahore University', 'Quaid-e-Azam University', 'NED University']),
            year_of_passing=random.randint(2010, 2023),
            education_subjects=random.choice(subjects),
            education_grade=random.choice(['A', 'B+', 'B', 'C+']),
            previous_institution_name=random.choice(['ABC School', 'XYZ College', 'City School', 'Elite Academy']),
            previous_position=random.choice(['Teacher', 'Senior Teacher', 'Head Teacher', 'Coordinator']),
            experience_from_date=date.today() - timedelta(days=random.randint(365*2, 365*10)),
            experience_to_date=date.today() - timedelta(days=random.randint(30, 365*2)),
            experience_subjects_classes_taught=random.choice(subjects),
            previous_responsibilities="Teaching and student management",
            role_start_date=date.today() - timedelta(days=random.randint(30, 365)),
            current_classes_taught=f"Grade {random.randint(1, 10)}",
            current_subjects=random.choice(subjects),
            current_extra_responsibilities=random.choice(['Class Teacher', 'Sports Coordinator', 'Library Incharge', 'None']),
            current_campus=campus,
            save_status='final'
        )
        
        # Update campus counts
        campus.total_teachers += 1
        if gender == 'male':
            campus.male_teachers += 1
        else:
            campus.female_teachers += 1
        campus.save()
        
        teachers_created += 1
        if teachers_created % 5 == 0:
            print(f"Created {teachers_created} teachers...")
    
    return teachers_created

if __name__ == "__main__":
    print("🚀 Starting data population...")
    
    # Create students
    print("📚 Creating students...")
    students = create_students(100)
    print(f"✅ Created {students} students")
    
    # Create teachers
    print("👨‍🏫 Creating teachers...")
    teachers = create_teachers(20)
    print(f"✅ Created {teachers} teachers")
    
    print("🎉 Data population completed!")
    print(f"📊 Total: {students} students, {teachers} teachers")