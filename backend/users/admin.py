from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Rubrique, SousRubrique, UserAccess

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'matricule', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    ordering = ('email',)
    search_fields = ('email', 'first_name', 'last_name', 'matricule')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'matricule', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'matricule', 'role', 'password1', 'password2'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Rubrique)
admin.site.register(SousRubrique)
admin.site.register(UserAccess)
