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

    // location.href='/choose'

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

                    var dataObj = [];

                    let placeholder='';
                    let counter = 0;

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
