getTrips()

// Displays all the users saved trips
function displaySaved(savedArray){
    let sTrip = document.getElementById("savedTrips")
    sTrip.innerHTML = ``

    console.log(savedArray)
    for(i=0;i<savedArray.length;i++){
        if(i%2){
            sTrip.innerHTML += `<a id="viewTrip" onclick=setTrip(${savedArray[i].id}) class="list-group-item list-group-item-action list-group-item-primary">${savedArray[i].tripName} <button type="button" title="Delete Trip" onclick=deleteTrip(${savedArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-trash-can"></i></button> <button type="button" title="Edit Trip" onclick=editTrip(${savedArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-pen"></i></button></a>`
        } else{
            sTrip.innerHTML += `<a id="viewTrip" onclick=setTrip(${savedArray[i].id}) class="list-group-item list-group-item-action list-group-item-light">${savedArray[i].tripName} <button type="button" title="Delete Trip" onclick=deleteTrip(${savedArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-trash-can"></i></button> <button type="button" title="Edit Trip" onclick=editTrip(${savedArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-pen"></i></button> </a>`
        }
    }
}

// Retrieve the chosen trip, and its details, for editing
function editTrip(editId){

    event.stopPropagation()

    // Retrieves the trip details based on supplied trip ID using this view
    $.ajax({
        type: "POST",
        url: "edittrip/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            attId: editId
        }
    }).done(function (data, status, xhr) {
        console.log(data);

        // Stores the trip details in local storage and marks the status for editing
        localStorage.setItem('editedTrip', JSON.stringify(data.results[0]))
        localStorage.setItem('editedTripStatus', "true")

        //Redirect the user to the create page
        location.href='/create'
    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

// Store the users selected trip for starting and redirects to the start trip page
function setTrip(thisTrip){
    localStorage.setItem('saveAndStart', JSON.stringify(thisTrip))
    location.href='/startTrip'
}

// Deletes the chosen trip if user clicks the delete button
function deleteTrip(thisTrip){
    event.stopPropagation()

    console.log(thisTrip)

    // Sends the trip's ID to a view for deletion
    $.ajax({
        type: "POST",
        url: "managetripdelete/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            delId: thisTrip
        }
    }).done(function (data, status, xhr) {
        console.log(status);

        // Refreshes the users trips
        getTrips()

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

// Displays all the users completed trips
function displayPrevious(previousArray){
    let pTrip = document.getElementById("previousTrips")
    pTrip.innerHTML = ``

    console.log(previousArray)
    for(i=0;i<previousArray.length;i++){
        if(i%2){
            pTrip.innerHTML += `<a id="viewTrip" onclick=setTrip(${previousArray[i].id}) class="list-group-item list-group-item-action list-group-item-primary">${previousArray[i].tripName}<button type="button" title="Delete Trip" onclick=deleteTrip(${previousArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-trash-can"></i></button> <button type="button" title="Edit Trip" onclick=editTrip(${previousArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-pen"></i></button></a>`
        } else{
            pTrip.innerHTML += `<a id="viewTrip" onclick=setTrip(${previousArray[i].id}) class="list-group-item list-group-item-action list-group-item-light">${previousArray[i].tripName}<button type="button" title="Delete Trip" onclick=deleteTrip(${previousArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-trash-can"></i></button> <button type="button" title="Edit Trip" onclick=editTrip(${previousArray[i].id}) class="btn btn-outline-dark"><i class="fa-solid fa-pen"></i></button></a>`
        }
    }
}

// Retrieve all the trips associated with the user
function getTrips() {

    // Calls a view that returns the users trips
    $.ajax({
        type: "GET",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url:"managetripretrieve/"
    }).done(function (data, status, xhr) {

        console.log(data)

        let savedTrips = [];
        let previousTrips = [];

        for(i=0;i<data.userTrips.length;i++){

            // Sorts the trips based on whether they were completed and pushes them into their relevant array
            if(data.userTrips[i].completed){

                previousTrips.push(data.userTrips[i])
                console.log(previousTrips)
            }else{
                savedTrips.push(data.userTrips[i])
            }
        }

        // Call functions to display both trip types
        displaySaved(savedTrips)
        displayPrevious(previousTrips)

        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updateddatabase<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("retrieve user trips finished");
    });

}

// Create cookies for use in AJAX req
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