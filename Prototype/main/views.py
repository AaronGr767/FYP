import decimal
from collections import defaultdict

from _decimal import Decimal
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core import serializers
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, reverse
from django.conf import settings
from osgeo_utils.gdal2tiles import data

from .models import Attraction, SavedTrip, AttractionRating, DetailsPreset, ExternalADUser
from django.contrib.auth import logout
from main.forms import NewUser
from main.models import UserProfile
from django.db.models import Q

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

# def tripRoute(request):
#
# 	lat_0 = request.GET.get("lat_a", None)
# 	long_0 = request.GET.get("long_a", None)
#
# 	# Come back to this to fix iteration through db, current problem is "list index out of range", think its a problem with query as models dont contain id while postgres does
# 	# length = range(3)
# 	# lat=[]
# 	# long=[]
# 	#
# 	# for i in length:
# 	# 	lat_query = Attraction.objects.values('latitude').filter(id=i).values_list('latitude', flat=True)
# 	# 	lat_1 = lat_query[0]
# 	# 	lat.append(lat_1)
# 	#
# 	# 	long_query = Attraction.objects.values('longitude').filter(id=i).values_list('longitude', flat=True)
# 	# 	long_1 = long_query[0]
# 	# 	long.append(long_1)
#
# 	lat_query = Attraction.objects.values('latitude').filter(name="General Post Office").values_list('latitude', flat = True)
# 	lat_1 = lat_query[0]
#
# 	long_query = Attraction.objects.values('longitude').filter(name="General Post Office").values_list('longitude', flat=True)
# 	long_1 = long_query[0]
#
# 	lat_query = Attraction.objects.values('latitude').filter(name="Hugh Lane Gallery").values_list('latitude', flat=True)
# 	lat_2 = lat_query[0]
#
# 	long_query = Attraction.objects.all().filter(name="Hugh Lane Gallery").values_list('longitude', flat=True)
# 	long_2 = long_query[0]
#
# 	context = {
# 	"google_api_key": settings.API_KEY,
# 	"lat_1": lat_1,
# 	"long_1": long_1,
# 	# "lat_1": lat_2,
# 	# "long_1": long_2,
# 	# "lat_1": lat[1],
# 	# "long_1": long[1],
# 	"origin": f'{lat_0}, {long_0}',
# 	"destination": f'{lat_2}, {long_2}',
# 	#"destination": f'{lat[2]}, {lat[2]}',
# 	}
# 	return render(request, 'tripRoute.html', context)

