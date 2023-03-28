import decimal
from collections import defaultdict

from _decimal import Decimal
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect

from .models import Attraction, SavedTrip, AttractionData, DetailsPreset, ExternalADUser, PreferencesProfile
from django.contrib.auth import logout
from main.forms import NewUser
from main.models import UserProfile
from django.db.models import Q

from django.contrib.auth import login

# Register a new user and create a profile and user account for them
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

# Logout a user
@login_required
def logout_request(request):
    logout(request)
    messages.info(request, "Successfully logged out!")
    return redirect("main:home")

# Retrieve attractions that match chosen filters
def filterAttractions(request):

    filterArray = request.POST.getlist('filters[]')
    groupSize = request.POST.get('gSize')
    maximumPrice = request.POST.get('mPrice')
    chosenDay = request.POST.get('choseDay')

    if chosenDay != "null":
        chosenDay = int(request.POST.get('choseDay'))

    print(filterArray)

    currUser = request.user.id

    try:
        # If user has an existing blacklist/whitelist
        userPrefs = PreferencesProfile.objects.get(userOwner_id=currUser)
        print("here")
        print(userPrefs.whiteList)

        if maximumPrice != "" and len(userPrefs.whiteList) > 0 and len(userPrefs.blackList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList), maxPrice__lte=maximumPrice).exclude(
                closingHours__contains=[chosenDay, "0"]).exclude(name__in=userPrefs.blackList)

        elif len(userPrefs.whiteList) > 0 and len(userPrefs.blackList) > 0:

            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList)).exclude(closingHours__contains=[chosenDay, "0"]).exclude(
                name__in=userPrefs.blackList)


        elif maximumPrice != "" and len(userPrefs.whiteList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray) | Q(
                    name__in=userPrefs.whiteList), maxPrice__lte=maximumPrice).exclude(
                closingHours__contains=[chosenDay, "0"])

        elif maximumPrice != "" and len(userPrefs.blackList) > 0:
            filt_query = Attraction.objects.filter(
                Q(tag1__in=filterArray) | Q(tag2__in=filterArray) | Q(tag3__in=filterArray),
                maxPrice__lte=maximumPrice).exclude(closingHours__contains=[chosenDay, "0"]).exclude(
                name__in=userPrefs.blackList)

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

        return JsonResponse(list(results), safe=False)

    except PreferencesProfile.DoesNotExist:

        # If user doesnt have an existing blacklist/whitelist

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

        return JsonResponse(list(results), safe=False)

# Save a trip when it is completed
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
    tip = request.POST.getlist("tips[]", None)
    website = request.POST.getlist("site[]", None)
    colours = request.POST.getlist("mColours[]", None)
    closing = request.POST.getlist("cArray[]", None)
    maximumPrice = request.POST.get("mPrice", None)

    attStat = [False] * len(savedNames)

    try:
        #All attributes to be saved
        sTrip = SavedTrip()
        sTrip.userOwner = request.user
        sTrip.startLocation = savedStart
        sTrip.attNames = savedNames
        sTrip.attLat = savedLat
        sTrip.attLng = savedLng
        sTrip.tripDescs = description
        sTrip.tripTips = tip
        sTrip.tripSites = website
        sTrip.tripTags = savedFilt
        sTrip.tripName = tripName
        sTrip.groupSize = groupSize
        sTrip.maxPrice = maximumPrice
        sTrip.date = savedDate
        sTrip.tripColours = colours
        sTrip.attStatus = attStat
        sTrip.attClosing = closing
        sTrip.save()

        # Update occurrence count for each attraction in trip by 1
        for item in savedNames:
            tempAtt = AttractionData.objects.get(attractionName=item)
            print("Parent")
            otherAtts = [others for others in savedNames if others != item] # Creates a temporary list that doesnt contain current attraction
            for tripAtt in otherAtts:
                for i, countAtt in enumerate(tempAtt.otherAttractions): # Iterates through array in DB with an index for the specific attraction to add to
                    if (tripAtt == countAtt):   # If Database array matches temporary list
                        tempAtt.occurrenceCount[i] = tempAtt.occurrenceCount[i] + 1
                        tempAtt.save()

        # Retrieve the trip id just created in case the user wishes to start the trip immediately
        trip_query = SavedTrip.objects.values('id').filter(userOwner_id=request.user.id).order_by('-id')[0]
        print(trip_query)

        return JsonResponse(trip_query, status=200)
    except:

        return JsonResponse({"message": "Saved failed for " + request.user}, status=400)


