const express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('index', {
    pageData: '[1,2,3]',
    pageTitle: 'VERY Different!'
  });
})



// Pass on a json version of the internal notam objects
app.get('/api/notam', function(req, res) {
  console.log(`Sending ${notam_objects.length} notam objects to javascript`);
  res.json(notam_objects);
});


app.listen(3000);

console.log('Listening on port 3000');


// Needed to fetch and get to the Notam details
const request = require('request');
const cheerio = require('cheerio');

/**
 * Look up Notams at the FAA.GOV site for a particular station.
 *
 * The Notams are collected as strings and added to an interal Array
 * notams and subsequently passed to the parser process_notams
 *
 * @param  {String} place ICAO name, for example EKDK
 * @return None
 */
function getNotams(place) {

  if (!place) place = 'EKDK';
  const page =
    "https://pilotweb.nas.faa.gov/PilotWeb/notamRetrievalByICAOAction.do?method=displayByICAOs&reportType=RAW&formatType=ICAO&actionType=notamRetrievalByICAOs&retrieveLocId=" +
    place;

  var notams = [];

  request(page, function(err, res, body) {
    if (err) {
      console.log("Error: ", err.description);
    } else {

      var $ = cheerio.load(body);
      $(' div#notamRight', 'div#resultsHomeLeft').each(function(i, elem) {
        notams[i] = $(this).find('pre').html();
      });
    }

    parseNotams(notams);

  });
}



var notam_objects = [];

/**
 * This is where the text input from the NOTAM server is parsed. All data
 * is extracted and added to the internal Notam object nObject unless it is
 * a Notam that should be ignored.
 *
 * When all is in place the nObject will be printed to the console and a
 * smaller object will be created with data for the GET event.
 *
 * TODO:  Need to eliminate the additional object here
 *
 * @param  {Array of String} notams One String with each Notam in an array
 * @return {None}
 */
function parseNotams(notams) {

  let ignored = 0;
  let errors = 0;
  let dateSkip = 0;

  let count = notams.length;
  for (let i = 0; i < count; i++) {
    let notam = notams[i];
    console.log('Raw notam: ' + notam + '\n');

    let lines = [];
    lines = notam.split('\n');

    // check first line - should we ignore?
    if (lines[0].trim()[0] == 'M') {
      console.log('This notam will be ignored');
      ignored++;
    } else {

      let nameParts = lines[0].split(' ');
      let name = nameParts[0];

      // Get to the Q-code on line 2
      let qParts = lines[1].split(' ');
      let qCode = '';
      if (qParts[0].toUpperCase() == "Q)") {
        let qInfoParts = qParts[qParts.length - 1].split('/');
        qCode = qParts[1].split('/')[1];
        if (qCode.toUpperCase() == 'QKKKK') {
          console.log('This notal will be ignored');
          ignored++;
        } else {
          // So we will use the info in this notam
          // Create object to hold all the info
          var nObject = {
            id: lines[0].split(' ')[0],
            name: name,
            place: '',
            fromDate: '',
            toDate: '',
            soon: '',
            qCode: qCode,
            fromAlt: '',
            toAlt: '',
            lat: '',
            lng: '',
            radius: '',
            text: ''
          }

          // Spatials
          let radius = qInfoParts[qInfoParts.length - 1].slice(-3);
          let coordinates = qInfoParts[qInfoParts.length - 1].slice(0, -3);


          let separator = 'N';
          if (coordinates.indexOf('S') > 0) separator = 'S';
          let cordarr = coordinates.split(separator);

          let lat = cordarr[0] / 100.;
          let lng = cordarr[1].slice(0, -1) / 100.;

          if (coordinates.indexOf('S') > 0) lat *= -1;
          if (coordinates.indexOf('W') > 0) lng *= -1;

          let toAlt = qInfoParts[qInfoParts.length - 2];
          let fromAlt = qInfoParts[qInfoParts.length - 3];

          nObject.lat = lat;
          nObject.lng = lng;
          nObject.fromAlt = fromAlt;
          nObject.toAlt = toAlt;
          nObject.radius = radius;

          // Line with A, B and C
          let line2parts = lines[2].split(' ');

          if (line2parts[0] == 'A)') {
            let place = line2parts[1];
            nObject.place = place;
          }

          if (line2parts[2] == 'B)') {
            let fromDate = line2parts[3];
            nObject.fromDate = getDate(fromDate);
          }

          if (line2parts[4] == 'C)') {
            let toDate = line2parts[5];
            if (toDate != 'PERM') {
              nObject.toDate = getDate(toDate);
            } else {
              // Create a Date one year ahead from now, so it will be allways active.
              var theFuture = new Date(new Date().setFullYear(new Date().getFullYear() +
                1));
              nObject.toDate = theFuture;
            }
          }

          // Line with E
          let textLine = 3;
          if (lines[textLine].substr(0, 2).toUpperCase() == 'E)') {
            nObject.text = lines[textLine].slice(-lines[3].length + 3);

            // And append the remaining lines, until we find the "CREATED:" signature
            // or one of the F) Fields we sometimes see in A series notams.
            while ((lines[++textLine].substr(0, 8).toUpperCase() != "CREATED:") &&
              (lines[textLine].substr(0, 2).toUpperCase() != "F)")) {
              nObject.text += '\n' + lines[textLine];
            }
          }

          let now = getUtcTime(new Date());
          if (nObject.fromDate <= now) {
            console.log('fromDate OK');
            if (now <= nObject.toDate) {
              console.log('toDate OK');

              // We are done checking - let's save the Notam object
              notam_objects.push(nObject);
              dump_notam(nObject);
            } else {
              dateSkip++;
              console.log('Skipping this one - expired');
            }
          } else {
            // Will it start within the next 24 hours?
            if (nObject.fromDate <= getTomorrow(now)) {
              console.log('This will start within 24hrs');
              nObject['soon'] = 'Y';
              // We are done checking - let's save the Notam object
              notam_objects.push(nObject);
              dump_notam(nObject);

            } else {
              dateSkip++;
              console.log('Skipping this one - not started');
            }
          }
        }

      } else {
        console.log("Expected a Q) line here???");
        errors++;
      }
    }

    console.log('\n');
  }

  console.log(`Processed a total of ${count} notams`);
  if (ignored > 0)
    console.log(`Marked ${ignored} as ignored`);
  if (dateSkip > 0)
    console.log(`# Not valid date: ${dateSkip}`);
  if (errors > 0)
    console.log(`Encountered ${errors}`);
}



