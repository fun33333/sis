#!/usr/bin/env python3
"""
Simple script to import teachers from CSV file
Usage: python import_teachers.py
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command

def main():
    """Main function to run the import command"""
    
    # Path to the CSV file
    csv_file_path = "6 teachers  - Sheet1 (2).csv"
    
    # Check if CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"❌ Error: CSV file not found: {csv_file_path}")
        print("Please make sure the CSV file is in the backend directory")
        return
    
    print("🚀 Starting teacher import process...")
    print(f"📁 CSV File: {csv_file_path}")
    print(f"🏫 Campus ID: 6 (Campus 6)")
    print("-" * 50)
    
    try:
        # Run the management command
        call_command(
            'import_teachers_csv',
            csv_file_path,
            campus_id=6,
            verbosity=2
        )
        
        print("-" * 50)
        print("✅ Teacher import completed successfully!")
        print("\n📋 Next steps:")
        print("1. Check the admin panel to verify teachers were created")
        print("2. Teachers can login with their employee code and password: 12345")
        print("3. Teachers should change their password on first login")
        
    except Exception as e:
        print(f"❌ Error during import: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure Django is properly configured")
        print("2. Check that all required models exist")
        print("3. Verify the CSV file format is correct")

if __name__ == "__main__":
    main()
