#!/bin/bash
echo "Installing missing backend packages..."

echo ""
echo "Installing django-cleanup..."
pip install django-cleanup

echo ""
echo "Installing all requirements..."
pip install -r requirements.txt

echo ""
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "Backend setup complete!"
