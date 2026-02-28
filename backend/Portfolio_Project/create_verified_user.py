import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Portfolio_Project.settings')
django.setup()

from Staff.models import Staff
from Portfolio.models import Portfolio
from django.contrib.auth.hashers import make_password

def create_verified_user():
    print("--- Verified User Creation ---")
    
    # 1. Clean up existing 'user' account to ensure fresh hashing
    Staff.objects.filter(username='user').delete()
    
    # 2. Create the account with correct Django password hashing
    staff = Staff.objects.create(
        username='user',
        password=make_password('user'),
        name='StockWhiz Admin',
        email='user@gmail.com',
        phone='1234567890'
    )
    
    # 3. Ensure a single portfolio exists for this user (required by our constraint)
    Portfolio.objects.get_or_create(
        staff=staff,
        defaults={"portfolio_name": "StockWhiz Admin's Portfolio"}
    )
    
    print(f"User '{staff.username}' created successfully!")
    print(f"Hashed Password in DB: {staff.password[:20]}...")
    print("Now try logging in with: Username: user | Password: user")

if __name__ == "__main__":
    create_verified_user()
