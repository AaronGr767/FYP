document.getElementById('doingOptionsContainer').innerHTML = ``;
let popup = document.getElementById("optPopUp");
popup.style.display = "none";

let displayCounter = 0;
let finishedAttractions = 0;
let userLocation;
let chosenLatlng;
let finishedArray = [];
let routePath = [];
let firstTimeCheck = 0;
let alreadyClosed = 0;
let nearbyMarker = [];
let routePending;
let lockClosed = []

let markCount = 0;
let locMarker;
let lastRoute;
let directionsRenderer;
//or var if breaks

let mapType = document.getElementById("cust")


let resultsObj = [];
let optCont = document.getElementById('doingOptionsContainer')
let results = localStorage.getItem("currentTrip");

if (results == null) {
    resultsObj = [];
} else {
    resultsObj = JSON.parse(results);
}

tripName()

visitStatus()

// If this is a previously completed trip, reset all the statuses for the attractions
function visitStatus() {
    let status = localStorage.getItem("editedTripStatus");
    if (status == "true") {
        for (j = 0; j < resultsObj.attStatus.length; j++) {
            resultsObj.attStatus[j] = true;
        }
    }
}


if (mapType.checked) {
    displayOptions()
}

// Display the trips name
function tripName() {
    let tripTitle = document.getElementById('tripHeader')
    tripTitle.innerHTML = ``
    tripTitle.innerHTML = `<em>${resultsObj.tripName}</em>`
}

locationMarker(markCount)

// Calls the checkTime function every minute
setTimeout(checkTime, 60000)


function checkTime() {
    let closingNameArray = []
    let closingTimeArray = []
    let closedNameArray = []
    let closedTimeArray = []
    let currTime = new Date();

    //Formats the current time into minutes
    let compareTime = (currTime.getHours() * 60) + currTime.getMinutes()
    console.log(resultsObj.attNames.length)

    //Iterates through each attraction
    for (i = 0; i < resultsObj.attNames.length; i++) {

        console.log(resultsObj.attNames.length)
        let attHour = parseInt(resultsObj.attClosing[i].substring(0, 2)) * 60
        let attMins = parseInt(resultsObj.attClosing[i].substring(2))
        let attTime = attHour + attMins
        let dif = attTime - compareTime;
        console.log("dif for each= " + dif)

        // If the attraction closes in an hour or less than an hour after the user has stopped the trip store its name & time
        if (dif == 60 || (firstTimeCheck == 0 && dif < 60 && dif > 0)) {
            closingNameArray.push(resultsObj.attNames[i])
            closingTimeArray.push(resultsObj.attClosing[i])
        }

        // If the attraction is closed store its name & time aswell as placing it in an array to be locked
        if (dif == 0 || (alreadyClosed == 0 && dif < 0)) {
            closedNameArray.push(resultsObj.attNames[i])
            closedTimeArray.push(resultsObj.attClosing[i])
            lockClosed.push(resultsObj.attNames[i])
        }

    }

    // Disable all closed attractions
    lockClosedAttraction(lockClosed)
    firstTimeCheck++
    alreadyClosed++

    // If there are any attractions that close in an hour, notify the user
    if (closingNameArray.length != 0) {
        let mapDiv = document.getElementById("map");
        timeAlertBox = document.createElement("div");
        timeAlertBox.setAttribute("id", "timeAlert");
        timeAlertBox.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        timeAlertBox.setAttribute("role", "alert")
        timeAlertBox.innerHTML = `<strong>Warning!</strong> <i class="fa-solid fa-clock-rotate-left"></i><br> Attraction(s) closing within an hour:<br> <button type="button" onclick=closeAlert("time") class="btn-close" data-bs-dismiss="alert"aria-label="Close"></button> <ul id="closingAtts"></ul>`;

        if (timeAlertBox.parentNode) {
            timeAlertBox.parentNode.removeChild(timeAlertBox);
        }

        mapDiv.appendChild(timeAlertBox)
        timeAlertBox.style.display = 'block'
        let alertList = document.getElementById("closingAtts")
        alertList.innerHTML = ``;

        for (i = 0; i < closingNameArray.length; i++) {
            alertList.innerHTML += `<li>${closingNameArray[i]} / ${closingTimeArray[i].substring(0, 2)}:${closingTimeArray[i].substring(2)}</li>`
        }
    }

    // If there are any attractions that are now closed, notify the user
    if (closedNameArray.length != 0) {
        let mapDiv = document.getElementById("map");
        closeAlertBox = document.createElement("div");
        closeAlertBox.setAttribute("id", "closedAlert");
        closeAlertBox.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        closeAlertBox.setAttribute("role", "alert")
        closeAlertBox.innerHTML = `<strong>Warning!</strong> <i class="fa-solid fa-clock-rotate-left"></i><br> Attraction(s) now closed:<br> <button type="button" onclick=closeAlert("closed") class="btn-close" data-bs-dismiss="alert"aria-label="Close"></button> <ul id="closedAtts"></ul>`;

        if (closeAlertBox.parentNode) {
            closeAlertBox.parentNode.removeChild(closeAlertBox);
        }


        mapDiv.appendChild(closeAlertBox)
        closeAlertBox.style.display = 'block'
        let clAlertList = document.getElementById("closedAtts")
        clAlertList.innerHTML = ``;

        for (i = 0; i < closedNameArray.length; i++) {
            clAlertList.innerHTML += `<li>${closedNameArray[i]} / ${closedTimeArray[i].substring(0, 2)}:${closedTimeArray[i].substring(2)}</li>`
        }
    }

}

