function createOptions(preset){
    let modalBod3 = document.getElementById("mBody3")
    modalBod3.innerHTML=``
    let modalBod2 = document.getElementById("mBody2")
    modalBod2.innerHTML=``
    let modalBod1 = document.getElementById("mBody1")
    modalBod1.innerHTML=``

    let formatPreset = "mBody" + preset
    let chosenPreset = document.getElementById(formatPreset)

    chosenPreset.innerHTML = `<div id="filtersContainer">
                        <table id="filtersContainerTable">
                            <h5 style="text-align: center">Attraction Type:</h5>
                            <tr>
                                <div id="filtersContainerCheck">
                                    <td><label>Architecture</label><input type="checkbox" value="architecture"
                                                                          id="archCheck">
                                    </td>
                                    <td><label>Art</label><input type="checkbox" value="art" id="artCheck"></td>
                                    <td><label>Cultural</label><input type="checkbox" value="cultural"
                                                                      id="cultCheck">
                                    </td>
                                </div>
                            </tr>
                            <tr>
                                <td><label>Educational</label><input type="checkbox" value="educational"
                                                                     id="eduCheck"></td>
                                <td><label>Family-Friendly</label><input type="checkbox" value="family-friendly"
                                                                         id="famCheck">
                                </td>
                                <td><label>Historical</label><input type="checkbox" value="historical"
                                                                    id="histCheck">
                                </td>

                            </tr>
                            <tr>
                                <td><label>Outdoors</label><input type="checkbox" value="outdoors" id="outCheck">
                                </td>
                                <td><label>Recreational</label><input type="checkbox" value="recreational"
                                                                      id="recCheck"></td>
                                <td><label>Religious</label><input type="checkbox" value="religious" id="relCheck">
                                </td>
                            </tr>
                        </table>
                    </div>
                    <br>

                    <div id="detailsContainer">
                        <h4 style="text-align: center">Optional Details:</h4>
                        <table style="margin:auto">
                            <tr>
                                <td style="text-align: left">Group Size:</td>
                                <td style="text-align: right"><input type="integer" placeholder="1,2,3"
                                                                     id="groupSize"></td>
                            </tr>
                            <tr>
                                <td style="text-align: left"><label>Maximum Price:*</label></td>
                                <td style="text-align: right"><input type="float" placeholder="€€€" id="maxPrice"
                                                                     style="text-align: center"></td>
                            </tr>
                        </table>
                        <p style="text-align: center;font-size: .7rem;color: gray">* ticket price for each
                            attraction
                            per
                            adult</p>
                    </div>`

}

function populatePreset(presetObj){
    if(presetObj.length>0){
        presetObj = presetObj[0]
        let mPrice = document.getElementById("maxPrice")
    mPrice.value = presetObj.presetPrice

    let gSize = document.getElementById("groupSize")
    gSize.value = presetObj.presetSize

    if (presetObj.presetTags.includes(document.getElementById('artCheck').value)) {
        document.getElementById('artCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('histCheck').value)) {
        document.getElementById('histCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('archCheck').value)) {
        document.getElementById('archCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('cultCheck').value)) {
        document.getElementById('cultCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('eduCheck').value)) {
        document.getElementById('eduCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('famCheck').value)) {
        document.getElementById('famCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('outCheck').value)) {
        document.getElementById('outCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('recCheck').value)) {
        document.getElementById('recCheck').checked = true
    }
    if (presetObj.presetTags.includes(document.getElementById('relCheck').value)) {
        document.getElementById('relCheck').checked = true
    }
    }
}

function renderPresets(preset){
    $.ajax({
        type: "POST",
        url: "retrievepreset/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            presetId: preset
        }
    }).done(function (data, status, xhr) {
        console.log(data);

        createOptions(preset)
        populatePreset(data.results)

    }).fail(function (xhr, status, error) {
        var message = "Passing filters failed.<br/>";
        console.log("Status: " + xhr.status + " " + xhr.responseText);
    }).always(function () {
    });
}

function setFilters(preset) {
    let counter = 0;
    let filterArray = [];
    if (document.getElementById('artCheck').checked) {
        filterArray[counter] = "art";
        counter++;
    }
    if (document.getElementById('histCheck').checked) {
        filterArray[counter] = "historical";
        counter++;
    }
    if (document.getElementById('archCheck').checked) {
        filterArray[counter] = "architecture";
        counter++;
    }
    if (document.getElementById('cultCheck').checked) {
        filterArray[counter] = "cultural";
        counter++;
    }
    if (document.getElementById('eduCheck').checked) {
        filterArray[counter] = "educational";
        counter++;
    }
    if (document.getElementById('famCheck').checked) {
        filterArray[counter] = "family-friendly";
        counter++;
    }
    if (document.getElementById('outCheck').checked) {
        filterArray[counter] = "outdoors";
        counter++;
    }
    if (document.getElementById('recCheck').checked) {
        filterArray[counter] = "recreational";
        counter++;
    }
    if (document.getElementById('relCheck').checked) {
        filterArray[counter] = "religious";
        counter++;
    }

    if (filterArray.length == 0) {
        filterArray = ['historical', 'architecture', 'art', 'cultural', 'educational', 'family-friendly', 'outdoors', 'recreational', 'religious']
    }

    savePreset(preset,filterArray)
}

function savePreset(preset,filterArray){
    $.ajax({
        type: "POST",
        url: "savepreset/",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            presetId: preset,
            filters: filterArray,
            gSize : document.getElementById("groupSize").value,
            mPrice : document.getElementById("maxPrice").value,
        }
    }).done(function (data, status, xhr) {
        console.log("Success");

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