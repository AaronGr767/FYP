from django.db import models
from django.contrib.auth import get_user_model
# Register your models here.

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, primary_key=True)
    email = models.CharField(max_length=100, null=True)

    def __str__(self):
        return f"{self.user}"

class Attraction(models.Model):
    #will probably need to set an id here as opposed to trying to use the one created by postgres
    name = models.CharField(max_length=100)
    latitude = models.CharField(max_length=50)
    longitude = models.CharField(max_length=50)
    tag = models.CharField(max_length=100, null=True)