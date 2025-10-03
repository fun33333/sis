from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("campus", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="campus",
            name="languages_of_instruction",
            field=models.CharField(
                choices=[
                    ("urdu", "Urdu"),
                    ("english", "English"),
                    ("english_and_urdu", "English and Urdu"),
                ],
                default="english",
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="campus",
            name="status",
            field=models.CharField(
                choices=[
                    ("active", "Active"),
                    ("not_active", "Not Active"),
                    ("underconstruction", "Under Construction"),
                ],
                default="active",
                max_length=20,
            ),
        ),
    ]


