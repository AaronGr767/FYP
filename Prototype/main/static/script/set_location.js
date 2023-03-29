let myLoc = false;

// Autocompletes user inputted address with data from Google Maps
function initAutocomplete() {

    let input = document.getElementById('starting_address');

    let options = {
        types: ['address'], // restrict results to cities
        componentRestrictions: {country: ['ie']} // restrict results to USA
    };

    let autocomplete = new google.maps.places.Autocomplete(input, options);

    // Listens for and retrieves the users selected location before storing it in local storage
    autocomplete.addListener('place_changed', function () {
        myLoc = false;
        let place = autocomplete.getPlace();
        let chosenAdd = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
        localStorage.setItem('startLoc', JSON.stringify(chosenAdd));
    });

}

// Checks to see if the user has chosen their current address or inputted a chosen address and proceeds accordingly
function checkType() {
    let manualEntry = document.getElementById('starting_address').value

    // If the user has not picked any address, sets their location value to 'None'
    if (myLoc == false && manualEntry == "") {
        console.log("Path to next page will go here when mapping is sorted")
        localStorage.setItem('startLoc', JSON.stringify("None"));
    }
    location.href = '/tripRoute'
}


// Retrieves the users current location if they choose so and stores it in local storage
function getLocation() {
    // If geolocation is supported by the browser
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