//Disable the attractions that are closed
function lockClosedAttraction(closedNames) {

    for (i = 0; i < closedNames.length; i++) {

        for (j = 0; j < resultsObj.attNames.length; j++) {

            let checkAttName = document.getElementById(j)
            if (closedNames[i] == checkAttName.name) {

                checkAttName.disabled = true;
                let checkAttDiv = document.getElementById("title" + j)
                let checkAttLabel = document.getElementById("dis" + j)

                checkAttDiv.title = "Closed"
                checkAttLabel.innerHTML = `${closedNames[i]} <i class="fa-solid fa-shop-lock"></i>`
            }
        }
    }
}

//Disable an attraction if the user has finished it
function lockFinishedAttraction(finName) {

    for (j = 0; j < resultsObj.attNames.length; j++) {

        let checkAttName = document.getElementById(j)
        if (finName == checkAttName.name) {

            checkAttName.disabled = true;
            let checkAttDiv = document.getElementById("title" + j)
            let checkAttLabel = document.getElementById("dis" + j)

            checkAttDiv.title = "Finished"
            checkAttLabel.innerHTML += ` <i class="fa-solid fa-circle-check"></i>`
        }
    }

}

// If the user starts a break then change the display to break in progress and start the break
function renderBreak(state, radius) {
    let alertBox = document.getElementById("breakAlert")
    alertBox.style.display = 'none'

    let sUBreak = document.getElementById("breakSetUp")
    sUBreak.style.display = 'none'
    let progBreak = document.getElementById("breakInProg")
    progBreak.style.display = 'block'

    let bType;

    if (state == "start") {
        bType = document.getElementById("breakType").value;

        let progType = document.getElementById("progBreakType")
        progType.value = bType;
    } else {
        bType = document.getElementById("progBreakType").value;
    }


    let formatType;

    // If the users breaktype is shopping, create this tailored request
    if (bType == "store") {
        formatType = ["clothing_store", "jewelry_store"]
        let request1 = {
            location: userLocation,
            radius: radius,
            type: [formatType[0]]
        }
        let request2 = {
            location: userLocation,
            radius: radius,
            type: [formatType[2]]
        }

        service = new google.maps.places.PlacesService(map);

        // Search for nearby locations based on the above requests
        service.nearbySearch(request1, callback);
        service.nearbySearch(request2, callback);

    } else {
        formatType = [bType]
        let request = {
            location: userLocation,
            radius: radius,
            type: formatType
        }

        service = new google.maps.places.PlacesService(map);

        // Search for nearby locations based on the above request
        service.nearbySearch(request, callback);
    }


}

