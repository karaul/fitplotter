# fitplotter

A simple one-page tool to plot parameters recorded in the `*.fit` file used by Garmin and Suunto.

Starting from 2021-03-03, it also works with `*.tkl` format (watch models: GPSmaster, navrun-500, ultrasport, etc).

Version [online](https://karaul.github.io/fitplotter). Raw fit- file[viewer](https://www.fitfileviewer.com/)

If you have no own fit files at the moment, you can download them from [examples](https://github.com/karaul/fitplotter/blob/main/examples/).

From 2021-03-08 you can download `*.fit` file from your _Garmin Connect_ account, for how to do it read  __Usage__ section below.

Check the wrapper for `fitplotter` is [fitalyser](https://github.com/karaul/fitalyser) - parallel project.

Check  [GChandler](https://github.com/karaul/gchandler) - download automatically new activities from Garnmin Connect to the local storage


![Alt text](https://github.com/karaul/fitplotter/blob/main/screenshots/screenshot.JPG?raw=true)

## Motivation

Garmin device does  recording the measured paremeters into a binary `.fit` file as a function of time and distance. Then, in Garmin Connect you can visualise these metrics in graphs. I found Garmin Connect a bit inconvenient for everyday analysis. For instance, I could not check heart rate efficiency (HRE) (if you do not know read about HRE [here](https://drive.google.com/file/d/17wK0y5p7rYlMRBogpZ9yicdnV191E1qx/view?usp=sharing) and  [in Russian here](https://grumbler.livejournal.com/104934.html)) during the run. Then, the data from different days could not be visualised in one plot. Also, it is not convenient in Garmin Connect to see simultaneously a pointer in the plot and on the GPS track. Moreover, Garmin Connect is slow, and it's always better to keep your files in your local storage and have opportunity to check them.  And finally, I wanted to learn JS programming.

## Features

- Work with any `*.fit` file (Garmin, Suunto);
- Work with `*.tkl` (sport watch models: GPSmaster, navrun-500, ultrasport, etc);
- Plot data from different files in one plot;
- Independent y-axes;
- hide/unhide curves by clicking on curve's name in the below legend;
- Synchronization of the plot pointer at the left with the map marker on the right;
- zoom of plot area by mouse click;
- Automatically calculate an average of the plotted parameters in the zoomed area;
- Visualise laps;
- Can remove spikes and  make noisy data smooth;
- Calculate breath_rate during the run, if HRV is on in the settings;

## Installation

### Installation for non-programmers who found this program in github

- click on the green button and download everything as zip file
- unzip
- Double click on index.html

### Installation for programmers who found it in github

`git clone https://github.com/karaul/fitplotter.git`

## Usage

Press button "Choose file" and select a `*.fit` file to analyse. In the Garmin unit,  `*.fit` files are in the folder "activities", which can be seen when you connect Garmin  with PC via USB. Or you can download your fit files from Garmin Connect. Also, you can play with `*.fit` files located for the demonstration purpose in the folder [examples](https://github.com/karaul/fitplotter/blob/main/examples/)

If everything works fine, after you open the `.fit` file, you will see a graph on the left and map on the right. Few screenshots are in the folder [screenshots](https://github.com/karaul/fitplotter/blob/main/screenshots/). Play with droplists: x-axis, y-axis, automode/manual add. Zoom area in the left graph and then see the averaged over the zoomed area on the right map. Click on the legend with different choice in the bottom droplist.

### In order to download `*.fit` file from _Garmin Connect_ account

- Login to _Garmin Connect_ (GC) account;
- Navigate to the activity URL `https://connect.garmin.com/modern/activity/xxxxxxxxxx`;
- The latest 10-digits number `xxxxxxxxx`in the _Garmin Connect_ URL is `acitvity ID`;
- Type in the `fitplotter`'s URL field the noticed `activity ID`;
- Click Download, wait a bit and save your zipped activity taken from _Garmin Connect_ into the local folder;
- Unzip the activity in your local folder;
- Click "Choose file" and load the activity as a local file into `fitplotter`

Russians may also check [ЧАВО](https://github.com/karaul/fitplotter/blob/main/screenshots/FAQ_ru.md)

## Contributors

[fit-file-parser](https://github.com/jimmykane/fit-parser) by Dimitrios Kanellopoulos. This  was taken and modified to get it working with HTML5 but with http static server.

[BackFitClientSide](https://github.com/gfmoore/BackFitClientSide) by Gordon Moore who demonstrated how to work without a server

[Sarah Lucke](https://github.com/SarahLucke) who explained me how to make an online fitplotter version based on the github repository

Thanks are to CanvasJS and Leaflet libraries for smooth work of the application.

## License

MIT license

(c) Evgeny Votyakov aka karaul ([about me](http://www.irc-club.ru/karaul.html) in Russian), Nicosia, Cyprus, 2021
