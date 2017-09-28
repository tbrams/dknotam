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

    // clear previous notices - if any
    $('#overlapping').html('');

    for (var i in notam_objects) {
      let notam = notam_objects[i];
      if (notam.id == circle.id) {
        console.log('Match: ' + notam.id);

        // check if there are other overlapping notams at the same coordinate
        let myOtherNotams = findNotamsAt(notam.id, notam.lat, notam.lng);
        console.log(`Found ${myOtherNotams.length} overlapping notams`);
        console.dir(myOtherNotams);

        if (myOtherNotams.length > 0) {
          let OLcontents =
            '<h1>Notice</h1><p>There are overlapping notams for this position</p><ul>';
          for (var i = 0; i < myOtherNotams.length; i++) {
            let n = myOtherNotams[i];
            OLcontents += '<li>' + createInfoHtml(n) + '</li>';
          }
          OLcontents += '</ul>';
          $('#overlapping').html(OLcontents);
        }

        infoWindow.setOptions({
          content: createInfoHtml(notam)
        });
      }

      infoWindow.setPosition(ev.latLng);
      infoWindow.open(map);
    }
  });
}


function createInfoHtml(n) {
  let date1 = formatDate(n.fromDate);
  let date2 = formatDate(n.toDate);
  let html = `<p>${n.text}</p>` +
    `<p>Altitudes: ${n.fromAlt} - ${n.toAlt} within a radius of: ${n.radius} nm<br/>` +
    `Valid from: ${date1} to: ${date2}<br/></p>`
  return html;
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


/**
 * Given a Notam ID, will check if there are overlapping Notams and return a list.
 *
 * @param  {String} id  id of Notam to exclude from search
 * @param  {String} lat lat component
 * @param  {String} lng lng component
 * @return {List of String}     List of notams that are overlapping
 */
function findNotamsAt(id, lat, lng) {
  let list = [];
  for (var i = 0; i < notam_objects.length; i++) {
    let n = notam_objects[i];
    if (n.id != id) {
      if (n.lat == lat && n.lng == lng) {
        list.push(n);
      }
    }
  }
  return list;
}
