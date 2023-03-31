retrieveTrip()

// AJAX call which retrieves the details for the trip based upon the supplied ID
function retrieveTrip() {
    let savedTrip = localStorage.getItem("saveAndStart");
    let stId = JSON.parse(savedTrip)

    // Send trip ID to a view and returns the trips associated details
    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url: "/retrievetrip/",
        data: {
            sTripId: stId
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        displayTrip(data)

        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Retrievedtrip<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
        console.log(error);
        var originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("retrieval finished");
    });
}

// Displays some summary information regarding the selected trip
function displayTrip(data) {
    let tripTags = document.getElementById("trTag")
    let tripAtts = document.getElementById("trAtt")

    console.log(data[0].tripTags)

    document.getElementById("trName").innerHTML += `  ${data[0].tripName}`

    document.getElementById("trDate").innerHTML += `  ${data[0].date}`


    let fullList = data[0].tripTags[0];

    for (i = 1; i < data[0].tripTags.length; i++) {
        fullList = fullList + ", " + data[0].tripTags[i]
    }

    tripTags.innerHTML += `<p style="color: gray">${fullList}</p>`
    let marginCounter = 0

    for (i = 0; i < data[0].attNames.length; i++) {
        tripAtts.innerHTML += `<div class="col" id="colContainer">
                                <div class="card">
                                    <p class="card-text">${data[0].attNames[i]}</p>
                                </div>
                               </div>`
        if (marginCounter == 0) {
            let firstCard = document.getElementById("colContainer")
            firstCard.style.marginTop = "0"
        }

        marginCounter++
    }

    //Store the current trip in local storage to reduce the need for constant calls to the database
    localStorage.setItem('currentTrip', JSON.stringify(data[0]))

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