# Retrieves the trip based on trip id so user can start trip
def retrieveTrip(request):
    savedTripId = request.POST.get("sTripId", None)

    tripid_query = SavedTrip.objects.filter(id=savedTripId).values()

    print(tripid_query)

    thisTrip = list(tripid_query)

    return JsonResponse(thisTrip, safe=False)


# Updates the attractions existing rating stats upon a user rating a specific attraction
def updateRating(request):
    ratedTrip = request.POST.get("name", None)
    tripRating = request.POST.get("rating", None)

    retrieveFilter = AttractionData.objects.get(attractionName=ratedTrip)

    print(retrieveFilter.sumOfRatings)

    # Updating the various numeric fields relevant for rating
    newRatingSum = retrieveFilter.sumOfRatings + int(tripRating)
    newRatingCount = retrieveFilter.totalNoRatings + 1
    avgRating = newRatingSum / newRatingCount
    roundRating = Decimal('{:.2f}'.format(avgRating))

    print(roundRating)

    # Updating the attraction with its new rating figures
    AttractionData.objects.filter(attractionName=ratedTrip).update(sumOfRatings=newRatingSum,
                                                                   totalNoRatings=newRatingCount,
                                                                   averageRating=roundRating)

    return HttpResponse(status=200)


# Changes the overall trip status to true upon completion
def updateTripStatus(request):
    thisTrip = request.POST.get("trId", None)

    SavedTrip.objects.filter(id=thisTrip).update(completed=True)

    return HttpResponse(status=200)

# Comparing the users trip with existing trips using Jaccard Sim and retrieving attractions present in the similar trips that meet the rating threshold
def compareSimilarity(request):
    savedFilt = request.POST.getlist('usedTags[]', None)
    minRating = request.POST.get("mRate", None)

    mySet = set(savedFilt)

    # Limit number of trips to avoid any speed issues, this can be modified accordingly as needs be
    query = SavedTrip.objects.all().order_by('-id')[:50]

    print(query[0].tripTags)

    matchingTrips = []

    # Implementing Jaccard similarity (Intersection/Union)
    for item in query:
        testSet = item.tripTags
        union = len(mySet.union(testSet))
        int = len(mySet.intersection(testSet))
        finalSim = int / union
        print(finalSim)
        # If trips are 2/3 similarity
        if (finalSim >= .66):
            matchingTrips.append(item.attNames)

    print(matchingTrips)

    # Flattening the list for suitable use
    combinedTrips = [item for innerTrips in matchingTrips for item in innerTrips]

    # Retrieving attractions that meet the users rating threshold
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

    print(set(combinedTrips))

    # Retrieving attractions that are both deemed similar and meet the rating threshold by getting the intersetion of both
    rateSet = set(checkForRating)
    simSet = set(combinedTrips)
    matchRating = list(rateSet.intersection(simSet))
    print(matchRating)

    attCount = []

    # Creating a list that counts the frequency of each attraction in similar trips
    for item in matchRating:
        temp = combinedTrips.count(item)
        attCount.append(temp)

    # Retrieve the actual attraction object for each suitable attraction and return it to user
    filt_query = Attraction.objects.filter(name__in=matchRating).values()

    finalResults = {
        "attractions": list(filt_query),
        "frequency": attCount
    }

    return JsonResponse(finalResults, status=200)

