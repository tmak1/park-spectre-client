// https://docs.microsoft.com/en-us/bingmaps/v8-web-control/creating-and-hosting-map-controls/creating-a-basic-map-control
// may be we need axios to make http request
const url = 'http://localhost:4567/usemap'; 
// the api and the web client are not on teh same app anymore. So use full url
function GetMap() {
    var map = new Microsoft.Maps.Map('#map', {
        center: new Microsoft.Maps.Location(-37.8124, 144.9623),
        zoom: 15
    });
    creatInfoBox(map);
    axios
    .get(url)
    .then(results => {
        // shows all bay information
        console.log("all results:")
        console.log(results);
        results.data.forEach((result, index) => {
            addPin(map, result, index);
        }); 
        
    })  
} 

var addPin = (map, result, index) => {
//Create custom Pushpin
var pin = new Microsoft.Maps.Pushpin(
    { latitude: result.lat, longitude: result.lon  },
    {
        title: '',
        subTitle: '',
        text: index
    });
    // var pushpinClicked = 
    pin.metadata = {
        title: result.description1,
        latlong: `${result.lat} ${result.lon}`  
    };
    // Microsoft.Maps.Events.addHandler(pin, 'mouseover', function (e) {
    //     e.target.setOptions({ 
    //         subTitle: 'Melbourne',
    //     });
    // });
    // Microsoft.Maps.Events.addHandler(pin, 'mouseout', function (e) {
    //     e.target.setOptions({ 
    //         subTitle: '',
    //     });
    // });
    
    Microsoft.Maps.Events.addHandler(pin, 'click', (e) => {
        //Make sure the infobox has metadata to display.
        console.log(e.target.metadata);
        if (e.target.metadata) {
            //Set the infobox options with the metadata of the pushpin.
            infobox.setOptions({
                location: e.target.getLocation(),
                title: e.target.metadata.title,
                description: e.target.metadata.latlong,
                visible: true
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
            label: 'Handler1',
            eventHandler: function () {
                alert('Handler1');
            }
        }, {
            label: 'Handler2',
            eventHandler: function () {
                alert('Handler2');
            }
        }]
    });
    //Assign the infobox to a map instance.
    infobox.setMap(map);
}

$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(350);
});