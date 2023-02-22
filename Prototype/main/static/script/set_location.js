let useLoc = false;
let myLat, myLong;
let myLoc=false;

$.getScript( "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&libraries=places")
.done(function( script, textStatus ) {
    google.maps.event.addDomListener(window, "load", initAutocomplete())

})

function initAutocomplete() {

    window['autocomplete_address'] = new google.maps.places.Autocomplete(
      document.getElementById('starting_address'),
    {
       types: ['address'],
       componentRestrictions: {'country': ['ie']},
    })

}

function setChoice(){
    myLoc = true;
    return myLoc;
}

function checkType(){
    if(myLoc){
        getLocation()
    }else{
        beginTrip()
    }

}

function beginTrip (){

    // const selectedMode = document.getElementById("mode").value;
    localStorage.setItem('transMode',document.getElementById("mode").value);



    if(useLoc == true){
        console.log("Anything here?")
        var latitude = myLat;
        var longitude = myLong;

        console.log('lat_a=' + latitude + '&long_a=' + longitude)
        var queryCoords = 'lat_a=' + latitude + '&long_a=' + longitude

        locString = '/route?' + queryCoords
        window.location.assign(locString)

    } else {
        var geocoder = new google.maps.Geocoder()

        var location = document.getElementById('starting_address').value

        geocoder.geocode({'address': location}, function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                console.log('lat_a=' + latitude + '&long_a=' + longitude)
                var queryCoords = 'lat_a=' + latitude + '&long_a=' + longitude

                locString = '/route?' + queryCoords
                window.location.assign(locString)
            }

        });
    }
}

function getLocation() {
  if (navigator.geolocation) {
      useLoc = true;
      navigator.geolocation.getCurrentPosition(setPosition);

  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function setPosition(position){
    myLat = position.coords.latitude;
    myLong = position.coords.longitude;
    console.log(myLat + " + " + myLong);
    beginTrip();
}





