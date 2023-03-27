from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
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
    maxPrice = models.FloatField(max_length=10, null=True)
    maxGroup = models.CharField(max_length=10, null=True)
    tag1 = models.CharField(max_length=100, null=True)
    tag2 = models.TextField(null=True)
    tag3 = models.TextField(null=True)
    description = models.TextField(null=True)
    website = models.TextField(null=True)
    markerColour = models.CharField(max_length=7, null=True)
    openingHours = ArrayField(models.TextField(), null=True)
    closingHours = ArrayField(models.TextField(), null=True)
    averageTime = models.CharField(max_length=3, null=True)

class SavedTrip(models.Model):
    #will probably need to set an id here as opposed to trying to use the one created by postgres
    userOwner = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    tripName = models.CharField(max_length=100,null=True)
    startLocation = models.CharField(max_length=100,null=True)
    attNames = ArrayField(models.TextField(), null=True)
    attLat = ArrayField(models.TextField(), null=True)
    attLng = ArrayField(models.TextField(), null=True)
    date = models.CharField(max_length=50,null=True)
    groupSize = models.CharField(max_length=3,null=True)
    maxPrice = models.FloatField(max_length=10, null=True)
    tripTags = ArrayField(models.CharField(max_length=200), null=True)
    tripDescs = ArrayField(models.TextField(), null=True)
    tripSites = ArrayField(models.TextField(), null=True)
    completed = models.BooleanField(default=False)
    tripColours = ArrayField(models.TextField(), null=True)
    attStatus = ArrayField(models.BooleanField(default=False), null=True)
    attClosing = ArrayField(models.TextField(), null=True)


class AttractionData(models.Model):
    attraction = models.ForeignKey(Attraction, null=True, on_delete=models.CASCADE)
    attractionName = models.CharField(max_length=100)
    averageRating = models.DecimalField(max_digits=4, decimal_places=2)
    sumOfRatings = models.IntegerField()
    totalNoRatings = models.IntegerField()
    otherAttractions = ArrayField(models.TextField(), null=True)
    occurrenceCount = ArrayField(models.IntegerField(), null=True)

class DetailsPreset(models.Model):
    preId = models.IntegerField(null=False)
    userOwner = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    presetSize = models.CharField(max_length=3, null=True)
    presetPrice = models.IntegerField(null=True)
    presetTags = ArrayField(models.CharField(max_length=200), null=True)

class PreferencesProfile(models.Model):
    userOwner = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
    whiteList = ArrayField(models.TextField(), null=True)
    blackList = ArrayField(models.TextField(), null=True)

class ExternalADUser(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    associatedAttraction = models.OneToOneField(Attraction, null=True, on_delete=models.CASCADE)
    attractionData = models.OneToOneField(AttractionData, null=True, on_delete=models.CASCADE)