// let myLat, myLong;
let myLoc=false;

// google.maps.event.addDomListener(window, 'load', initialize);
//
//     function initialize() {
//
//       var input = document.getElementById('starting_address');
//
//       var autocomplete = new google.maps.places.Autocomplete(input);
//
//       autocomplete.addListener('place_changed', function () {
//
//       var place = autocomplete.getPlace();
//
//       // place variable will have all the information you are looking for.
//
//       $('#lat').val(place.geometry['location'].lat());
//
//       $('#long').val(place.geometry['location'].lng());
//
//     });
//
//   }

// $.getScript( "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&libraries=places")
// .done(function( script, textStatus ) {
//     google.maps.event.addDomListener(window, "load", initAutocomplete())
//
// })

// google.maps.event.addListener(autocomplete, 'starting_address', function() {
//   let place = autocomplete.getPlace();
//   console.log(place.name); // log the selected place name
// });

function initAutocomplete() {

    let input = document.getElementById('starting_address');

  let options = {
    types: ['address'], // restrict results to cities
    componentRestrictions: {country: ['ie']} // restrict results to USA
  };

  let autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.addListener('place_changed', function() {
    let place = autocomplete.getPlace();
    let chosenAdd = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
    localStorage.setItem('startLoc', JSON.stringify(chosenAdd));
  });

    // window['autocomplete_address'] = new google.maps.places.Autocomplete(
    //   document.getElementById('starting_address'),
    // {
    //    types: ['address'],
    //    componentRestrictions: {'country': ['ie']},
    // })

}

// function setChoice(){
//     myLoc = true;
// }
//
function checkType(){
    let manualEntry = document.getElementById('starting_address').value

    if(myLoc == false &&  manualEntry == ""){
        console.log("Path to next page will go here when mapping is sorted")
        localStorage.setItem('startLoc', JSON.stringify("None"));
    }
    location.href='/tripRoute'
}

// function beginTrip (){
//
//     if(myLoc == true){
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(function (position) {
//             userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//             console.log("Below this:")
//                 console.log(userLocation)
//             localStorage.setItem('startLoc', JSON.stringify(userLocation));
//         })
//         } else {
//             console.log("Geolocation is not supported by this browser.");
//         }
//
//     } else {
//         var geocoder = new google.maps.Geocoder()
//
//         var chosenLocation = document.getElementById('starting_address').value
//
//         geocoder.geocode({'address': chosenLocation}, function (results, status) {
//
//             // if (status == google.maps.GeocoderStatus.OK) {
//                 var latitude = results[0].geometry.location.lat();
//                 var longitude = results[0].geometry.location.lng();
//
//                 let userLocation = new google.maps.LatLng(latitude, longitude);
//
//                 // let startObj = {startLat: latitude, startLng: longitude}
//                 // localStorage.setItem('startLoc', JSON.stringify(startObj));
//
//                 console.log('lat_a=' + latitude + '&long_a=' + longitude)
//                 var queryCoords = 'lat_a=' + latitude + '&long_a=' + longitude
//
//                 localStorage.setItem('startLoc', JSON.stringify(userLocation));
//
//                 // locString = '/route?' + queryCoords
//                 // window.location.assign(locString)
//
//
//         });
//     }
//     location.href='/tripRoute'
// }

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

// function setPosition(position){
//     myLat = position.coords.latitude;
//     myLong = position.coords.longitude;
//     console.log(myLat + " + " + myLong);
//     beginTrip();
// }





