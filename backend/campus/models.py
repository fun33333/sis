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
    campus_id = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        help_text="Auto-generated: CITY-YEAR-POSTAL-NO (e.g., KHI-16-75080-01)"
    )
    campus_code = models.CharField(max_length=50, unique=True)
    campus_name = models.CharField(max_length=255)
    campus_type = models.CharField(max_length=20, choices=CAMPUS_TYPE_CHOICES, default="main")
    governing_body = models.CharField(max_length=255, blank=True, null=True)
    accreditation = models.CharField(max_length=255, blank=True, null=True)
    instruction_language = models.CharField(max_length=255, help_text="e.g. English, Urdu")
    academic_year_start = models.DateField()
    academic_year_end = models.DateField()
    established_year = models.PositiveIntegerField(blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)

    # 🔹 Location
    address_full = models.TextField()
    postal_code = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True, null=True)

    # 🔹 Contact
    primary_phone = models.CharField(max_length=20)
    secondary_phone = models.CharField(max_length=20, blank=True, null=True)
    official_email = models.EmailField()

    # 🔹 Administration
    campus_head_name = models.CharField(max_length=255)
    campus_head_phone = models.CharField(max_length=50, blank=True, null=True)
    campus_head_email = models.EmailField(blank=True, null=True)

    total_staff_members = models.PositiveIntegerField(default=0)
    total_teachers = models.PositiveIntegerField(default=0)
    male_teachers = models.PositiveIntegerField(default=0)
    female_teachers = models.PositiveIntegerField(default=0)
    total_maids = models.PositiveIntegerField(default=0)
    total_coordinators = models.PositiveIntegerField(default=0)
    total_guards = models.PositiveIntegerField(default=0)
    other_staff = models.PositiveIntegerField(default=0)

    # 🔹 Students
    total_students = models.PositiveIntegerField(default=0)
    male_students = models.PositiveIntegerField(default=0)
    female_students = models.PositiveIntegerField(default=0)
    student_capacity = models.PositiveIntegerField(default=0)
    morning_students = models.PositiveIntegerField(default=0)
    afternoon_students = models.PositiveIntegerField(default=0)
    avg_class_size = models.PositiveIntegerField(default=0)

    # 🔹 Academic / Shifts
    shift_available = models.CharField(max_length=20, choices=SHIFT_CHOICES, default="morning")
    grades_available = models.TextField(help_text="Comma separated e.g. Nursery, 1, 2, 3")

    # 🔹 Infrastructure
    total_rooms = models.PositiveIntegerField(default=0, editable=False)
    total_classrooms = models.PositiveIntegerField(default=0)
    total_offices = models.PositiveIntegerField(default=0)
    num_computer_labs = models.PositiveIntegerField(default=0)
    num_science_labs = models.PositiveIntegerField(default=0)

    library_available = models.BooleanField(default=False)
    power_backup = models.BooleanField(default=False)
    internet_available = models.BooleanField(default=False)
    teacher_transport = models.BooleanField(default=False)
    canteen_facility = models.BooleanField(default=False)
    meal_program = models.BooleanField(default=False)

    # 🔹 Washrooms
    total_washrooms = models.PositiveIntegerField(default=0, editable=False)
    staff_washrooms = models.PositiveIntegerField(default=0)
    student_washrooms = models.PositiveIntegerField(default=0, editable=False)
    male_staff_washrooms = models.PositiveIntegerField(default=0)
    female_staff_washrooms = models.PositiveIntegerField(default=0)
    male_student_washrooms = models.PositiveIntegerField(default=0)
    female_student_washrooms = models.PositiveIntegerField(default=0)

    # 🔹 Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    # 🔹 Sports
    sports_facility = models.BooleanField(default=False)
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

            last_campus = Campus.objects.filter(
                campus_id__startswith=f"{city_code}-{year_code}-{postal}"
            ).order_by("-id").first()

            if last_campus and last_campus.campus_id:
                try:
                    last_num = int(last_campus.campus_id.split("-")[-1])
                except:
                    last_num = 0
            else:
                last_num = 0

            self.campus_id = f"{city_code}-{year_code}-{postal}-{(last_num + 1):02d}"

        # 🔹 Auto calculate totals
        self.student_washrooms = self.male_student_washrooms + self.female_student_washrooms
        self.total_washrooms = (
            self.staff_washrooms + self.student_washrooms
        )
        self.total_rooms = (
            self.total_classrooms + self.total_offices + self.num_computer_labs + self.num_science_labs
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.campus_name} ({self.campus_code})"