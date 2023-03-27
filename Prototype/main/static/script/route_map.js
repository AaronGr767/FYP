
let resultsObj = retrieveStore()

displayAttractions(resultsObj)

displayDetails()

function displayDetails(){
    let details = localStorage.getItem("detailsStore");
    let detailsObj = JSON.parse(details);

    console.log(detailsObj)

    let detCont = document.getElementById("addDetails")

    if(detailsObj.tripName == "" && detailsObj.groupSize == "" && detailsObj.maxPrice == "" && detailsObj.chosenDate == ""){
        detCont.innerHTML =`<em>No additional details for this trip</em>`
    }
    if(detailsObj.tripName != ""){
        detCont.innerHTML += `<div style="display: flex; justify-content: space-between;">
                                <p style="text-align: left"><em>Trip Name: </em></p>
                                <p style="text-align: right">${detailsObj.tripName}</p>
                              </div>`
    }
    if(detailsObj.groupSize != ""){
        detCont.innerHTML += `<div style="display: flex; justify-content: space-between;">
                                <p style="text-align: left"><em>Group Size: </em></p>
                                <p style="text-align: right">${detailsObj.groupSize}</p>
                              </div>`
    }
    if(detailsObj.maxPrice != ""){
        detCont.innerHTML += `<div style="display: flex; justify-content: space-between;">
                                <p style="text-align: left"><em>Maximum Price: </em></p>
                                <p style="text-align: right">${detailsObj.maxPrice}</p>
                              </div>`
    }
    if(detailsObj.chosenDate != ""){
        detCont.innerHTML += `<div style="display: flex; justify-content: space-between;">
                                <p style="text-align: left"><em>Chosen Date: </em></p>
                                <p style="text-align: right">${detailsObj.chosenDate}</p>
                              </div>`
    }

}

var popup = document.getElementById("optPopUp");
popup.style.display = "none";
//
//
//
//
//
// // $.getScript( "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&libraries=places")
// // .done(function( script, textStatus ) {
// //     google.maps.event.addDomListener(window, "load", initMap)
// //
// // })
// //
// // const waypts = [
// //         {location: {lat: lat_1, lng: long_1},
// //         stopover: true}
// //         ];
//
function retrieveStore(){
    let results = localStorage.getItem("finalChoice");

    if (results == null) {
        resultsStorage = [];
      } else {
        resultsStorage = JSON.parse(results);
    }

    return resultsStorage;
}
//
// // function initMap() {
// //     var directionsService = new google.maps.DirectionsService;
// //     var directionsDisplay = new google.maps.DirectionsRenderer;
// //     var map = new google.maps.Map(document.getElementById('map'));
// //     directionsDisplay.setMap(map);
// //     calculateAndDisplayRoute(directionsService, directionsDisplay);
// //
// // }
//
// // function calculateAndDisplayRoute(directionsService, directionsDisplay) {
// //     var selectedMode=localStorage.getItem('transMode');
// //
// //     console.log(selectedMode);
// //
// //     directionsService.route({
// //         origin: origin,
// //         destination: destination,
// //         waypoints: waypts,
// //         optimizeWaypoints: true,
// //         travelMode: google.maps.TravelMode[selectedMode],
// //     }, function(response, status) {
// //       if (status === 'OK') {
// //         directionsDisplay.setDirections(response);
// //
// //       } else {
// //
// //         alert('Directions request failed due to ' + status);
// //       }
// //     });
// // }
//
function displayAttractions(resultsObj){
    choiceHtml = document.getElementById("attList")
    // let results = localStorage.getItem("resultStore");
    //
    // if (results == null) {
    //     resultsObj = [];
    //   } else {
    //     resultsObj = JSON.parse(results);
    // }

    console.log("cheese = " + typeof(resultsObj))

    resultsObj.forEach((element) =>{
                console.log(element.name)
                choiceHtml.innerHTML += `<li><i class="fa-solid fa-flag-checkered"style="color: ${element.markerColour}"></i><text style="color: #111111;">  ${element.name}</text></li>`
            })

    return resultsObj;
}

