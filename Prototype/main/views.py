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

from .models import Attraction, SavedTrip, AttractionData, DetailsPreset, ExternalADUser, PreferencesProfile
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
            messages.success(request, "Registration successful.")
            return redirect("login")
        messages.error(request, "Unsuccessful registration. Invalid information.")
    form = NewUser()
    return render(request=request, template_name="registration/register.html", context={"register_form": form})


@login_required
def logout_request(request):
    logout(request)
    messages.info(request, "Successfully logged out!")
    return redirect("main:home")


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

    currUser = request.user.id
    try:
        userPrefs = PreferencesProfile.objects.get(userOwner_id=currUser)
        print("here")
        print(userPrefs.whiteList)

        if maximumPrice != "" and len(userPrefs.whiteList) > 0 and len(userPrefs.blackList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList), maxPrice__lte=maximumPrice).exclude(
                closingHours__contains=[chosenDay, "0"]).exclude(name__in=userPrefs.blackList)

        elif len(userPrefs.whiteList) > 0 and len(userPrefs.blackList) > 0:

            filt_query = Attraction.objects.filter(Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(name__in=userPrefs.whiteList)).exclude(closingHours__contains=[chosenDay, "0"]).exclude(name__in=userPrefs.blackList)


        elif maximumPrice != "" and len(userPrefs.whiteList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList), maxPrice__lte=maximumPrice).exclude(
                closingHours__contains=[chosenDay, "0"])

        elif maximumPrice != "" and len(userPrefs.blackList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray),
                maxPrice__lte=maximumPrice).exclude(closingHours__contains=[chosenDay, "0"]).exclude(name__in=userPrefs.blackList)

        elif len(userPrefs.whiteList) > 0 and len(userPrefs.blackList) == 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList)).exclude(closingHours__contains=[chosenDay, "0"])

        elif len(userPrefs.blackList) > 0 and len(userPrefs.whiteList) == 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray)).exclude(
                closingHours__contains=[chosenDay, "0"],
                name__in=userPrefs.blackList)


        results = filt_query.values()

        return HttpResponse(results)

    except PreferencesProfile.DoesNotExist:

        if maximumPrice != "" and groupSize != "null":
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray), maxPrice__lte=maximumPrice,
                maxGroup__gte=groupSize).exclude(closingHours__contains=[chosenDay, "0"])

        elif groupSize != "null":
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray),
                maxGroup__gte=groupSize).exclude(closingHours__contains=[chosenDay, "0"])

        elif maximumPrice != "":
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray),
                maxPrice__lte=maximumPrice).exclude(closingHours__contains=[chosenDay, "0"])

        else:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray)).exclude(
                closingHours__contains=[chosenDay, "0"])

        results = filt_query.values()

        return HttpResponse(results)


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

    counter = -1

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
        sTrip.attStatus = attStat
        sTrip.attClosing = closing
        sTrip.save()

        # Update occurnce count for each attraction in trip
        for item in savedNames:
            tempAtt = AttractionData.objects.get(attractionName=item)
            print("papa")
            print(item)
            otherAtts = [others for others in savedNames if others != item]
            for tripAtt in otherAtts:
                for i, countAtt in enumerate(tempAtt.otherAttractions):
                    if (tripAtt == countAtt):
                        tempAtt.occurrenceCount[i] = tempAtt.occurrenceCount[i] + 1
                        tempAtt.save()

        trip_query = SavedTrip.objects.values('id').filter(userOwner_id=request.user.id).order_by('-id')[0]
        print(trip_query)

        # message = f"Updated {request.user.username} with {f'POINT({savedNames})'}"

        return JsonResponse(trip_query, status=200)
    except:

        return JsonResponse({"message": "Saved failed for " + request.user}, status=400)


def retrieveTrip(request):
    savedTripId = request.POST.get("sTripId", None)

    tripid_query = SavedTrip.objects.filter(id=savedTripId).values()
    print("Test")
    print(tripid_query)

    thisTrip = list(tripid_query)

    return JsonResponse(thisTrip, safe=False)


