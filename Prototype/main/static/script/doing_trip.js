document.getElementById('doingOptionsContainer').innerHTML = ``;
let popup = document.getElementById("optPopUp");
popup.style.display = "none";

let displayCounter = 0;
let finishedAttractions = 0;
let userLocation;
let userArray = []
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

function visitStatus(){
    let status = localStorage.getItem("editedTripStatus");
    if(status=="true") {
        for (j = 0; j < resultsObj.attStatus.length; j++) {
            resultsObj.attStatus[j] = true;
        }
    }
}

// updateLocation()
if (mapType.checked) {

    displayOptions()
}

function tripName() {
    let tripTitle = document.getElementById('tripHeader')
    tripTitle.innerHTML = ``
    tripTitle.innerHTML = `<em>${resultsObj.tripName}</em>`
}

locationMarker(markCount)


setTimeout(checkTime, 4000)

function checkTime() {
    let closingNameArray = []
    let closingTimeArray = []
    let closedNameArray = []
    let closedTimeArray = []
    let currTime = new Date();
    let compareTime = (currTime.getHours() * 60) + currTime.getMinutes()
    console.log(resultsObj.attNames.length)
    for (i = 0; i < resultsObj.attNames.length; i++) {
        console.log(resultsObj.attNames.length)
        let attHour = parseInt(resultsObj.attClosing[i].substring(0, 2)) * 60
        let attMins = parseInt(resultsObj.attClosing[i].substring(2))
        let attTime = attHour + attMins
        let dif = attTime - compareTime;
        console.log("dif for each= " + dif)
        if (dif == 60 || (firstTimeCheck == 0 && dif < 60 && dif > 0)) {
            closingNameArray.push(resultsObj.attNames[i])
            closingTimeArray.push(resultsObj.attClosing[i])
        }

        if (dif == 0 || (alreadyClosed == 0 && dif < 0)) {
            closedNameArray.push(resultsObj.attNames[i])
            closedTimeArray.push(resultsObj.attClosing[i])
            lockClosed.push(resultsObj.attNames[i])
        }

    }
    lockClosedAttraction(lockClosed)
    firstTimeCheck++
    alreadyClosed++
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

function lockClosedAttraction(closedNames){
    for (i = 0; i < closedNames.length; i++) {
        for(j = 0; j < resultsObj.attNames.length; j++){
            let checkAttName = document.getElementById(j)
                if(closedNames[i] == checkAttName.name){
                    checkAttName.disabled = true;
                    let checkAttDiv = document.getElementById("title"+j)
                    let checkAttLabel = document.getElementById("dis"+j)

                    checkAttDiv.title = "Closed"
                    checkAttLabel.innerHTML = `${closedNames[i]} <i class="fa-solid fa-shop-lock"></i>`
                }
        }
    }
}

function lockFinishedAttraction(finName){
    for(j = 0; j < resultsObj.attNames.length; j++){
        let checkAttName = document.getElementById(j)
            if(finName == checkAttName.name){
                checkAttName.disabled = true;
                let checkAttDiv = document.getElementById("title"+j)
                let checkAttLabel = document.getElementById("dis"+j)

                checkAttDiv.title = "Finished"
                checkAttLabel.innerHTML += ` <i class="fa-solid fa-circle-check"></i>`
            }
    }

}

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

        service.nearbySearch(request, callback);
    }


}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (i = 0; i < results.length; i++) {
            console.log(results[i])
            // if(results[i].opening_hours.isOpen){
            createMarker(results[i]);
            // }
        }
    }
}

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

function removeBreakLocs() {
    for (i = 0; i < nearbyMarker.length; i++) {
        nearbyMarker[i].setMap(null);
    }
}

function finishBreak() {
    for (i = 0; i < nearbyMarker.length; i++) {
        nearbyMarker[i].setMap(null);
    }

    let sUBreak = document.getElementById("breakSetUp")
    sUBreak.style.display = 'block'
    let progBreak = document.getElementById("breakInProg")
    progBreak.style.display = 'none'
}

function beginBreak() {
    let brHour = document.getElementById("breakHours").value
    let brMins = document.getElementById("breakMins").value
    let brTime = brHour + ":" + brMins

    let testRegex = new RegExp("^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$")

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

        //don't forget to flick this back after testing
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
                let attTime = attHour + attMins
                let dif = attTime - combinedTime;
                if (combinedTime > attTime || dif <= 60) {
                    closingNameArray.push(resultsObj.attNames[i])
                    closingTimeArray.push(resultsObj.attClosing[i])
                }
            }

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
                renderBreak("start", "300")
            }
        }

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
    } else if (closeCheck == "closed"){
        let alertBox = document.getElementById("closedAlert")
        let alertList = document.getElementById("closedAtts")
        alertList.innerHTML = ``
        alertBox.style.display = 'none'
    }

}

function closeInvAlert() {
    let alertBox = document.getElementById("invalidAlert")
    alertBox.style.display = 'none'
}

