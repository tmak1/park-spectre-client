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

    axios.get("https://parkinspector.herokuapp.com/")
    .then(results => {
        bays = results.data;
        checkBayStatus(bays, displayBaysByStatus.value);
        loginTime = new Date();
        // console.log(loginTime);

        // client side code for SSE :
        const es = new EventSource("https://parkinspector.herokuapp.com/broadcast");

        es.addEventListener('broadcast', ev => {
            var bayInfo = JSON.parse(ev.data)
            // console.log(bayInfo);
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
    
        if (bay.status === "Present") {
            icon = 'images/red.png' 
        } else {
            icon = 'images/green.png'     
        }

        bayStatus = getBayStatus(bay)

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
        
        pinClick(pin)

        //Add the pushpin to the map
        map.entities.push(pin);
}

var pinClick = pin => {
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
    cell1.innerHTML = `<a href="#top">${bay.bay_id}</a>`
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
// filter by status drop down event listener
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

var findPin = id => {
    var pin; 
    for (var i = 0; i < map.entities.getLength(); i ++) {
        pin = map.entities.get(i);
        if (pin.metadata.id === id) {
            return pin
        }
    }
}

var tableClick = e => {
    var clickedId = e.target.innerText
    var isnum = /^\d+$/.test(clickedId)
    if (isnum === true) {
        var pin = findPin(clickedId)
        infobox.setOptions({
            location: pin.getLocation(),
            title: pin.metadata.title,
            description: pin.metadata.description,
            visible: true,
            actions: [{
                label: 'More info',
                eventHandler: function (event) {
                    event.preventDefault()
                    getParkingBayInfo(pin.metadata.allData)
                }
            }]
        });
        map.setView({
            center: new Microsoft.Maps.Location(Number(pin.geometry.y), Number(pin.geometry.x)),
            zoom: 18
        })
    } else {
        console.log("Is NOT a number")
    }
}

// clickable table
document.querySelector('table').addEventListener('click', tableClick)

// toggle functions
$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(250);
}); 
       
$('.toggleInfo').click(function(e) {
    e.preventDefault();
    $('.bayInfo').slideToggle(250);
}); 