/**
 * Give visual feedback on the console - parsed Notam information.
 *
 * @param  {object} nObj Notam Object
 * @return none
 */
function dump_notam(nObj) {
  console.log(`Id: ${nObj.id}`);
  console.log(`Q-code: ${nObj.qCode}`);
  console.log(`Place: ${nObj.place}`);
  console.log(`From: ${nObj.fromDate}`);
  console.log(`To: ${nObj.toDate}`);
  console.log(
    `coords: ${nObj.lat} ${nObj.lng} - radius: ${nObj.radius}`
  );
  console.log(`From Alt: ${nObj.fromAlt} to ${nObj.toAlt}`);
  console.log(`Text: ${nObj.text}`);

  if (nObj.soon == 'Y') {
    console.log('NOTE: This notam will start within next 24 hrs\n');
  }
}



/**
 * Take the Notam date string and return a real Date object.
 *
 * @param  {String} dateStr A String like "1709280700"
 * @return {Date}           An equivalent Date object
 */
function getDate(dateStr) {
  return new Date(20 + dateStr.substring(0, 2), (dateStr.substring(2, 4) - 1),
    dateStr.substring(4, 6),
    dateStr.substring(6, 8),
    dateStr.substring(8, 10));
}

/**
 * Calculate and return a Date object with the UTC time of the time passed in.
 *
 * @param  {Date} today Date in local time.
 * @return {Date}       Date in UTC time.
 */
function getUtcTime(today) {
  return new Date(today.getTime() + today.getTimezoneOffset() * 60000);
}


/**
 * Create and return a Date object set for tomorrow.
 * @param  {Date} today Our "today" date
 * @return {Date}       The day after
 */
function getTomorrow(today) {
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  return tomorrow;
}


/**
 * Return a Date object from the future.
 * @return {Date} A Date one year from now.
 */
function getOneMoreYear() {
  return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
}


/**
 * This is intended to test and debug. Change the content of the
 * NOTAM below and see the result all the way through without having
 * to sift to a tons of official notams.
 *
 * @return {none}
 */
function runTest() {
  var testData = [];
  var testStr = 'Raw notam: C0951/17 NOTAMN\n';
  testStr += 'Q) EKDK/QRRCA/IV/BO /W /000/027/5538N00811E007\n';
  testStr += 'A) EKDK B) 1709290700 C) PERM\n';
  testStr += 'E) RESTRICTED AREA EKR34 BORDRUP ACTIVATED\n';
  testStr += 'F) SFC G) 2700FT AMSL\n';
  testStr += 'CREATED: 27 Sep 2017 11:20:00\n';
  testStr += 'SOURCE: EUECYIYN\n';
  testData.push(testStr);

  parseNotams(testData);
}

//runTest();

// Remember to comment out this one when testing
getNotams('EKRK');
