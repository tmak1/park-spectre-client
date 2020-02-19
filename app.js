// https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/creating-a-basic-map-control
// may be we need axios to make http request
const url = 'http://localhost:4567/usemap'
var map
// the api and the web client are not on teh same app anymore. So use full url
function GetMap() {
        map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(-37.8124, 144.9623),
        zoom: 15
    });
    axios
        .get(url)
        .then(results => {
            console.log(results)
            results.data.forEach((result, index) => {
                addPin(result, index, displayBays.value)
            }); 
        })  
    creatInfoBox(map);
} 

var addPin = (result, index, displayBays) => {
    if (displayBays === 'both') {
        createAllPins(result, index)
    } else if (displayBays === 'empty') {
        if (result.status !== 'Present') {
            createAllPins(result, index)
        }
    } else if (displayBays === 'occupied') {
        if (result.status === 'Present') {
            createAllPins(result, index)
        }
    }
}

var createAllPins = (result, index) => {
// check if bay is occupied
        var bayStatus;
        var bayColor;
        if (result.status === "Present") {
            bayStatus = "Bay occupied"
            bayColor = "red"
        } else {
            bayStatus = "Bay empty"
            bayColor = "green"
        }

        var pin = new Microsoft.Maps.Pushpin(
            { latitude: result.lat, longitude: result.lon }, 
            { color: bayColor }
        );

        pin.metadata = {
            title: `Parking bay: ${result.bayid}`,
            description: `Bay status: ${bayStatus} <br> Bay type: ${result.typedesc1}`, 
            id: result.bayid, 
            allData: result
        };
        
        Microsoft.Maps.Events.addHandler(pin, 'click', (e) => {
            if (e.target.metadata) {
                //Set the infobox options with the metadata of the pushpin.
                infobox.setOptions({
                    location: e.target.getLocation(),
                    title: e.target.metadata.title,
                    description: e.target.metadata.description,
                    visible: true,
                    actions: [{
                        label: 'More info',
                        eventHandler: function (event) {
                            event.preventDefault()
                            getParkingBayInfo(e.target.metadata.allData)
                        }
                    }]
                });        
            }
        });
        //Add the pushpin to the map
        map.entities.push(pin);
}

var creatInfoBox = map => {
        //Create an infobox at the center of the map but don't show it.
        infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
            visible: false,
            actions: [{
                label: 'More info',
            }]
        });
        //Assign the infobox to a map instance.
        infobox.setMap(map);
    }

var getParkingBayInfo = data => {    
    var bayInfoSection = document.querySelector('.bayInfo')
    if (bayInfoSection.style.display !== 'block') {
        $('.bayInfo').slideToggle(350);
    }

    var descriptions = []
    if (data.description1 !== null) { descriptions.push(data.description1) } 
    if (data.description2 !== null) { descriptions.push(data.description2) }
    if (data.description3 !== null) { descriptions.push(data.description3) }
    if (data.description4 !== null) { descriptions.push(data.description4) }
    if (data.description5 !== null) { descriptions.push(data.description5) }
    if (data.description6 !== null) { descriptions.push(data.description6) }

    var infoDiv = document.querySelector('.infoList')
    infoDiv.innerHTML = `
        <li>Parking bay: ${data.bayid}</li>
        <li>Bay status: ${data.status}</li>
        <li>Bay info: </li>
            <ul>
                <li>${descriptions.join("<li>")}</li>
            </ul>
        `
}

$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(350);
}); 
       
$('.toggleInfo').click(function(e) {
    e.preventDefault();
    $('.bayInfo').slideToggle(350);
}); 

let displayBays = document.querySelector('#displayBays');
displayBays.addEventListener("change", GetMap)