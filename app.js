// https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/creating-a-basic-map-control
// may be we need axios to make http request
const url = 'http://localhost:4567/usemap'
var map
var bays

// the api and the web client are not on the same app anymore. So use full url
function GetMap() {
        map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(-37.8124, 144.9623),
        zoom: 15
    });
    axios
        .get(url)
        .then(results => {
            bays = results
            checkBayStatus(bays, displayBaysByStatus.value)
        })  
    creatInfoBox(map);
} 

var checkBayStatus = (bays, displayBayValue) => {
    // hide bay info slide down
    var bayInfoSection = document.querySelector('.bayInfo')
    if (bayInfoSection.style.display == 'block') {
        $('.bayInfo').slideToggle(250);
    }
    // clear infobox
    infobox.setOptions({
        visible: false,
    })
    // clear pins from map
    map.entities.clear()
    // clear drawn pin array
    var drawnPins = []
    // check bay status
    bays.data.forEach(bay => {
        if (displayBayValue === 'both') {
            drawnPins.push(bay)
            createPin(bay)
        } else if (displayBayValue === 'empty') {
            if (bay.status !== 'Present') {
                drawnPins.push(bay)
                createPin(bay)
            }
        } else if (displayBayValue === 'occupied') {
            if (bay.status === 'Present') {
                drawnPins.push(bay)
                createPin(bay)
            }
        }
    })
}

var createPin = (bay) => {
// check if bay is occupied
        var bayStatus;
        var bayColor;
        if (bay.status === "Present") {
            bayStatus = "Bay occupied"
            bayColor = "red"
        } else {
            bayStatus = "Bay empty"
            bayColor = "green"
        }

        var pin = new Microsoft.Maps.Pushpin(
            { latitude: bay.lat, longitude: bay.lon }, 
            { color: bayColor }
        );

        pin.metadata = {
            title: `Parking bay: ${bay.bayid}`,
            description: `Bay status: ${bayStatus} <br> Bay type: ${bay.typedesc1}`, 
            id: bay.bayid, 
            allData: bay
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

var getParkingBayInfo = bay => {    
    var bayInfoSection = document.querySelector('.bayInfo')
    if (bayInfoSection.style.display !== 'block') {
        $('.bayInfo').slideToggle(250);
    }

    var descriptions = []
    if (bay.description1 !== null) { descriptions.push(bay.description1) } 
    if (bay.description2 !== null) { descriptions.push(bay.description2) }
    if (bay.description3 !== null) { descriptions.push(bay.description3) }
    if (bay.description4 !== null) { descriptions.push(bay.description4) }
    if (bay.description5 !== null) { descriptions.push(bay.description5) }
    if (bay.description6 !== null) { descriptions.push(bay.description6) }

    var status;
    if (bay.status === 'Present') {
        status = 'Bay occupied'
    } else {
        status = 'Bay empty'
    }

    var infoDiv = document.querySelector('.infoList')
    infoDiv.innerHTML = `
        <p class="infoListHeading">Parking bay: ${bay.bayid}</p>
        <li>Bay status: ${status}</li>
        <li>Bay info: </li>
            <ul>
                <li>${descriptions.join("<li>")}</li>
            </ul>
        `
}

// event listeners
let displayBaysByStatus = document.querySelector('#bayStatus');
displayBaysByStatus.addEventListener('change', () => {
    checkBayStatus(bays, displayBaysByStatus.value)
})

let dispalyBayByHour = document.querySelector('#hours');
dispalyBayByHour.addEventListener('change', () => {
    console.log(dispalyBayByHour.value)
})

document.querySelector('#reset').addEventListener('click', () => {
        checkBayStatus(bays, 'both')
})

// toggle functions
$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(250);
}); 
       
$('.toggleInfo').click(function(e) {
    e.preventDefault();
    $('.bayInfo').slideToggle(250);
}); 