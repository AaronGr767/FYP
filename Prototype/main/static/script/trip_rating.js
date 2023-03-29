let tripRating = "";

function openRating() {
    let questionPopup = document.getElementById("askRating")
    questionPopup.remove()

    let ratingForm = document.getElementById("rateContainer")
    ratingForm.style.display = 'block'
}

function addRating(ratingValue) {
    tripRating = ratingValue
}

function saveTripRate() {

    let results = localStorage.getItem("currentTrip");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }

    let userFeedback = document.getElementById("ratingFeedback").value

    if(tripRating == ""){
        let warning = document.getElementById("ratingText")
        warning.style.color = "red"
    } else {

        let csrftoken = getCookie('csrftoken');

        $.ajax({
            type: "POST",
            url: "savetriprating/",
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: {
                tripId: resultsObj.id,
                overallRating: tripRating,
                userFeedback: userFeedback
            }
        }).done(function (data, status, xhr) {
            console.log("Success");

        }).fail(function (xhr, status, error) {
            var message = "Passing rating failed.<br/>";
            console.log("Status: " + xhr.status + " " + xhr.responseText);
        }).always(function () {
        });
    }
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