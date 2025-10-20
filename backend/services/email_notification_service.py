from django.core.mail import send_mail
from django.conf import settings

class EmailNotificationService:
    DEFAULT_PASSWORD = '12345'
    
    @staticmethod
    def send_credentials_email(user, employee_code, entity_type):
        """Send login credentials to newly created user"""
        subject = f'Welcome to School Management System - Your Login Credentials'
        
        role_display = entity_type.capitalize()
        
        message = f"""
Dear {user.first_name} {user.last_name},

Welcome to the School Management System!

Your account has been created with the following credentials:

Employee Code: {employee_code}
Password: {EmailNotificationService.DEFAULT_PASSWORD}

Please login at: {settings.FRONTEND_URL}/Universal_Login

For security, please change your password after first login.

Best regards,
School Administration
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return True, "Email sent successfully"
        except Exception as e:
            return False, f"Failed to send email: {str(e)}"
