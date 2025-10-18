#!/usr/bin/env python3
"""
Import Campus 6 Teachers from CSV
This script imports teacher data from the IAK Teachers Form - Campus 6.csv file
"""

import os
import sys
import django
import csv
from datetime import datetime, date
import re

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from teachers.models import Teacher
from campus.models import Campus
from users.models import User

def clean_phone_number(phone):
    """Clean and format phone number"""
    if not phone or phone in ['000', '0000', '']:
        return None
    
    # Remove all non-digit characters
    cleaned = re.sub(r'\D', '', str(phone))
    
    # Remove leading zeros and format
    if cleaned.startswith('0'):
        cleaned = cleaned[1:]
    
    # Add country code if not present
    if not cleaned.startswith('92'):
        cleaned = '92' + cleaned
    
    return cleaned

def clean_cnic(cnic):
    """Clean and format CNIC"""
    if not cnic or cnic in ['0000', '000', '']:
        return None
    
    # Remove all non-digit characters
    cleaned = re.sub(r'\D', '', str(cnic))
    
    # Format as XXXXX-XXXXXXX-X
    if len(cleaned) == 13:
        return f"{cleaned[:5]}-{cleaned[5:12]}-{cleaned[12]}"
    
    return cleaned

def parse_date(date_str):
    """Parse date string in various formats"""
    if not date_str or date_str in ['0000', '000', '']:
        return None
    
    try:
        # Try different date formats
        formats = [
            '%d/%m/%Y',
            '%d-%m-%Y', 
            '%Y-%m-%d',
            '%d/%m/%y',
            '%d-%m-%y'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        
        # If no format works, return None
        return None
    except:
        return None

def create_user_for_teacher(teacher_data):
    """Create user account for teacher"""
    try:
        # Generate username from full name
        full_name = teacher_data.get('full_name', '')
        username = full_name.lower().replace(' ', '_').replace('.', '')
        
        # Make username unique
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}_{counter}"
            counter += 1
        
        # Get email
        email = teacher_data.get('email', '')
        if not email or email == '0000':
            email = f"{username}@campus6.local"
        
        # Make email unique
        counter = 1
        original_email = email
        while User.objects.filter(email=email).exists():
            email = f"{original_email.split('@')[0]}_{counter}@{original_email.split('@')[1]}"
            counter += 1
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=full_name.split()[0] if full_name else '',
            last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else '',
            role='teacher',
            is_active=True
        )
        
        return user
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

def import_teachers():
    """Import teachers from CSV"""
    csv_file = 'IAK Teachers Form - Campus 6.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ CSV file not found: {csv_file}")
        return
    
    # Get or create Campus 6
    campus, created = Campus.objects.get_or_create(
        campus_name='Campus 6',
        defaults={
            'campus_code': 'C6',
            'city': 'Karachi',
            'address': 'Yaroo Khan Goth, Surjani Town',
            'phone': '021-1234567',
            'email': 'campus6@idaraalkhair.org',
            'principal_name': 'Sir Mudasir',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created Campus 6")
    else:
        print(f"✅ Found Campus 6")
    
    imported_count = 0
    skipped_count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Extract data from CSV
                full_name = row.get('Full Name:', '').strip()
                if not full_name or full_name == '0000':
                    print(f"⚠️ Row {row_num}: Skipped - No name")
                    skipped_count += 1
                    continue
                
                # Clean and prepare data - mapping to actual Teacher model fields
                teacher_data = {
                    'full_name': full_name,
                    'dob': parse_date(row.get('Date of Birth:', '')) or date(1990, 1, 1),  # Required field
                    'gender': row.get('Gender:', '').lower() or 'other',  # Required field
                    'contact_number': clean_phone_number(row.get('Contact Number:', '')) or '0000000000',  # Required field
                    'email': row.get('Email Address:', '').strip() or f"{full_name.lower().replace(' ', '_')}@campus6.local",  # Required field
                    'permanent_address': row.get('Permanent Address:', '').strip() or 'Not provided',  # Required field
                    'current_address': row.get('Temporary Address (if different):', '').strip() if row.get('Temporary Address (if different):') else None,
                    'marital_status': row.get('Marital Status:', '').lower() if row.get('Marital Status:') else None,
                    'cnic': clean_cnic(row.get('CNIC', '')),
                    
                    # Education Information
                    'education_level': row.get('Last Education', '').strip() if row.get('Last Education') else None,
                    'institution_name': row.get('Last Institute Name', '').strip() if row.get('Last Institute Name') else None,
                    'year_of_passing': int(row.get('Year of Passing', 0)) if row.get('Year of Passing') and row.get('Year of Passing').isdigit() else None,
                    'education_subjects': row.get('Specialization', '').strip() if row.get('Specialization') else None,
                    'education_grade': row.get('Grade', '').strip() if row.get('Grade') else None,
                    
                    # Experience Information
                    'previous_institution_name': row.get('Last Organization Name', '').strip() if row.get('Last Organization Name') else None,
                    'previous_position': row.get('Position/Designation', '').strip() if row.get('Position/Designation') else None,
                    'experience_from_date': parse_date(row.get('Last work Start Date', '')),
                    'experience_to_date': parse_date(row.get('Last day of Previous work', '')),
                    'experience_subjects_classes_taught': row.get('Subjects/Classes Taught (If any)', '').strip() if row.get('Subjects/Classes Taught (If any)') else None,
                    'previous_responsibilities': row.get('Responsibilities/Assignments', '').strip() if row.get('Responsibilities/Assignments') else None,
                    
                    # Current Role Information
                    'joining_date': parse_date(row.get('Date of Joining of Current School', '')),
                    'current_role_title': 'Teacher',  # Default role
                    'current_campus': campus,
                    'shift': row.get('Shift:', '').lower() if row.get('Shift:') else 'morning',
                    'current_subjects': row.get('Subjects Taught', '').strip() if row.get('Subjects Taught') else None,
                    'current_classes_taught': row.get('Classes', '').strip() if row.get('Classes') else None,
                    'current_extra_responsibilities': row.get('Additional Responsibilities', '').strip() if row.get('Additional Responsibilities') else None,
                    'is_class_teacher': row.get('If class teacher', '').lower() == 'yes' if row.get('If class teacher') else False,
                    'is_currently_active': True,
                }
                
                # Create user account
                user = create_user_for_teacher(teacher_data)
                if user:
                    teacher_data['user'] = user
                
                # Create teacher
                teacher = Teacher.objects.create(**teacher_data)
                imported_count += 1
                print(f"✅ Row {row_num}: Imported {full_name}")
                
            except Exception as e:
                print(f"❌ Error in row {row_num}: {e}")
                skipped_count += 1
                continue
    
    print(f"\n📊 Import Summary:")
    print(f"✅ Successfully imported: {imported_count} teachers")
    print(f"⚠️ Skipped: {skipped_count} teachers")
    print(f"🏫 Campus: {campus.campus_name}")

if __name__ == '__main__':
    print("🚀 Starting Campus 6 Teacher Import...")
    import_teachers()
    print("✅ Import completed!")