// Callback to display results of the break request
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (i = 0; i < results.length; i++) {

            console.log(results[i])
            createMarker(results[i]);

        }
    }
}

//Creates a marker for each location that fits the filters provided by the break request
function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });

    nearbyMarker.push(marker)

    nearbyMarker[nearbyMarker.length - 1].addListener('click', function () {
        let infowindow = new google.maps.InfoWindow({
            content: place.name
        });
        infowindow.open(map, nearbyMarker[nearbyMarker.length - 1]); // Open the info window at the marker's position
    });

    // nearbyMarker[nearbyMarker.length-1].setMap(map)

}

//Removes markers for all break locations
function removeBreakLocs() {
    for (i = 0; i < nearbyMarker.length; i++) {
        nearbyMarker[i].setMap(null);
    }
}

// Ends the break for user and hides 'break in progress' section
function finishBreak() {
    for (i = 0; i < nearbyMarker.length; i++) {
        nearbyMarker[i].setMap(null);
    }

    let sUBreak = document.getElementById("breakSetUp")
    sUBreak.style.display = 'block'
    let progBreak = document.getElementById("breakInProg")
    progBreak.style.display = 'none'
}

// Begins a break for user
function beginBreak() {
    let brHour = document.getElementById("breakHours").value
    let brMins = document.getElementById("breakMins").value
    let brTime = brHour + ":" + brMins

    // Regex for a valid time format
    let testRegex = new RegExp("^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$")

    // If the user has inpuuted a valid time
    if (testRegex.test(brTime)) {
        let closingNameArray = []
        let closingTimeArray = []
        let currTime = new Date();
        let brTimeFormat = (parseInt(brHour) * 60) + parseInt(brMins)
        let compareTime = (currTime.getHours() * 60) + currTime.getMinutes()

        let combinedTime = brTimeFormat + compareTime

        let intFormatTimes = resultsObj.attClosing.map(str => parseInt(str))
        let maxTime = Math.max(...intFormatTimes)
        let maxHours = parseInt(String(maxTime).substring(0, 2))
        let maxMins = parseInt(String(maxTime).substring(2))

        let finalTime = (maxHours * 60) + maxMins

        // If the users chosen break length will exceed the latest closing time for the attractions, notify them accordingly
        if (combinedTime > finalTime) {
            let breakSetup = document.getElementById("breakSetUp");
            alertBox = document.createElement("div");
            alertBox.setAttribute("id", "invalidAlert");
            alertBox.setAttribute("class", "alert alert-danger alert-dismissible fade show");
            alertBox.setAttribute("role", "alert")
            alertBox.innerHTML = '<strong>Error!</strong> <i class="fa-solid fa-circle-xmark"></i><p id="errorMsg">Invalid time format!</p><button type="button" onclick="closeInvAlert()" class="btn-close" data-bs-dismiss="alert"\n' +
                '                        aria-label="Close"></button>';

            if (alertBox.parentNode) {
                alertBox.parentNode.removeChild(alertBox);
            }


            breakSetup.appendChild(alertBox)
            alertBox.style.display = 'block'
            let errMsg = document.getElementById("errorMsg")
            errMsg.innerHTML = `No attractions will be open at this hour!`


        } else {
            for (i = 0; i < resultsObj.attClosing.length; i++) {
                console.log(i)
                let attHour = parseInt(resultsObj.attClosing[i].substring(0, 2)) * 60
                let attMins = parseInt(resultsObj.attClosing[i].substring(2))

                // calculate if any attractions will close during or an after the break
                let attTime = attHour + attMins
                let dif = attTime - combinedTime;
                if (combinedTime > attTime || dif <= 60) {
                    closingNameArray.push(resultsObj.attNames[i])
                    closingTimeArray.push(resultsObj.attClosing[i])
                }
            }

            // if any attractions will close during or an after the break then notify the user accordingly, otherwise just start the break
            if (closingNameArray.length != 0) {
                let breakSetup = document.getElementById("breakSetUp");
                breakAlertBox = document.createElement("div");
                breakAlertBox.setAttribute("id", "breakAlert");
                breakAlertBox.setAttribute("class", "alert alert-warning  alert-dismissible fade show");
                breakAlertBox.setAttribute("role", "alert")
                breakAlertBox.innerHTML = '<strong>Warning!</strong> <i class="fa-solid fa-clock-rotate-left"></i><br> Keep in mind the closing hour for these attractions:<br> <button type="button" onclick=closeAlert("break") class="btn-close" data-bs-dismiss="alert"aria-label="Close"></button> <ul id="closingBreakAtts"></ul> <div style="margin-left: 10%;text-align: center"> <button type="button" onclick=renderBreak() class="btn btn-outline-warning" style="color: slategray;">Confirm Break</button> </div>';

                if (breakAlertBox.parentNode) {
                    breakAlertBox.parentNode.removeChild(breakAlertBox);
                }


                breakSetup.appendChild(breakAlertBox)
                breakAlertBox.style.display = 'block'
                let alertList = document.getElementById("closingBreakAtts")
                alertList.innerHTML = ``;

                console.log(closingNameArray)

                for (let k = 0; k < closingNameArray.length; k++) {
                    alertList.innerHTML += `<li>${closingNameArray[k]} / ${closingTimeArray[k].substring(0, 2)}:${closingTimeArray[k].substring(2)}</li>`
                }
            } else {

                // Begin the break with a default seach radius of 300 metres
                renderBreak("start", "300")
            }
        }

        // Notify the user of an invalid time format inputted
    } else {
        let breakSetup = document.getElementById("breakSetUp");
        alertBox = document.createElement("div");
        alertBox.setAttribute("id", "invalidAlert");
        alertBox.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        alertBox.setAttribute("role", "alert")
        alertBox.innerHTML = '<strong>Error!</strong> <i class="fa-solid fa-circle-xmark"></i><p id="errorMsg">Invalid time format!</p><button type="button" onclick="closeInvAlert()" class="btn-close" data-bs-dismiss="alert"\n' +
            '                        aria-label="Close"></button>';

        if (alertBox.parentNode) {
            alertBox.parentNode.removeChild(alertBox);
        }


        breakSetup.appendChild(alertBox)
        alertBox.style.display = 'block'
        let errMsg = document.getElementById("errorMsg")
        errMsg.innerHTML = `Invalid time format!`
    }
}

