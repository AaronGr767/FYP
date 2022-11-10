from django.db import models
from django.contrib.auth import get_user_model
# Register your models here.

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    username = models.CharField(max_length=150, primary_key=True)
    test = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user}"
# Create your models here.
