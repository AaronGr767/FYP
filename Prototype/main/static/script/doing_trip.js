document.getElementById('optionsContainer').innerHTML = ``;
let popup = document.getElementById("optPopUp");
    popup.style.display = "none";

let displayCounter = 0;
let finishedAttractions = 0;
let userLocation;
let userArray = []
let chosenLatlng;
let finishedArray = [];

let markCount = 0;
let locMarker;
let lastRoute;
let directionsRenderer;
//or var if breaks

let mapType = document.getElementById("cust")


let resultsObj = [];
let optCont = document.getElementById('optionsContainer')
let results = localStorage.getItem("currentTrip");

if (results == null) {
    resultsObj = [];
} else {
    resultsObj = JSON.parse(results);
}

tripName()

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

function displayOptions() {
    optCont.innerHTML = ``;

    for (i = 0; i < resultsObj.attNames.length; i++) {

        console.log(resultsObj.attNames[i])

        checkHtml = `
                            <div class="btn-group" role="group" aria-label="Basic radio toggle button group" style="margin-bottom: 2%;width:100%">
                              <input type="checkbox" onclick=confirmBox(${i}) class="btn-check" name="${resultsObj.attNames[i]}" id=${i} autocomplete="off">
                              <label class="btn btn-outline-secondary" for=${i}>${resultsObj.attNames[i]}</label>
                            </div>
                <br>`

        optCont.innerHTML += checkHtml;
        console.log("feck off " + document.getElementById(i).name)

    }
    for(i = 0; i < finishedArray.length; i++){
            document.getElementById(finishedArray[i]).disabled = true;
        }
}

function confirmBox(i) {
    let popUp = document.getElementById("mapPopUp")
    popUp.innerHTML = ``;
    popUp.innerHTML = `Would you like to map a route between you and your selected attraction?<br>
                    <button onclick=startRoute(${i}) type="button" class="btn btn-outline-secondary">Yes</button>
                    <button onclick=hideBox(${i}) type="button" class="btn btn-outline-secondary">No</button>`
    popUp.style.display = 'block'
}

function hideBox(i) {
    let popUp = document.getElementById("mapPopUp")
    popUp.style.display = 'none'

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
        zoom: 7,
        center: dublin,
    });

    addAttraction()
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});

    document.getElementById("mode").addEventListener("change", () => {
        if(lastRoute != ''){
            lastRoute.setMap(null);
            lastRoute=''
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
    });


}

