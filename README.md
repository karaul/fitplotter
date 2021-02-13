# fitplotter

A simple one-page tool to plot parameters recorded in the \*.fit file used by Garmin and Suunto.

## Motivation 

Garmin device does  recording the measured paremeters into a binary \*.fit file as a function of time and distance. Then, in Garmin Connect you can visualise these metrics in graphs. I found Garmin Connect a bit inconvenient for everyday analysis. For instance, I could not check heart rate efficiency (HRE) (if you do not know read about HRE [here](https://drive.google.com/file/d/17wK0y5p7rYlMRBogpZ9yicdnV191E1qx/view?usp=sharing) and   [in Russian here](https://grumbler.livejournal.com/104934.html)) during the run. Then, the data from different days could not be visualised in one plot. Also, it is not convenient in Garmin Connect to see simultaneously a pointer in the plot and on the GPS track. Moreover, Garmin Connect is slow, and it's always better to keep your files in your local storage and have opportunity to check them.  And finally, I wanted to learn JS programming.

## Features 

- Works with any \*.fit file (Garmin, Suunto)
- Plot data from different \*.fit files in one plot;
- Independent y-axes;
- hide/unhide curves by clicking on curve's name in the below legend;
- Synchronization of the plot pointer at the left with the map marker on the right;
- zoom of plot area by mouse click;
- Automatically calculate an average of the plotted parameters in the zoomed area;
- Visualise laps

## Installation

##### Installation for non-programmers who have a trusted link to  \*.zip files (to avoid malware the link must be obtained from me personally by email).

- Download fitplotter.zip and unzip. 
- Download http-server-static.zip and unzip next to the folder "fitplotter" created by unzipping fitplotter.zip
- Double click on fitplotter.bat to launch the program. If it  does not start, check paths inside fitplotter.bat.
- Inside the programm, press button "Choose file" and select a \*.fit file to analyse. In the Garmin unit,  \*.fit files are in the folder "activities", which can be seen when you connect Garmin  with PC via USB. Or you can download your fit files from Garmin Connect. Also, you can play with \*.fit files located for the demonstration purpose in the folder "examples."

##### Installation for non-programmers who found this program in github

- download everything as zip file and unzip. 
- Install [nodejs](https://nodejs.org/en/) in your system. 
- Put in fitplotter.bat proper path into the installed node.exe
- Double click on fitplotter.bat

##### Installation for programmers who found it in github
```
github clone https://github.com/karaul/fitplotter 
node .
```

##### Installation if you have own http-server 

Download only index.html and ./src/\*
Open index.html inside your http-server.

## How it works

fitplotter needs an http-server to read local files. It has the own simple server working with node.exe located in the folder http-server-static. If you know what is the http-server and also have it installed and you want to use the own one, you can do it. Otherwise, double click on the file fitplotter.bat in order to launch http-server-static.js by means of \_node.exe located in http-server-static folder and then a new window in your browser will be opened with the start page of the program.

File \_node.exe located the folder http-server-static. This is the most heavy file of the installation (23mb zipped).

[Good explanation](https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally) why http-server is needed and how to get it working

## Contributors

[fit-file-parser](https://github.com/jimmykane/fit-parser) by Dimitrios Kanellopoulos was taken and modified to get it working with HTML5.

Many thanks are to CanvasJS and Leaflet libraries for smooth work of the application.

## License

MIT license


(c) Evgeny Votyakov aka karaul ([about me](http://www.irc-club.ru/karaul.html) in Russian), Nicosia, Cyprus, 2021
