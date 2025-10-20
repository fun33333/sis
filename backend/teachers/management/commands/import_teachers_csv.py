import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils.dateparse import parse_date
from teachers.models import Teacher
from campus.models import Campus
from utils.id_generator import IDGenerator

User = get_user_model()

class Command(BaseCommand):
    help = 'Import teachers from CSV file and create user accounts'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            type=str,
            help='Path to the CSV file containing teacher data'
        )
        parser.add_argument(
            '--campus-id',
            type=int,
            default=6,
            help='Campus ID to assign teachers to (default: 6)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually creating records (for testing)'
        )

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        campus_id = options['campus_id']
        dry_run = options['dry_run']

        # Check if CSV file exists
        if not os.path.exists(csv_file_path):
            raise CommandError(f'CSV file not found: {csv_file_path}')

        # Get campus
        try:
            campus = Campus.objects.get(id=campus_id)
            self.stdout.write(f'Using campus: {campus.campus_name}')
        except Campus.DoesNotExist:
            raise CommandError(f'Campus with ID {campus_id} not found')

        # Process CSV file
        self.process_csv(csv_file_path, campus, dry_run)

    def process_csv(self, csv_file_path, campus, dry_run):
        """Process the CSV file and create teachers"""
        
        created_count = 0
        error_count = 0
        skipped_count = 0

        with open(csv_file_path, 'r', encoding='utf-8') as file:
            # Read CSV with proper encoding
            csv_reader = csv.DictReader(file)
            
            for row_num, row in enumerate(csv_reader, start=2):  # Start from 2 (header is row 1)
                try:
                    # Skip empty rows
                    if not row.get('Full Name:') or row.get('Full Name:').strip() == '':
                        skipped_count += 1
                        continue

                    if dry_run:
                        self.stdout.write(f'[DRY RUN] Would process: {row.get("Full Name:")}')
                        continue

                    # Process the teacher data
                    teacher_data = self.extract_teacher_data(row, campus)
                    
                    with transaction.atomic():
                        # Generate employee code first
                        employee_code = self.generate_employee_code(teacher_data)
                        
                        # Create user account
                        user = self.create_user_account(teacher_data, employee_code)
                        
                        # Create teacher profile
                        teacher = self.create_teacher_profile(teacher_data, user, employee_code)
                        
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✅ Created teacher: {teacher.full_name} (ID: {teacher.employee_code})'
                            )
                        )

                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f'❌ Error processing row {row_num} ({row.get("Full Name:", "Unknown")}): {str(e)}'
                        )
                    )
                    continue

        # Summary
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETED - No records were created'))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n📊 Import Summary:\n'
                    f'✅ Created: {created_count}\n'
                    f'❌ Errors: {error_count}\n'
                    f'⏭️  Skipped: {skipped_count}'
                )
            )

    def extract_teacher_data(self, row, campus):
        """Extract and clean teacher data from CSV row"""
        
        # Helper function to clean data
        def clean_field(value):
            if not value or value.strip() in ['', '0000', '000', 'N/A', 'nil']:
                return None
            return value.strip()

        # Helper function to parse date
        def parse_date_field(date_str):
            if not date_str or date_str.strip() in ['', '0000', '000']:
                return None
            try:
                # Try different date formats
                for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
                    try:
                        return datetime.strptime(date_str.strip(), fmt).date()
                    except ValueError:
                        continue
                return None
            except:
                return None

        # Extract basic info
        full_name = clean_field(row.get('Full Name:'))
        if not full_name:
            raise ValueError("Full name is required")

        # Parse date of birth
        dob_str = clean_field(row.get('Date of Birth:'))
        dob = parse_date_field(dob_str) if dob_str else None

        # Gender mapping
        gender_map = {
            'male': 'male',
            'female': 'female',
            'Male': 'male',
            'Female': 'female'
        }
        gender = gender_map.get(clean_field(row.get('Gender:')), 'other')

        # Marital status mapping
        marital_map = {
            'single': 'single',
            'married': 'married',
            'divorced': 'divorced',
            'widowed': 'widowed',
            'Single': 'single',
            'Married': 'married',
            'Divorced': 'divorced',
            'Widowed': 'widowed'
        }
        marital_status = marital_map.get(clean_field(row.get('Marital Status:')), 'single')

        # Shift mapping
        shift_map = {
            'morning': 'morning',
            'afternoon': 'afternoon',
            'Morning': 'morning',
            'Afternoon': 'afternoon',
        }
        shift = shift_map.get(clean_field(row.get('Shift:')), 'morning')

        # Education level mapping
        education_level = clean_field(row.get('Last Education'))
        if education_level:
            education_level = education_level.lower()

        # Extract year of passing
        year_of_passing = clean_field(row.get(' Year of Passing'))
        if year_of_passing and year_of_passing.isdigit():
            year_of_passing = int(year_of_passing)
        else:
            year_of_passing = None

        # Parse joining date
        joining_date_str = clean_field(row.get('Date of Joining of Current School'))
        joining_date = parse_date_field(joining_date_str) if joining_date_str else None

        # Parse experience dates
        exp_from_str = clean_field(row.get('Last work Start Date'))
        exp_to_str = clean_field(row.get('Last day of Previous work'))
        experience_from_date = parse_date_field(exp_from_str) if exp_from_str else None
        experience_to_date = parse_date_field(exp_to_str) if exp_to_str else None

        # Parse CNIC dates
        cnic_issue_str = clean_field(row.get('Issue Date of CNIC'))
        cnic_expiry_str = clean_field(row.get('Expiry date of CNIC'))
        cnic_issue_date = parse_date_field(cnic_issue_str) if cnic_issue_str else None
        cnic_expiry_date = parse_date_field(cnic_expiry_str) if cnic_expiry_str else None

        # Check if class teacher
        is_class_teacher = clean_field(row.get('If class teacher', '').lower()) == 'yes'

        # Extract assigned class and section
        assigned_class = clean_field(row.get('Class teacher of class'))
        assigned_section = clean_field(row.get('Section'))

        return {
            'full_name': full_name,
            'dob': dob,
            'gender': gender,
            'contact_number': clean_field(row.get('Contact Number:')) or 'N/A',
            'email': clean_field(row.get('Email Address:')) or clean_field(row.get('Teacher\'s Own email Address')),
            'permanent_address': clean_field(row.get('Permanent Address:')) or 'N/A',
            'current_address': clean_field(row.get('Temporary Address (if different):')),
            'marital_status': marital_status,
            'cnic': clean_field(row.get('CNIC')),
            
            # Education
            'education_level': education_level,
            'institution_name': clean_field(row.get('Last Institute Name')),
            'year_of_passing': year_of_passing,
            'education_subjects': clean_field(row.get('Specialization')),
            'education_grade': clean_field(row.get('Grade')),
            
            # Experience
            'previous_institution_name': clean_field(row.get('Last Organization Name')),
            'previous_position': clean_field(row.get('Position/Designation')),
            'experience_from_date': experience_from_date,
            'experience_to_date': experience_to_date,
            'experience_subjects_classes_taught': clean_field(row.get('Subjects/Classes Taught (If any)')),
            'previous_responsibilities': clean_field(row.get('Responsibilities/Assignments')),
            
            # Current role
            'joining_date': joining_date,
            'current_subjects': clean_field(row.get('Subjects Taught')),
            'current_classes_taught': clean_field(row.get('Classes')),
            'current_extra_responsibilities': clean_field(row.get('Additional Responsibilities')),
            'shift': shift,
            'is_currently_active': True,
            'is_class_teacher': is_class_teacher,
            'assigned_class': assigned_class,
            'assigned_section': assigned_section,
            
            # Emergency contact
            'emergency_contact_number': clean_field(row.get('Emergency Contact Number')),
            'emergency_contact_name': clean_field(row.get('Emergency Contact Name and Relationship')),
            
            # CNIC details
            'cnic_issue_date': cnic_issue_date,
            'cnic_expiry_date': cnic_expiry_date,
            
            # Campus
            'campus': campus,
        }

    def create_user_account(self, teacher_data, employee_code):
        """Create user account for teacher"""
        
        # Use employee code as username
        username = employee_code
        
        # Generate password (default password)
        password = '12345'  # Default password for teachers
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=teacher_data['email'],
            password=password,
            first_name=teacher_data['full_name'].split()[0] if teacher_data['full_name'].split() else teacher_data['full_name'],
            last_name=' '.join(teacher_data['full_name'].split()[1:]) if len(teacher_data['full_name'].split()) > 1 else '',
            role='teacher',
            campus=teacher_data['campus'],
            phone_number=teacher_data['contact_number'],
            is_active=True,
            is_verified=True,
            has_changed_default_password=False
        )
        
        return user

    def generate_username(self, full_name):
        """Generate unique username from full name"""
        
        # Clean name and create base username
        name_parts = full_name.lower().replace(' ', '_').replace('.', '').replace(',', '')
        base_username = name_parts
        
        # Check if username exists and add number if needed
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        return username

    def generate_employee_code(self, teacher_data):
        """Generate employee code for teacher"""
        try:
            employee_code = IDGenerator.generate_unique_employee_code(
                campus=teacher_data['campus'],
                shift=teacher_data['shift'],
                year=2025,  # Current year
                role='teacher'
            )
        except Exception as e:
            self.stdout.write(f'Warning: Could not generate employee code: {e}')
            employee_code = f"C{teacher_data['campus'].id:02d}-{teacher_data['shift'][0].upper()}-25-T-{teacher_data.get('id', 1):04d}"
        
        return employee_code

    def create_teacher_profile(self, teacher_data, user, employee_code):
        """Create teacher profile"""

        # Create teacher
        teacher = Teacher.objects.create(
            user=user,
            full_name=teacher_data['full_name'],
            dob=teacher_data['dob'] or datetime.now().date(),
            gender=teacher_data['gender'],
            contact_number=teacher_data['contact_number'],
            email=teacher_data['email'],
            permanent_address=teacher_data['permanent_address'],
            current_address=teacher_data['current_address'],
            marital_status=teacher_data['marital_status'],
            cnic=teacher_data['cnic'],
            
            # Education
            education_level=teacher_data['education_level'],
            institution_name=teacher_data['institution_name'],
            year_of_passing=teacher_data['year_of_passing'],
            education_subjects=teacher_data['education_subjects'],
            education_grade=teacher_data['education_grade'],
            
            # Experience
            previous_institution_name=teacher_data['previous_institution_name'],
            previous_position=teacher_data['previous_position'],
            experience_from_date=teacher_data['experience_from_date'],
            experience_to_date=teacher_data['experience_to_date'],
            experience_subjects_classes_taught=teacher_data['experience_subjects_classes_taught'],
            previous_responsibilities=teacher_data['previous_responsibilities'],
            
            # Current role
            joining_date=teacher_data['joining_date'] or datetime.now().date(),
            current_campus=teacher_data['campus'],
            current_subjects=teacher_data['current_subjects'],
            current_classes_taught=teacher_data['current_classes_taught'],
            current_extra_responsibilities=teacher_data['current_extra_responsibilities'],
            shift=teacher_data['shift'],
            is_currently_active=teacher_data['is_currently_active'],
            is_class_teacher=teacher_data['is_class_teacher'],
            
            # Auto-generated fields
            employee_code=employee_code,
            teacher_id=employee_code,  # Same as employee code
            
            # System fields
            save_status='final',
        )
        
        return teacher