def updateRating(request):
    ratedTrip = request.POST.get("name", None)
    tripRating = request.POST.get("rating", None)

    # retrieveFilter = AttractionData.objects.values("sumOfRatings","totalNoRatings").filter(attractionName=ratedTrip)
    retrieveFilter = AttractionData.objects.get(attractionName=ratedTrip)

    print(retrieveFilter.sumOfRatings)

    newRatingSum = retrieveFilter.sumOfRatings + int(tripRating)
    newRatingCount = retrieveFilter.totalNoRatings + 1
    avgRating = newRatingSum / newRatingCount
    roundRating = Decimal('{:.2f}'.format(avgRating))
    print(roundRating)

    AttractionData.objects.filter(attractionName=ratedTrip).update(sumOfRatings=newRatingSum,
                                                                   totalNoRatings=newRatingCount,
                                                                   averageRating=roundRating)

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
        finalSim = int / union
        print(finalSim)
        if (finalSim > .6):
            matchingTrips.append(item.attNames)

    print(matchingTrips)

    combinedTrips = [item for innerTrips in matchingTrips for item in innerTrips]

    # counts = defaultdict(lambda: 0)
    #
    # for item in combinedTrips:
    # 	counts[item] += 1
    #
    # print(counts)

    filterRating = AttractionData.objects.filter(averageRating__gte=minRating).values_list("attractionName")
    print(filterRating)

    checkForRating = []

    # Alter the query results for comparison purposes
    for item in filterRating:
        strItem = str(item)
        print(strItem)
        alter = strItem.replace("(", '').replace(")", '').replace(",", "").replace("'", '')
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
        delTrip = DetailsPreset.objects.get(preId=presetId, userOwner_id=userFilter)
        print(delTrip)

        delTrip.preId = presetId
        delTrip.presetTags = presetFilters
        if (presetSize != ''):
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
        userQuery = ExternalADUser.objects.get(user_id=currUser)

        attQuery = Attraction.objects.filter(id=userQuery.associatedAttraction_id).values()

        rateQuery = AttractionData.objects.filter(id=userQuery.attractionData_id).values()

        print(attQuery[0])
        print("AHHHHHH")

        context = {
            "attraction": list(attQuery),
            "rating": list(rateQuery)
        }

        print(context)

        # Can only return attraction here as returning rating causes a problem with Decimal that doesnt allow for the object to be recieved
        return render(request, 'admin.html', {'attraction': list(attQuery)})

    except ExternalADUser.DoesNotExist:
        return render(request, 'home.html')
    return JsonResponse(status=200)


def saveAttractionChanges(request):
    attId = request.POST.get("attId", None)
    attDesc = request.POST.get("desc", None)
    attOpHours = request.POST.getlist('oHours[]', None)
    attClHours = request.POST.getlist('cHours[]', None)

    thisAtt = Attraction.objects.get(id=attId)

    thisAtt.description = attDesc
    thisAtt.openingHours = attOpHours
    thisAtt.closingHours = attClHours

    thisAtt.save()

    return HttpResponse(status=200)


def retrievePopularity(request):
    attraction = request.POST.get("attraction", None)

    popQuery = AttractionData.objects.filter(attractionName=attraction).order_by('-occurrenceCount').values_list(
        "otherAttractions", flat=True)[:3]

    # Access just the array
    popQuery = popQuery[0]

    retrievePop = Attraction.objects.filter(name__in=popQuery).values()

    print(retrievePop)

    context = {
        "results": list(retrievePop)
    }

    return JsonResponse(context, status=200)


def retrieveData(request):
    attractionId = request.POST.get("attId", None)
    attractionName = request.POST.get("attName", None)

    retrieveRateData = AttractionData.objects.filter(attraction_id=attractionId).values()

    retrievePlannedData = SavedTrip.objects.filter(attNames__contains=[attractionName])
    print(retrievePlannedData)
    plannedNumber = retrievePlannedData.count()

    retrieveFinishedData = SavedTrip.objects.filter(attNames__contains=[attractionName], completed=True)
    actualNumber = retrieveFinishedData.count()

    context = {
        "results": list(retrieveRateData),
        "plannedCount": plannedNumber,
        "actualCount": actualNumber
    }

    return JsonResponse(context, status=200)


def savePreference(request):
    whitelistArr = request.POST.getlist('whitelist[]', None)
    blacklistArr = request.POST.getlist('blacklist[]', None)

    currUser = request.user.id
    try:
        userPrefs = PreferencesProfile.objects.get(userOwner_id=currUser)

        userPrefs.blackList = blacklistArr
        userPrefs.whiteList = whitelistArr
        userPrefs.save()

        return HttpResponse(status=200)

    except PreferencesProfile.DoesNotExist:

        print(whitelistArr)
        newUserPrefs = PreferencesProfile()
        newUserPrefs.userOwner_id = currUser
        newUserPrefs.blackList = blacklistArr
        newUserPrefs.whiteList = whitelistArr
        newUserPrefs.save()

        return HttpResponse(status=200)

def retrievePreference(request):
	currUser = request.user.id
	userPrefs = PreferencesProfile.objects.filter(userOwner_id=currUser).values()

	context = {
		"results": list(userPrefs)
	}
	return  JsonResponse(context, status=200)