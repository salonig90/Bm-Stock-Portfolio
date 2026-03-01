from django.contrib import admin
from .models import Staff

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'username', 'email', 'phone')
    search_fields = ('name', 'username', 'email')
