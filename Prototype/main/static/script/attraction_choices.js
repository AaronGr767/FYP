

function setFilters(){
    let counter= 0;
    let filterArray=[];
    if (document.getElementById('artCheck').checked) {
            filterArray[counter] = "art";
            counter ++;
    }
    if (document.getElementById('histCheck').checked) {
            filterArray[counter] = "historical";
            counter ++;
    }
    if (document.getElementById('archCheck').checked) {
            filterArray[counter] = "architecture";
            counter ++;
    }
    if (document.getElementById('cultCheck').checked) {
            filterArray[counter] = "cultural";
            counter ++;
    }
    if (document.getElementById('eduCheck').checked) {
            filterArray[counter] = "educational";
            counter ++;
    }
    if (document.getElementById('famCheck').checked) {
            filterArray[counter] = "family-friendly";
            counter ++;
    }
    if (document.getElementById('outCheck').checked) {
            filterArray[counter] = "outdoors";
            counter ++;
    }
    if (document.getElementById('recCheck').checked) {
            filterArray[counter] = "recreational";
            counter ++;
    }
    if (document.getElementById('relCheck').checked) {
            filterArray[counter] = "religious";
            counter ++;
    }

    if(filterArray.length==0){
        filterArray = ['historical','architecture','art','cultural','educational','family-friendly','outdoors','recreational','religious']
    }

    console.log(filterArray)
    localStorage.setItem('filterStore', JSON.stringify(filterArray))

    // location.href='/choose'
    cDate = new Date(document.getElementById("chosenDate").value)
    let days = [0,1,2,3,4,5,6]

    let chosenDay = days[cDate.getDay()]

    console.log("Day of choice: "+ chosenDay)

    storeDetails();

    postFilters(filterArray, chosenDay)
}

function postFilters(filterArray,chosenDay){
    let csrftoken = getCookie('csrftoken');

     $.ajax({
                    type: "POST",
                    url: "filterAttractions/",
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    data: {
                        filters: filterArray,
                        choseDay: chosenDay,
                        gSize : document.getElementById("groupSize").value,
                        mPrice : document.getElementById("maxPrice").value,
                        cDate : document.getElementById("chosenDate").value
                    }
                }).done(function (data, status, xhr) {

                    console.log("Did we make it home?");



                    // let jsonResp = JSON.parse('{"data"}');
                    console.log(data);
                    // let test1 = JSON.parse(data)
                    var dataJson = data.replace(/'/g, '"');
                    console.log(dataJson);

         //            let test2 = JSON.parse(dataJson)
         // console.log(typeof test2)

                    let placeholder='';
                    let counter = 0;
                    let dataObj = [];

                    for(let i = 0; i <= dataJson.length; i++){
                        if(dataJson[i] === "}"){
                            placeholder = placeholder + dataJson[i];
                            placeholder[counter] = placeholder[counter].replace('undefined','');
                            console.log("unfinished beans")
                            console.log(placeholder)

                            dataObj[counter] = JSON.parse(placeholder)

                            placeholder = ''
                            counter = counter + 1;
                        } else {
                            placeholder = placeholder + dataJson[i]
                        }
                    }
                    // var dataObj = JSON.stringify(dataJson)
                    // dataObj[0] = JSON.parse(dataJson)
                    // console.log(placeholder)
                    // dataObj = JSON.parse(placeholder)

                    console.log("finished beans = ")

                    console.log(dataObj[0])
                    console.log(dataObj[1])
                    console.log(dataObj)

                    localStorage.setItem('resultStore', JSON.stringify(dataObj))

                    location.href='/choose'


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

function storeDetails(){
    tName = document.getElementById("tripName").value
    gSize = document.getElementById("groupSize").value
    mPrice = document.getElementById("maxPrice").value
    cDate = document.getElementById("chosenDate").value

    console.log("hola "+mPrice)

    let resultsObj1 = {
        tripName:tName,
        groupSize:gSize,
        maxPrice:mPrice,
        chosenDate:cDate
    };

     localStorage.setItem('detailsStore', JSON.stringify(resultsObj1))

}
