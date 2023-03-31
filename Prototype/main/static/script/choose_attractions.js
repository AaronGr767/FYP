let removeCheck = 0;
let map;
let markers = [];
let recData;
let popularResults;
let tempHold;
let recHold;
let currHold;

let savedPopChoice = []
let disArray = []

let j = -1;

document.getElementById('optionsContainer').innerHTML = `<h5 style="text-align: center">Attractions Based on<br> Your Choices:</h5>`;

displayOptions()

// Displays all attraction options to user based on their chosen filters
function displayOptions() {
    let resultsObj = [];
    let optCont = document.getElementById("optionsContainer")

    // Retrieves the results based on user filters
    let results = localStorage.getItem("resultStore");
    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }

    console.log(resultsObj[0])

    // Displays all suitable attractions as choices
    for (i = 0; i < resultsObj.length; i++) {

        console.log(resultsObj[i].name)

        optCont.innerHTML += `
                        <div class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${resultsObj[i].tag1}" style="margin-bottom: 2%;width:99%">
                          <input type="checkbox"  onclick=addAttraction(${i}) class="btn-check" name="${resultsObj[i].name}" id=${i}  autocomplete="off">
                          <label class="btn btn-outline-secondary" for=${i}><button class="attInfo" title="info" onclick="displayDetails('${resultsObj[i].name}')"><i class="fa-solid fa-circle-info"></i></button> ${resultsObj[i].name}</label>
                        </div>`

    }

}


//Displays the relevant details for an attraction upon the user clicking the info button
function displayDetails(chosenName) {
    let attrRating;
    let infoPopup = document.getElementById("mapPopUp4")
    infoPopup.style.display = 'block'
    let done = 0;
    let details = localStorage.getItem("detailsStore");
    let parsedDetails = JSON.parse(details)
    let dayIdx = parsedDetails.dayIndex

    // Calls a view that finds the chosen attraction and returns its rating
    $.ajax({
        type: "POST",
        url: "retrieverating/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            attName: chosenName
        }
    }).done(function (data, status, xhr) {
        console.log("Retrieval successful.");
        console.log(data)

        attrRating = data.results[0].averageRating / 2

        //Display attraction details if its from users own choices
        for (i = 0; i < resultsObj.length; i++) {
            if (chosenName == resultsObj[i].name) {
                infoPopup.innerHTML = `<div class="alert alert-light alert-dismissible fade show" role="alert" style="margin-bottom: 2%"><p>${resultsObj[i].description}</p>
                                    <p><em>User Rating : </em><strong>${attrRating} <i class="fa-solid fa-star"></i></strong></p>
                                    <p><em>Ticket Price (per adult) : </em><strong>€${resultsObj[i].maxPrice}</strong></p>
                                    <p><em>Access : </em><strong>${resultsObj[i].access}</strong></p>
                                    <p><em>Average Tour Length : </em><strong>${resultsObj[i].averageTime} minutes</strong></p>
                                    <p><em>Hours for Chosen Date : </em><strong>${resultsObj[i].openingHours[dayIdx].substring(0, 2)}:${resultsObj[i].openingHours[dayIdx].substring(2)} - ${resultsObj[i].closingHours[dayIdx].substring(0, 2)}:${resultsObj[i].closingHours[dayIdx].substring(2)}</strong></p>
                                    <p><em>Website : </em><a style="color:inherit" href="${resultsObj[i].website} target="_blank""><strong>${resultsObj[i].website}</strong></a></p>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`
                done++
            }
        }

        //Display attraction details if its from reccommended choices
        if (done == 0) {
            for (j = 0; j < recData.attractions.length; j++) {
                if (chosenName == recData.attractions[j].name) {
                    infoPopup.innerHTML = `<div class="alert alert-light alert-dismissible fade show" role="alert" style="margin-bottom: 2%"><p>${recData.attractions[j].description}</p>
                                    <p><em>Ticket Price (per adult) : </em><strong>€${recData.attractions[j].maxPrice}</strong></p>
                                    <p><em>Access : </em><strong>${recData.attractions[j].access}</strong></p>
                                    <p><em>Average Tour Length : </em><strong>${recData.attractions[j].averageTime} minutes</strong></p>
                                    <p>Hours for Chosen Date : <strong>${recData.attractions[j].openingHours[dayIdx].substring(0, 2)}:${recData.attractions[j].openingHours[dayIdx].substring(2)} - ${recData.attractions[j].closingHours[dayIdx].substring(0, 2)}:${recData.attractions[j].closingHours[dayIdx].substring(2)}</strong></p>
                                    <p><em>Website : </em><a style="color:inherit" href="${recData.attractions[j].website} target="_blank""><strong>${recData.attractions[j].website}</strong></a></p>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`
                    done++
                }
            }
        }

        console.log(popularResults)

        //Display attraction details if its from most popular choices
        if (done == 0) {
            for (k = 0; k < popularResults.length; k++) {
                if (chosenName == popularResults[k].name) {
                    infoPopup.innerHTML = `<div class="alert alert-light alert-dismissible fade show" role="alert" style="margin-bottom: 2%"><p>${popularResults[k].description}</p>
                                    <p><em>Ticket Price (per adult) : </em><strong>€${popularResults[k].maxPrice}</strong></p>
                                    <p><em>Access : </em><strong>${popularResults[k].access}</strong></p>
                                    <p>Average Tour Length : <strong>${popularResults[k].averageTime} minutes</strong></p>
                                    <p>Hours for Chosen Date : <strong>${popularResults[k].openingHours[dayIdx].substring(0, 2)}:${popularResults[k].openingHours[dayIdx].substring(2)} - ${popularResults[k].closingHours[dayIdx].substring(0, 2)}:${popularResults[k].closingHours[dayIdx].substring(2)}</strong></p>
                                    <p><em>Website : </em><a style="color:inherit" href="${popularResults[k].website} target="_blank""><strong>${popularResults[k].website}</strong></a></p>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`
                    done++
                }
            }
        }

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });

    console.log(dayIdx)

}

