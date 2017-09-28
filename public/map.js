var radius = 5000;
var notam_objects = [];

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
    maxWidth: 700
  });

  var counter = 100;
  $.get('/api/notam', function(data) {
    var stringData = JSON.stringify(data);
    notam_objects = JSON.parse(stringData);

    // Construct the circle for each value in notam_objects.
    for (var i = 0; i < notam_objects.length; i++) {
      var notam = notam_objects[i];
      console.log(`Adding notam #${i}`);
      console.log('Soon: ' + notam.soon);

      // For upcoming notams, use another color
      let color = '#FF0000';
      if (notam.soon == 'Y') {
        color = '#00FF00';
      }
      // Add the circle for this notam to the map.
      notamCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        center: {
          lat: notam.lat,
          lng: notam.lng
        },
        radius: radius
      });

      addIdToCircle(notamCircle, i, map, infoWindow, counter++);

    }

  });
}

function addIdToCircle(circle, i, map, infoWindow, id) {
  // wiring up id's
  circle['id'] = id;
  notam_objects[i]['id'] = id;

  google.maps.event.addListener(circle, 'click', function(ev) {
    console.log('Clicked on Id: ' + circle.id);
    for (var c in notam_objects) {
      if (notam_objects[c].id == circle.id) {
        console.log('Match: ' + notam_objects[c].id);
        console.dir(notam_objects[c]);

        infoWindow.setOptions({
          content: '<p>' + notam_objects[c].text +
            '<br/>Clicked:<br/>(' +
            ev.latLng.lat().toFixed(3) + ', ' +
            ev.latLng.lng().toFixed(3) + ')</p>'
        });
      }

      infoWindow.setPosition(ev.latLng);
      infoWindow.open(map);
    }
  });
}