function saveTrip(startCheck) {
    let resultsName = [];
    let resultsLat = [];
    let resultsLng = [];
    let descArray = [];
    let siteArray = [];
    let colourArray = [];
    let statusArray = [];
    let finalStore = retrieveStore()

    let closingArray = retrieveTimes(finalStore)

    let details = localStorage.getItem("detailsStore");
    let filters = localStorage.getItem("filterStore");
    let startLoc = localStorage.getItem("startLoc")

    let filterArray = JSON.parse(filters)
    console.log(typeof filterArray)

    let detailsObj = JSON.parse(details);


    finalStore.forEach((element) =>{
        resultsName.push(element.name)
        resultsLat.push(element.latitude)
        resultsLng.push(element.longitude)
        descArray.push(element.description)
        siteArray.push(element.website)
        colourArray.push(element.markerColour)
    })

    console.log(resultsName)
    console.log(resultsLat)
    console.log(resultsLng)

    // let csrftoken = getCookie('csrftoken');

    let status = localStorage.getItem("editedTripStatus");
    if(status=="true") {
        let eTrip = localStorage.getItem("editedTrip")
        let editedTrip = JSON.parse(eTrip)

        $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url:"saveeditedtrip/",
        data: {
            tripId: editedTrip.id,
            sLocation: startLoc,
            attNames: resultsName,
            lats: resultsLat,
            lngs:resultsLng,
            tripTags:filterArray,
            tName:detailsObj.tripName,
            gSize:detailsObj.groupSize,
            mPrice:detailsObj.maxPrice,
            cDate:detailsObj.chosenDate,
            desc:descArray,
            site:siteArray,
            mColours: colourArray,
            aStatus: statusArray,
            cArray: closingArray
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        if(startCheck){
            localStorage.setItem('saveAndStart', JSON.stringify(data.id))
            location.href='/startTrip'
        }else{
            location.href='/home'
        }
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updateddatabase<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("update finished");
    });

    }else{
        $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url:"savetrip/",
        data: {
            sLocation: startLoc,
            attNames: resultsName,
            lats: resultsLat,
            lngs:resultsLng,
            tripTags:filterArray,
            tName:detailsObj.tripName,
            gSize:detailsObj.groupSize,
            mPrice:detailsObj.maxPrice,
            cDate:detailsObj.chosenDate,
            desc:descArray,
            site:siteArray,
            mColours: colourArray,
            aStatus: statusArray,
            cArray: closingArray
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        if(startCheck){
            localStorage.setItem('saveAndStart', JSON.stringify(data.id))
            location.href='/startTrip'
        }else{
            location.href='/home'
        }
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updateddatabase<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("save finished");
    });
    }

}

function retrieveTimes(finalStore){
    let dayArray=[];
    let myDets = localStorage.getItem("detailsStore");
    myDets = JSON.parse(myDets)
    let choseDay = myDets.chosenDate
    if(choseDay != "null"){
        choseDay = new Date(choseDay)
        let days = [0,1,2,3,4,5,6]

        let chosenDay = days[choseDay.getDay()]

        finalStore.forEach((element) =>{
            dayArray.push(element.closingHours[chosenDay])
        })
    }

    return dayArray;
}

function getCookie(cname) {
     var name = cname + "=";
     var ca = document.cookie.split(';');
     for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if(c.indexOf(name) == 0)
           return c.substring(name.length,c.length);
     }
     return "";
    }

function optionsPopUp(){
    var popup = document.getElementById("optPopUp");
    popup.style.display = "block";
}





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

    let startLoc = localStorage.getItem("startLoc")

    let starting = JSON.parse(startLoc)

    if(starting != "None") {

        let plannedStart = new google.maps.LatLng(starting.lat, starting.lng);


        const svgMarker = {
            path: "m13.9 46 5.8-29.3-5.05 2.15v6.65H11.6v-8.65l9.6-4.05q.7-.3 1.475-.375.775-.075 1.525.075.85.15 1.475.55.625.4 1.025 1l2.1 3.3q1.55 2.4 3.875 3.775T37.65 22.5v3q-3.5-.1-6.175-1.525Q28.8 22.55 26.65 19.6l-1.9 7.6 4.6 4.15V46h-3V34l-5.4-4.9L17 46ZM27 10.3q-1.5 0-2.575-1.075Q23.35 8.15 23.35 6.65q0-1.5 1.075-2.575Q25.5 3 27 3q1.5 0 2.575 1.075Q30.65 5.15 30.65 6.65q0 1.5-1.075 2.575Q28.5 10.3 27 10.3Z",
            fillColor: "blue",
            fillOpacity: 0.8,
            strokeWeight: 0,
            rotation: 0,
            scale: .8,
            anchor: new google.maps.Point(20, 30),
        };


        const locMarker = new google.maps.Marker({
            position: plannedStart,
            map,
            title: "Your planned starting location!",
            icon: svgMarker,
        });

        locMarker.addListener('click', function() {
        const infowindow = new google.maps.InfoWindow({
            content: marker.title // Use the title as the content of the info window
        });
        infowindow.open(map, marker); // Open the info window at the marker's position
    });

    }
}

function addMarker(position,attName,colour) {

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


function addAttraction() {
        resultsObj = retrieveStore()

        resultsObj.forEach((element) => {
                    var myLatlng = new google.maps.LatLng(parseFloat(element.latitude),parseFloat(element.longitude));
                    console.log(myLatlng)
                    addMarker(myLatlng,element.name,element.markerColour)
                })


    }

    window.initMap = initMap;