// Close the various pop ups a user may encounter
function closeAlert(closeCheck) {
    if (closeCheck == "time") {
        let alertBox = document.getElementById("timeAlert")
        let alertList = document.getElementById("closingAtts")
        alertList.innerHTML = ``
        alertBox.style.display = 'none'
    } else if (closeCheck == "break") {
        let alertBox = document.getElementById("breakAlert")
        let alertList = document.getElementById("closingBreakAtts")
        alertList.innerHTML = ``
        alertBox.style.display = 'none'
    } else if (closeCheck == "closed") {
        let alertBox = document.getElementById("closedAlert")
        let alertList = document.getElementById("closedAtts")
        alertList.innerHTML = ``
        alertBox.style.display = 'none'
    }

}

// Closed invalid time alert
function closeInvAlert() {
    let alertBox = document.getElementById("invalidAlert")
    alertBox.style.display = 'none'
}

// Display all the users attractions in the trip for selection purposes
function displayOptions() {
    if (routePath.length != 0) {
        for (i = 0; i < routePath.length; i++)
            routePath[i].setMap(null);
    }
    optCont.innerHTML = ``;

    for (i = 0; i < resultsObj.attNames.length; i++) {

        console.log(resultsObj.attNames[i])

        let disId = "dis" + i
        let titleId = "title" + i

        checkHtml = `
                            <div id=${titleId} class="btn-group" role="group" aria-label="Basic radio toggle button group" style="margin-bottom: 2%;width:99%">
                              <input type="checkbox" onclick=confirmBox(${i}) class="btn-check" name="${resultsObj.attNames[i]}" id=${i} autocomplete="off">
                              <label id=${disId} class="btn btn-outline-secondary" for=${i}>${resultsObj.attNames[i]}</label>
                            </div>
                <br>`

        optCont.innerHTML += checkHtml;

    }
    for (i = 0; i < finishedArray.length; i++) {
        document.getElementById(finishedArray[i]).disabled = true;
    }
}

