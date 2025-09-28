from django.db import models
from django.utils import timezone


class Student(models.Model):
    # --- Personal Details ---
    photo = models.ImageField(upload_to="students/photos/", null=True, blank=True)
    name = models.CharField(max_length=200)  # Only required
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
    father_cnic = models.CharField(max_length=20, null=True, blank=True)
    father_contact = models.CharField(max_length=20, null=True, blank=True)
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
    campus = models.ForeignKey("campus.Campus", on_delete=models.SET_NULL, null=True, blank=True)
    current_grade = models.CharField(max_length=50, null=True, blank=True)
    section = models.CharField(max_length=10, null=True, blank=True)
    reason_for_transfer = models.TextField(null=True, blank=True)
    to_year = models.CharField(max_length=20, null=True, blank=True)
    from_year = models.CharField(max_length=20, null=True, blank=True)
    last_class_passed = models.CharField(max_length=50, null=True, blank=True)
    last_school_name = models.CharField(max_length=200, null=True, blank=True)
    old_gr_no = models.CharField(max_length=50, null=True, blank=True)

    # ⚠️ GR No is optional now
    gr_no = models.CharField(max_length=50, null=True, blank=True, unique=False)

    # --- ID Generation Fields ---
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)  # C03-M-25-00456
    enrollment_year = models.IntegerField(null=True, blank=True)  # Year when student joined
    student_number = models.IntegerField(null=True, blank=True)  # Sequential number for the year
    shift = models.CharField(max_length=10, null=True, blank=True)  # M=Morning, E=Evening

    # --- System Fields ---
    is_draft = models.BooleanField(default=True)  # True = Draft Save, False = Final Save
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student_id or self.gr_no or 'No ID'})"
    
    def generate_student_id(self):
        """
        Generate student ID based on campus, shift, enrollment year, and student number
        """
        if not all([self.campus, self.shift, self.enrollment_year, self.student_number]):
            return None
        
        from users.utils import generate_student_id, get_shift_code
        
        campus_code = self.campus.code or f"C{self.campus.id:02d}"
        shift_code = get_shift_code(self.shift)
        year = str(self.enrollment_year)[-2:]  # Last 2 digits of year
        
        return generate_student_id(campus_code, shift_code, year, self.student_number)
    
    def save(self, *args, **kwargs):
        # Generate student_id if not exists
        if not self.student_id and all([self.campus, self.shift, self.enrollment_year, self.student_number]):
            self.student_id = self.generate_student_id()
        
        super().save(*args, **kwargs)

#done