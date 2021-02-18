function randomColorFactor() {
	return Math.round(Math.random() * 255);
}

function randomColor(opacity) {
	return (
		"rgba(" +
		randomColorFactor() +
		"," +
		randomColorFactor() +
		"," +
		randomColorFactor() +
		"," +
		(opacity || ".3") +
		")"
	);
}

function automodePlot(yaxisshow) {
	var yadded = [];
	if (document.getElementById('openmode').value === "automode") {
		chartdata = chartdata || [];
		if (chartdata.length > 0) {
			for (var c of chartdata) {
				var y = c.name.split(" ")[0];
				if (!yadded.includes(y)) yadded.push(y);
			}
		} else {
			var x = document.getElementById('xaxis').value;
			for (var y of yaxisshow) {
				if (yOptions[x].includes(y)) yadded.push(y);
			}
		}
		for (var y of yadded) {
			document.getElementById('ylist').value = y;
			document.getElementById('ylist').dispatchEvent(new Event('change'));
		}
	}
	return yadded.length;
}


function getDataFromFitForCanvasJS(fitdatalocal, fieldx, fieldy) {
	var dataPoints = [];
	if (fieldx === "timestamp" && fieldy.slice(0, 3) === "lap") {
		for (var k = 0; k < fitdatalocal.laps.length; k++) {
			dataPoints.push({
				x: fitdatalocal.laps[k].start_time,
				y: (fieldy === "lap_avg_heart_rate") ?
					fitdatalocal.laps[k].avg_heart_rate : fitdatalocal.laps[k].total_elapsed_time,
				//y: k,
				indexLabel: (k % 4 == 0) ? k.toString() : ""
			});
		}
	} else {
		if (fieldx === "lap_number") {
			for (var k = 0; k < fitdatalocal.laps.length; k++) {
				dataPoints.push({
					x: k,
					y: fitdatalocal.laps[k][fieldy],
				});
			}
		} else {
			for (var k in fitdatalocal.records) {
				var x = fitdatalocal.records[k][fieldx];
				if( isNaN(x) ) { } else {
					dataPoints.push({ x: x, y: fitdatalocal.records[k][fieldy]} );
				}
			}
		}
	}
	return dataPoints;
}

document.getElementById('xaxis').onchange = function (e) {
	// assign ylist options depending on xaxis	
	document.getElementById('clean').dispatchEvent(new Event('click'));
	document.getElementById("ylist").options.length = 0;
	var xaxis = document.getElementById('xaxis').value;
	var ylist = yOptions[xaxis];
	//console.log(ylist);
	for (var k = 0; k < ylist.length; k++) {
		//console.log(ylist[k]);
		document.getElementById("ylist").options.add(new Option(ylist[k], ylist[k]));
	}
	axisXops.title = xaxisLabel[xaxis];
	document.getElementById('update').dispatchEvent(new Event('click'));
}

