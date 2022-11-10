from django.contrib.gis.admin import OSMGeoAdmin
from .models import Attraction
from django.contrib.gis import admin

admin.site.register(Attraction)


