getTrips()

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

function editTrip(editId){
    event.stopPropagation()
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

        localStorage.setItem('editedTrip', JSON.stringify(data.results[0]))
        localStorage.setItem('editedTripStatus', "true")

        location.href='/create'
    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

function setTrip(thisTrip){
    localStorage.setItem('saveAndStart', JSON.stringify(thisTrip))
    location.href='/startTrip'
}

function deleteTrip(thisTrip){
    event.stopPropagation()

    console.log(thisTrip)

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

        getTrips()

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

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

function getTrips() {


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
            if(data.userTrips[i].completed){
                previousTrips.push(data.userTrips[i])
                console.log(previousTrips)
            }else{
                savedTrips.push(data.userTrips[i])
            }
        }

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