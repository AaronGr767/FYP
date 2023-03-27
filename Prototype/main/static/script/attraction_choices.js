let presetObj = [];

retrievePresets()

checkEdit()

// Check to see if an attraction has been supplied for editing purpose
function checkEdit(){
    let status = localStorage.getItem("editedTripStatus");
    // If there is such an attraction then populate the relevant fields with its data
    if(status=="true"){
        let eTrip = localStorage.getItem("editedTrip")
        let editedTrip = JSON.parse(eTrip)

        console.log(editedTrip)

        let trName = document.getElementById("tripName")
        trName.value = editedTrip.tripName

        let trSize = document.getElementById("groupSize")
        trSize.value = editedTrip.groupSize

        let trPrice = document.getElementById("maxPrice")
        trPrice.value = editedTrip.maxPrice

        let trDate = document.getElementById("chosenDate")
        trDate.value = editedTrip.date

        for(i=0;i<editedTrip.tripTags.length;i++){
            let reformat = editedTrip.tripTags[i].substring(0,3) + "Check"
            let filter = document.getElementById(reformat)
            filter.checked = true;
        }
    }
}

//Retrieves all the presets belonging to a user by doing an AJAX call
function retrievePresets(){
    $.ajax({
        type: "GET",
        url: "retrievecreatepreset/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
    }).done(function (data, status, xhr) {
        console.log(data);

        //If the user has atleast one preset then display them as options on the screen
        if(data.results.length>0){
            renderCreatePresets(data.results)
        }

    }).fail(function (xhr, status, error) {
        var message = "Passing data failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

//Display all presets belonging to a user as clickable radio buttons
function renderCreatePresets(data){
    presetObj = data
    let presCont = document.getElementById("presetContainer")

    for(i=0;i<presetObj.length;i++){
        let label = "inlineRadio" + i
        let passParam = presetObj[i]

        //Radio buttons will run a function to populate relevant input fields when selected
        presCont.innerHTML+= `<div class="form-check form-check-inline">
                                <input onclick=fillPreset(${i}) class="form-check-input" type="radio" name="inlineRadioOptions">
                                <label class="form-check-label">Preset ${presetObj[i].preId}</label>
                            </div>`

    }

    let presetBox = document.getElementById("presetOuter")
    presetBox.style.display = 'block'
}

//Fills out all the relevant input fields based on the selected preset choice
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

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('hisCheck').value)) {
        document.getElementById('hisCheck').checked = true
    }else{
        document.getElementById('hisCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('arcCheck').value)) {
        document.getElementById('arcCheck').checked = true
    }else{
        document.getElementById('arcCheck').checked = false
    }

    if (presetObj[presetChoice].presetTags.includes(document.getElementById('culCheck').value)) {
        document.getElementById('culCheck').checked = true
    }else{
        document.getElementById('culCheck').checked = false
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

//Sets & stores in local storage all the various selected filters for future use
function setFilters(){
    let counter= 0;
    let filterArray=[];
    if (document.getElementById('artCheck').checked) {
            filterArray[counter] = "art";
            counter ++;
    }
    if (document.getElementById('hisCheck').checked) {
            filterArray[counter] = "historical";
            counter ++;
    }
    if (document.getElementById('arcCheck').checked) {
            filterArray[counter] = "architecture";
            counter ++;
    }
    if (document.getElementById('culCheck').checked) {
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

    let tName = document.getElementById("tripName").value
    let cDate = new Date(document.getElementById("chosenDate").value)

    // Checks to see if user inputted a valid date, else notify user
    if(!isNaN(cDate.getTime())){

        // Checks to see if user entered a trip name, else notify user
        if(tName != ""){

            // Get index value based on selected day (e.g. Sun = 0, Mon = 1, etc)
            let days = [0, 1, 2, 3, 4, 5, 6]
            chosenDay = days[cDate.getDay()]
            console.log("Day of choice: " + chosenDay)

            let gSizeInput = document.getElementById("groupSize")
            let mPriceInput = document.getElementById("maxPrice")

            let gSizeCheck = true;
            let mPriceCheck = true;

            //If user entered a group size, check that it is a valid int
            if (gSizeInput.value != "") {
                gSizeCheck = Number.isInteger(parseInt(gSizeInput.value))
                console.log(gSizeCheck)
            }

            //If user entered a max price, check that it is a valid int
            if (mPriceInput.value != "") {
                mPriceCheck = Number.isInteger(parseInt(mPriceInput.value))
            }

            // If both values are valid ints then proceed to store details and use the filters, else notify user
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
        console.log("No day chosen")
        let alertBox = document.getElementById("invalidAlert")
        let alertDateMessage = document.getElementById("errorMsg")

        alertDateMessage.innerHTML=`You must enter a value for trip date as certain attractions may be closed on specific days!`
        alertBox.style.display = 'block'

    }
}

//Close the various alerts when user clicks the X button
function closeInvAlert(alertType){
    if(alertType == "noDate"){
        let alertBox = document.getElementById("invalidAlert")
        alertBox.style.display = 'none'
    } else{
        let alertBox = document.getElementById("invalidFormatAlert")

        alertBox.style.display = 'none'
    }
}

//Using the selected filters & chosen date, retrieve attractions that match these parameters
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

                    console.log(data);

                    //Store the filtered attractions and proceed user to next page
                    localStorage.setItem('resultStore', JSON.stringify(data))
                    location.href='/choose'


                }).fail(function (xhr, status, error) {
                    var message = "Passing data failed.<br/>";
                    console.log("Status: " + xhr.status + " " + xhr.responseText);
                }).always(function () {
                });

}

// Create cookies for use in AJAX req
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

//Stores various details used in trip creation in local storage
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

