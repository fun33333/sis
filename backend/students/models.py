# models.py

from django.db import models
from django.utils import timezone


class Student(models.Model):
    # --- Personal Details ---
    photo = models.ImageField(upload_to="students/photos/", null=True, blank=True)
    name = models.CharField(max_length=200)
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
    father_name = models.CharField(max_length=200, null=True, blank=True)
    father_cnic = models.CharField(max_length=20, null=True, blank=True)
    father_contact = models.CharField(max_length=20, null=True, blank=True)
    father_occupation = models.CharField(max_length=200, null=True, blank=True)

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
        choices=(
            ("active", "Active"),
            ("inactive", "Inactive"),
            ("terminated", "Terminated"),
        ),
        default="active"
    )
    terminated_on = models.DateTimeField(null=True, blank=True)
    termination_reason = models.TextField(null=True, blank=True)

    campus = models.ForeignKey("campus.Campus", on_delete=models.SET_NULL, null=True, blank=True)
    current_grade = models.CharField(max_length=50, null=True, blank=True)
    section = models.CharField(max_length=10, null=True, blank=True)
    last_class_passed = models.CharField(max_length=50, null=True, blank=True)
    last_school_name = models.CharField(max_length=200, null=True, blank=True)
    gr_no = models.CharField(max_length=50, null=True, blank=True, unique=False)

    # --- ID Generation Fields ---
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    student_code = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    enrollment_year = models.IntegerField(null=True, blank=True)
    student_number = models.IntegerField(null=True, blank=True)
    shift = models.CharField(max_length=10, null=True, blank=True)

    # --- System Fields ---
    is_draft = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    classroom = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text="Classroom where student is enrolled"
    )

    # --- Properties ---
    @property
    def campus_from_classroom(self):
        return self.classroom.campus if self.classroom else self.campus

    @property
    def level(self):
        return self.classroom.level if self.classroom else None

    @property
    def grade_from_classroom(self):
        return self.classroom.grade if self.classroom else None

    @property
    def class_teacher(self):
        return self.classroom.class_teacher if self.classroom else None

    def _str_(self):
        return f"{self.name} ({self.student_code or self.student_id or self.gr_no or 'No ID'})"

    def save(self, *args, **kwargs):
        # Set termination date automatically
        if self.current_state == "terminated" and not self.terminated_on:
            self.terminated_on = timezone.now()

        # Prevent termination fields from appearing at add time
        if not self.pk:  # means this is a new student
            self.current_state = "active"
            self.terminated_on = None
            self.termination_reason = None

        # Generate student code or ID
        if not self.student_code and self.classroom:
            try:
                from utils.id_generator import IDGenerator
                self.student_code = IDGenerator.generate_unique_student_code(
                    self.classroom, self.enrollment_year or 2025
                )
            except Exception as e:
                print(f"Error generating student code: {str(e)}")

        if not self.student_id and all([self.campus, self.shift, self.enrollment_year, self.student_number]):
            from users.utils import generate_student_id, get_shift_code
            campus_code = self.campus.code or f"C{self.campus.id:02d}"
            shift_code = get_shift_code(self.shift)
            year = str(self.enrollment_year)[-2:]
            self.student_id = generate_student_id(campus_code, shift_code, year, self.student_number)

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['-created_at']