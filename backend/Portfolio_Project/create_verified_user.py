import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Portfolio_Project.settings')
django.setup()

from Staff.models import Staff
from Portfolio.models import Portfolio
from django.contrib.auth.hashers import make_password

def create_verified_user():
    print("--- StockWhiz: Absolute User Reset ---")
    
    username = 'user'
    password = 'user'
    
    # 1. Complete Wipe
    Staff.objects.filter(username__iexact=username).delete()
    
    # 2. Fresh Creation
    hashed_password = make_password(password)
    staff = Staff.objects.create(
        username=username,
        password=hashed_password,
        name='StockWhiz Admin',
        email='user@gmail.com',
        phone='1234567890'
    )
    
    # 3. Portfolio Sync
    Portfolio.objects.filter(staff=staff).delete()
    Portfolio.objects.create(
        staff=staff,
        portfolio_name="StockWhiz Admin's Portfolio"
    )
    
    print(f"SUCCESS: User '{username}' created with password '{password}'")
    print(f"HASH: {hashed_password[:25]}...")
    
    # 4. Final verification test
    from django.contrib.auth.hashers import check_password
    test_ok = check_password(password, staff.password)
    print(f"VERIFICATION TEST: {'PASSED' if test_ok else 'FAILED'}")

if __name__ == "__main__":
    create_verified_user()
