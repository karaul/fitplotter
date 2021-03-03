/*
Parse record byte array and return dictionay containing latitude, longtitude, date and altitude
Based on Robware answer on 
https://www.reddit.com/r/ukbike/comments/29i7nt/did_anyone_else_get_the_gps_watch_from_the_aldi/
https://www.reddit.com/r/ukbike/comments/29i7nt/did_anyone_else_get_the_gps_watch_from_the_aldi/cilkru4/
(changed long/lat, numbering starts from 0)
GPS Data (32 bytes):
00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31
-----------------------------------------------------------------------------------------------
  |  |Y |M |D |H |m |S | Long      | Lat       |Alt  | Head|Speed|Dist |HR|  |  |  |  |  |  |

Speed is measured in Metres per hour
Distance is measured in cm and it is distance from the previous point

I can extract all the GPS and heart rate information from the file so far, excluding the satellite count.

I first tried a hex editor, but that wasn't giving me anything useful, other than showing a repeating pattern to the data after a certain point. I then just made myself a simple C# console app that loaded in the file and printed out the byte data. From there the pattern became clearer, and I started a trial and error approach of reading various data types. I had the software open on my other monitor so I could read the values it got. First I got the lat and long, then once I got the altitude and heart rate I started to fill the gaps much quicker.

Here's what I have from a couple of evenings at it:

Header (256 bytes?):
	192: int GPS record count (is this a short or int?)
	210: lap count?
	211-216: start timestamp
	217-219: total workout time?
	274-279: timestamp
	228-229: avg speed?
	230-231: max speed?
	236: average heart rate?
	237: max heart rate?
	238: min heart rate?
	244-246: hr below zone time?
	248-250: hr in zone time?
	252-254: hr above zone time?

Lap data (16 bytes?):
01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16
-----------------------------------------------
  |  |  |  |  |  |  |  |  |  |  |  |AS|  |  |

AS=Average Speed

GPS Data (32 bytes):
01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32
-----------------------------------------------------------------------------------------------
  |  |Y |M |D |H |m |S | Lat       | Long      |Alt  | Head|Speed|Dist |HR|  |  |  |  |  |  |

First 2 bytes are something to do with GPS signal/number of satelites.
Speed is measured in Metres per hour
Distance is measured in cm and is distance from previous point
*/

'use strict'

function parseBytes(arr, base, delim) { 
  // [a1, a2, ... an].map(b=>{return b.toString(16).padStart(2,0)}).reduce((s,b)=>{return s+b}); 
  // each ak represents as a String with base 16, 9 -> '9', 10 -> 'a', 255 -> 'ff', 246 -> 'f6'
  // add seros from right starting from ther second position, '1' -> '01', 'f' -> '0f'
  // and takes all togther [a,b,c] -> 'a'+'b'+'c'
  return arr.map(b => {
      return b.toString(base).padStart(2,0)}).reduce( (s,b) => {return s + delim + b}
  )
}

function parseBytesToInt(arr) { 
  return parseInt(parseBytes(arr, 16, ""),16);  
}

// class definiton
class TklParser {
  constructor(options = {}) {
    this.options = {
      speedUnit: options.speedUnit || 'm/s',
      lengthUnit: options.lengthUnit || 'm'
    };
  }

  parse(content, callback) {

    if (content === "undefined" ) {
      callback('\nNo file, check path to the file\n', {});
      return;
    }

    const blob = new Uint8Array(content);
    if (blob.length <= 1) {
      callback("\nFile is too small, probably it's wrong file, check path to the file\n", {});
      return
    }

    var session = {};
    session.sport = "running";
    session.sub_sport = "generic";
    session.avg_heart_rate = parseBytesToInt( [blob[236]] )/1.0;
    session.avg_speed =  parseBytesToInt( [blob[229], blob[228]] ) / 10;
    
    // address 256 is end of the header, and 210 contains number of laps, each 16 bytes
    var iStart = 256 + blob[210] * 16; // 
    var distance = 0.0;
    const records = [];
    // collect records
    for (var ind = iStart; ind < blob.length; ind += 32) {

      var bytes = blob.slice(ind, ind + 32);

      var timestamp = "20" + parseBytes( [bytes[2], bytes[3], bytes[4]], 10, '-') +
        "T" + parseBytes( [bytes[5], bytes[6], bytes[7]], 10, ':') + "Z";
      var lon = parseBytesToInt([bytes[11], bytes[10], bytes[ 9], bytes[ 8]])/10000000.00;
      var lat = parseBytesToInt([bytes[15], bytes[14], bytes[13], bytes[12]])/10000000.00;
      // altitude
      var alt = parseBytesToInt([bytes[17], bytes[16]])/1.00;
      var speed = parseBytesToInt([bytes[21], bytes[20]])/100.00;
      var dist = parseBytesToInt([bytes[23], bytes[22]])/10.00;
      var hr = parseBytesToInt([bytes[24]])/1.0;
      
      distance += dist;
 
      records.push({
        timestamp: timestamp,
        speed: speed,
        heart_rate: hr,
        position_long: lon,
        position_lat: lat,
        altitude: alt,
        distance: distance
      });
    }

    //console.log(records);

    session.start_time = records[0].timestamp;
    session.total_timer_time = (new Date(records[records.length - 1].timestamp) - new Date(records[0].timestamp)) / 60000;
    session.total_distance = records[records.length - 1].distance / 1000;

    // fill laps
    // το do: split track in 1km intervals
    let lap = [  {start_time: records[0].timestamp, avg_speed: records[0].speed }, 
      {start_time: records.slice(-1).timestamp, avg_speed: records.slice(-1).speed}  ];
    const laps = [];
    laps.push(lap);

    // fill sessions
    session.start_time = records[0].timestamp;
    session.total_timer_time = (new Date(records[records.length - 1].timestamp) - new Date(records[0].timestamp)) / 60000;
    session.total_distance = records[records.length - 1].distance / 1000;
    const sessions = [];
    sessions.push(session);

    //console.log(sessions);

    const tklObj = {};
    tklObj.sessions = sessions;
    tklObj.laps = laps;
    tklObj.records = records;

    //callback(null, blob[210]);
    callback(null, tklObj);

  }
}

module.exports = TklParser;
