var radius = 5000;
var citymap = [];

function initMap() {

  // Create the map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: {
      lat: 55.5,
      lng: 11.0
    },
    mapTypeId: 'terrain'
  });
  var infoWindow = new google.maps.InfoWindow({
    content: "<div>Hello! World</div>",
    maxWidth: 500
  });

  var counter = 100;
  $.get('/api/notam', function(data) {
    var stringData = JSON.stringify(data);
    citymap = JSON.parse(stringData);

    // Construct the circle for each value in citymap.
    for (var i = 0; i < citymap.length; i++) {
      var city = citymap[i];
      console.log('Adding places');

      // Add the circle for this city to the map.
      cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: city.center,
        radius: radius
      });

      addIdToCircle(cityCircle, i, map, infoWindow, counter++);

    }

  });
}

function addIdToCircle(circle, i, map, infoWindow, id) {
  // wiring up id's
  circle['id'] = id;
  citymap[i]['id'] = id;

  google.maps.event.addListener(circle, 'click', function(ev) {
    console.log('Clicked on Id: ' + circle.id);
    for (var c in citymap) {
      if (citymap[c].id == circle.id) {
        console.log('Match: ' + citymap[c].id);

        infoWindow.setOptions({
          content: '<p>' + citymap[c].text + '<br/>Clicked:<br/>(' +
            ev.latLng.lat().toFixed(3) + ', ' +
            ev.latLng.lng().toFixed(3) + ')</p>'
        });
      }

      infoWindow.setPosition(ev.latLng);
      infoWindow.open(map);
    }
  });
}