compareTrips(0)
showMarkers()


// Retrieves attractions from local storage
let results = localStorage.getItem("resultStore");

if (results == null) {
    resultsObj = [];
} else {
    resultsObj = JSON.parse(results);
}


// Initialises the map
function initMap() {
    let dublin = {lat: 53.345302024709206, lng: -6.27215179129342};

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: dublin,
    });

}

// Adds a marker for the chosen attraction with its relevant details
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

    // Add a marker that displays the attractions name when clicked
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

// Adds a selected attraction when the user clicks on it
function addAttraction(buttonId) {
    let attBut = document.getElementById(buttonId)
    console.log("breaks here")
    console.log(attBut.name)

    // Check to see if the user has clicked on or off the attraction
    if (attBut.checked) {

        // If the user has picked any of the most popular choices, these are then stored in array to be saved later
        if (popularResults != null) {
            for (i = 0; i < popularResults.length; i++) {
                let formatId = "pop" + i
                checkRec = document.getElementById(formatId)
                if (checkRec != null) {
                    if (checkRec.checked) {
                        if (!savedPopChoice.includes(popularResults[i])) {
                            savedPopChoice.push(popularResults[i])
                            console.log(savedPopChoice)
                        }

                    }
                }
            }

        }

        // Iterate through each relevant attraction until it finds the correct attraction that matches the users choice
        resultsObj.forEach((element) => {

            if (attBut.name == element.name) {
                let myLatlng = new google.maps.LatLng(parseFloat(element.latitude), parseFloat(element.longitude));
                console.log(element.latitude)
                console.log(myLatlng)

                // Adds the attraction marker
                addMarker(myLatlng, element.name, element.markerColour)

                // Checks to see if any recommended attraction are the same as the chosen attraction and disables them accordingly
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

        //Retrieves top 3 most popular attractions associated with chosen attraction
        retrievePopular(attBut.name)

    // If the user has deselected the attraction
    } else {
        attBut.checked = false;

        // Iterate through each relevant attraction until it finds the correct attraction that matches the users choice
        resultsObj.forEach((element) => {

            if (attBut.name == element.name) {
                var tempLatLng = new google.maps.LatLng(parseFloat(element.latitude), parseFloat(element.longitude));
                console.log(tempLatLng)

                // Iterate through all markers and remove the marker for the deselected attraction
                markers.forEach((item) => {

                    j++;
                    console.log("comp " + tempLatLng + " / " + markers)

                    if (JSON.stringify(item.position) === JSON.stringify(tempLatLng)) {

                        // Remove the marker for the deselected attraction
                        delMarkers(item, j)

                        // Checks to see if any recommended or most popular attractions are the same as the chosen attraction and re-enables them accordingly
                        if (disArray.length != 0) {
                            for (k = 0; k < disArray.length; k++) {
                                tempHold = document.getElementById("rec" + disArray[k])
                                if (tempHold != null && tempHold.name == element.name) {
                                    tempHold.disabled = false;
                                    disArray.splice(k, 1)
                                }
                            }

                            for (j = 0; j < disArray.length; j++) {

                                tempHold = document.getElementById("pop" + j)
                                if (tempHold != null && tempHold.name == element.name) {
                                    tempHold.disabled = false;
                                    disArray.splice(j, 1)
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

// Retrieves and stores the users final choices when they click the next step button
function collectChoices() {
    let results = localStorage.getItem("resultStore");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }

    let finalChoices = [];

    // Store any attractions chosen from the users own choices section
    for (i = 0; i < resultsObj.length; i++) {
        checkVar = document.getElementById(i)

        if (checkVar.checked) {
            resultsObj.forEach((element) => {

                if (element.name == checkVar.name) {
                    finalChoices.push(element)
                    console.log(finalChoices)
                }
            })
        }
    }

    // Store any attractions chosen from the recommended section
    if (recData != undefined) {
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
    }

    // Store any attractions chosen from the most popular section
    if (popularResults != null) {
        for (i = 0; i < popularResults.length; i++) {
            let formatId = "pop" + i
            checkRec = document.getElementById(formatId)
            if (checkRec != null) {
                if (checkRec.checked) {
                    for (j = 0; j < popularResults.length; j++) {
                        if (popularResults[j].name == checkRec.name) {
                            if (!savedPopChoice.includes(popularResults[j])) {
                                finalChoices.push(popularResults[j])
                            }
                            console.log(popularResults[j])
                            console.log(finalChoices)
                        }
                    }
                }
            }
        }

        for (j = 0; j < savedPopChoice.length; j++) {
            finalChoices.push(savedPopChoice[j])
        }
    }

    // Stores all chosen attractions in local storage and move to next page
    localStorage.setItem('finalChoice', JSON.stringify(finalChoices))
    location.href = '/setLocation'
}

// Calls the view to retrieve data for recommendation based on similar trips
function compareTrips(minRating) {
    let optCont = document.getElementById('reccChoices')
    optCont.innerHTML = ``;

    let filters = localStorage.getItem("filterStore");
    let filterArray = JSON.parse(filters)

    // let csrftoken = getCookie('csrftoken');

    // Calls view passes the user's chosen filters and rating in order to return recommendations based on similar trips
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

        // Displays the recommendations
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

// Create cookies for use in AJAX req
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

//Shows the dropdown for selecting a star rating
function showDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Manages logic for selecting a star value for rating
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

// Displays all the recommendations recieved for the user
function displayRecommendations(recAtt) {
    let recChoice = document.getElementById('reccChoices')
    let recOptions = document.getElementById('recOptions')

    if (recAtt.frequency.length > 0) {
        recOptions.style.display = 'block'

        for (i = 0; i < recAtt.attractions.length; i++) {
            let recId = "rec" + i
            console.log(recId)

            recChoice.innerHTML += `<div id="recOps" class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${recAtt.attractions[i].tag1}" style="margin-bottom: 2%;width:99%">
                          <input type="checkbox"  onclick=addRecAttraction(${i},"rec") class="btn-check" name="${recAtt.attractions[i].name}" id=${recId}  autocomplete="off">
                          <label class="btn btn-outline-secondary" for=${recId}><button class="attInfo" title="info" onclick="displayDetails('${recAtt.attractions[i].name}')"><i class="fa-solid fa-circle-info"></i></button> ${recAtt.attractions[i].name}</label>
                        </div><br>`

            // Checks to see if any of these recommendations are already present in the other attractions tabs
            checkForSelected("rec", recId, recAtt.attractions[i].name)
        }
    } else {
        recChoice.innerHTML = "<p>No options match this rating!</p>"
    }

}

// Adds a selected recommended attraction when the user clicks on it
function addRecAttraction(buttonId, type) {
    //Formats the buttons proper id based for if it is either from the recommended or popular section

    realId = type + buttonId
    let attBut = document.getElementById(realId)
    console.log("Adding rec")
    console.log(attBut.name)

    let chosenData;

    // Checks if the attraction is sourced from popular or recommended
    if (type == "rec") {
        chosenData = recData.attractions
    } else {
        chosenData = popularResults
    }

    // Check to see if the user has clicked on or off the attraction
    if (attBut.checked) {

        // Iterate through each relevant attraction until it finds the correct attraction that matches the users choice
        for (i = 0; i < chosenData.length; i++) {

            if (attBut.name == chosenData[i].name) {

                var myLatlng = new google.maps.LatLng(parseFloat(chosenData[i].latitude), parseFloat(chosenData[i].longitude));
                console.log(chosenData[i].latitude)
                console.log(myLatlng)

                // Adds the attraction marker
                addMarker(myLatlng, chosenData.name, chosenData[i].markerColour)

                // Checks to see if any other offered attractions are the same attraction as the chosen attraction and disables them accordingly
                for (j = 0; j < resultsObj.length; j++) {
                    tempHold = document.getElementById(j)

                    if (tempHold.name == chosenData[i].name) {
                        currHold = tempHold;
                        currHold.disabled = true;
                        disArray.push(j)
                    }

                    if (document.getElementById("popChoices").style.display == 'block') {
                        if (type == "rec") {
                            recHold = document.getElementById("pop" + j)
                        } else {
                            recHold = document.getElementById("rec" + j)
                        }

                        if (recHold != null && recHold.name == chosenData[i].name) {
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

    // If the user has deselected the attraction
    } else {

        // Iterate through each relevant attraction until it finds the correct attraction that matches the users choice
        for (i = 0; i < chosenData.length; i++) {

            if (attBut.name == chosenData[i].name) {
                var tempLatLng = new google.maps.LatLng(parseFloat(chosenData[i].latitude), parseFloat(chosenData[i].longitude));
                console.log(tempLatLng)

                // Iterate through all markers and remove the marker for the deselected attraction
                markers.forEach((item) => {
                    j++;
                    console.log("comp " + tempLatLng + " / " + markers)
                    if (JSON.stringify(item.position) === JSON.stringify(tempLatLng)) {

                        // Remove the marker for the deselected attraction
                        delMarkers(item, j)

                        // Checks to see if any disabled attractions are the same as the chosen attraction and re-enables them accordingly
                        if (disArray.length != 0) {
                            for (k = 0; k < disArray.length; k++) {
                                tempHold = document.getElementById(disArray[k])
                                if (tempHold.name == chosenData[i].name) {
                                    tempHold.disabled = false;
                                    disArray.splice(k, 1)
                                }

                                if (document.getElementById("popChoices").style.display == 'block') {
                                    if (type == "rec") {
                                        recHold = document.getElementById("pop" + k)
                                    } else {
                                        recHold = document.getElementById("rec" + k)
                                    }

                                    if (recHold != null && recHold.name == chosenData[i].name) {
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

// Retrieves the top 3 most popular attractions associated with an attraction
function retrievePopular(attName) {

    // Passes the attractions name to a view that returns the top 3 most popular attractions associated with an attraction
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

        popularResults = data.results;

        // Displays the most popular attractions
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

// Displays the most popular attractions the user as selectable options
function renderPopular(popResults) {
    let popCont = document.getElementById("popChoices")
    popCont.style.display = 'block'
    popCont.innerHTML = ``
    popCont.innerHTML = `<h5>Chosen Attraction Commonly<br> Paired with:</h5>`

    console.log(popResults)

    for (i = 0; i < popResults.length; i++) {

        let popId = "pop" + i


        popCont.innerHTML += `<div id="popOps" class="btn-group" role="group" aria-label="Basic radio toggle button group" title="${popResults[i].tag1}" style="margin-bottom: 2%;width:99%">
                      <input type="checkbox"  onclick=addRecAttraction(${i},"pop") class="btn-check" name="${popResults[i].name}" id=${popId}  autocomplete="off">
                      <label class="btn btn-outline-secondary" for=${popId}><button class="attInfo" title="info" onclick="displayDetails('${popResults[i].name}')"><i class="fa-solid fa-circle-info"></i></button> ${popResults[i].name}</label>
                    </div><br>`

        // Checks to see if any of these recommendations are already present in the other attraction selection tabs
        checkForSelected("pop", popId, popResults[i].name)
    }

}

//If option is already selected elsewhere
function checkForSelected(type, id, name) {

    // Adds all attractions from the users own choices tab to the disabled array
    for (v = 0; v < resultsObj.length; v++) {
        if (document.getElementById(v).checked) {
            if (document.getElementById(v).name == name) {
                disArray.push(v)
            }
        }
    }

    if (disArray.length > 0) {

        //breaks entire page by freezing when I iterate using 'i'
        // Iterate through the array containing all clicked attractions
        for (p = 0; p < disArray.length; p++) {

            let existingSelects = document.getElementById(disArray[p]).name

            // Ensure that all disabled attractions remain disabled
            if (existingSelects == name) {
                document.getElementById(id).disabled = true;

            //Disables all popular attractions that already have the attraction selected elsewhere
            } else if (type != "pop") {

                if (document.getElementById("pop" + disArray[p]).name == name) {
                    document.getElementById(id).disabled = true;
                }

            //Disables all recommended attractions that already have the attraction selected elsewhere
            } else if (type != "rec" && document.getElementById("rec" + disArray[p]) != null) {

                if (document.getElementById("rec" + disArray[p]).name == name) {
                    document.getElementById(id).disabled = true;
                }
            }
        }

    }

}