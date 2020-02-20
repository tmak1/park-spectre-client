// https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/creating-a-basic-map-control
// may be we need axios to make http request
// const url = 'http://localhost:4567/sensors'
var map
var bays
var loginTime

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

// the api and the web client are not on the same app anymore. So use full url
function GetMap() {
        map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(-37.8124, 144.9623),
        zoom: 15
    });

    creatInfoBox(map);

    axios.get("http://localhost:4567")
    .then(results => {
        bays = results.data;
        checkBayStatus(bays, displayBaysByStatus.value);
        loginTime = new Date();
        console.log(loginTime);

        // client side code for SSE :
        const es = new EventSource("http://localhost:4567/broadcast");

        es.addEventListener('broadcast', ev => {
            var bayInfo = JSON.parse(ev.data)
            console.log(bayInfo);
            bays = bayInfo;
            checkBayStatus(bays, displayBaysByStatus.value)
        });
    })  
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
    // check bay status
    console.log(bays);
    bays.forEach(bay => {
        if (displayBayValue === 'both') {
            createPin(bay)
        } else if (displayBayValue === 'empty') {
            if (bay.status !== 'Present') {
                createPin(bay)
            }
        } else if (displayBayValue === 'occupied') {
            if (bay.status === 'Present') {
                createPin(bay)
            }
        }
    })
}

var createPin = (bay) => {
// check if bay is occupied
        var bayStatus;
        var bayColor;
        // icon = '<?xml version="1.0" ?><svg height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><g transform="translate(0 -1028.4)"><path d="m12.031 1030.4c-3.8657 0-6.9998 3.1-6.9998 7 0 1.3 0.4017 2.6 1.0938 3.7 0.0334 0.1 0.059 0.1 0.0938 0.2l4.3432 8c0.204 0.6 0.782 1.1 1.438 1.1s1.202-0.5 1.406-1.1l4.844-8.7c0.499-1 0.781-2.1 0.781-3.2 0-3.9-3.134-7-7-7zm-0.031 3.9c1.933 0 3.5 1.6 3.5 3.5 0 2-1.567 3.5-3.5 3.5s-3.5-1.5-3.5-3.5c0-1.9 1.567-3.5 3.5-3.5z" fill="#c0392b"/><path d="m12.031 1.0312c-3.8657 0-6.9998 3.134-6.9998 7 0 1.383 0.4017 2.6648 1.0938 3.7498 0.0334 0.053 0.059 0.105 0.0938 0.157l4.3432 8.062c0.204 0.586 0.782 1.031 1.438 1.031s1.202-0.445 1.406-1.031l4.844-8.75c0.499-0.963 0.781-2.06 0.781-3.2188 0-3.866-3.134-7-7-7zm-0.031 3.9688c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5z" fill="#e74c3c" transform="translate(0 1028.4)"/></g></svg>'
        // icon = 'red.png'
        // icon = '<?xml version="1.0" standalone="no"?><svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20.000000pt" height="20.000000pt" viewBox="0 0 20.000000 20.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,20.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"></g></svg>'
        if (bay.status === "Present") {
            bayStatus = "Occupied"
            icon = 'red.png' 
        } else {
            bayStatus = "Available"
            icon = 'green.png'     
        }

        var pin = new Microsoft.Maps.Pushpin({ latitude: bay.lat, longitude: bay.lon }, 
            {
                anchor: new Microsoft.Maps.Point(10, 10),
                icon: icon

            }
        );

        pin.metadata = {
            title: `Parking bay: ${bay.bay_id}`,
            description: `Bay status: ${bayStatus} <br> Bay type: ${bay.typedesc1}`, 
            id: bay.bay_id, 
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



var getBayDescriptions = bay => {
    var descriptions = []
    if (bay.description1 !== null) { descriptions.push(bay.description1) } 
    if (bay.description2 !== null) { descriptions.push(bay.description2) }
    if (bay.description3 !== null) { descriptions.push(bay.description3) }
    if (bay.description4 !== null) { descriptions.push(bay.description4) }
    if (bay.description5 !== null) { descriptions.push(bay.description5) }
    if (bay.description6 !== null) { descriptions.push(bay.description6) }
    return descriptions
}

var getBayStatus = bay => {
    var status;
    if (bay.status === 'Present') {
        status = 'Bay occupied'
    } else {
        status = 'Bay empty'
    }
    return status
}

var getParkingBayInfo = bay => {    
    var bayInfoSection = document.querySelector('.bayInfo')
    if (bayInfoSection.style.display !== 'block') {
        $('.bayInfo').slideToggle(250);
    }

    var descriptions = getBayDescriptions(bay)
    var status = getBayStatus(bay)

    var infoDiv = document.querySelector('.infoList')
    infoDiv.innerHTML = `
        <p class="allBaysInfoListHeading">Parking bay: ${bay.bay_id}</p>
        <li>Bay status: ${status}</li>
        <li>Bay info: </li>
            <ul>
                <li>${descriptions.join("<li>")}</li>
            </ul>
        `
}

var bayInfoTable = (bay) => {
    var descriptions = getBayDescriptions(bay)
    var status = getBayStatus(bay)

    var table = document.querySelector('.allBaysTable')
    var row = table.insertRow(-1)
    var cell1 = row.insertCell(0)
    var cell2 = row.insertCell(1)
    var cell3 = row.insertCell(2)
    cell1.innerHTML = bay.bay_id
    cell2.innerHTML = status
    cell3.innerHTML = `<li>${descriptions.join("<li>")}</li>`
}

var createInfoList = (i) => {
    document.querySelector('.displayList').style.display = 'none'
    document.querySelector('.hideList').style.display = 'block'
    document.querySelector('#allBaysList').style.display = 'block'
    
    var table = document.querySelector('.allBaysTable')
    table.innerHTML = `<tr><th>Bay ID</th><th>Bay Status</th><th>Bay Description</th></tr>`

    var num = 0
    bays.forEach(bay => {
        if (displayBaysByStatus.value === 'both') {
            if (num < i) {
                bayInfoTable(bay)
                num ++
            }
        } else if (displayBaysByStatus.value === 'empty') {
            if (bay.status !== 'Present') {
                if (num < i) {
                    bayInfoTable(bay)
                    num ++
                }
            }
        } else if (displayBaysByStatus.value === 'occupied') {
            if (bay.status === 'Present') {
                if (num < i) {
                    bayInfoTable(bay)
                    num ++
                }
            }
        }
    })
}

// remove bay information list
var destroyInfoList = () => {
    document.querySelector('.displayList').style.display = 'block'
    document.querySelector('.hideList').style.display = 'none'
    document.querySelector('#allBaysList').style.display = 'none'
    var allBaysTable = document.querySelector('.allBaysTable')
    allBaysTable.innerHTML = `<tr><th>Bay ID</th><th>Bay Status</th><th>Bay Description</th></tr>`
    i = 10
}

// event listeners
let displayBaysByStatus = document.querySelector('#bayStatus');
displayBaysByStatus.addEventListener('change', () => {
    destroyInfoList()
    checkBayStatus(bays, displayBaysByStatus.value)
})

// rest filter buttons
document.querySelector('#reset').addEventListener('click', () => {
    checkBayStatus(bays, 'both')
})

// display list button
var i = 10
document.querySelector('.displayList').addEventListener('click', () => {
    createInfoList(i)
})

// hide list button
document.querySelector('.hideList').addEventListener('click', () => {
    destroyInfoList()
})

// load more rows on bay information list
document.querySelector('.load').addEventListener('click', e => {
    e.preventDefault()
    i += 10
    createInfoList(i)
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