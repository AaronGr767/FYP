let removeCheck = 0;
let map;
let markers = [];
let recData;
let tempHold;
let recHold;
let currHold;

let disArray = []

let i = 0
let j = -1;

document.getElementById('optionsContainer').innerHTML = `<h5 style="text-align: center">Attractions Based on<br> Your Choices:</h5>`;

displayOptions()

function displayOptions() {
    let resultsObj = [];
    let optCont = document.getElementById('optionsContainer')
    let results = localStorage.getItem("resultStore");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }


    console.log("beep " + resultsObj.length);
    console.log(resultsObj[0])
    console.log("cheese = " + typeof (resultsObj))


    for (i = 0; i < resultsObj.length; i++) {

        console.log(resultsObj[i].name)

        checkHtml = `
                        <div class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${resultsObj[i].tag1}" style="margin-bottom: 2%;width:99%">
                          <input type="checkbox"  onclick=addAttraction(${i}) class="btn-check" name="${resultsObj[i].name}" id=${i}  autocomplete="off">
                          <label class="btn btn-outline-secondary" for=${i}>${resultsObj[i].name}</label>
                        </div>
            <br>`

        optCont.innerHTML += checkHtml;
        console.log("feck off " + document.getElementById(i).name)
    }


}

compareTrips(0)
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

    marker.addListener('click', function () {
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

    retrievePopular(attBut.name)

    if (attBut.checked) {

        let compare;


        resultsObj.forEach((element) => {
            // let id = element.id;
            if (attBut.name == element.name) {
                var myLatlng = new google.maps.LatLng(parseFloat(element.latitude), parseFloat(element.longitude));
                console.log(element.latitude)
                console.log(myLatlng)
                addMarker(myLatlng, element.name, element.markerColour)

                for (j = 0; j < recData.attractions.length; j++) {

                    tempHold = document.getElementById("rec" + j)
                    if (tempHold.name == element.name) {
                        currHold = tempHold;
                        currHold.disabled = true;
                        disArray.push(j)
                    }
                }
            }
        })

    } else {
        attBut.checked = false;
        resultsObj.forEach((element) => {

            if (attBut.name == element.name) {
                var tempLatLng = new google.maps.LatLng(parseFloat(element.latitude), parseFloat(element.longitude));
                console.log(tempLatLng)
                markers.forEach((item) => {
                    j++;
                    console.log("comp " + tempLatLng + " / " + markers)
                    if (JSON.stringify(item.position) === JSON.stringify(tempLatLng)) {
                        console.log("no hope")
                        delMarkers(item, j)

                        if (disArray.length != 0) {
                            for (k = 0; k < disArray.length; k++) {
                                tempHold = document.getElementById("rec" + disArray[k])
                                if (tempHold.name == element.name) {
                                    tempHold.disabled = false;
                                    disArray.splice(k, 1)
                                }
                            }
                        }
                    }

                })
            }

        })
    }

}

window.initMap = initMap;

function collectChoices() {
    let results = localStorage.getItem("resultStore");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }

    let finalChoices = [];
    let attId = []
    for (i = 0; i < resultsObj.length; i++) {
        checkVar = document.getElementById(i)
        if (checkVar.checked) {
            resultsObj.forEach((element) => {
                if (element.name == checkVar.name) {
                    finalChoices.push(element)
                    console.log("vibes")
                    console.log(finalChoices)
                }
            })
        }
    }
    for (i = 0; i < recData.frequency.length; i++) {
        let formatId = "rec" + i
        checkRec = document.getElementById(formatId)
        if (checkRec.checked) {
            for (j = 0; j < recData.frequency.length; j++) {
                if (recData.attractions[j].name == checkRec.name) {
                    finalChoices.push(recData.attractions[j])
                    console.log(recData.attractions[j])
                    console.log(finalChoices)
                }
            }
        }
    }


    localStorage.setItem('finalChoice', JSON.stringify(finalChoices))
    location.href = '/routeMap'
}