function displayOptions() {
    if (routePath.length != 0) {
        for (i = 0; i < routePath.length; i++)
            routePath[i].setMap(null);
    }
    optCont.innerHTML = ``;

    for (i = 0; i < resultsObj.attNames.length; i++) {

        console.log(resultsObj.attNames[i])

        let disId = "dis"+i
        let titleId = "title"+i

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


// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.
let map;
let markers = [];


showMarkers()

function initMap() {
    let dublin = {lat: 53.345302024709206, lng: -6.27215179129342};

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: dublin,
    });

    addAttraction()
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});

    document.getElementById("progBreakType").addEventListener("change", () => {
        removeBreakLocs()
        renderBreak("progress", document.getElementById("searchRad").value)
    });

    document.getElementById("searchRad").addEventListener("change", () => {
        removeBreakLocs()
        renderBreak("progress", document.getElementById("searchRad").value)
    });

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

function locationMarker() {
    navigator.geolocation.watchPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // userArray = []

        for (i = 0; i <= resultsObj.attNames.length - 1; i++) {

            let checks = document.getElementById(i)
            if (checks.checked == true && i == routePending) {
                let chosenLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));
                let distanceToGeofence = google.maps.geometry.spherical.computeDistanceBetween(
                    userLocation,
                    chosenLatlng
                );

                //remember to reverse logic when done testing and uncomment the for loop
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

function addRating(rating, finAtt) {
    let attName = resultsObj.attNames[finAtt]
    resultsObj.att
    let popUp = document.getElementById("mapPopUp3")

    let csrftoken = getCookie('csrftoken');

    if (rating != "none") {
        popUp.innerHTML = 'Thank you for rating this attraction!';
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

    setTimeout(function () {
        popUp.classList.add('fadeOut');
        setTimeout(function () {
            popUp.style.display = 'none';
            popUp.classList.remove('fadeOut');
        }, 2000);
    }, 2000);
    console.log(rating)
    console.log(attName)

    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).checked = false;
        document.getElementById(i).disabled = false;
    }


    finishedArray.push(finAtt)

    lockFinishedAttraction(attName)
    lockClosedAttraction(lockClosed)

    for (i = 0; i < finishedArray.length; i++) {
        document.getElementById(finishedArray[i]).disabled = true;
    }
    displayCounter = 0;
    finishedAttractions++;
    lastRoute.setMap(null);
    lastRoute = '';
    delMarkers(markers[finAtt], finAtt)
}

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

function startRoute(i) {
    routePending = i
    let popUp = document.getElementById("mapPopUp")
    if (popUp.parentNode) {
        popUp.parentNode.removeChild(popUp);
    }

    if (lastRoute) {
        lastRoute.setMap(null);
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        const selectedMode = document.getElementById("mode").value;

        chosenLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));

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

function addAttraction() {
    console.log("breaks here")

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

function delMarkers(delMark, i) {
    console.log(delMark)
    delete markers[i]
    delMark.setMap(null);
    console.log("clarity" + i)
    console.log(markers)
}

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
        infowindow.open(map, marker); // Open the info window at the marker's position
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

$(":checkbox").click(function (e) {
    $(":checkbox").prop('checked', false)
    $(e.target).prop('checked', true);
});

function optionsPopUp(check) {
    var popup = document.getElementById("optPopUp");
    if (check) {
        popup.style.display = "block";
    } else {
        popup.style.display = "none";
    }

}

function markFinished() {
    let csrftoken = getCookie('csrftoken');

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

function lockOptions() {

    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).disabled = true;
    }
    calculateRoute()
}

function calculateRoute() {

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

    for (i = 0; i < resultsObj.attNames.length; i++) {
        if (resultsObj.attStatus[i] == false && !lockClosed.includes(resultsObj.attNames[i])) {
            remainingLocNames.push(resultsObj.attNames[i])
            remainingLocDesc.push(resultsObj.tripTips[i])
            remainingLocSites.push(resultsObj.tripSites[i])
            remainingLocCol.push(resultsObj.tripColours[i])

            let attLocation = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));

            console.log(parseFloat(resultsObj.attLat[i]))

            remainingLocCoords.push({
                location: attLocation,
                stopover: true
            });

        }
    }

    let wpDest = remainingLocCoords[remainingLocCoords.length - 1].location
    remainingLocCoords.pop()

    directionsService
        .route({
            origin: userLocation,
            destination: wpDest,
            waypoints: remainingLocCoords,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode[selectedMode],
        })
        .then((response) => {
            directionsRenderer.setDirections(response);

            const myRoute = response.routes[0].overview_path;
            console.log(myRoute)

            //   var routePath = new google.maps.Polyline({
            //   path: myRoute,
            // });

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
            if (selectedMode == 'TRANSIT') {
                window.alert("Unable to plot a route between these attractions using public transport. Sorry!")
            } else {
                window.alert("Directions request failed due to " + e)
            }
        })
}

function filterFunction() {
  var input, filter, ul, li, option, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  option = div.getElementsByTagName("option");
  for (i = 0; i < option.length; i++) {
    txtValue = option[i].textContent || option[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      option[i].style.display = "";
    } else {
      option[i].style.display = "none";
    }
  }
}

window.initMap = initMap;




