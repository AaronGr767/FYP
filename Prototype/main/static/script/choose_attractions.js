// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.
let map;
let markers = [];
let i = 0
let j = -1;

showMarkers()

let results = localStorage.getItem("resultStore");

if (results == null) {
    resultsObj = [];
  } else {
    resultsObj = JSON.parse(results);
}


function initMap() {
    let dublin = {lat: 53.345302024709206, lng: -6.27215179129342};

     map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: dublin,
    });

  //   const pinViewBackground = new google.maps.marker.PinView({
  //   background: "#FBBC04",
  // });

}

// const customPin = new google.maps.marker.PinView({
//     background: "#7bcde8",
// })


function addMarker(position) {
  const marker = new google.maps.Marker({
    map,
    position,
    content: "background: '#FBBC04'",
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

// Removes the markers from the map, but keeps them in the array.
function delMarkers(delMark, i) {
    console.log(delMark)
    delete markers[i]
  delMark.setMap(null);
    console.log("clarity" + i)
    console.log(markers)
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
}

function addAttraction(buttonId) {
        let attBut = document.getElementById(buttonId)
        console.log("breaks here")
        console.log(attBut.name)

        if (attBut.checked) {

            let compare;


            resultsObj.forEach((element) => {
                // let id = element.id;
                if(attBut.name == element.name){
                    var myLatlng = new google.maps.LatLng(parseFloat(element.latitude),parseFloat(element.longitude));
                    addMarker(myLatlng, buttonId)
                }
            })

        }else
        {
            attBut.checked = false;
            resultsObj.forEach((element) => {

                if(attBut.name == element.name) {
                    var tempLatLng = new google.maps.LatLng(parseFloat(element.latitude), parseFloat(element.longitude));
                    console.log(tempLatLng)
                    markers.forEach((item) => {
                        j++;
                        console.log("comp " + tempLatLng + " / " + markers)
                        if (JSON.stringify(item.position) === JSON.stringify(tempLatLng)) {
                            console.log("no hope")
                            delMarkers(item, j)
                            // showMarkers()
                            // console.log("del"+markers[j])
                            // delete markers[j]
                            //
                            // setMapOnAll(map, markers)
                        }
                    })
                }

                // let id = element.id;
                // if(buttonId == id){
                //     console.log("att del")
                //     delete element.id;
                //     delete element.position;
                //
                //     setMapOnAll()

                //     function setMapOnAll(map) {
                //       for (let i = 0; i < markers.length; i++) {
                //         markers[i].setMap(map);
                //       }
                //     }
                //
                //
                // }
            })
        }

    }

window.initMap = initMap;

function collectChoices(){
    let results = localStorage.getItem("resultStore");

        if (results == null) {
            resultsObj = [];
          } else {
            resultsObj = JSON.parse(results);
        }

    let finalChoices = [];
    for(i=0;i<resultsObj.length;i++){
        checkVar = document.getElementById(i)
        if(checkVar.checked){
            resultsObj.forEach((element) =>{
                if(element.id == i){
                    finalChoices.push(element)
                    console.log("vibes")
                    console.log(finalChoices)
                }
            })
        }
    }

    localStorage.setItem('finalChoice', JSON.stringify(finalChoices))
    location.href='/routeMap'
}