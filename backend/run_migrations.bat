@echo off
echo Running Database Migrations...
cd /d "%~dp0"

echo.
echo Step 1: Making migrations...
python manage.py makemigrations

echo.
echo Step 2: Applying migrations...
python manage.py migrate

echo.
echo Step 3: Creating cache table (if needed)...
python manage.py createcachetable

echo.
echo Migrations complete!
pause