document.getElementById('ylist').onchange = function (e) {
	var yobj = document.getElementById('ylist');
	var xobj = document.getElementById('xaxis');
	//console.log(document.getElementById('yaxis2').value);
	var axisYIndex, axisYType = "undefined";
	var color = randomColor(1);
	var aa = [axisYops, axisY2ops];
	aaloop:
		for (var kk in aa) {
			var a = aa[kk];
			for (var k in a) {
				if (a[k].title === yobj.value) {
					axisYIndex = k;
					axisYType = (kk == 0 ? "primary" : "secondary");
					break aaloop;
				}
			}
		}
	//console.log(document.getElementById('yaxis2').value );
	if (axisYType === "undefined") {
		switch (yobj.value) {
			case "heart_rate" || "lap_avg_heart_rate":
				color = "red";
				break;
			case "pace":
				color = "blue" || "lap_time";
				break;
			case "HRE":
				color = "green";
				break;
			default:
		}
		if (axisYops.length < axisY2ops.length + 1) {
			axisYType = "primary";
			axisYops.push({
				title: yobj.value,
				lineColor: color,
				autoCalculate: true,
				labelFontSize: 15,
				titleFontSize: 15,
				gridThickness: 0.15
			});
			axisYIndex = axisYops.length - 1;
		} else {
			axisYType = "secondary";
			axisY2ops.push({
				title: yobj.value,
				lineColor: color,
				autoCalculate: true,
				labelFontSize: 15,
				titleFontSize: 15,
				gridThickness: 0
			});
			axisYIndex = axisY2ops.length - 1;
		}
	}

	//var datapoints = getDataFromFitForCanvasJS(fitdata, xobj.value, yobj.value);
	var chartdataType = "line",
		markerType = "none",
		markerSize = 0;
	if (yobj.value.slice(0, 3) === "lap" && xobj.value === "timestamp") {
		chartdataType = "scatter";
		markerType = "triangle";
		markerSize = 8;
	}
	if (xobj.value === "lap_number") {
		chartdataType = "column";
	}
	//console.log(chartdataType);
	chartdata = chartdata || [];
	chartdata.push({
		color: color,
		lineThickness: 0.5,
		type: chartdataType, //"line", // "scatter"
		markerType: markerType,
		markerSize: markerSize,
		showInLegend: true,
		//name: yobj.value + " " + new Intl.DateTimeFormat('ru-RU').format(fitdata.activity.local_timestamp),
		// see also line 332
		name: yobj.value + " " + new Intl.DateTimeFormat('ru-RU').format(local_timestamp),
		axisYType: axisYType, //document.getElementById('yaxis2').value,
		axisYIndex: axisYIndex,
		indexLabelPlacement: "inside",
		indexLabelFontSize: 15,
		dataPoints: getDataFromFitForCanvasJS(fitdata, xobj.value, yobj.value)
		//backgroundColor: "rgba(153,255,51,0.4)",
		//mouseover: updateMapPosition
		//mousemove: updateMapPosition
		//click: updateMapPosition
	});

	chart.render();
}


var fReader = new FileReader();
var fileInput = document.getElementById('myfile');

var chartdata = [];
var axisXops = {
	crosshair: {
		enabled: true,
		snapToDataPoint: true,
		updated: updateMapPosition
	},
	gridThickness: 0.15,
	titleFontSize: 15,
	labelFontSize: 15,
	labelAngle: 0
};
var axisYops = [],
	axisY2ops = [];

var yOptions = {
	distance: [],
	timestamp: ["lap_avg_heart_rate", "lap_time"],
	lap_number: []
};
var xaxisLabel = {
	distance: "distance, km",
	timestamp: "time from the start, hours",
	lap_number: "lap number"
};


var chart = new CanvasJS.Chart("plotarea", {
	zoomEnabled: true,
	zoomType: "x", // "x","y", "xy"
	rangeChanging: updateMapSegment,
	//animationEnabled: true,
	theme: "light2", // "light1", "light2", "dark1", "dark2"		
	axisX: axisXops,
	axisY: axisYops,
	axisY2: axisY2ops,
	legend: {
		fontSize: 15,
		cursor: "pointer",
		itemclick: toggleDataSeries
	},
	data: chartdata
});

var activeLine;
var modal = document.getElementById("myModal");

document.getElementById("lineThickness").onchange = function(){
	chart.data[activeLine].set("lineThickness", this.value);
}

document.getElementById("lineColοr").oninput = function(){
	chart.data[activeLine].set("color", this.value);
}

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

var span = document.getElementsByClassName("close")[0].onclick = function() {
	modal.style.display = "none";
}


