let homeButt = document.getElementById("baseButton1")
homeButt.style.display = 'none';

console.log(attraction)
let attObj = attraction[0]


renderDetails(attraction[0])

function renderDetails(attraction){
    let containerLeft = document.getElementById("adminContentLeft")

    containerLeft.innerHTML+= `<h4>${attraction.name}</h4><br><h5>Description:</h5>`
    containerLeft.innerHTML+= `<textarea rows="10" style="width: 80%" id="description">${attraction.description}</textarea>`
    
    renderTimes(attraction)
}

function renderTimes(attraction){

    for(i=0;i<attraction.openingHours.length;i++){
        let opHourForm = "oHour"+i
        let opMinForm = "oMin"+i
        let clHourForm = "cHour"+i
        let clMinForm = "cMin"+i

        document.getElementById(opHourForm).value = attraction.openingHours[i].substring(0, 2)
        document.getElementById(opMinForm).value = attraction.openingHours[i].substring(2)
        document.getElementById(clHourForm).value = attraction.closingHours[i].substring(0, 2)
        document.getElementById(clMinForm).value = attraction.openingHours[i].substring(2)
    }

}

function updateAttraction(){
    let openingHours=[]
    let closingHours=[]
    let allHours=[]

    let desc = document.getElementById("description").value
    
    for(i=0;i<attObj.openingHours.length;i++){
        let opHourForm = "oHour"+i
        let opMinForm = "oMin"+i
        let clHourForm = "cHour"+i
        let clMinForm = "cMin"+i

        let opHourSave =document.getElementById(opHourForm).value
        let opMinSave =document.getElementById(opMinForm).value
        let clHourSave =document.getElementById(clHourForm).value
        let clMinSave =document.getElementById(clMinForm).value

        openingHours.push(opHourSave+opMinSave)
        closingHours.push(clHourSave+clMinSave)
    }

    saveChanges(desc,openingHours,closingHours)
}

function saveChanges(description,openingArray,closingArray){
    $.ajax({
        type: "POST",
        url: "saveattractionchanges/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            attId: attObj.id,
            desc: description,
            oHours : openingArray,
            cHours : closingArray,
        }
    }).done(function (data, status, xhr) {
        console.log("Update successful.");
    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
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