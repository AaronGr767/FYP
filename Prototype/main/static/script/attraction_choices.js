let presetObj = [];

retrievePresets()

function fillPreset(presetChoice){
    console.log(presetObj[presetChoice])

    let mPrice = document.getElementById("maxPrice")
    mPrice.value = presetObj[presetChoice].presetPrice

    let gSize = document.getElementById("groupSize")
    gSize.value = presetObj[presetChoice].presetSize

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('artCheck').value)) {
        document.getElementById('artCheck').checked = true
    }else{
        document.getElementById('artCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('histCheck').value)) {
        document.getElementById('histCheck').checked = true
    }else{
        document.getElementById('histCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('archCheck').value)) {
        document.getElementById('archCheck').checked = true
    }else{
        document.getElementById('archCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('cultCheck').value)) {
        document.getElementById('cultCheck').checked = true
    }else{
        document.getElementById('cultCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('eduCheck').value)) {
        document.getElementById('eduCheck').checked = true
    }else{
        document.getElementById('eduCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('famCheck').value)) {
        document.getElementById('famCheck').checked = true
    }else{
        document.getElementById('famCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('outCheck').value)) {
        document.getElementById('outCheck').checked = true
    }else{
        document.getElementById('outCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('recCheck').value)) {
        document.getElementById('recCheck').checked = true
    }else{
        document.getElementById('recCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('relCheck').value)) {
        document.getElementById('relCheck').checked = true
    }else{
        document.getElementById('relCheck').checked = false
    }

}

function retrievePresets(){
    $.ajax({
        type: "GET",
        url: "retrievecreatepreset/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    }).done(function (data, status, xhr) {
        console.log(data);

        if(data.results.length>0){
            renderCreatePresets(data.results)
        }

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

function renderCreatePresets(data){
    presetObj = data
    let presCont = document.getElementById("presetContainer")

    for(i=0;i<presetObj.length;i++){
        let label = "inlineRadio" + i
        let passParam = presetObj[i]

        presCont.innerHTML+= `<div class="form-check form-check-inline">
                                <input onclick=fillPreset(${i}) class="form-check-input" type="radio" name="inlineRadioOptions">
                                <label class="form-check-label">Preset ${presetObj[i].preId}</label>
                            </div>`

    }

    let presetBox = document.getElementById("presetOuter")
    presetBox.style.display = 'block'
}

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
    let chosenDay;

    // location.href='/choose'
    let tName = document.getElementById("tripName").value
    let cDate = new Date(document.getElementById("chosenDate").value)
    if(!isNaN(cDate.getTime())){
        if(tName != ""){
            let days = [0, 1, 2, 3, 4, 5, 6]

            chosenDay = days[cDate.getDay()]

            console.log("Day of choice: " + chosenDay)

            let gSizeInput = document.getElementById("groupSize")
            let mPriceInput = document.getElementById("maxPrice")

            let gSizeCheck = true;
            let mPriceCheck = true;

            if (gSizeInput.value != "") {
                gSizeCheck = Number.isInteger(parseInt(gSizeInput.value))
                console.log(gSizeCheck)
            }
            if (mPriceInput.value != "") {
                mPriceCheck = Number.isInteger(parseInt(mPriceInput.value))
            }

            if (gSizeCheck && mPriceCheck) {
                storeDetails(chosenDay);

                postFilters(filterArray, chosenDay)
            } else {
                console.log("Incorrect format")
                let alertFormBox = document.getElementById("invalidFormatAlert")
                let alertMessage = document.getElementById("formatErrorMsg")

                alertFormBox.style.display = 'block'
                alertMessage.innerHTML = `Invalid value entered!`
            }
        }else{
            let alertBox = document.getElementById("invalidAlert")
            let alertNameMessage = document.getElementById("errorMsg")

            alertNameMessage.innerHTML=`You must choose a name for your trip!`
            alertBox.style.display = 'block'
        }
    } else{
        // chosenDay = "null"
        console.log("No day chosen")
        let alertBox = document.getElementById("invalidAlert")
        let alertDateMessage = document.getElementById("errorMsg")

        alertDateMessage.innerHTML=`You must enter a value for trip date as certain attractions may be closed on specific days!`
        alertBox.style.display = 'block'

    }
}

function closeInvAlert(alertType){
    if(alertType == "noDate"){
        let alertBox = document.getElementById("invalidAlert")
        alertBox.style.display = 'none'
    } else{
        let alertBox = document.getElementById("invalidFormatAlert")

        alertBox.style.display = 'none'
    }
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

                    localStorage.setItem('resultStore', JSON.stringify(data))

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

function storeDetails(chosenday){
    tName = document.getElementById("tripName").value
    gSize = document.getElementById("groupSize").value
    mPrice = document.getElementById("maxPrice").value
    cDate = document.getElementById("chosenDate").value

    console.log("hola "+mPrice)

    let resultsObj1 = {
        tripName:tName,
        groupSize:gSize,
        maxPrice:mPrice,
        chosenDate:cDate,
        dayIndex: chosenday
    };

     localStorage.setItem('detailsStore', JSON.stringify(resultsObj1))

}
