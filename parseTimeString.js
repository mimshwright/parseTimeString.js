 /**
 * Parses a string into milliseconds.
 * Times can use multiple units. Each unit should be separated by a comma or a space.
 * Units will only be detected if they are placed after the time value. 
 * All times will be returned in milliseconds.
 * If no time unit is specified, the result will use null for the time unit and
 * the synchronized action will use its default.
 *
 * @author Mims Wright
 * @example
 * <p>
 * These are all valid options: <br />
 * "1 hour, 2 minutes, 3 seconds, 4 milliseconds" <br />
 * "1h2m3s4ms"  <br />
 * "5sec,12fr"†  <br />
 * "01:23:45;15"† (1h, 23m, 45s, 15f - frames are based on the parser's framerate which defaults to 30fps)  <br />
 * ":03" (3s)  <br />
 * "300 frames"†  <br />
 * "1.25s"  <br />
 * "5 milliseconds, 15mins, 6 hrs"  <br />
 * "0.25 days"  <br />
 * </p>
 *
 * <p><em>
 * †: Frames are interpereted based on the framerate you provide to
 *    the funciton. By default, 30fps is used.
 * </em></p>
 *
 * @param {String} timeString a string representing some ammount of time.
 * @param {Number} [frameRate=30] An optional framerate value used for calculating frames.
 * @return {Number} An integer containing the time in milliseconds.
 */
function parseTimeString (timeString, frameRate) {
    // define an object to hold the results
    var result = 0;

    // These contstant values are used for conversions and for matching patterns in the algorithm.
    var MILLISECONDS_VALUE = 1;
    var SECONDS_VALUE = 1000;
    var MINUTES_VALUE = 60000;
    var HOURS_VALUE = 3600000;
    var DAYS_VALUE = 86400000;

    var DEFAULT_FRAME_RATE = 30;

    var NUMBER_UNIT_PAIR_SEARCH = /(\d*\.?\d+)\s*[a-z]+\s*,?\s*/g;
    var NUMBER_SEARCH = /\d*\.?\d+/g;
    var LETTER_SEARCH = /[a-z]+/;
    var NEGATIVE_SEARCH = /^-.+/;

    var FRAMES_SEARCH = /([^a-z]|^)(f|fr|frames?)/;
    var MILLISECONDS_SEARCH = /([^a-z]|^)(ms|msecs?|milliseconds?)/;
    var SECONDS_SEARCH = /([^a-z]|^)(s|secs?|seconds?)/;
    var MINUTES_SEARCH = /([^a-z]|^)(m|mins?|minutes?)/;
    var HOURS_SEARCH = /(h|hrs?|hours?)/;
    var DAYS_SEARCH = /(d|days?)/;
    var TIMECODE_FORMAT_SEARCH = /(\d\d?)?(:\d\d)+(;\d\d)?/;
    var TIMECODE_SEGMENT_SEARCH = /(^\d\d?)|(:\d\d)/g;
    var TIMECODE_FRAME_SEARCH = /;(\d\d)/;
    var TIMECODE_DIGIT_SEARCH = /(\d\d?)/;

    if (!frameRate) {
        frameRate = DEFAULT_FRAME_RATE;
    }

    /** Convert milliseconds to frames based on the frame rate. */
    function framesToMilliseconds(frames) {
        return Math.ceil(frames / frameRate * 1000);
    }

    // if string contains only a number value, return it and don't specify a time unit
    if (!isNaN(timeString)) {
        result = parseInt(timeString,10);
        return result;
    }

    // if the first character is a negative sign, make the entire number negative.
    var negate = false;
    if (timeString.match(NEGATIVE_SEARCH)) {
        timeString = timeString.substr(1);
        negate = true;
    }

    // make time string not case sensitive
    timeString = timeString.toLocaleLowerCase();

    // Process timecode from time string if it extists.
    if (timeString.search(TIMECODE_FORMAT_SEARCH) >= 0) {
        var ms = 0;

        // Extract the times from the timecode if there are any.
        var timeMatch = timeString.match(TIMECODE_SEGMENT_SEARCH);
        if (timeMatch && timeMatch.length >= 1) {
            timeMatch = timeMatch.reverse();

            // Timecodes with more than 4 segments aren't supported
            if (timeMatch.length > 4) {
                throw new SyntaxError("The timecode wasn't formatted correctly. It has too many segments.");
            }


            // check for seconds
            if (timeMatch[0]) {

                ms = timeMatch[0].toString().match(TIMECODE_DIGIT_SEARCH)[0] * SECONDS_VALUE;
                result += ms;
            }
            // check for minutes
            if (timeMatch[1]) {
                ms = timeMatch[1].toString().match(TIMECODE_DIGIT_SEARCH)[0] * MINUTES_VALUE;
                result += ms;
            }
            // check for hours
            if (timeMatch[2]) {
                ms = timeMatch[2].toString().match(TIMECODE_DIGIT_SEARCH)[0] * HOURS_VALUE;
                result += ms;
            }
            // check for days
            if (timeMatch[3]) {
                ms = timeMatch[3].toString().match(TIMECODE_DIGIT_SEARCH)[0] * DAYS_VALUE;
                result += ms;
            }
        }

        // Extract the frames from the timecode if there are any.
        var frameMatch = timeString.match(TIMECODE_FRAME_SEARCH);
        if (frameMatch && frameMatch.length >= 1) {
            ms = framesToMilliseconds(frameMatch[0].toString().match(TIMECODE_DIGIT_SEARCH)[0]);
            result += ms;
        }
        return result;

    } // end timecode parsing


    // separate by number / unit pairs separated by spaces or commas.
    var unitValuePairs = timeString.match(NUMBER_UNIT_PAIR_SEARCH);
    // if there are no pairs, the data is malformed.
    if (unitValuePairs.length < 1) {
        throw new SyntaxError("The input object contains malformed data: " + timeString);
    }

    // for each unit value pair...
    for (var i in unitValuePairs) {
        var pair = unitValuePairs[i];

        // separate the number from the text unit identifier
        var time = Number(pair.match(NUMBER_SEARCH)[0]);
        var timeUnit = pair.match(LETTER_SEARCH)[0];

        //based on the time unit, convert the time value to milliseconds
        if (timeUnit.search(FRAMES_SEARCH) >= 0) {
            // Convert frames to milliseconds
            time = framesToMilliseconds(time);
        } else {
            if (timeUnit.search(MILLISECONDS_SEARCH) >= 0) {
                time *= MILLISECONDS_VALUE;
            } else if (timeUnit.search(SECONDS_SEARCH) >= 0) {
                time *= SECONDS_VALUE;
            } else if (timeUnit.search(MINUTES_SEARCH) >= 0) {
                time *= MINUTES_VALUE;
            } else if (timeUnit.search(HOURS_SEARCH) >= 0) {
                time *= HOURS_VALUE;
            } else if (timeUnit.search(DAYS_SEARCH) >= 0) {
                time *= DAYS_VALUE;
            } else {
                // this is probably a different type of unit.
                throw new SyntaxError("The input object contains malformed data.");
            }
        }
        time = Math.round(time);
        result += time;
    }

    // apply the negation if necessary.
    if (negate) result *= -1;

    // return the result as an integer
    return Math.floor(result);
}