function locationMarker() {
    navigator.geolocation.watchPosition(function (position) {
        userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // userArray = []

        for (i = 0; i <= resultsObj.attNames.length - 1; i++) {

            let checks = document.getElementById(i)
            if (checks.checked == true) {
                let chosenOption = i
                let chosenLatlng = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));
                let distanceToGeofence = google.maps.geometry.spherical.computeDistanceBetween(
                    userLocation,
                    chosenLatlng
                );

                //remember to reverse logic when done testing and uncomment the for loop
                if (distanceToGeofence >= 50) {
                    console.log("Within Range")
                    if (displayCounter == 0 && document.getElementById("mapPopUp").style.display == 'none') {
                        for (j = 0; j <= resultsObj.attNames.length - 1; j++) {
                            document.getElementById(j).disabled = true;
                        }
                        let popUp = document.getElementById("mapPopUp2")
                        popUp.innerHTML = `<strong>Welcome to the ${resultsObj.attNames[i]}!</strong><br><br>
                                     <p style="text-align: left">${resultsObj.tripDescs[i]}</p>
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
    let lastPopUp = document.getElementById("mapPopUp2")
    lastPopUp.style.display = 'none';
    let popUp = document.getElementById("mapPopUp3")
    popUp.style.display = 'block';
    //Reference: https://codepen.io/anefzaoui/pen/NWPZzMa
    popUp.innerHTML = `Would you like to rate this attraction?
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
                    </fieldset>`
    //End reference
}

function addRating(rating, finAtt) {
    let attName = resultsObj.attNames[finAtt]
    let popUp = document.getElementById("mapPopUp3")

    popUp.innerHTML = 'Thank you for rating this attraction!';

     setTimeout(function() {
        popUp.classList.add('fadeOut');
        setTimeout(function() {
            popUp.style.display = 'none';
            popUp.classList.remove('fadeOut');
        }, 2000);
    }, 2000);
    console.log(rating)
    console.log(attName)
    console.log("Booyah!")


    let csrftoken = getCookie('csrftoken');

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

        for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
            document.getElementById(i).checked = false;
            document.getElementById(i).disabled = false;
        }


        finishedArray.push(finAtt)

        for(i = 0; i < finishedArray.length; i++){
             document.getElementById(finishedArray[i]).disabled = true;
        }
        displayCounter = 0;
        finishedAttractions ++;
        lastRoute.setMap(null);
        lastRoute = '';
        delMarkers(markers[finAtt],finAtt)
        // delete markers[finAtt]
        // showMarkers()

        // location.href = '/home'

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
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
    // for(i=0;i<=resultsObj.attNames.length-1;i++){
    //     document.getElementById(i).disabled = true;
    // }
    let popUp = document.getElementById("mapPopUp")
    popUp.style.display = 'none'

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
        addMarker(myLatlng, resultsObj.attNames[i], resultsObj.tripColours[i])
    }
}

function delMarkers(delMark, i) {
    console.log(delMark)
    delete markers[i]
    delMark.setMap(null);
    console.log("clarity" + i)
    console.log(markers)
}

function addMarker(position, attName, colour) {
    const marker = new google.maps.Marker({
        map,
        position,
        title: attName,
        icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            strokeWeight: 2,
            fillColor: colour,
            fillOpacity: 1
        }
    });

    marker.addListener('click', function() {
        const infowindow = new google.maps.InfoWindow({
            content: marker.title // Use the title as the content of the info window
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

function optionsPopUp(check){
    var popup = document.getElementById("optPopUp");
    if(check){
        popup.style.display = "block";
    }else{
        popup.style.display = "none";
    }

}

function markFinished(){
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

        location.href = '/home'

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

function lockOptions(){
    for (i = 0; i <= resultsObj.attNames.length - 1; i++) {
        document.getElementById(i).disabled = true;
    }
    calculateRoute()
}

function calculateRoute() {
    let service = new google.maps.DistanceMatrixService();
    let startLocation = [userLocation]
    let tripLocations = [];
    for (i = 0; i < resultsObj.attNames.length; i++) {
        let nextLoc = new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]));
        tripLocations.push(nextLoc);
    }

    // for(i=0;i<resultsObj.attNames.length;i++){
    //     let distanceToGeofence = google.maps.geometry.spherical.computeDistanceBetween(
    //                 userLocation,
    //                 new google.maps.LatLng(parseFloat(resultsObj.attLat[i]), parseFloat(resultsObj.attLng[i]))
    //             );
    //     for(){
    //
    //     }
    // }

    // service.getDistanceMatrix({
    //     origins: startLocation,
    //     destinations: tripLocations,
    //     travelMode: 'DRIVING',
    //     unitSystem: google.maps.UnitSystem.IMPERIAL,
    //     avoidHighways: false,
    //     avoidTolls: false
    // }, function (response, status) {
    //     if (status === 'OK') {
    //         let distances = response.rows[0].elements;
    //         let shortestDistance = null;
    //         let closestLocation = null;
    //         for (let i = 0; i < distances.length; i++) {
    //             let distance = distances[i].distance.value;
    //             if (shortestDistance === null || distance < shortestDistance) {
    //                 shortestDistance = distance;
    //                 closestLocation = tripLocations[i];
    //             }
    //         }
    //         console.log(`The closest location is ${closestLocation}, which is ${shortestDistance} meters away from the set point.`);
    //     } else {
    //         console.log(`Error: ${status}`);
    //     }
    // });
}
window.initMap = initMap;




