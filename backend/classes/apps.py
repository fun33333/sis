from django.apps import AppConfig

class ClassesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "classes"

    def ready(self):
        # signals ko load karo (code auto-generation ke liye)
        try:
            import classes.signals  # noqa
        except Exception:
            pass