function compareTrips(minRating) {
    let optCont = document.getElementById('reccChoices')
    optCont.innerHTML = ``;

    let filters = localStorage.getItem("filterStore");
    let filterArray = JSON.parse(filters)

    // let csrftoken = getCookie('csrftoken');

    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url: "comparesimilarity",
        data: {
            usedTags: filterArray,
            mRate: minRating
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        recData = data

        removeCheck++

        displayRecommendations(data)

        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updateddatabase<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("retrieval finished");
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

function showDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

//Reference: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_dropdown
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

//End Reference

function displayRecommendations(recAtt) {
    let recOpt = document.getElementById('reccChoices')

    for (i = 0; i < recAtt.frequency.length; i++) {

        let recId = "rec" + i

        console.log(recId)

        checkHtml = `<div id="recOps" class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${recAtt.attractions[i].tag1}" style="margin-bottom: 2%;width:99%">
                      <input type="checkbox"  onclick=addRecAttraction(${i},"rec") class="btn-check" name="${recAtt.attractions[i].name}" id=${recId}  autocomplete="off">
                      <label class="btn btn-outline-secondary" for=${recId}>${recAtt.attractions[i].name}</label>
                    </div><br>`

        recOpt.innerHTML += checkHtml;

        checkForSelected("rec", recId, recAtt.attractions[i].name)
    }
}

function addRecAttraction(buttonId,type) {
    realId = type + buttonId
    let attBut = document.getElementById(realId)
    console.log("Adding rec")
    console.log(attBut.name)

    if (attBut.checked) {

        let compare;

        for (i = 0; i < recData.frequency.length; i++) {
            // let id = element.id;
            if (attBut.name == recData.attractions[i].name) {
                var myLatlng = new google.maps.LatLng(parseFloat(recData.attractions[i].latitude), parseFloat(recData.attractions[i].longitude));
                console.log(recData.attractions[i].latitude)
                console.log(myLatlng)
                addMarker(myLatlng, recData.attractions[i].name, recData.attractions[i].markerColour)
                for (j = 0; j < resultsObj.length; j++) {
                    tempHold = document.getElementById(j)
                    if (tempHold.name == recData.attractions[i].name) {
                        currHold = tempHold;
                        currHold.disabled = true;
                        disArray.push(j)
                    }

                    if(document.getElementById("popChoices").style.display == 'block') {
                        if (type == "rec") {
                            recHold = document.getElementById("pop" + j)
                        } else {
                            recHold = document.getElementById("rec" + j)
                        }

                        if (recHold.name == recData.attractions[i].name) {
                            currHold = recHold;
                            currHold.disabled = true;
                            disArray.push(j)
                        }
                    }
                }
            }

        }
        console.log("Testers:")
    console.log(recHold)
    console.log(currHold)
    console.log(disArray)
    } else {
        // if(currHold.disabled){
        //     currHold.disabled = false;
        // }

        for (i = 0; i < recData.frequency.length; i++) {

            if (attBut.name == recData.attractions[i].name) {
                var tempLatLng = new google.maps.LatLng(parseFloat(recData.attractions[i].latitude), parseFloat(recData.attractions[i].longitude));
                console.log(tempLatLng)
                markers.forEach((item) => {
                    j++;
                    console.log("comp " + tempLatLng + " / " + markers)
                    if (JSON.stringify(item.position) === JSON.stringify(tempLatLng)) {
                        console.log("no hope")
                        delMarkers(item, j)

                        if (disArray.length != 0) {
                            for (k = 0; k < disArray.length; k++) {
                                tempHold = document.getElementById(disArray[k])
                                if (tempHold.name == recData.attractions[i].name) {
                                    tempHold.disabled = false;
                                    disArray.splice(k, 1)
                                }

                                if(document.getElementById("popChoices").style.display == 'block') {
                                    if (type == "rec") {
                                        recHold = document.getElementById("pop" + k)
                                    } else {
                                        recHold = document.getElementById("rec" + k)
                                    }

                                    if (recHold.name == recData.attractions[i].name) {
                                        recHold.disabled = false;
                                        disArray.splice(k, 1)
                                    }
                                }
                            }
                        }
                    }
                })
            }

        }
        console.log("Testers:")
    console.log(disArray)
    }

}

function retrievePopular(attName){
    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url: "retrievepopularity/",
        data: {
            attraction: attName
        }
    }).done(function (data, status, xhr) {
        console.log(data)

        renderPopular(data.results)
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updateddatabase<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("retrieval finished");
    });
}

function renderPopular(popResults){
    let popCont = document.getElementById("popChoices")
    popCont.style.display = 'block'
    popCont.innerHTML = ``
    popCont.innerHTML = `<h5>Most Commonly Paired with<br> these Attractions:</h5>`

    console.log(popResults)

    for (i = 0; i < popResults.length; i++) {

        let popId = "pop" + i


        popCont.innerHTML += `<div id="popOps" class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${popResults[i].tag1}" style="margin-bottom: 2%;width:99%">
                      <input type="checkbox"  onclick=addRecAttraction(${i},"pop") class="btn-check" name="${popResults[i].name}" id=${popId}  autocomplete="off">
                      <label class="btn btn-outline-secondary" for=${popId}>${popResults[i].name}</label>
                    </div><br>`

        checkForSelected("rec", popId, popResults[i].name)
    }

}

//If option is already selected elsewhere
function checkForSelected(type, id, name) {
    let ifPopExists = document.getElementById("popChoices").style.display

    for (i = 0; i < disArray.length; i++) {
        if (document.getElementById(disArray[i]).name == name) {
            document.getElementById(id).disabled = true;
        }
        // else if (document.getElementById("pop"+disArray[i]).name == name) {
        //         document.getElementById(id).disabled = true;
        //     }
        //
        // if (ifPopExists == 'block' && type == "rec") {
        //
        // }

        // else if (type == "pop"){
        //     if (document.getElementById(disArray[i]).name == name) {
        //         document.getElementById(id).disabled = true;
        //     }
        //     if (document.getElementById("rec"+disArray[i]).name == name) {
        //         document.getElementById(id).disabled = true;
        //     }
        // }
    }


}