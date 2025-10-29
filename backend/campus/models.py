from django.db import models


class Campus(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("closed", "Closed"),
        ("under_construction", "Under Construction"),
    ]

    CAMPUS_TYPE_CHOICES = [
        ("main", "Main"),
        ("branch", "Branch"),
    ]

    SHIFT_CHOICES = [
        ("morning", "Morning"),
        ("afternoon", "Afternoon"),
        ("both", "Both"),
    ]

    # 🔹 Primary Key
    id = models.AutoField(primary_key=True)

    # 🔹 Basic Info
    campus_photo = models.ImageField(upload_to='campus/photos/', blank=True, null=True, help_text="Campus photo (optional)")
    campus_id = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text="Auto-generated: CITY-YEAR-POSTAL-NO (e.g., KHI-16-75080-01)"
    )
    campus_code = models.CharField(max_length=50, blank=True, null=True)
    campus_name = models.CharField(max_length=255, blank=True)
    campus_type = models.CharField(max_length=20, choices=CAMPUS_TYPE_CHOICES, default="main")
    governing_body = models.CharField(max_length=255, blank=True, null=True)
    accreditation = models.CharField(max_length=255, blank=True, null=True)
    instruction_language = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. English, Urdu")
    academic_year_start = models.DateField(blank=True, null=True)
    academic_year_end = models.DateField(blank=True, null=True)
    established_year = models.PositiveIntegerField(blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)

    # 🔹 Location
    address_full = models.TextField(blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True, null=True)

    # 🔹 Contact
    primary_phone = models.CharField(max_length=20, blank=True)
    secondary_phone = models.CharField(max_length=20, blank=True, null=True)
    official_email = models.EmailField(blank=True)

    # 🔹 Administration
    campus_head_name = models.CharField(max_length=255, blank=True)
    campus_head_phone = models.CharField(max_length=50, blank=True, null=True)
    campus_head_email = models.EmailField(blank=True, null=True)

    total_staff_members = models.PositiveIntegerField(default=0)
    total_teachers = models.PositiveIntegerField(default=0)
    male_teachers = models.PositiveIntegerField(default=0)
    female_teachers = models.PositiveIntegerField(default=0)

    # 🔹 Students
    total_students = models.PositiveIntegerField(default=0)
    male_students = models.PositiveIntegerField(default=0)
    female_students = models.PositiveIntegerField(default=0)
    student_capacity = models.PositiveIntegerField(default=0)
    morning_students = models.PositiveIntegerField(default=0)
    afternoon_students = models.PositiveIntegerField(default=0)
    avg_class_size = models.PositiveIntegerField(default=0)
    
    # Shift-wise student counts for "Both" shift
    morning_male_students = models.PositiveIntegerField(default=0, help_text="Male students in morning shift")
    morning_female_students = models.PositiveIntegerField(default=0, help_text="Female students in morning shift")
    morning_total_students = models.PositiveIntegerField(default=0, editable=False, help_text="Auto-calculated total morning students")
    afternoon_male_students = models.PositiveIntegerField(default=0, help_text="Male students in afternoon shift")
    afternoon_female_students = models.PositiveIntegerField(default=0, help_text="Female students in afternoon shift")
    afternoon_total_students = models.PositiveIntegerField(default=0, editable=False, help_text="Auto-calculated total afternoon students")
    
    # Shift-wise teacher counts for "Both" shift
    morning_male_teachers = models.PositiveIntegerField(default=0, help_text="Male teachers in morning shift")
    morning_female_teachers = models.PositiveIntegerField(default=0, help_text="Female teachers in morning shift")
    morning_total_teachers = models.PositiveIntegerField(default=0, editable=False, help_text="Auto-calculated total morning teachers")
    afternoon_male_teachers = models.PositiveIntegerField(default=0, help_text="Male teachers in afternoon shift")
    afternoon_female_teachers = models.PositiveIntegerField(default=0, help_text="Female teachers in afternoon shift")
    afternoon_total_teachers = models.PositiveIntegerField(default=0, editable=False, help_text="Auto-calculated total afternoon teachers")
    
    # Total Non-teaching Staff
    total_non_teaching_staff = models.PositiveIntegerField(default=0, help_text="Total non-teaching staff")
    
    # Academic Year (as months)
    academic_year_start_month = models.CharField(max_length=20, blank=True, null=True, help_text="Month name e.g. 'April'")
    academic_year_end_month = models.CharField(max_length=20, blank=True, null=True, help_text="Month name e.g. 'March'")

    # 🔹 Academic / Shifts
    shift_available = models.CharField(max_length=20, choices=SHIFT_CHOICES, default="morning", blank=True)
    grades_available = models.TextField(blank=True, null=True, help_text="Comma separated e.g. Nursery, 1, 2, 3")
    grades_offered = models.TextField(blank=True, null=True, help_text="Grades offered by campus")

    # 🔹 Infrastructure
    total_rooms = models.PositiveIntegerField(default=0, editable=False)
    total_classrooms = models.PositiveIntegerField(default=0)
    total_offices = models.PositiveIntegerField(default=0)
    num_computer_labs = models.PositiveIntegerField(default=0)
    num_science_labs = models.PositiveIntegerField(default=0)
    num_biology_labs = models.PositiveIntegerField(default=0, blank=True)
    num_chemistry_labs = models.PositiveIntegerField(default=0, blank=True)
    num_physics_labs = models.PositiveIntegerField(default=0, blank=True)

    library_available = models.BooleanField(default=False, blank=True)
    power_backup = models.BooleanField(default=False)
    internet_available = models.BooleanField(default=False)
    teacher_transport = models.BooleanField(default=False)
    canteen_facility = models.BooleanField(default=False)
    meal_program = models.BooleanField(default=False)

    # 🔹 Washrooms
    total_washrooms = models.PositiveIntegerField(default=0, editable=False)
    staff_washrooms = models.PositiveIntegerField(default=0, editable=False)
    student_washrooms = models.PositiveIntegerField(default=0, editable=False)
    male_teachers_washrooms = models.PositiveIntegerField(default=0)
    female_teachers_washrooms = models.PositiveIntegerField(default=0)
    male_student_washrooms = models.PositiveIntegerField(default=0)
    female_student_washrooms = models.PositiveIntegerField(default=0)

    # 🔹 Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    # 🔹 Sports
    sports_available = models.TextField(
        blank=True,
        null=True,
        help_text="If available, list sports e.g. Cricket, Football, Swimming"
    )

    # 🔹 System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🔹 Draft Flag (bilkul end me)
    is_draft = models.BooleanField(default=False, help_text="If True, campus is in draft mode")

    # 🔹 Auto Calculations
    def save(self, *args, **kwargs):
        # Auto-generate campus_id if not provided
        if not self.campus_id:
            city_code = self.city[:3].upper() if self.city else "CMP"
            year_code = str(self.established_year or 2025)[-2:]
            postal = self.postal_code[-5:] if self.postal_code else "00000"
            
            # Use campus_code instead of serial number
            campus_code_suffix = self.campus_code if self.campus_code else "C01"

            self.campus_id = f"{city_code}-{year_code}-{postal}-{campus_code_suffix}"

        # 🔹 Auto calculate totals for washrooms
        self.staff_washrooms = self.male_teachers_washrooms + self.female_teachers_washrooms
        self.student_washrooms = self.male_student_washrooms + self.female_student_washrooms
        self.total_washrooms = self.staff_washrooms + self.student_washrooms
        
        # 🔹 Auto calculate totals for rooms
        self.total_rooms = (
            self.total_classrooms + self.total_offices + self.num_computer_labs + self.num_science_labs 
            + self.num_biology_labs + self.num_chemistry_labs + self.num_physics_labs
        )
        
        # 🔹 Auto calculate shift-wise totals for students (if "both" shift)
        if self.shift_available == "both":
            self.morning_total_students = self.morning_male_students + self.morning_female_students
            self.afternoon_total_students = self.afternoon_male_students + self.afternoon_female_students
            self.total_students = self.morning_total_students + self.afternoon_total_students
            
            self.morning_total_teachers = self.morning_male_teachers + self.morning_female_teachers
            self.afternoon_total_teachers = self.afternoon_male_teachers + self.afternoon_female_teachers
            self.total_teachers = self.morning_total_teachers + self.afternoon_total_teachers
        else:
            # For single shift (morning or afternoon), use the regular fields
            self.total_students = self.male_students + self.female_students
            self.total_teachers = self.male_teachers + self.female_teachers
        
        # 🔹 Calculate total staff (teachers + non-teaching staff)
        self.total_staff_members = self.total_teachers + self.total_non_teaching_staff

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.campus_name} ({self.campus_code})"