# Retrieves all trips belonging to a user
def manageTripRetrieve(request):
    userFilter = request.user.id

    trip_query = SavedTrip.objects.filter(userOwner_id=userFilter).values()

    results = {
        "userTrips": list(trip_query)
    }

    return JsonResponse(results, status=200)

# Deletes a trip specified by a user
def manageTripDelete(request):
    delTripId = request.POST.get("delId", None)

    delTrip = SavedTrip.objects.get(id=delTripId)
    delTrip.delete()

    return HttpResponse(status=200)

# Saves the users preset
def savePreset(request):
    presetId = request.POST.get("presetId", None)
    userFilter = request.user.id

    presetFilters = request.POST.getlist('filters[]', None)
    presetSize = request.POST.get("gSize", None)
    presetPrice = request.POST.get("mPrice", None)

    try:
        # If preset already exists simply overwrite it with new data
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
        #if preset does not exist, make a new database entry

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


# Retrieves chosen user preset
def retrievePreset(request):
    presetId = request.POST.get("presetId", None)
    userFilter = request.user.id

    retTrip = DetailsPreset.objects.filter(preId=presetId, userOwner_id=userFilter).values()

    context = {
        "results": list(retTrip)
    }
    return JsonResponse(context, status=200)


# Retrieves all existing presets for a user
def retrieveCreatePreset(request):
    userFilter = request.user.id

    retTrip = DetailsPreset.objects.filter(userOwner_id=userFilter).values()

    context = {
        "results": list(retTrip)
    }
    return JsonResponse(context, status=200)


# Checks to see if a users credentials exist in the external admin table & redirects them accordingly
def checkAdmin(request):
    currUser = request.user.id
    try:
        userQuery = ExternalADUser.objects.get(user_id=currUser)

        attQuery = Attraction.objects.filter(id=userQuery.associatedAttraction_id).values()

        rateQuery = AttractionData.objects.filter(id=userQuery.attractionData_id).values()

        print(attQuery[0])

        context = {
            "attraction": list(attQuery),
            "rating": list(rateQuery)
        }

        print(context)

        # Can only return attraction here as returning rating causes a problem with Decimal that doesnt allow for the object to be recieved, couldnt fix
        return render(request, 'admin.html', {'attraction': list(attQuery)})

    except ExternalADUser.DoesNotExist:
        return render(request, 'home.html')
    return JsonResponse(status=200)


# Saves any changes that an externalADUser makes to their associated attraction
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


# Retrieves the 3 most common attractions associated with a chosen attractions
def retrievePopularity(request):
    attraction = request.POST.get("attraction", None)

    popQuery = AttractionData.objects.filter(attractionName=attraction).order_by('-occurrenceCount').values_list(
        "otherAttractions", flat=True)

    # Access just the query rather than queryset and take top 3 as its already ordered by occurrence count
    popResults = popQuery[0]
    popResultsTop = popResults[:3]

    print(popResultsTop)

    # Retrieve associated attraction object for the 3 most common attractions
    retrievePop = Attraction.objects.filter(name__in=popResultsTop).values()

    context = {
        "results": list(retrievePop)
    }

    return JsonResponse(context, status=200)


# Retrieve the various extra data associated with a specified attraction for ExternalAD (rating, planned vs actual, etc)
def retrieveData(request):
    attractionId = request.POST.get("attId", None)
    attractionName = request.POST.get("attName", None)

    retrieveRateData = AttractionData.objects.filter(attraction_id=attractionId).values()

    # Count the number of trips that contain the attraction vs completed trips that contain it
    retrievePlannedData = SavedTrip.objects.filter(attNames__contains=[attractionName])
    plannedNumber = retrievePlannedData.count()

    retrieveFinishedData = SavedTrip.objects.filter(attNames__contains=[attractionName], completed=True)
    actualNumber = retrieveFinishedData.count()

    context = {
        "results": list(retrieveRateData),
        "plannedCount": plannedNumber,
        "actualCount": actualNumber
    }

    return JsonResponse(context, status=200)