// If the user selects an attraction while in custom route mode, ask them to confirm
function confirmBox(i) {
    let mapDiv = document.getElementById("map");
    ConfirmRouteBox = document.createElement("div");
    ConfirmRouteBox.setAttribute("id", "mapPopUp");
    ConfirmRouteBox.innerHTML = `Would you like to map a route between you and your selected attraction?<br>
                    <button onclick=startRoute(${i}) type="button" class="btn btn-outline-secondary">Yes</button>
                    <button onclick=hideBox(${i}) type="button" class="btn btn-outline-secondary">No</button>`;

    if (ConfirmRouteBox.parentNode) {
        ConfirmRouteBox.parentNode.removeChild(ConfirmRouteBox);
    }


    mapDiv.appendChild(ConfirmRouteBox)
    ConfirmRouteBox.style.display = 'block'
}

// If the user does not wish to map a route to selected attraction, hide this popup box
function hideBox(i) {
    let popUp = document.getElementById("mapPopUp")
    popUp.style.display = 'none'
    if (popUp.parentNode) {
        popUp.parentNode.removeChild(popUp);
    }

    document.getElementById(i).checked = false

    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).disabled = false;
    }
}

let map;
let markers = [];

showMarkers()

// Initialise the map
function initMap() {
    let dublin = {lat: 53.345302024709206, lng: -6.27215179129342};

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: dublin,
    });

    addAttraction()
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});

    // Listen for if the user updates the break search radius mid break and then update the request with the newly chosen type
    document.getElementById("progBreakType").addEventListener("change", () => {
        removeBreakLocs()
        renderBreak("progress", document.getElementById("searchRad").value)
    });

    // Listen for if the user changes the break type mid break and then update the request with the newly search radius
    document.getElementById("searchRad").addEventListener("change", () => {
        removeBreakLocs()
        renderBreak("progress", document.getElementById("searchRad").value)
    });

    // If the user changes the travel mode mid route, then update the route with the newly chosen travel route
    document.getElementById("mode").addEventListener("change", () => {
        if (document.getElementById("cust").checked) {
            if (lastRoute != '') {
                lastRoute.setMap(null);
                lastRoute = ''
                let selectedMode = document.getElementById("mode").value;

                let request = {
                    origin: userLocation,
                    destination: chosenLatlng,
                    travelMode: google.maps.TravelMode[selectedMode]
                };

                // Send the request to the DirectionsService and display the route on the map
                let directionsService = new google.maps.DirectionsService();
                directionsService.route(request, function (result, status) {
                    if (status == 'OK') {
                        // Create a new route object and display it on the map
                        lastRoute = new google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            map,
                            directions: result
                        });
                    }
                });
            }
        } else {
            calculateRoute()
        }
    });


}

