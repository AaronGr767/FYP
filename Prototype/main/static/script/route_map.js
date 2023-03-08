
let resultsObj = retrieveStore()

displayAttractions(resultsObj)

var popup = document.getElementById("optPopUp");
popup.style.display = "none";


$.getScript( "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&libraries=places")
.done(function( script, textStatus ) {
    google.maps.event.addDomListener(window, "load", initMap)

})

const waypts = [
        {location: {lat: lat_1, lng: long_1},
        stopover: true}
        ];

function retrieveStore(){
    let results = localStorage.getItem("finalChoice");

    if (results == null) {
        resultsStorage = [];
      } else {
        resultsStorage = JSON.parse(results);
    }

    return resultsStorage;
}

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'));
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var selectedMode=localStorage.getItem('transMode');

    console.log(selectedMode);

    directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[selectedMode],
    }, function(response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);

      } else {

        alert('Directions request failed due to ' + status);
      }
    });
}

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
                choiceHtml.innerHTML += `<li>${element.name}</li>`
            })

    return resultsObj;
}

function saveTrip(startCheck) {
    let resultsName, resultsLat, resultsLng = '';
    let resultsStore = retrieveStore()
    let counter = 0;

    let details = localStorage.getItem("detailsStore");
    let filters = localStorage.getItem("filterStore");
    let startLoc = localStorage.getItem("startLoc")

    if (details == null) {
        detailsObj = [];
      } else {
        detailsObj = JSON.parse(details);
    }

    resultsStore.forEach((element) =>{
                if(counter==0){
                    resultsName = element.name
                    resultsLat = element.latitude
                    resultsLng = element.longitude
                    counter ++
                }else{
                    resultsName = resultsName + "," + element.name
                    resultsLat = resultsLat + "," + element.latitude
                    resultsLng = resultsLng + "," + element.longitude
                }

            })

    console.log(resultsName)
    console.log(resultsLat)
    console.log(resultsLng)

    // let csrftoken = getCookie('csrftoken');

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
            tags:filters,
            tName:detailsObj.tripName,
            gSize:detailsObj.groupSize,
            mPrice:detailsObj.maxPrice,
            cDate:detailsObj.chosenDate
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        if(startCheck){
            localStorage.setItem('saveAndStart', JSON.stringify(data))
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