function updateMapSegment(e) {
	//console.log(document.getElementById('xaxis').value);
	if (document.getElementById('xaxis').value === "lap_number") {} else {
		if (e.trigger === "zoom") {
			var xMin = e.axisX[0].viewportMinimum;
			var xMax = e.axisX[0].viewportMaximum;
			var xname = document.getElementById('xaxis').value;
			var ycalc = Array(chartdata.length).fill(0),
				npts = 0;
			//console.log(ycalc);
			//console.log(chartdata);
			if (withGPS) mapSegment.setLatLngs([
				[]
			]);
			// the faster way : (1) find first index at x=xmin, and (2) do loop till xmax ?
			for (let k in fitdata.records) {
				//for (var k=0; k < chart.data[0].dataPoints.length; k++){
				var record = fitdata.records[k];
				if (record[xname] >= xMin && record[xname] <= xMax) {

					if (withGPS && !(isNaN(record["position_lat"]) || isNaN(record["position_long"])))
						mapSegment.addLatLng([record["position_lat"], record["position_long"]]);

					npts++;

					for (var n = 0; n < chartdata.length; n++) {						
						if (chartdata[n].type === "scatter") {} else {
							if (k < chartdata[n].dataPoints.length) {
								if ("y" in chartdata[n].dataPoints[k]) {
									ycalc[n] += isNaN(chartdata[n].dataPoints[k].y)? 0 :chartdata[n].dataPoints[k].y;
								}							
							}
						}
					}
				}
			}

			var averinfo = ""; //"Parameter  Average";
			for (var n = 0; n < chartdata.length; n++) {
				//console.log(chartdata[n].type);
				if (chartdata[n].type === "scatter") {} else {
					ycalc[n] = ycalc[n] / npts;
					averinfo = averinfo + "<b>" + chartdata[n].name + "</b>: " + ycalc[n].toFixed(2) + "<br/>";
				}
			}
			//console.log(averinfo);
			//console.log(npts);
			//console.log(ycalc);
			//alert(averinfo);
			mapSegmentInfo = L.popup({
					autoClose: true
				}).setLatLng(mapSegment.getCenter())
				.setContent(averinfo).openOn(mymap);
		} else if (e.trigger === "reset") {
			if (withGPS) mapSegment.setLatLngs([
				[]
			]);
		}
	}
}

function updateMapPosition(e) {
	if (withGPS) {
		var xgiven = e.value;
		var xname = document.getElementById('xaxis').value;
		var record = {};
		for (let k in fitdata.records) {
			record = fitdata.records[k];
			if (record[xname] === xgiven) break
		}
		//console.log([ record["position_lat"], record["position_long"] ] );
		if ( !( isNaN(record["position_lat"]) || isNaN(record["position_long"])) )
			mapPosition.setLatLng([record["position_lat"], record["position_long"]]);
	}
}

//function updateMapPosition(e){
//  this is for: mousemove: updateMapPosition
//	// console.log(e.dataPointIndex);
//	var d = fitdata.records[e.dataPointIndex];
//	mapPosition.setLatLng([d.position_lat, d.position_long]);
//}

/*function toggleDataSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else {
		e.dataSeries.visible = true;
	}
	e.chart.render();
}*/
function toggleDataSeries(e) {
	switch (document.getElementById('legendaction').value) {
		case "hide_show":
			if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
				e.dataSeries.visible = false;
			} else {
				e.dataSeries.visible = true;
			}
			break;

		case "change":
			for (var k in chart.data) {
				var c = chart.data[k];
				if (c.name == e.dataSeries.name) {
					activeLine = k;
					modal.style.display = "block";
					document.getElementById('lineThickness').value = c.get("lineThickness");
					document.getElementById('lineColοr').value = c.get("color");
					break;
				}
			}
			break;
	
		case "change_thickness":
			for (var c of chart.data) {
				if (c.name == e.dataSeries.name) {
					e.dataSeries.lineThickness = parseFloat(prompt("Line thickness, min 0.5, max 12:", c.get("lineThickness").toString()));
					break;
				}
			}
			break;
		case "change_thickness":
			for (var c of chart.data) {
				if (c.name == e.dataSeries.name) {
					e.dataSeries.lineThickness = parseFloat(prompt("Line thickness, min 0.5, max 12:", c.get("lineThickness").toString()));
					break;
				}
			}
			break;

		case "change_color":
			for (var c of chart.data) {
				if (c.name == e.dataSeries.name) {
					var t = prompt("Line color, HEX or word: r(red), g(green), b(blue), " +
						"c(cyan), m(magenta), y(yellow), n(navy), p(purple), ο(olive), t(tomato):", c.get("color"));
					switch (t) {
						case "r":
							t = "#FF0000";
							break;
						case "g":
							t = "#00FF00";
							break;
						case "b":
							t = "#0000FF";
							break;
						case "c":
							t = "#00FFFF";
							break;
						case "m":
							t = "#FF00FF";
							break;
						case "y":
							t = "#FFFF00";
							break;
						case "n":
							t = "#000080";
							break;
						case "p":
							t = "#800080";
							break;
						case "o":
							t = "#808000";
							break;
						case "t":
							t = "#FF6347";
							break;
					}
					e.dataSeries.color = t;
					break;
				}
			}
			break;
		case "remove_curve":
			for (var c of chart.data) {
				if (c.name == e.dataSeries.name) {
					c.remove();
					break;
				}
			}
			break;
		default:
	}
	e.chart.render();
}

