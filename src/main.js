// Add an event listener of DOMContentLoaded to the whole document and call an anonymous function.
// You can then wrap your code in that function's brackets
// and it will execute once loading is complete.

document.addEventListener('DOMContentLoaded', function () {

	//console.log('Aloha');

	//"use strict";

	//============ Utilities ======================================================//
	const swap = (arr, x, y) => [arr[x], arr[y]] = [arr[y], arr[x]];
	const calcMiddle = (x, y) => ~~((x + y) / 2);

	function median(arr) {
		let low = 0;
		let high = arr.length - 1;
		let middle, ll, hh;
		let median = calcMiddle(low, high);

		while (true) {
			if (high <= low) { // One element only
				return arr[median];
			}

			if (high == low + 1) { // Two elements only
				if (arr[low] > arr[high])
					swap(arr, low, high);
				return arr[median];
			}

			// Find median of low, middle and high items; swap into position low
			middle = calcMiddle(low, high);
			if (arr[middle] > arr[high]) swap(arr, middle, high);
			if (arr[low] > arr[high]) swap(arr, low, high);
			if (arr[middle] > arr[low]) swap(arr, middle, low);

			// Swap low item (now in position middle) into position (low+1)
			swap(arr, middle, low + 1);

			// Nibble from each end towards middle, swapping items when stuck
			ll = low + 1;
			hh = high;
			while (true) {
				do ll++; while (arr[low] > arr[ll]);
				do hh--; while (arr[hh] > arr[low]);

				if (hh < ll)
					break;

				swap(arr, ll, hh);
			}

			// Swap middle item (in position low) back into correct position
			swap(arr, low, hh);

			// Re-set active partition
			if (hh <= median)
				low = ll;
			if (hh >= median)
				high = hh - 1;
		}
	}

	function averfilter(a, bin) {
		var bin2p1 = 1 + 2 * bin,
			n = a.length;
		var af = [];
		for (var i = 0; i < n; i++) {
			var s = 0;
			for (var k = 0; k < bin2p1; k++) {
				var ipk = i + k - bin;
				s += ipk >= 0 ? (ipk < n ? a[ipk] : a[n - 1]) : a[0];
			}
			af.push(s / bin2p1);
		}
		return af;
	}


	function medfilter(a, bin) {
		var bin2p1 = 1 + 2 * bin,
			n = a.length;
		var dm = Array(bin2p1).fill(a[0]);
		var af = [];
		for (var i = 0; i < n; i++) {
			for (var k = 0; k < bin2p1; k++) {
				var ipk = i + k - bin;
				dm[k] = (ipk >= 0 ? (ipk < n ? a[ipk] : a[n - 1]) : a[0]);
			}
			af.push(median(dm));
		}
		return af;
	}

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
	//============ Utilities ======================================================//

	//============ Global variables  ======================================================//
	//var filename = '';
	var fitdataObj = {};
	var fitdata = {};	
	var activityLabel = '';
	var cleanPlotFlag = true;
	var fReader = new FileReader();
	const fitParser = new FitParser({
		force: true,
		speedUnit: 'km/h',
		lengthUnit: 'm',
		temperatureUnit: 'celsius',
		elapsedRecordField: true,
		mode: 'list',
	});

	const tklParser = new TklParser();

	// variables for working with canvasjs
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

	// variables for working with the map 
	var Ltracks = [];
	var Lpopups = [];
	var mapPosition = {},
		mapSegment = {},
		mapSegmentInfo = {},
		withGPS;
	//============ Global variables  ======================================================//

	function automodePlot(yaxisshow) {
		// input parameter  yaxisshow is array containing y to show on the plot
		// not all y might be in yOptions,the existing are collected in yadded
		let yadded = [];
		let ylist = document.getElementById('ylist');
		if (document.getElementById('openmode').value === "automode") {
			chartdata = chartdata || [];
			if (chartdata.length > 0) {
				chartdata.forEach(c => {
					let y = c.name.split(" ")[0];
					if (!yadded.includes(y)) yadded.push(y)
				});
			} else {
				let x = document.getElementById('xaxis').value;
				yaxisshow.forEach(y => {
					if (yOptions[x].includes(y)) yadded.push(y)
				});
			}
			yadded.forEach(y => {
				ylist.value = y;
				ylist.dispatchEvent(new Event('change'));
			});
		}
		return yadded.length;
	}


	function getDataFromFitForCanvasJS(fitdatalocal, fieldx, fieldy) {
		var dataPoints = [];
		if (fieldx === "timestamp" && fieldy.slice(0, 3) === "lap") {
			for (let k = 0; k < fitdatalocal.laps.length; k++) {
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
				for (let k = 0; k < fitdatalocal.laps.length; k++) {
					dataPoints.push({
						x: k,
						y: fitdatalocal.laps[k][fieldy],
					});
				}
			} else {
				for (let k in fitdatalocal.records) {
					let x = fitdatalocal.records[k][fieldx];
					if (!isNaN(x)) {
						dataPoints.push({
							x: x,
							y: fitdatalocal.records[k][fieldy]
						});
					}
				}
			}
		}
		return dataPoints;
	}

	document.getElementById('xaxis').onchange = function (e) {
		let xaxis = this.value;
		let ylist = document.getElementById("ylist");
		let yold = ylist.value;
		if (cleanPlotFlag) document.getElementById('clean').dispatchEvent(new Event('click'));
		// assign ylist options depending on xaxis	
		ylist.options.length = 0;
		yOptions[xaxis].forEach(b => {
			ylist.options.add(new Option(b, b));
		});
		if (yold && yOptions[xaxis].includes(yold)) ylist.value = yold;
		cleanPlotFlag = (cleanPlotFlag || true);
		axisXops.title = xaxisLabel[xaxis];
		document.getElementById('update').dispatchEvent(new Event('click'));
	}

	document.getElementById('ylist').onchange = function (e) {
		let yobj = document.getElementById('ylist');
		let xobj = document.getElementById('xaxis');
		let axisYIndex, axisYType = "undefined";
		let color = randomColor(1);
		let aa = [axisYops, axisY2ops];
		aaloop:
			for (let kk in aa) {
				let a = aa[kk];
				for (let k in a) {
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
					color = "#ff0000";
					break;
				case "pace" || "lap_time":
					color = "#0000ff";
					break;
				case "HRE":
					color = "#00ff00";
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
					gridThickness: 0.15,
					crosshair: {
						enabled: false,
						snapToDataPoint: true
					}
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
		let chartdataType = "line",
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
			name: yobj.value + " " + activityLabel,
			axisYType: axisYType,
			axisYIndex: axisYIndex,
			indexLabelPlacement: "inside",
			indexLabelFontSize: 15,
			dataPoints: getDataFromFitForCanvasJS(fitdata, xobj.value, yobj.value)
		});

		chart.render();
	}

	// popup windows to change line properties: color, thickness
	var modal = document.getElementById("myModal");
	document.getElementById("lineThickness").onchange = function () {
		chart.data[activeLine].set("lineThickness", this.value);
	}
	document.getElementById("lineColοr").oninput = function () {
		chart.data[activeLine].set("color", this.value);
	}
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
	var span = document.getElementsByClassName("close")[0].onclick = function () {
		modal.style.display = "none";
	}
	// popup windows to change line properties: color, thickness


	function updateMapSegment(e) {
		//console.log(document.getElementById('xaxis').value);
		if (document.getElementById('xaxis').value === "lap_number") {} else {
			if (e.trigger === "zoom") {
				let xMin = e.axisX[0].viewportMinimum;
				xMin = (xMin == null) ? chart.axisX[0].get("minimum") : xMin;
				let xMax = e.axisX[0].viewportMaximum || e.axisX[0].maximum;
				xMax = (xMax == null) ? chart.axisX[0].get("maximum") : xMax;
				let xname = document.getElementById('xaxis').value;
				let ycalc = Array(chartdata.length).fill(0),
					npts = 0;
				//console.log(ycalc);
				//console.log(chartdata);
				if (withGPS) mapSegment.setLatLngs([
					[]
				]);
				// the faster way : (1) find first index at x=xmin, and (2) do loop till xmax ?
				for (let k in fitdata.records) {
					//for (var k=0; k < chart.data[0].dataPoints.length; k++){
					let record = fitdata.records[k];
					if (record[xname] >= xMin && record[xname] <= xMax) {

						if (withGPS && !(isNaN(record["position_lat"]) || isNaN(record["position_long"])))
							mapSegment.addLatLng([record["position_lat"], record["position_long"]]);

						npts++;

						for (let n = 0; n < chartdata.length; n++) {
							if (chartdata[n].type === "scatter") {} else {
								if (k < chartdata[n].dataPoints.length) {
									if ("y" in chartdata[n].dataPoints[k]) {
										ycalc[n] += isNaN(chartdata[n].dataPoints[k].y) ? 0 : chartdata[n].dataPoints[k].y;
									}
								}
							}
						}
					}
				}

				let averinfo = ""; //"Parameter  Average";
				for (let n = 0; n < chartdata.length; n++) {
					//console.log(chartdata[n].type);
					if (chartdata[n].type === "scatter") {} else {
						ycalc[n] = ycalc[n] / npts;
						averinfo = averinfo + "<b>" + chartdata[n].name + "</b>: " + ycalc[n].toFixed(2) + "<br/>";
					}
				}
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
			if (!(isNaN(record["position_lat"]) || isNaN(record["position_long"])))
				mapPosition.setLatLng([record["position_lat"], record["position_long"]]);
		}
	}

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
						var color = c.get("color"),
							hexcolor;
						if (color[0] == "#") {
							hexcolor = color;
						} else {
							const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
							hexcolor = `#${((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])).toString(16).slice(1)}`;

						}
						//console.log(hexcolor);						
						document.getElementById("lineColοr").value = hexcolor;
						document.getElementById("lineThickness").value = c.get("lineThickness");
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
			case "filter_curve":
				var medfil1bin = document.getElementById('medfil1bin').value;
				var averfil1bin = document.getElementById('averfil1bin').value;
				var yold;
				for (var k in chart.data) {
					var c = chart.data[k];
					if (c.name == e.dataSeries.name) {
						activeLine = k;
						yold = c.name;
						break;
					}
				}
				var xy = chart.data[activeLine].get("dataPoints");
				var y = [];
				for (var i = 0; i < xy.length; i++) {
					y.push(xy[i].y)
				}
				var yfiltered = medfilter(y, medfil1bin);
				var yfiltered2 = averfilter(yfiltered, averfil1bin);
				for (var i = 0; i < xy.length; i++) {
					xy[i].y = yfiltered2[i]
				}

				chart.data[activeLine].set("dataPoints", xy);
				chart.data[activeLine].set("lineThickness", 2);
				chart.data[activeLine].set("name", yold + " filter " + medfil1bin + "/" + averfil1bin);

				document.getElementById('ylist').value = yold.split(" ")[0];
				document.getElementById('ylist').dispatchEvent(new Event('change'));

				document.getElementById('medfil1bin').value = 0;
				document.getElementById('averfil1bin').value = 0;
				document.getElementById('legendaction').value = "hide_show";
				break;
			default:
		}
		e.chart.render();
	}

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

	document.getElementById('myfile').onchange = function () {
		const file = this.files[0];
		const filename = file.name;
		//console.log(filename);
		const files = document.getElementById("files");
		files.options.add(new Option("filename", filename));
		files.value = filename;
		fReader.readAsArrayBuffer(file);
	}

	fReader.onload = function (e) {
		let blob =e.target.result; // it contains an ArrayBuffer
		parseBLOB(blob);
	}

	function errorNoFile(error,filename, errorId) {
		let name = filename.replace(/LevelUp/g, '/../').replace("plus","+");
		let files = document.getElementById("files");		
		files.options.remove(files.selectedIndex);
		console.log(error);
		switch (errorId) {
			case 1:
				alert("ERROR\nProbably file:\n" + name + "\ndoes not exist");
				break;
			case 2:
				alert("ERROR\nProbably file:\n" + name + "\ncorrupted");
				break;
			default:
				alert("ERROR\nfile:\n" + name);
				break;
		}
	}

	function parseBLOB(blob) {
		var parser;
		const filename = document.getElementById("files").value;
		if (filename.slice(-4) === ".fit") parser=fitParser;
		if (filename.slice(-4) === ".tkl") parser=tklParser;
		let timeStartParsing = performance.now();
		parser.parse(blob, function (error, data) {
			if (error) {
				errorNoFile(error,filename,2);
			  // remove the latest added options in the files				
			} else {
				let timeEndParsing = performance.now();
				console.log('file parsing takes: ' + parseFloat(timeEndParsing - timeStartParsing) + ' ms');
				//console.log(data);
				prepareFitData(data);
			}
		});
	}

	function prepareFitData(data) {
		activityLabel = new Date(data.sessions[0]["start_time"]).toISOString().slice(0, 10) + " " + data.sessions[0].sport;
		let D = new Date(data.records[0].timestamp);
		let timeoffset = D.getHours() + D.getMinutes() / 60;
		let paceFlag = false;
		let hreFlag = false;
		for (let k in data.records) {
			let record = data.records[k];
			D = new Date(record.timestamp);
			data.records[k].timestamp = D.getHours() + D.getMinutes() / 60 - timeoffset;
			data.records[k].distance = isNaN(record.distance) ? NaN : record.distance / 1000;
			paceFlag = paceFlag || ("speed" in record && !isNaN(record.speed)) ||
				("enhanced_speed" in record && !isNaN(record.enhanced_speed));
			if (paceFlag) {
				var speed = ("speed" in record && !isNaN(record.speed)) ? record.speed : record.enhanced_speed;
				data.records[k].pace = (speed > 0 ? 60 / speed : NaN);
				hreFlag = hreFlag || (paceFlag && "heart_rate" in record && !isNaN(record.heart_rate));
				if (hreFlag)
					data.records[k].HRE = (speed > 0 ? record.heart_rate * 60 / speed : NaN);
			}
		}
		paceFlag = false;
		hreFlag = false;
		for (let k in data.laps) {
			let record = data.laps[k];
			D = new Date(record.start_time);
			data.laps[k].start_time = D.getHours() + D.getMinutes() / 60 - timeoffset;
			paceFlag = paceFlag || ("avg_speed" in record && !isNaN(record.avg_speed)) ||
				("enhanced_avg_speed" in record && !isNaN(record.enhanced_avg_speed));
			if (paceFlag) {
				var speed = ("avg_speed" in record && !isNaN(record.avg_speed)) ? record.avg_speed : record.enhanced_avg_speed;
				data.laps[k].avg_pace = (speed > 0 ? 60 / speed : NaN);
				hreFlag = hreFlag || (paceFlag && "avg_heart_rate" in record && !isNaN(record.avg_heart_rate));
				if (hreFlag)
					data.laps[k].avg_HRE = (speed > 0 ? record.avg_heart_rate * 60 / speed : NaN);
			}
		}

		fitdata = data;

		// define yOptions for ylist dropbox
		let noXaxisFlag = (document.getElementById('xaxis').options.length == 0);
		let yOptionsHere = [];
		for (let [ykey, yrecords] of Object.entries({
				distance: "records",
				timestamp: "records",
				lap_number: "laps"
			})) {
			if (noXaxisFlag) document.getElementById('xaxis').options.add(new Option(ykey, ykey));
			for (let datarow of data[yrecords]) {
				for (let [key, value] of Object.entries(datarow)) {
					yOptionsHere[ykey] = yOptionsHere[ykey] || [];
					if (!yOptionsHere[ykey].includes(key)) yOptionsHere[ykey].push(key);
				}
			}
			yOptionsHere[ykey].sort();
		}
		yOptions = yOptionsHere;
		if (noXaxisFlag) document.getElementById('xaxis').value = "distance";
		cleanPlotFlag = noXaxisFlag;
		document.getElementById('xaxis').dispatchEvent(new Event('change'));

		const files = document.getElementById("files");
		const filename = files.options[files.selectedIndex].value;
		const filesText = activityLabel + " ["+ filename.replace(/^.*[\\\/]/, '').slice(0,10) + "..." + filename.slice(-4) + "]";
		files.options[files.selectedIndex].text = filesText;
		fitdataObj[filename] = {
			data: fitdata,
			yOptions: yOptions
		};

		prepareFitDataMap(fitdata);
	}

	function prepareFitDataMap(fitdata) {
		// now work with leaflet 
		let trackdata = [], latt_aver = 0, long_aver = 0, ncoor=0;
 		fitdata.records.forEach(element => {
			let x = element.position_lat;
			let y = element.position_long;
			if ( !( isNaN(x) || isNaN(y) ) ) { 
				trackdata.push([x, y]);
				latt_aver += x;
				long_aver += y;
				ncoor++;
			}
		});
		withGPS = trackdata.length > 0;
		if (withGPS) {
			mymap.setView([latt_aver/ncoor,long_aver/ncoor], 14);
			let givencolors = ["blue", "green", "magenta", "brown", "purple", "olive", "cyan"];
			let k = Ltracks.length % givencolors.length;
			let track = L.polyline(trackdata, {color: givencolors[k]}).addTo(mymap);
			Ltracks.push(track);

			const label = new Date(fitdata.sessions[0]["start_time"]).toISOString().slice(0, 10) 
				+ " " + fitdata.sessions[0].sport;
			//console.log(label);
			Lpopups.push(
				L.popup({
					autoClose: false
				}).setLatLng(trackdata[Math.round(Math.random() * (trackdata.length - 1) / 2)])
				.setContent(label).openOn(mymap)
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
				  [35.156025,33.3766633], // Nicosia
				//[55.752121, 37.617664], // Moscow
				//[55.830431, 49.066081] // Kazan
			];
			mymap.setView(faketrack[0], 14);
			mapSegment = L.polyline(faketrack, {
				color: "red",
				weight: 5
			}).addTo(mymap);
		}

	};


	document.getElementById('update').onclick = function (e) {
		if (document.getElementById('openmode').value === "manualmode") {
			document.getElementById('ylist').dispatchEvent(new Event('change'));
		} else {
			automodePlot(["heart_rate", "pace", "HRE"]) == 0 ?
				(automodePlot(["speed"]) == 0 ?
					(automodePlot(["total_elapsed_time", "avg_heart_rate", "avg_HRE"]) == 0 ?
						(automodePlot(["avg_pace", "avg_heart_rate", "avg_HRE"]) == 0 ?
							automodePlot(["altitude"]) : null) : null) : null) : null;
		}
	}

	document.getElementById('zoom').onchange = function (e) {
		let zoom = document.getElementById('zoom').value;
		chart.axisX[0].crosshair.set("enabled", zoom.indexOf("x") >= 0);
		for (let k = 0; k < chart.axisY.length; k++) {
			chart.axisY[k].crosshair.set("enabled", zoom.indexOf("y") >= 0);
		}
		//chart.set("zoomType", document.getElementById('zoom').value);
		chart.set("zoomType", zoom);
	}

	document.getElementById('clean').onclick = function (e) {
		// reset zoom
		chart.options.axisX.viewportMinimum = chart.options.axisX.viewportMaximum = null;
		// reset y-axis
		document.getElementById('ylist').value = null;
		for (let k = axisYops.length - 1; k >= 0; k--) {
			axisYops.pop()
		}
		for (let k = axisY2ops.length - 1; k >= 0; k--) {
			axisY2ops.pop()
		}
		for (let k = chartdata.length - 1; k >= 0; k--) {
			chartdata.pop()
		}
		chart.render();
	}

	document.getElementById('cleanMap').onclick = function (e) {
		if (withGPS) {
			Ltracks.forEach(b => {
				mymap.removeLayer(b)
			});
			Lpopups.forEach(b => {
				mymap.removeLayer(b)
			});
			mymap.removeLayer(mapSegmentInfo);
			mapSegment.setLatLngs([
				[]
			]);
		}
	}

	document.getElementById('reload').onclick = function (e) {
		setTimeout(function () {
			document.location.reload();
			//window.location.reload();
		}, 300);
	}

	document.getElementById("updateMap").onclick = function (e) {
		Object.values(fitdataObj).forEach(v=>{
			prepareFitDataMap(v.data);
		})
	}

	document.getElementById("selectURL").onchange = function (e) {
		document.getElementById('downloadURL').value = this.value;
	}


	//var csrf_token = "";
	document.getElementById("download").onclick = function (e) {
		let fileUrl; 
		// get_activity_summary
		// https://connect.garmin.com/proxy/activity-service/activity/6298180784 - gives summary as JSON
		// activity_details
		// https://connect.garmin.com/proxy/activity-service/activity/6298180784/details
		// strava
		// https://www.strava.com/activities/4813519589 // activity page
		// https://www.strava.com/activities/4813519589/export_original // download URL
		if ( document.getElementById('downloadURL').value.indexOf("garmin") > 0	)
			// garmin fit format;  was working  on 2021-03-06
			fileUrl = "https://connect.garmin.com/proxy/download-service/files/activity/xxxxxxxxxx";
		if ( document.getElementById('downloadURL').value.indexOf("strava") > 0	)
			// strava original fit format;  was working  on 2021-03-06
			fileUrl = "https://www.strava.com/activities/xxxxxxxxxx/export_original";
	    let id = document.getElementById('downloadURL').value.split("/").slice(-1);
		//id = "6277409729" // garmin;
		//id = "6277409729" // garmin;
		//console.log(id);
		let  downloadUrl = fileUrl.replace("xxxxxxxxxx",id);
		//console.log(downloadUrl);
		// to download the current id 
		window.location.href = downloadUrl;
		/*
		let response =  fetch(downloadUrl); //, {mode: "no-cors"});
		let blob =  response.arrayBuffer(); 
		let fileName = 'test.zip';
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
			fs.root.getFile(fileName, { create: true }, function (fileEntry) {
				fileEntry.createWriter(function (fileWriter) {
					fileWriter.addEventListener("writeend", function () {
						window.location = fileEntry.toURL();
					}, false);
					fileWriter.write(blob, "_blank");
				}, function () { });
			}, function () { });
		}, function () { });					
		*/
		// https://github.com/johannesh83/garmin-connect-export/blob/master/gcexport.py
	}

	document.getElementById("files").onchange = function (e) {
		const filename = document.getElementById("files").value;
		if(filename in fitdataObj) {
			fitdata = fitdataObj[filename].data;
			yOptions = fitdataObj[filename].yOptions;
			activityLabel = new Date(fitdata.sessions[0]["start_time"]).toISOString().slice(0, 10) + " " + fitdata.sessions[0].sport;
			document.getElementById("openmode").value = "manualmode";
			cleanPlotFlag = false;
			document.getElementById("xaxis").dispatchEvent(new Event("change"));
		}
		else { 
			makeXMLHttpRequest(filename);
		}
	}

	function httpRequestOnLoad() {
		if (this.readyState  === 4) {
		   if (this.status === 200) {
			   const blob = new Uint8Array(this.response);
			   parseBLOB(blob);
			}			
			if (this.status === 404) {
				const  filename = document.getElementById("files").value;
				errorNoFile("status 404",filename, 1);	
			}
		}		
	}

	const queryString = window.location.search; 
	const urlParams = new URLSearchParams(queryString);	
	if ( urlParams.get('file') != null ) {
		const filename = urlParams.get('file');
		const files = document.getElementById("files");
		files.options.add(new Option("filename", filename));
		files.value = filename;
		makeXMLHttpRequest( filename );
	}

	function makeXMLHttpRequest(filename) {
		//console.log(filename);    
		let filenamexhr = "./../" + filename.replace("plus","+");
		let xhr = new XMLHttpRequest();			
		xhr.onload = httpRequestOnLoad;
		xhr.open('GET', decodeURI(filenamexhr), true);
		xhr.responseType = 'arraybuffer';
		xhr.onerror = function (e) {
			console.log(error(xhr.statusText));	
			// remove the latest added options in the files
			document.getElementById("files").options.pop();  
		}
		xhr.send(null);				
	}

});