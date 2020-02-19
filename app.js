function GetMap() {
    var map = new Microsoft.Maps.Map('#myMap', {
        center: new Microsoft.Maps.Location(-37.818555, 144.959076),
        zoom: 15
    });
}

$('.toggle').click(function(e) {
    e.preventDefault();
    $('.about').slideToggle(350);
});