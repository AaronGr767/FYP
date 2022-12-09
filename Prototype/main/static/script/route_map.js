
$.getScript( "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&libraries=places")
.done(function( script, textStatus ) {
    google.maps.event.addDomListener(window, "load", initMap)

})

const waypts = [
        {location: {lat: lat_1, lng: long_1},
        stopover: true}
        ];

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map-route'));
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay);

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    var selectedMode=localStorage.getItem('transMode');

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


