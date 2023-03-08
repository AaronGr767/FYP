retrieveTrip()

function retrieveTrip(){
    let savedTrip = localStorage.getItem("saveAndStart");
    let stId = JSON.parse(savedTrip)
    console.log(stId.id)

    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url:"/retrievetrip/",
        data: {
            sTripId:stId.id
        }
    }).done(function (data, status, xhr) {
        console.log(data)
        displayTrip(data)
        // console.log(tripid_query)
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

function displayTrip(){
    let tripDets = document.getElementById("tripSum")


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