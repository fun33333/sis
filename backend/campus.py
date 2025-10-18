# campus_urllib.py - urllib based approach
import os
import django
import urllib.request
import urllib.parse
import json
from google.oauth2.service_account import Credentials
from dateutil import parser
import re
from django.utils.crypto import get_random_string

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from campus.models import Campus

# Helper functions
def parse_date(value):
    if not value or str(value).strip() == "" or str(value).startswith("#"):
        return None
    try:
        return parser.parse(str(value)).date()
    except:
        return None

def safe_string(value):
    if not value:
        return ""
    return str(value).strip()

def get_field(row, *field_names):
    for field_name in field_names:
        if field_name in row and row[field_name]:
            return row[field_name]
    return None

def generate_campus_code(campus_name, city):
    # Generate campus code
    name_part = re.sub(r'[^a-zA-Z0-9]', '', campus_name)[:3].upper()
    city_part = re.sub(r'[^a-zA-Z0-9]', '', city)[:2].upper() if city else "XX"
    random_part = get_random_string(3, allowed_chars='0123456789')
    return f"{name_part}{city_part}{random_part}"

# Direct Google Sheets API using urllib
def get_sheet_data():
    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    
    creds = Credentials.from_service_account_file("credentials.json", scopes=SCOPES)
    
    # Force token refresh
    creds.refresh(None)
    access_token = creds.token
    
    if not access_token:
        raise Exception("❌ Failed to get access token from Google service account")
    
    print(f"✅ Access token obtained: {access_token[:20]}...")
    
    spreadsheet_id = "1kA7hT5-7X8eNq3Cq-eSepB4y_D2TM1iYFqjLsvvz-ic"
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}/values/Form%20Responses%201!A:Z"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    print(f"🔗 Requesting URL: {url}")
    print(f"🔑 Using token: {access_token[:20]}...")
    
    # Use urllib instead of requests
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    
    return data.get('values', [])

# Main function
def import_campus_data():
    print("🚀 Starting Campus Data Import...")
    
    # Get data from Google Sheets
    rows = get_sheet_data()
    
    if not rows:
        print("⚠ No data found in Google Sheet.")
        return
    
    # First row is headers
    headers = rows[0]
    data_rows = rows[1:]
    
    print(f"📊 Found {len(data_rows)} records")
    print(f"📋 Headers: {headers}")
    
    success_count = 0
    error_count = 0
    
    for row_data in data_rows:
        try:
            # Create row dictionary
            row = dict(zip(headers, row_data))
            
            campus_name = safe_string(get_field(row, "Enter campus name", "Campus Name", "Campus"))
            if not campus_name:
                print("⚠ Skipped row: No campus name provided")
                error_count += 1
                continue
            
            city = safe_string(get_field(row, "City"))
            postal_code = safe_string(get_field(row, "Postal Code", "Zip Code")) or "00000"
            
            campus_data = {
                "campus_name": campus_name,
                "city": city,
                "postal_code": postal_code,
                "address": safe_string(get_field(row, "Address", "Full Address")) or f"{city}, Pakistan",
                "campus_code": generate_campus_code(campus_name, city)
            }
            
            # Create campus
            campus = Campus.objects.create(**campus_data)
            print(f"✅ Created: {campus.campus_name} ({campus.campus_code})")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error creating campus: {e}")
            error_count += 1
    
    print(f"\n🎉 Import completed!")
    print(f"✅ Success: {success_count} campuses")
    print(f"❌ Errors: {error_count} campuses")

if __name__ == "__main__":
    import_campus_data()