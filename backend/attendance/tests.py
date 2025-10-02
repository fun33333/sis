from django.test import TestCase
from django.utils import timezone
from datetime import date, time, timedelta
from django.core.exceptions import ValidationError
from students.models import Student
from teachers.models import Teacher
from classes.models import Grade, ClassRoom
from campus.models import Campus
from user.models import User
from .models import Attendance, AttendanceSummary


class AttendanceModelTest(TestCase):
    def setUp(self):
        # Create test data
        self.campus = Campus.objects.create(
            campus_id="TEST-001",
            campus_code="TEST",
            campus_name="Test Campus",
            address="Test Address",
            city="Test City",
            province_state="Test Province",
            postal_code="12345",
            primary_phone="1234567890",
            official_email="test@example.com",
            head_name="Test Head",
            languages_of_instruction="English",
            academic_year_start=date(2024, 1, 1),
            academic_year_end=date(2024, 12, 31)
        )
        
        self.grade = Grade.objects.create(name="Grade 1")
        self.classroom = ClassRoom.objects.create(
            grade=self.grade,
            section="A",
            capacity=30
        )
        
        self.teacher = Teacher.objects.create(
            full_name="Test Teacher",
            dob=date(1990, 1, 1),
            gender="male",
            contact_number="1234567890",
            email="teacher@example.com",
            permanent_address="Test Address"
        )
        
        self.student = Student.objects.create(
            name="Test Student",
            campus=self.campus,
            classroom=self.classroom,
            current_grade="Grade 1",
            section="A"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="user@example.com",
            password="testpass123",
            role="teacher",
            campus=self.campus
        )
    
    def test_attendance_creation(self):
        """Test creating an attendance record"""
        attendance = Attendance.objects.create(
            student=self.student,
            classroom=self.classroom,
            class_teacher=self.teacher,
            campus=self.campus,
            date=date.today(),
            status='present',
            created_by=self.user
        )
        
        self.assertEqual(attendance.student, self.student)
        self.assertEqual(attendance.classroom, self.classroom)
        self.assertEqual(attendance.status, 'present')
        self.assertTrue(attendance.is_present)
        self.assertFalse(attendance.is_absent)
    
    def test_attendance_validation(self):
        """Test attendance validation"""
        # Test valid attendance
        attendance = Attendance(
            student=self.student,
            classroom=self.classroom,
            campus=self.campus,
            date=date.today(),
            status='present'
        )
        attendance.full_clean()  # Should not raise ValidationError
        
    
    def test_attendance_properties(self):
        """Test attendance properties"""
        attendance = Attendance.objects.create(
            student=self.student,
            classroom=self.classroom,
            campus=self.campus,
            date=date.today(),
            status='late'
        )
        
        self.assertTrue(attendance.is_present)
        self.assertFalse(attendance.is_absent)
        self.assertTrue(attendance.is_late)
    
    def test_attendance_unique_constraint(self):
        """Test that only one attendance record per student per day per class"""
        Attendance.objects.create(
            student=self.student,
            classroom=self.classroom,
            campus=self.campus,
            date=date.today(),
            status='present'
        )
        
        # Try to create another attendance for the same student, class, and date
        with self.assertRaises(Exception):  # Should raise IntegrityError
            Attendance.objects.create(
                student=self.student,
                classroom=self.classroom,
                campus=self.campus,
                date=date.today(),
                status='absent'
            )


