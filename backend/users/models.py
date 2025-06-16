from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from .managers import CustomUserManager


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('superadmin', 'Super Admin'),
        ('user', 'User'),
    )

    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'matricule', 'role']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class Rubrique(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, blank=True, null=True, unique=True)
    powerbi_url = models.URLField(blank=True, null=True, help_text="Lien vers le rapport Power BI pour cette rubrique")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class SousRubrique(models.Model):
    title = models.CharField(max_length=100)
    rubrique = models.ForeignKey(Rubrique, on_delete=models.CASCADE, related_name='sous_rubriques')
    slug = models.SlugField(max_length=150, blank=True, null=True, unique=True)
    powerbi_url = models.URLField(blank=True, null=True, help_text="Lien vers le rapport Power BI pour cette sous-rubrique")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.rubrique.title} → {self.title}"


class UserAccess(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rubrique = models.ForeignKey(Rubrique, on_delete=models.CASCADE)
    sous_rubrique = models.ForeignKey(SousRubrique, null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        if self.sous_rubrique:
            return f"{self.user.email} a accès à {self.rubrique.title} / {self.sous_rubrique.title}"
        return f"{self.user.email} a accès à toute la rubrique {self.rubrique.title}"