// Tracks the users location and updates the icon if any changes
function locationMarker() {
    navigator.geolocation.watchPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        for (i = 0; i <= resultsObj.attNames.length - 1; i++) {

            let checks = document.getElementById(i)

            // If the user is currently on the way to an attraction
            if (checks.checked == true && i == routePending) {

                let chosenLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));
                let distanceToGeofence = google.maps.geometry.spherical.computeDistanceBetween(
                    userLocation,
                    chosenLatlng
                );

                // If user is within distance of the attraction on their current route then notify them accordingly & provide content
                if (distanceToGeofence <= 50) {

                    console.log("Within Range")
                    if (displayCounter == 0) {

                        for (j = 0; j <= resultsObj.attNames.length - 1; j++) {
                            document.getElementById(j).disabled = true;
                        }

                        let popUp = document.getElementById("mapPopUp2")
                        popUp.innerHTML = `<strong>Welcome to the ${resultsObj.attNames[i]}!</strong><br><br>
                                     <p style="text-align: left">${resultsObj.tripTips[i]}</p>
                                     <a href="${resultsObj.tripSites[i]}" target="_blank"><em>Click here to visit the website!</em></a><br><br>
                                     <button onclick=finishAttraction(${i}) type="button" class="btn btn-outline-secondary">Finished With This Attraction</button>`;

                        popUp.style.display = 'block'
                        displayCounter++
                    }
                }
                console.log(distanceToGeofence)
            }
        }

        console.log(userLocation)
        let svgMarker = {
            path: "m13.9 46 5.8-29.3-5.05 2.15v6.65H11.6v-8.65l9.6-4.05q.7-.3 1.475-.375.775-.075 1.525.075.85.15 1.475.55.625.4 1.025 1l2.1 3.3q1.55 2.4 3.875 3.775T37.65 22.5v3q-3.5-.1-6.175-1.525Q28.8 22.55 26.65 19.6l-1.9 7.6 4.6 4.15V46h-3V34l-5.4-4.9L17 46ZM27 10.3q-1.5 0-2.575-1.075Q23.35 8.15 23.35 6.65q0-1.5 1.075-2.575Q25.5 3 27 3q1.5 0 2.575 1.075Q30.65 5.15 30.65 6.65q0 1.5-1.075 2.575Q28.5 10.3 27 10.3Z",
            fillColor: "blue",
            fillOpacity: 0.4,
            strokeWeight: 0,
            rotation: 0,
            scale: .8,
            anchor: new google.maps.Point(20, 35),
        };

        //If the marker is being set on user for the first time then create a new marker, otherwise update the existing marker
        if (markCount == 0) {
                locMarker = new google.maps.Marker({
                    position: userLocation,
                    map,
                    icon: svgMarker,
                });
                locMarker.setMap(map);
                markCount++
        } else {
            locMarker.setPosition(userLocation)
        }

    });
}

// Upon finishing an attraction provide the user with an option to rate it
function finishAttraction(finAtt) {
    resultsObj.attStatus[finAtt] = true
    let lastPopUp = document.getElementById("mapPopUp2")
    lastPopUp.style.display = 'none';
    let popUp = document.getElementById("mapPopUp3")
    popUp.style.display = 'block';
    //Reference: https://codepen.io/anefzaoui/pen/NWPZzMa
    popUp.innerHTML = `Would you like to rate this attraction?<br>
                    <fieldset class="rate">
                        <input type="radio" id="rating10" onclick=addRating(value,'${finAtt}') name="rating" value="10" /><label for="rating10" title="5 stars"></label>
                        <input type="radio" id="rating9" onclick=addRating(value,'${finAtt}')  name="rating" value="9" /><label class="half" for="rating9" title="4 1/2 stars"></label>
                        <input type="radio" id="rating8" onclick=addRating(value,'${finAtt}') name="rating" value="8" /><label for="rating8" title="4 stars"></label>
                        <input type="radio" id="rating7" onclick=addRating(value,'${finAtt}') name="rating" value="7" /><label class="half" for="rating7" title="3 1/2 stars"></label>
                        <input type="radio" id="rating6" onclick=addRating(value,'${finAtt}') name="rating" value="6" /><label for="rating6" title="3 stars"></label>
                        <input type="radio" id="rating5" onclick=addRating(value,'${finAtt}') name="rating" value="5" /><label class="half" for="rating5" title="2 1/2 stars"></label>
                        <input type="radio" id="rating4" onclick=addRating(value,'${finAtt}') name="rating" value="4" /><label for="rating4" title="2 stars"></label>
                        <input type="radio" id="rating3" onclick=addRating(value,'${finAtt}') name="rating" value="3" /><label class="half" for="rating3" title="1 1/2 stars"></label>
                        <input type="radio" id="rating2" onclick=addRating(value,'${finAtt}') name="rating" value="2" /><label for="rating2" title="1 star"></label>
                        <input type="radio" id="rating1" onclick=addRating(value,'${finAtt}') name="rating" value="1" /><label class="half" for="rating1" title="1/2 star"></label>
                    </fieldset><br><button onclick=addRating("none",'${finAtt}') type="button" class="btn btn-outline-secondary">No Thanks!</button>\``
    //End reference
}