class AttendanceSummaryModelTest(TestCase):
    def setUp(self):
        # Create test data (similar to AttendanceModelTest)
        self.campus = Campus.objects.create(
            campus_id="TEST-001",
            campus_code="TEST",
            campus_name="Test Campus",
            address="Test Address",
            city="Test City",
            province_state="Test Province",
            postal_code="12345",
            primary_phone="1234567890",
            official_email="test@example.com",
            head_name="Test Head",
            languages_of_instruction="English",
            academic_year_start=date(2024, 1, 1),
            academic_year_end=date(2024, 12, 31)
        )
        
        self.grade = Grade.objects.create(name="Grade 1")
        self.classroom = ClassRoom.objects.create(
            grade=self.grade,
            section="A",
            capacity=30
        )
        
        self.student = Student.objects.create(
            name="Test Student",
            campus=self.campus,
            classroom=self.classroom,
            current_grade="Grade 1",
            section="A"
        )
    
    def test_attendance_summary_creation(self):
        """Test creating an attendance summary"""
        summary = AttendanceSummary.objects.create(
            student=self.student,
            classroom=self.classroom,
            campus=self.campus,
            month=1,
            year=2024,
            academic_year="2024-2025",
            total_days=20,
            present_days=18,
            absent_days=2,
            late_days=1,
            excused_days=0,
            half_days=0
        )
        
        self.assertEqual(summary.student, self.student)
        self.assertEqual(summary.total_days, 20)
        self.assertEqual(summary.present_days, 18)
        self.assertEqual(summary.attendance_percentage, 90.0)  # 18/20 * 100
    
    def test_attendance_summary_calculation(self):
        """Test automatic calculation of attendance percentage"""
        summary = AttendanceSummary.objects.create(
            student=self.student,
            classroom=self.classroom,
            campus=self.campus,
            month=1,
            year=2024,
            academic_year="2024-2025",
            total_days=10,
            present_days=8,
            absent_days=1,
            late_days=1,
            excused_days=0
        )
        
        # The save method should calculate the percentage
        self.assertEqual(summary.attendance_percentage, 90.0)  # (8 + 1) / 10 * 100




class AttendanceIntegrationTest(TestCase):
    """Integration tests for the attendance system"""
    
    def setUp(self):
        # Create comprehensive test data
        self.campus = Campus.objects.create(
            campus_id="TEST-001",
            campus_code="TEST",
            campus_name="Test Campus",
            address="Test Address",
            city="Test City",
            province_state="Test Province",
            postal_code="12345",
            primary_phone="1234567890",
            official_email="test@example.com",
            head_name="Test Head",
            languages_of_instruction="English",
            academic_year_start=date(2024, 1, 1),
            academic_year_end=date(2024, 12, 31)
        )
        
        self.grade = Grade.objects.create(name="Grade 1")
        self.classroom = ClassRoom.objects.create(
            grade=self.grade,
            section="A",
            capacity=30
        )
        
        self.teacher = Teacher.objects.create(
            full_name="Test Teacher",
            dob=date(1990, 1, 1),
            gender="male",
            contact_number="1234567890",
            email="teacher@example.com",
            permanent_address="Test Address"
        )
        
        self.student1 = Student.objects.create(
            name="Student 1",
            campus=self.campus,
            classroom=self.classroom,
            current_grade="Grade 1",
            section="A"
        )
        
        self.student2 = Student.objects.create(
            name="Student 2",
            campus=self.campus,
            classroom=self.classroom,
            current_grade="Grade 1",
            section="A"
        )
    
    def test_monthly_attendance_tracking(self):
        """Test tracking attendance over a month"""
        # Create attendance records for a month
        test_date = date(2024, 1, 1)
        
        # Student 1: Present most days
        for i in range(20):
            Attendance.objects.create(
                student=self.student1,
                classroom=self.classroom,
                campus=self.campus,
                date=test_date + timedelta(days=i),
                status='present' if i < 18 else 'absent'
            )
        
        # Student 2: More absences
        for i in range(20):
            Attendance.objects.create(
                student=self.student2,
                classroom=self.classroom,
                campus=self.campus,
                date=test_date + timedelta(days=i),
                status='present' if i < 15 else 'absent'
            )
        
        # Check that summaries are created
        summary1 = AttendanceSummary.objects.get(
            student=self.student1,
            month=1,
            year=2024
        )
        summary2 = AttendanceSummary.objects.get(
            student=self.student2,
            month=1,
            year=2024
        )
        
        self.assertEqual(summary1.total_days, 20)
        self.assertEqual(summary1.present_days, 18)
        self.assertEqual(summary1.attendance_percentage, 90.0)
        
        self.assertEqual(summary2.total_days, 20)
        self.assertEqual(summary2.present_days, 15)
        self.assertEqual(summary2.attendance_percentage, 75.0)