fileInput.onchange = function (e) {
	var file = this.files[0];
	fReader.readAsArrayBuffer(file);
}

import {
	default as FitParser
} from './fit-parser.cjs';

var fitParser = new FitParser({
	force: true,
	speedUnit: 'km/h',
	lengthUnit: 'm',
	temperatureUnit: 'celsius',
	elapsedRecordField: true,
	mode: 'list',
});


var fitdata = {},
	trackdata = [],
	local_timestamp = '';

var mymap = L.map('map');
if (navigator.onLine) {
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(mymap);
	// or with mapbox
	//const mapbox_access_token = 'pk.eyJ1Ijoia2FyYXVsIiwiYSI6ImNra3JqczZ1bzBwMGMycHBmdXRiMXZ0dTIifQ.fZTV-Hvc1R_25VWOKmhRlQ';
	//L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapbox_access_token, 
	//{
	//	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	//	maxZoom: 18,
	//	id: 'mapbox/streets-v11',
	//}).addTo(mymap);
}

var Ltracks = [];
var Lpopups = [];
var mapPosition = {},
	mapSegment = {},
	mapSegmentInfo = {},
	withGPS;

fReader.onload = function (e) {
	//console.log(e.target.result); /// <-- this contains an ArrayBuffer
	//var ylist = [];
	fitParser.parse(e.target.result, function (error, data) {
		if (error) {
			console.log(error);
		} else {
			//console.log(data);
			//console.log(data.laps);
			if ("activity" in data) {
				local_timestamp = ("local_timestamp" in data.activity ?
					data.activity.local_timestamp : data.records[0].timestamp);
			} else {
				local_timestamp = data.records[0].timestamp;
			}
			var D = new Date(data.records[0].timestamp);
			var timeoffset = D.getHours() + D.getMinutes() / 60;
			var paceFlag = false;
			var hreFlag = false;
			for (var k in data.records) {
				var record = data.records[k];
				D = new Date(record.timestamp);
				data.records[k].timestamp = D.getHours() + D.getMinutes() / 60 - timeoffset;
				data.records[k].distance = isNaN(record.distance) ? NaN: record.distance/1000;
				paceFlag = paceFlag || ("speed" in record && !isNaN(record.speed));
				if (paceFlag)
					data.records[k].pace = (record.speed > 0 ? 60 / record.speed : NaN);
				hreFlag = hreFlag || (paceFlag && "heart_rate" in record && !isNaN(record.heart_rate));
				if (hreFlag)
					data.records[k].HRE = (record.speed > 0 ? record.heart_rate * 60 / record.speed : NaN);
			}
			paceFlag = false;
			hreFlag = false;
			for (var k in data.laps) {
				var record = data.laps[k];
				D = new Date(record.start_time);
				data.laps[k].start_time = D.getHours() + D.getMinutes() / 60 - timeoffset;
				paceFlag = paceFlag || ("avg_speed" in record && !isNaN(record.avg_speed));
				if (paceFlag)
					data.laps[k].avg_pace = (record.avg_speed > 0 ? 60 / record.avg_speed : NaN);
				hreFlag = hreFlag || (paceFlag && "avg_heart_rate" in record && !isNaN(record.avg_heart_rate));
				if (hreFlag)
					data.laps[k].avg_HRE = (record.avg_speed > 0 ? record.avg_heart_rate * 60 / record.avg_speed : NaN);
			}

			fitdata = data;

			//var l=document.getElementById('xaxis').options = chartdata || [];
			if (document.getElementById('xaxis').options.length == 0) {
				for (var [ykey, yrecords] of Object.entries({
						distance: "records",
						timestamp: "records",
						lap_number: "laps"
					})) {
					//console.log(ykey);
					//console.log(yrecords);
					document.getElementById('xaxis').options.add(new Option(ykey, ykey));
					for (var datarow of data[yrecords]) {
						for (var [key, value] of Object.entries(datarow)) {
							yOptions[ykey] = yOptions[ykey] || [];
							if ( !(yOptions[ykey].includes(key) || ykey === key) ) {
								yOptions[ykey].push(key);
							}
						}
					}
					// sort out
					yOptions[ykey].sort();
				}

				// set default xaxis as "distance"
				document.getElementById('xaxis').value = "distance";
				// set ylistOptions for xaxis = distance
				document.getElementById('xaxis').dispatchEvent(new Event('change'));
			} else {
				document.getElementById('update').dispatchEvent(new Event('click'));
			}
		}
	});

	// now work with leallet 
	trackdata = [];
	var latt_aver = 0,
		long_aver = 0,
		n = 0;

	for (var i in fitdata.records) {
		var record = fitdata.records[i];
		var x = record.position_lat;
		var y = record.position_long;
		if (isNaN(x) || isNaN(y)) {} else {
			trackdata.push([x, y]);
			latt_aver += x;
			long_aver += y;
			n++;
		}
	};
	latt_aver = latt_aver / n;
	long_aver = long_aver / n;
	withGPS = !(isNaN(latt_aver) || isNaN(long_aver));

	//var trackcolor = ;
	//trackcolor = 'rgba(135,35,67, 0.2)'
	//console.log(trackcolor);
	/*Ltrack.on('click', function(e) {
		alert(e.latlng);
	});*/

	if (withGPS) {

		mymap.setView([latt_aver, long_aver], 14);

		var givencolors = ["blue", "green", "magenta", "brown", "purple", "olive"];
		var k = Ltracks.length % givencolors.length;
		Ltracks.push(L.polyline(trackdata, {
			color: givencolors[k]
		}).addTo(mymap));

		Lpopups.push(
			L.popup({
				autoClose: false
			}).setLatLng(trackdata[Math.round(Math.random() * (trackdata.length - 1) / 2)])
			.setContent(new Intl.DateTimeFormat('ru-RU').format(local_timestamp)).openOn(mymap)
		);

		if (!mymap.hasLayer(mapPosition)) {
			mapPosition = L.circleMarker(trackdata[0], {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 5
			}).addTo(mymap);
		} else {
			mapPosition.bringToFront();
		}

		if (!mymap.hasLayer(mapSegment)) {
			mapSegment = L.polyline([
				[]
			], {
				color: "red",
				weight: 5
			}).addTo(mymap);
		} else {
			mapSegment.bringToFront();
		}
	} else {
		var faketrack = [ // fake segment to get popup with averaged
			//[35.156025,33.3766633], // Nicosia
			//[55.752121, 37.617664], // Moscow
			[55.830431, 49.066081] // Kazan
		];
		mymap.setView(faketrack[Math.round(Math.random() * (trackdata.length - 1) / 2)], 14);
		mapSegment = L.polyline(faketrack, {
			color: "red",
			weight: 5
		}).addTo(mymap);
	}

};