// If the user chose to rate the attraction, save their chosen rating
function addRating(rating, finAtt) {
    let attName = resultsObj.attNames[finAtt]
    resultsObj.att
    let popUp = document.getElementById("mapPopUp3")

    let csrftoken = getCookie('csrftoken');

    // If they provided a rating
    if (rating != "none") {

        popUp.innerHTML = 'Thank you for rating this attraction!';

        // Call a view which sends the rating to its associated attraction for storage
        $.ajax({
            type: "POST",
            url: "updaterating/",
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: {
                name: attName,
                rating: rating
            }
        }).done(function (data, status, xhr) {
            console.log("Success");

        }).fail(function (xhr, status, error) {
            var message = "Passing filters failed.<br/>";
            console.log("Status: " + xhr.status + " " + xhr.responseText);
        }).always(function () {
        });

    }

    // Fade away thank you message
    setTimeout(function () {
        popUp.classList.add('fadeOut');
        setTimeout(function () {
            popUp.style.display = 'none';
            popUp.classList.remove('fadeOut');
        }, 2000);
    }, 2000);
    console.log(rating)
    console.log(attName)

    // Disables the attraction for further selection
    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).checked = false;
        document.getElementById(i).disabled = false;
    }


    finishedArray.push(finAtt)

    //Locks all finished and closed attractions
    lockFinishedAttraction(attName)
    lockClosedAttraction(lockClosed)

    for (i = 0; i < finishedArray.length; i++) {
        document.getElementById(finishedArray[i]).disabled = true;
    }

    displayCounter = 0;
    finishedAttractions++;
    lastRoute.setMap(null);
    lastRoute = '';

    // Removes the attractions markers
    delMarkers(markers[finAtt], finAtt)
}

// Create cookies for use in AJAX req
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return "";
}

// If the user has chosen an attraction while using custom route then map the route from their position to this attraction
function startRoute(i) {
    routePending = i
    let popUp = document.getElementById("mapPopUp")
    if (popUp.parentNode) {
        popUp.parentNode.removeChild(popUp);
    }

    // Remove any currently mapped routes
    if (lastRoute) {
        lastRoute.setMap(null);
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        const selectedMode = document.getElementById("mode").value;

        chosenLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));

        // Creates a request using the user's location, the attraction's location and the user's selected travel mode
        let request = {
            origin: userLocation,
            destination: chosenLatlng,
            travelMode: google.maps.TravelMode[selectedMode]
        };

        // Send the request to the DirectionsService and display the route on the map
        let directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (result, status) {
            if (status == 'OK') {

                // Create a new route object and display it on the map
                lastRoute = new google.maps.DirectionsRenderer({
                    suppressMarkers: true,
                    map,
                    directions: result
                });
            }
        });

    });

}

// Prepares each attraction so that a marker for each can be added to the map
function addAttraction() {

    let results = localStorage.getItem("currentTrip");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }


    for (i = 0; i < resultsObj.attLat.length; i++) {
        var myLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));
        addMarker(myLatlng, resultsObj.attNames[i], resultsObj.tripColours[i], resultsObj.attClosing[i])
    }
}

// Deletes a chosen marker when called
function delMarkers(delMark, i) {
    console.log(delMark)
    delete markers[i]
    delMark.setMap(null);
    console.log("clarity" + i)
    console.log(markers)
}

