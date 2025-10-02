from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator


class Student(models.Model):
    SHIFT_CHOICES = (
        ("M", "Morning"),
        ("A", "Afternoon"),
    )

    # --- Personal Details ---
    photo = models.ImageField(upload_to="students/photos/", null=True, blank=True)
    name = models.CharField(max_length=200)  # Required
    gender = models.CharField(
        max_length=10,
        choices=(("male", "Male"), ("female", "Female")),
        null=True,
        blank=True
    )
    dob = models.DateField(null=True, blank=True)
    place_of_birth = models.CharField(max_length=200, null=True, blank=True)
    religion = models.CharField(max_length=100, null=True, blank=True)
    mother_tongue = models.CharField(max_length=100, null=True, blank=True)

    # --- Contact Details ---
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    primary_phone = models.CharField(max_length=20, null=True, blank=True)

    father_name = models.CharField(max_length=200, null=True, blank=True)
    father_cnic = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        validators=[RegexValidator(
            regex=r'^\d{5}-\d{7}-\d{1}$',
            message='CNIC must be in format: 12345-1234567-1'
        )]
    )
    father_contact = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        validators=[RegexValidator(
            regex=r'^(\+92|0)?[0-9]{10}$',
            message='Phone number must be valid Pakistani number'
        )]
    )
    father_occupation = models.CharField(max_length=200, null=True, blank=True)

    secondary_phone = models.CharField(max_length=20, null=True, blank=True)
    guardian_name = models.CharField(max_length=200, null=True, blank=True)
    guardian_cnic = models.CharField(max_length=20, null=True, blank=True)
    guardian_occupation = models.CharField(max_length=200, null=True, blank=True)

    mother_name = models.CharField(max_length=200, null=True, blank=True)
    mother_cnic = models.CharField(max_length=20, null=True, blank=True)
    mother_status = models.CharField(
        max_length=20,
        choices=(("widowed", "Widowed"), ("divorced", "Divorced"), ("married", "Married")),
        null=True,
        blank=True
    )
    mother_contact = models.CharField(max_length=20, null=True, blank=True)
    mother_occupation = models.CharField(max_length=200, null=True, blank=True)

    zakat_status = models.CharField(
        max_length=20,
        choices=(("applicable", "Applicable"), ("not_applicable", "Not Applicable")),
        null=True,
        blank=True
    )

    address = models.TextField(null=True, blank=True)
    family_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    house_owned = models.BooleanField(default=False)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # --- Academic Details ---
    current_state = models.CharField(
        max_length=20,
        choices=(("active", "Active"), ("inactive", "Not Active")),
        default="active"
    )
    campus = models.ForeignKey(
        "campus.Campus",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students"
    )

    classroom = models.ForeignKey(
        "classes.ClassRoom",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students"
    )

    shift = models.CharField(max_length=1, choices=SHIFT_CHOICES, default="M")
    enrollment_year = models.IntegerField(default=timezone.now().year)

    # Previous School Details
    reason_for_transfer = models.TextField(null=True, blank=True)
    to_year = models.CharField(max_length=20, null=True, blank=True)
    from_year = models.CharField(max_length=20, null=True, blank=True)
    last_class_passed = models.CharField(max_length=50, null=True, blank=True)
    last_school_name = models.CharField(max_length=200, null=True, blank=True)
    old_gr_no = models.CharField(max_length=50, null=True, blank=True)

    # --- Auto Generated Fields ---
    student_code = models.CharField(max_length=50, unique=True, editable=False, null=True, blank=True)
    gr_no = models.CharField(max_length=20, editable=False, null=True, blank=True)

    # --- System Fields ---
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("campus", "gr_no")  # ensure GR no unique per campus

    def save(self, *args, **kwargs):
        # Auto-generate GR No (sequential within campus)
        if not self.gr_no and self.campus:
            last_student = Student.objects.filter(campus=self.campus).order_by("-id").first()
            last_num = 0
            if last_student and last_student.gr_no:
                try:
                    last_num = int(last_student.gr_no)
                except:
                    last_num = 0
            self.gr_no = f"{(last_num + 1):04d}"  # e.g. 0001

        # Auto-generate Student Code
        if not self.student_code and self.campus:
            campus_code = self.campus.campus_code[:3] if self.campus.campus_code else "CMP"
            shift_code = self.shift.upper()
            year_code = str(self.enrollment_year)[-2:]  # last 2 digits
            gr_code = self.gr_no or "0000"
            self.student_code = f"{campus_code}{shift_code}{year_code}-{gr_code}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.student_code or 'No Code'})"


class StudentEnrollment(models.Model):
    student = models.ForeignKey(Student, related_name="enrollments", on_delete=models.CASCADE)
    classroom = models.ForeignKey("classes.ClassRoom", related_name="enrollments", on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=9, help_text="e.g. 2025-2026")
    date_enrolled = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "classroom", "academic_year")
        ordering = ["-date_enrolled"]

    def __str__(self):
        return f"{self.student.name} → {self.classroom} ({self.academic_year})"
