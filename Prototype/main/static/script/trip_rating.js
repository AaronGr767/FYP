let tripRating = "";

// Displays the rating/review form if the user chooses to provide one
function openRating() {
    let questionPopup = document.getElementById("askRating")
    questionPopup.remove()

    let ratingForm = document.getElementById("rateContainer")
    ratingForm.style.display = 'block'
}

// Stores the rating value each time the user selects a rating, in case they change it multiple times
function addRating(ratingValue) {
    tripRating = ratingValue
}

// Saves the various details regarding the user's review
function saveTripRate() {

    // Retrieve the trip details from local storage to access the ID
    let results = localStorage.getItem("currentTrip");

    if (results == null) {
        resultsObj = [];
    } else {
        resultsObj = JSON.parse(results);
    }

    let userFeedback = document.getElementById("ratingFeedback").value

    // If the user has not given a rating, highlight the text red
    if (tripRating == "") {
        let warning = document.getElementById("ratingText")
        warning.style.color = "red"
    } else {

        let csrftoken = getCookie('csrftoken');

        // Send the review details to a view to be saved
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