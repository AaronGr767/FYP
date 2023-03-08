from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core import serializers
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, reverse
from django.conf import settings
from osgeo_utils.gdal2tiles import data

from .models import Attraction, SavedTrip
from django.contrib.auth import logout
from main.forms import NewUser
from main.models import UserProfile

from django.contrib.auth import authenticate, login

def register_request(request):
	if request.method == "POST":
		form = NewUser(request.POST)
		if form.is_valid():
			user = form.save()
			username = request.POST.get('username')
			email = request.POST.get('email')
			user_profile = UserProfile(user=user, username=username, email=email)
			user_profile.save()
			login(request, user)
			messages.success(request, "Registration successful." )
			return redirect("login")
		messages.error(request, "Unsuccessful registration. Invalid information.")
	form = NewUser()
	return render(request=request, template_name="registration/register.html", context={"register_form":form})

@login_required
def logout_request(request):
	logout(request)
	messages.info(request, "Successfully logged out!")
	return redirect("main:home")

def tripRoute(request):

	lat_0 = request.GET.get("lat_a", None)
	long_0 = request.GET.get("long_a", None)

	# Come back to this to fix iteration through db, current problem is "list index out of range", think its a problem with query as models dont contain id while postgres does
	# length = range(3)
	# lat=[]
	# long=[]
	#
	# for i in length:
	# 	lat_query = Attraction.objects.values('latitude').filter(id=i).values_list('latitude', flat=True)
	# 	lat_1 = lat_query[0]
	# 	lat.append(lat_1)
	#
	# 	long_query = Attraction.objects.values('longitude').filter(id=i).values_list('longitude', flat=True)
	# 	long_1 = long_query[0]
	# 	long.append(long_1)

	lat_query = Attraction.objects.values('latitude').filter(name="General Post Office").values_list('latitude', flat = True)
	lat_1 = lat_query[0]

	long_query = Attraction.objects.values('longitude').filter(name="General Post Office").values_list('longitude', flat=True)
	long_1 = long_query[0]

	lat_query = Attraction.objects.values('latitude').filter(name="Hugh Lane Gallery").values_list('latitude', flat=True)
	lat_2 = lat_query[0]

	long_query = Attraction.objects.all().filter(name="Hugh Lane Gallery").values_list('longitude', flat=True)
	long_2 = long_query[0]

	context = {
	"google_api_key": settings.API_KEY,
	"lat_1": lat_1,
	"long_1": long_1,
	# "lat_1": lat_2,
	# "long_1": long_2,
	# "lat_1": lat[1],
	# "long_1": long[1],
	"origin": f'{lat_0}, {long_0}',
	"destination": f'{lat_2}, {long_2}',
	#"destination": f'{lat[2]}, {lat[2]}',
	}
	return render(request, 'tripRoute.html', context)

def filterAttractions(request):
	i = 0
	filterArray = request.POST.getlist('filters[]')
	groupSize = request.POST.get('gSize')
	maximumPrice = request.POST.get('mPrice')
	filt_query = [];

	print(filterArray)

	results = ' '


	print(filterArray[0])

	i = 0

	long_query = Attraction.objects.values()
	print(Attraction.objects.values())
	print("priceo = ")
	print(maximumPrice)
	if maximumPrice != "":
		filt_query = Attraction.objects.filter(tag1__in=filterArray, maxPrice__lte=maximumPrice,maxGroup__gte=groupSize).values()
		print("we vibin!")
	else:
		filt_query = Attraction.objects.filter(tag1__in=filterArray, maxGroup__gte=groupSize).values()
		print("we not vibin!")

	results = filt_query

	# context = {
	# 	'google_api_key': settings.API_KEY,
	# 	'results' : filt_query
	# }

	# query_results = serializers.serialize("json", Attraction.objects.filter(tag=filterArray).values())

	# print(context.get('results'))
	print(filt_query.values('name'))

	return HttpResponse(results)

	# return render(request, 'chooseAttractions.html', context)


def saveTrip(request):
	savedStart = request.POST.get("sLocation", None)
	savedNames = request.POST.get("attNames", None)
	savedLat = request.POST.get("lats", None)
	savedLng = request.POST.get("lngs", None)
	savedFilt = request.POST.get("tags", None)
	tripName = request.POST.get("tName", None)
	savedDate = request.POST.get("cDate", None)
	groupSize = request.POST.get("gSize", None)


	try:

		# my_coords = [float(coord) for coord in locations.split(", ")]
		sTrip = SavedTrip()
		sTrip.userOwner = request.user
		sTrip.startLocation = savedStart
		sTrip.attNames = savedNames
		sTrip.attLat = savedLat
		sTrip.attLng = savedLng
		sTrip.tags = savedFilt
		sTrip.tripName = tripName
		sTrip.groupSize = groupSize
		sTrip.date = savedDate
		sTrip.save()

		trip_query = SavedTrip.objects.values('id').filter(userOwner_id=request.user.id).order_by('-id')[0]
		print("feck")
		print(trip_query)

		# message = f"Updated {request.user.username} with {f'POINT({savedNames})'}"

		return JsonResponse(trip_query, status=200)
	except:

		return JsonResponse({"message": request.user}, status=400)

def retrieveTrip(request):
	savedTripId = request.POST.get("sTripId", None)

	tripid_query = SavedTrip.objects.filter(id=savedTripId).values()
	print("Test")
	print(tripid_query)

	queryResults = tripid_query

	return HttpResponse(queryResults)