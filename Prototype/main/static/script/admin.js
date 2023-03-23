let homeButt = document.getElementById("baseButton1")
homeButt.style.display = 'none';

console.log(attraction)

renderDetails(attraction[0])

function renderDetails(attraction){
    let containerLeft = document.getElementById("adminContentLeft")

    containerLeft.innerHTML+= `<h4>${attraction.name}</h4><br><h5>Description:</h5>`
    containerLeft.innerHTML+= `<textarea rows="10" style="width: 80%">${attraction.description}</textarea>`
}