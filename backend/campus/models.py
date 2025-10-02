from django.db import models  # pyright: ignore[reportMissingImports]


class Campus(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("not_active", "Not Active"),
        ("underconstruction", "Under Construction"),
    ]
    
    LANGUAGE_CHOICES = [
        ("urdu", "Urdu"),
        ("english", "English"),
        ("english_and_urdu", "English and Urdu"),
    ]

    # General Information
    name = models.CharField(max_length=255)
    code = models.CharField(
        max_length=50,
        unique=False,   # unique hataya
        blank=True,     # form me optional
        null=True       # database me NULL allow
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    governing_body = models.CharField(max_length=255, blank=True, null=True)

    # About Campus
    registration_no = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Official campus registration or license number"
    )
    address = models.TextField()
    grades_offered = models.CharField(max_length=255, help_text="e.g. Grade 1 - Grade 12")
    languages_of_instruction = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default="english")
    # Academic year start month (1-12)
    academic_year_start_month = models.CharField(max_length=255, null=True, blank=True)
    academic_year_end_month = models.CharField(max_length=255, null=True, blank=True)


    capacity = models.PositiveIntegerField(help_text="Maximum student capacity")

    # Academic Structure
    avg_class_size = models.PositiveIntegerField(default=0)

    # Students
    num_students = models.PositiveIntegerField(default=0, help_text="Total students")
    num_students_male = models.PositiveIntegerField(default=0, help_text="Number of male students")
    num_students_female = models.PositiveIntegerField(default=0, help_text="Number of female students")

    # Teachers
    num_teachers = models.PositiveIntegerField(default=0, help_text="Total teachers")
    num_teachers_male = models.PositiveIntegerField(default=0, help_text="Number of male teachers")
    num_teachers_female = models.PositiveIntegerField(default=0, help_text="Number of female teachers")

    # Infrastructure
    total_classrooms = models.PositiveIntegerField(default=0)
    office_rooms = models.PositiveIntegerField(default=0, help_text="Number of office rooms")
    # total number of rooms (general)
    num_rooms = models.PositiveIntegerField(default=0)

    # Facilities & misc
    facilities = models.TextField(blank=True, null=True, help_text="Comma-separated list of facilities or JSON")

    # media
    photo = models.TextField(blank=True, null=True, help_text="URL or data URI for campus photo")

    # Labs & Facilities
    biology_labs = models.PositiveIntegerField(default=0)
    chemistry_labs = models.PositiveIntegerField(default=0)
    physics_labs = models.PositiveIntegerField(default=0)
    computer_labs = models.PositiveIntegerField(default=0)

    library = models.BooleanField(default=False)
    toilets_male = models.PositiveIntegerField(default=0)
    toilets_female = models.PositiveIntegerField(default=0)
    # (removed: toilets_accessible)
    toilets_teachers = models.PositiveIntegerField(default=0, help_text="Number of toilets reserved for teachers")

    power_backup = models.BooleanField(default=False)
    internet_wifi = models.BooleanField(default=False)

    # Other Info
    established_date = models.DateField(blank=True, null=True)
    campus_address = models.TextField(blank=True, null=True)
    special_classes = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Special classes like Montessori, Prep Section"
    )

    # Staff Summary
    total_teachers = models.PositiveIntegerField(default=0)
    total_non_teaching_staff = models.PositiveIntegerField(default=0)
    staff_contact_hr = models.CharField(max_length=100, blank=True, null=True)
    admission_office_contact = models.CharField(max_length=100, blank=True, null=True)

    # Draft system
    is_draft = models.BooleanField(default=True)

    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
