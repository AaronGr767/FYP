

function setFilters(){
    let counter= 0;
    let filterArray=[];
    if (document.getElementById('artCheck').checked) {
            filterArray[counter] = "art";
            counter ++;
    }
    if (document.getElementById('histCheck').checked) {
            filterArray[counter] = "history";
            counter ++;
    }

    localStorage.setItem('filterStore', filterArray)

    // location.href='/choose'

    storeDetails();

    postFilters(filterArray)
}

function postFilters(filterArray){
    let csrftoken = getCookie('csrftoken');

     $.ajax({
                    type: "POST",
                    url: "filterAttractions/",
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    data: {

                        filters: filterArray
                    }
                }).done(function (data, status, xhr) {

                    console.log("Did we make it home?");

                    console.log(typeof data)

                    // let jsonResp = JSON.parse('{"data"}');
                    console.log(data);
                    var dataJson = data.replace(/'/g, '"');
                    console.log(dataJson);



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
    gSize = document.getElementById("groupSize").value
    mPrice = document.getElementById("maxPrice").value
    cDate = document.getElementById("chosenDate").value

    let resultsObj1 = {
        groupSize:gSize,
        maxPrice:mPrice,
        chosenDate:cDate
    };

     localStorage.setItem('detailsStore', JSON.stringify(resultsObj1))

}
