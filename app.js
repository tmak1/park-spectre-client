const url = "http://localhost:8080/api/parkingbays";



function GetMap() {

  var map = new Microsoft.Maps.Map("#myMap", {
    center: new Microsoft.Maps.Location(-37.818555, 144.959076),
    // mapTypeId: Microsoft.Maps.MapTypeId.aerial,
    zoom: 18
  });

  //Add your post map load code here.
  var center = map.getCenter();
  console.log(center);

  function addPin(result) {
    //Create custom Pushpin
    var pin = new Microsoft.Maps.Pushpin(
      { latitude: result.location.latitude, longitude: result.location.longitude },
      {
        title: result.bay_id,
        subTitle: "SEI",
        text: `${result.status === 'Present' ? 'X' : 'O'}`
      }
    );

    //Add the pushpin to the map
    map.entities.push(pin);
  }


  axios.get(url).then(res => {
    // for dom- we have dom api or jquery
    console.log(res.data.status);
  
    res.data.forEach(addPin);
  });
}
$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(350);
});

