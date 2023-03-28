let myLoc = false;

function initAutocomplete() {

    let input = document.getElementById('starting_address');

    let options = {
        types: ['address'], // restrict results to cities
        componentRestrictions: {country: ['ie']} // restrict results to USA
    };

    let autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener('place_changed', function () {
        let place = autocomplete.getPlace();
        let chosenAdd = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
        localStorage.setItem('startLoc', JSON.stringify(chosenAdd));
    });

}


function checkType() {
    let manualEntry = document.getElementById('starting_address').value

    if (myLoc == false && manualEntry == "") {
        console.log("Path to next page will go here when mapping is sorted")
        localStorage.setItem('startLoc', JSON.stringify("None"));
    }
    location.href = '/tripRoute'
}


function getLocation() {
    if (navigator.geolocation) {
        myLoc = true
        navigator.geolocation.getCurrentPosition(function (position) {
            userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            console.log(userLocation)
            localStorage.setItem('startLoc', JSON.stringify(userLocation));
        })
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}






