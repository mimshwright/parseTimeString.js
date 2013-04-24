parseTimeString.js
==================

A small function used to parse english strings describing a length of time into milliseconds.

Times can use multiple units. Each unit should be separated by a comma or a space. Units will only be detected if they are placed after the time value. All times will be returned in milliseconds. If no time unit is specified, the result will use null for the time unit and the synchronized action will use its default.

Usage
=====

`parseTimeString( timeString[, frameRate]);`

  - `timeString` A string representing some ammount of time.
  - `frameRate` An optional framerate value used for calculating frames. Default is 30.
  - Return an integer containing the time in milliseconds

 These are all valid options:

  - "1 hour, 2 minutes, 3 seconds, 4 milliseconds"
  - "1h2m3s4ms"
  - "5sec,12fr"†
  - "01:23:45;15"† (1h, 23m, 45s, 15fr)
  - ":03" (3s)
  - "300 frames"†
  - "1.25s"
  - "5 milliseconds, 15mins, 6 hrs"
  - "0.25 days"

 _†: Frames are interpereted based on the framerate you provide to the funciton. By default, 30fps is used._

Contribute
==========

All contributions are welcome but you must add a QUnit test case in `[test.html](http://htmlpreview.github.io/?https://github.com/mimshwright/parseTimeString.js/master/test.html)` for any new functionality.