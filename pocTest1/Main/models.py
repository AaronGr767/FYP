from django.contrib.gis.db import models

class Attraction(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.CharField(max_length=50)
    longitude = models.CharField(max_length=50)

