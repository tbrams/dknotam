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
      let notam = notam_objects[c];
      if (notam.id == circle.id) {
        console.log('Match: ' + notam.id);

        console.dir(notam);
        let date1 = formatDate(notam.fromDate);
        let date2 = formatDate(notam.toDate);
        infoWindow.setOptions({
          content: `<p>${notam.text}</p>` +
            `<p>Altitudes: ${notam.fromAlt} - ${notam.toAlt} within a radius of: ${notam.radius} nm<br/>` +
            `Valid from: ${date1} to: ${date2}<br/></p>`
        });
      }

      infoWindow.setPosition(ev.latLng);
      infoWindow.open(map);
    }
  });
}


/**
 * Format Date Object to be more readable and clearly UTC time.
 *
 * @param  {String} d Date object formatted as a string
 * @return {String} Date formatted as "yyyy-mm-dd hh:mm utc"
 */
function formatDate(d) {
  return (d.substr(0, 10) + ' ' + d.substr(11, 5) + ' UTC');
}