def filterAttractions(request):
	i = 0
	filterArray = request.POST.getlist('filters[]')
	groupSize = request.POST.get('gSize')
	maximumPrice = request.POST.get('mPrice')
	chosenDay = request.POST.get('choseDay')
	# filt_query = [];
	if chosenDay != "null":
		chosenDay = int(request.POST.get('choseDay'))

	print(filterArray)

	results = ' '


	print(filterArray[0])

	i = 0

	long_query = Attraction.objects.values()
	print(Attraction.objects.values())
	print("priceo = ")
	print(maximumPrice)
	if (maximumPrice != "" or maximumPrice != 0) and (chosenDay != "null"):
		filt_query = Attraction.objects.filter(
			Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray), maxPrice__lte=maximumPrice,
			maxGroup__gte=groupSize).exclude(closingHours__contains=[chosenDay, "0"])
	# filt_query = [attraction for attraction in filt_query if attraction.closingHours[chosenDay] != "0"]

	elif chosenDay != "null":
		filt_query = Attraction.objects.filter(
			Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray),
			maxGroup__gte=groupSize).exclude(closingHours__contains=[chosenDay, "0"])
	# filt_query = [attraction for attraction in filt_query if attraction.closingHours[chosenDay] != "0"]

	elif maximumPrice != "" or maximumPrice != 0:
		filt_query = Attraction.objects.filter(
			Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray), maxPrice__lte=maximumPrice,
			maxGroup__gte=groupSize)
	# filt_query = [attraction for attraction in filt_query if attraction.closingHours[chosenDay] != "0"]

	else:
		filt_query = Attraction.objects.filter(
			Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray), maxGroup__gte=groupSize)

	results = filt_query.values()

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
	savedFilt = request.POST.getlist('tripTags[]', None)
	savedStart = request.POST.get("sLocation", None)
	savedNames = request.POST.getlist("attNames[]", None)
	savedLat = request.POST.getlist("lats[]", None)
	savedLng = request.POST.getlist("lngs[]", None)
	tripName = request.POST.get("tName", None)
	savedDate = request.POST.get("cDate", None)
	groupSize = request.POST.get("gSize", None)
	description = request.POST.getlist("desc[]", None)
	website = request.POST.getlist("site[]", None)
	colours = request.POST.getlist("mColours[]", None)
	closing = request.POST.getlist("cArray[]", None)

	attStat = [False] * len(savedNames)

	try:

		# my_coords = [float(coord) for coord in locations.split(", ")]
		sTrip = SavedTrip()
		sTrip.userOwner = request.user
		sTrip.startLocation = savedStart
		sTrip.attNames = savedNames
		sTrip.attLat = savedLat
		sTrip.attLng = savedLng
		sTrip.tripDescs = description
		sTrip.tripSites = website
		sTrip.tripTags = savedFilt
		sTrip.tripName = tripName
		sTrip.groupSize = groupSize
		sTrip.date = savedDate
		sTrip.tripColours = colours
		sTrip.attStatus =attStat
		sTrip.attClosing = closing
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

	thisTrip= list(tripid_query)



	return JsonResponse(thisTrip, safe=False)

def updateRating(request):
	ratedTrip = request.POST.get("name", None)
	tripRating = request.POST.get("rating", None)

	# retrieveFilter = AttractionRating.objects.values("sumOfRatings","totalNoRatings").filter(attractionName=ratedTrip)
	retrieveFilter = AttractionRating.objects.get(attractionName=ratedTrip)

	print(retrieveFilter.sumOfRatings)

	newRatingSum = retrieveFilter.sumOfRatings + int(tripRating)
	newRatingCount = retrieveFilter.totalNoRatings + 1
	avgRating = newRatingSum/newRatingCount
	roundRating = Decimal('{:.2f}'.format(avgRating))
	print(roundRating)

	AttractionRating.objects.filter(attractionName=ratedTrip).update(sumOfRatings=newRatingSum,totalNoRatings=newRatingCount, averageRating = roundRating)

	return HttpResponse(status=200)

def updateTripStatus(request):
	thisTrip = request.POST.get("trId", None)

	SavedTrip.objects.filter(id=thisTrip).update(completed=True)

	return HttpResponse(status=200)

def compareSimilarity(request):
	savedFilt = request.POST.getlist('usedTags[]', None)
	minRating = request.POST.get("mRate", None)

	mySet = set(savedFilt)

	query = SavedTrip.objects.all().order_by('-id')[:10]
	print(savedFilt)
	print(query[0].tripTags)

	matchingTrips = []

	for item in query:
		testSet = item.tripTags
		union = len(mySet.union(testSet))
		int = len(mySet.intersection(testSet))
		finalSim = int/union
		print(finalSim)
		if(finalSim>.6):
			matchingTrips.append(item.attNames)

	print(matchingTrips)

	combinedTrips = [item for innerTrips in matchingTrips for item in innerTrips]

	# counts = defaultdict(lambda: 0)
	#
	# for item in combinedTrips:
	# 	counts[item] += 1
	#
	# print(counts)

	filterRating = AttractionRating.objects.filter(averageRating__gte=minRating).values_list("attractionName")
	print(filterRating)

	checkForRating = []

	#Alter the query results for comparison purposes
	for item in filterRating:
		strItem = str(item)
		print(strItem)
		alter = strItem.replace("(",'').replace(")",'').replace(",","").replace("'",'')
		checkForRating.append(alter)


	print(set(checkForRating))
	print("test")
	print(set(combinedTrips))

	rateSet = set(checkForRating)
	simSet = set(combinedTrips)
	matchRating = list(rateSet.intersection(simSet))
	print(matchRating)

	# for item in list(counts.keys()):
	# 	if counts[item] in matchRating:
	# 		del counts[item]

	attCount = []

	for item in matchRating:
		temp = combinedTrips.count(item)
		attCount.append(temp)

	filt_query = Attraction.objects.filter(name__in=matchRating).values()

	finalResults = {
		"attractions": list(filt_query),
		"frequency": attCount
	}

	return JsonResponse(finalResults, status=200)