document.getElementById('update').onclick = function (e) {
	automodePlot(["heart_rate", "pace", "HRE"]) == 0 ?
		(automodePlot(["speed"]) == 0 ?
			(automodePlot(["total_elapsed_time"]) == 0 ?
				(automodePlot(["avg_pace", "avg_heart_rate", "avg_HRE"]) == 0 ?				
					automodePlot(["altitude"]) : null) : null) : null) : null;

}

document.getElementById('clean').onclick = function (e) {

	// reset zoom
	chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
	// reset y-axis
	document.getElementById('ylist').value = null;

	for (var k = axisYops.length - 1; k >= 0; k--) {
		axisYops.pop()
	}
	for (var k = axisY2ops.length - 1; k >= 0; k--) {
		axisY2ops.pop()
	}
	for (var k = chartdata.length - 1; k >= 0; k--) {
		chartdata.pop()
	}
	chart.render();

	if (withGPS) {
		for (var k = 0; k < Ltracks.length - 1; k++) {
			mymap.removeLayer(Ltracks[k]);
		}
		Ltracks = Ltracks.slice(-1);

		for (var k = 0; k < Lpopups.length - 1; k++) {
			mymap.removeLayer(Lpopups[k]);
		}

		Lpopups = Lpopups.slice(-1);
		//mapPosition.setLatLng( [] );
		mapSegment.setLatLngs([
			[]
		]);

		//if ( mymap.hasLayer(mapSegmentΙnfo)) {
		//	mymap.removeLayer(mapSegmentΙnfo);
		//}
	}

}