// Adds a marker for each attraction on the map
function addMarker(position, attName, colour, closing) {
    let reformat = closing.substring(0, 2) + ":" + closing.substring(2)

    const marker = new google.maps.Marker({
        map,
        position,
        title: attName,
        subtitle: reformat,
        icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            strokeWeight: 2,
            fillColor: colour,
            fillOpacity: 1
        }
    });

    marker.addListener('click', function () {
        let infowindow = new google.maps.InfoWindow({
            content: "<strong>" + marker.title + "</strong>" + "<br>Closing Hours:" + marker.subtitle
        });
        infowindow.open(map, marker);
    });

    markers.push(marker);
    console.log(markers)
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Clears checks from all checked boxes and checks the selected box
$(":checkbox").click(function (e) {
    $(":checkbox").prop('checked', false)
    $(e.target).prop('checked', true);
});

// Display or hide popup
function optionsPopUp(check) {
    var popup = document.getElementById("optPopUp");
    if (check) {
        popup.style.display = "block";
    } else {
        popup.style.display = "none";
    }

}

// Mark the trip as finished upon completions
function markFinished() {
    let csrftoken = getCookie('csrftoken');

    // Passes the trip id to a view in order to update the status of this trip as completed
    $.ajax({
        type: "POST",
        url: "updatetripstatus/",
        headers: {
            'X-CSRFToken': csrftoken
        },
        data: {
            trId: resultsObj.id
        }
    }).done(function (data, status, xhr) {
        console.log("Success");

        location.href = '/rateTrip'

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

// If the user has selected a recommended route, lock the ability to individually select each attraction
function lockOptions() {

    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).disabled = true;
    }
    calculateRoute()
}

// If the user has chosen the recommended route then calculate and map the most optimized route possible
function calculateRoute() {

    // Remove any existing routes
    if (lastRoute) {
        lastRoute.setMap(null);
    }

    if (routePath.length != 0) {
        for (i = 0; i < routePath.length; i++)
            routePath[i].setMap(null);
    }

    const selectedMode = document.getElementById("mode").value;
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    let remainingLocNames = [];
    let remainingLocCoords = [];
    let remainingLocDesc = [];
    let remainingLocSites = [];
    let remainingLocCol = [];
    console.log(resultsObj)

    // Iterate through each attraction
    for (i = 0; i < resultsObj.attNames.length; i++) {

        // If the attraction is not closed or completed
        if (resultsObj.attStatus[i] == false && !lockClosed.includes(resultsObj.attNames[i])) {
            remainingLocNames.push(resultsObj.attNames[i])
            remainingLocDesc.push(resultsObj.tripTips[i])
            remainingLocSites.push(resultsObj.tripSites[i])
            remainingLocCol.push(resultsObj.tripColours[i])

            let attLocation = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));

            console.log(parseFloat(resultsObj.attLat[i]))

            // Format each suitable attraction for use as a waypoint
            remainingLocCoords.push({
                location: attLocation,
                stopover: true
            });

        }
    }


    let wpDest = remainingLocCoords[remainingLocCoords.length - 1].location
    remainingLocCoords.pop()

    // Create a route using the userslocation, the suitables attractions and the selected travel mode
    directionsService
        .route({
            origin: userLocation,
            destination: wpDest,
            waypoints: remainingLocCoords,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode[selectedMode],
        })
        .then((response) => {
            // Render this route to the map

            directionsRenderer.setDirections(response);

            const myRoute = response.routes[0].overview_path;
            console.log(myRoute)

            for (let i = 0; i < response.routes[0].legs.length; i++) {
                const leg = response.routes[0].legs[i];
                console.log(leg)

                routePath[i] = new google.maps.Polyline({
                    path: leg.steps.map(step => step.path).flat(),
                    strokeColor: remainingLocCol[i],
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                    geodesic: true,
                });

                routePath[i].setMap(map);
            }


        })
        .catch((e) => {
            // If google maps is unable to plot a transport route
            if (selectedMode == 'TRANSIT') {
                window.alert("Unable to plot a route between these attractions using public transport. Sorry!")
            } else {
                window.alert("Directions request failed due to " + e)
            }
        })
}



window.initMap = initMap;




