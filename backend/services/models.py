from django.db import models


class GlobalCounter(models.Model):
    """
    Thread-safe monotonically increasing counters for system-wide sequences.
    Keys examples: 'student', 'employee'.
    """
    key = models.CharField(max_length=50, unique=True)
    value = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'global_counters'

    def __str__(self):
        return f"{self.key}:{self.value}"

from django.db import models

# Create your models here.