# Save the users associated preferences
def savePreference(request):
    whitelistArr = request.POST.getlist('whitelist[]', None)
    blacklistArr = request.POST.getlist('blacklist[]', None)

    currUser = request.user.id
    try:
        # If user has previously saved preferences, update existing object
        userPrefs = PreferencesProfile.objects.get(userOwner_id=currUser)

        userPrefs.blackList = blacklistArr
        userPrefs.whiteList = whitelistArr
        userPrefs.save()

        return HttpResponse(status=200)

    except PreferencesProfile.DoesNotExist:

        # If user has no saved preferences object, create new object & save

        newUserPrefs = PreferencesProfile()
        newUserPrefs.userOwner_id = currUser
        newUserPrefs.blackList = blacklistArr
        newUserPrefs.whiteList = whitelistArr
        newUserPrefs.save()

        return HttpResponse(status=200)


# Retrieves users saved preferences
def retrievePreference(request):
    currUser = request.user.id
    userPrefs = PreferencesProfile.objects.filter(userOwner_id=currUser).values()

    context = {
        "results": list(userPrefs)
    }
    return JsonResponse(context, status=200)


# Retrieve a trip for editing purposes based on supplied trip Id
def editTrip(request):
    tripId = request.POST.get("attId", None)

    tripEdit = SavedTrip.objects.filter(id=tripId).values()

    context = {
        "results": list(tripEdit)
    }

    return JsonResponse(context, status=200)


# Update the trip selected for editing
def saveEditedTrip(request):
    editId = request.POST.get("tripId", None)
    savedFilt = request.POST.getlist('tripTags[]', None)
    savedStart = request.POST.get("sLocation", None)
    savedNames = request.POST.getlist("attNames[]", None)
    savedLat = request.POST.getlist("lats[]", None)
    savedLng = request.POST.getlist("lngs[]", None)
    tripName = request.POST.get("tName", None)
    savedDate = request.POST.get("cDate", None)
    groupSize = request.POST.get("gSize", None)
    description = request.POST.getlist("desc[]", None)
    tip = request.POST.getlist("tips[]", None)
    website = request.POST.getlist("site[]", None)
    colours = request.POST.getlist("mColours[]", None)
    closing = request.POST.getlist("cArray[]", None)
    maximumPrice = request.POST.get("mPrice", None)

    attStat = [False] * len(savedNames)

    counter = -1

    try:

        # my_coords = [float(coord) for coord in locations.split(", ")]
        editedTrip = SavedTrip.objects.get(id=editId)

        editedTrip.startLocation = savedStart
        editedTrip.attNames = savedNames
        editedTrip.attLat = savedLat
        editedTrip.attLng = savedLng
        editedTrip.tripDescs = description
        editedTrip.tripTips = tip
        editedTrip.tripSites = website
        editedTrip.tripTags = savedFilt
        editedTrip.tripName = tripName
        editedTrip.groupSize = groupSize
        editedTrip.maxPrice = maximumPrice
        editedTrip.date = savedDate
        editedTrip.tripColours = colours
        editedTrip.attStatus = attStat
        editedTrip.attClosing = closing
        editedTrip.save()

        # Update occurrence count for each attraction in trip by 1
        for item in savedNames:
            tempAtt = AttractionData.objects.get(attractionName=item)
            print("Parent")
            otherAtts = [others for others in savedNames if
                         others != item]  # Creates a temporary list that doesn't contain current attraction
            for tripAtt in otherAtts:
                for i, countAtt in enumerate(
                        tempAtt.otherAttractions):  # Iterates through array in DB with an index for the specific attraction to add to
                    if (tripAtt == countAtt):  # If Database array matches temporary list
                        tempAtt.occurrenceCount[i] = tempAtt.occurrenceCount[i] + 1
                        tempAtt.save()

        return JsonResponse({'id': editId}, status=200)
    except:

        return JsonResponse({"message": "Saved failed for " + request.user}, status=400)