def manageTripRetrieve(request):

	userFilter = request.user.id

	trip_query = SavedTrip.objects.filter(userOwner_id=userFilter).values()

	results = {
		"userTrips": list(trip_query)
	}

	return JsonResponse(results, status=200)

def manageTripDelete(request):
	delTripId = request.POST.get("delId", None)

	delTrip = SavedTrip.objects.get(id=delTripId)
	delTrip.delete()

	return HttpResponse(status=200)

def savePreset(request):
	presetId = request.POST.get("presetId", None)
	userFilter = request.user.id

	presetFilters = request.POST.getlist('filters[]', None)
	presetSize = request.POST.get("gSize", None)
	presetPrice = request.POST.get("mPrice", None)

	try:
		delTrip = DetailsPreset.objects.get(preId=presetId,userOwner_id=userFilter)
		print(delTrip)

		delTrip.preId = presetId
		delTrip.presetTags = presetFilters
		if(presetSize != ''):
			delTrip.presetSize = presetSize
		else:
			delTrip.presetSize = None

		if (presetPrice != ''):
			delTrip.presetPrice = presetPrice
		else:
			delTrip.presetPrice = None

		delTrip.save()
		return HttpResponse(status=200)

	except DetailsPreset.DoesNotExist:
		detPreset = DetailsPreset()
		detPreset.userOwner = request.user
		detPreset.preId = presetId
		detPreset.presetTags = presetFilters

		if (presetSize != ''):
			detPreset.presetSize = presetSize
		else:
			detPreset.presetSize = None

		if (presetPrice != ''):
			detPreset.presetPrice = presetPrice
		else:
			detPreset.presetPrice = None

		detPreset.save()
		return HttpResponse(status=200)

def retrievePreset(request):
	presetId = request.POST.get("presetId", None)
	userFilter = request.user.id

	retTrip = DetailsPreset.objects.filter(preId=presetId, userOwner_id=userFilter).values()

	context = {
		"results": list(retTrip)
	}
	return JsonResponse(context, status=200)

def retrieveCreatePreset(request):
	userFilter = request.user.id

	retTrip = DetailsPreset.objects.filter(userOwner_id=userFilter).values()

	context = {
		"results": list(retTrip)
	}
	return JsonResponse(context, status=200)

def checkAdmin(request):
	currUser = request.user.id
	try:
		userQuery = ExternalADUser.objects.get(user_id = currUser)

		attQuery = Attraction.objects.filter(id = userQuery.associatedAttraction_id).values()

		rateQuery = AttractionRating.objects.filter(id = userQuery.attractionRating_id).values()

		print(attQuery[0])
		print("AHHHHHH")

		context = {
			"attraction":list(attQuery),
			"rating": list(rateQuery)
		}

		print(context)

		#Can only return attraction here as returning rating causes a problem with Decimal that doesnt allow for the object to be recieved
		return render(request,'admin.html', {'attraction': list(attQuery)})

	except ExternalADUser.DoesNotExist:
		return render(request,'home.html')
	return JsonResponse(status=200)


