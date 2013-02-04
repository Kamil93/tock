/**
* Tock by Mr Chimp - github.com/mrchimp/tock
* Based on code by James Edwards:
*    sitepoint.com/creating-accurate-timers-in-javascript/
*/

function Tock(options) {
    this.go = false;
    this.interval = options.interval || 10;
    this.countdown = options.countdown || false;
    this.final_time = 0;
    if (options.callback !== undefined) {
        this.callback = options.callback;
    } else {
        this.callback = function () {};
    }
    if (options.complete !== undefined) {
        this.complete = options.complete;
    } else {
        this.complete = function () {};
    }
}

/**
 * Reset the clock
 */
Tock.prototype.reset = function () {
    this.stop();
    this.start_time = 0;
    this.time = 0;
    this.elapsed = '0.0';
};

/**
 * Start the clock.
 */
Tock.prototype.start = function (time) {
    if (this.countdown === true) {
        this._startCountdown(time);
    } else {
        this._startTimer();
    }
};

/**
 * Stop the clock.
 */
Tock.prototype.stop = function () {
    this.go = false;
    this.final_time = (Date.now() - this.start_time);
    window.clearTimeout(this.timeout);
};

/** 
 * Get the current clock time in ms.
 * Use with Tock.msToTime() to make it look nice.
 */
Tock.prototype.lap = function () {
    if (this.go) {
        var now;

        if (this.countdown === true) {
            now = this.duration_ms - (Date.now() - this.start_time);
        } else {
            now = (Date.now() - this.start_time);
        }

        return now;
    }

    return this.final_time;
};

/**
 * Format milliseconds as a string.
 */
Tock.prototype.msToTime = function (ms) {
    var milliseconds = ms % 1000,
        seconds = Math.floor((ms / 1000) % 60).toString(),
        minutes = Math.floor((ms / (60 * 1000)) % 60).toString();
    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }
    if (minutes.length === 1) {
        minutes = '0' + minutes;
    }
    return minutes + ":" + seconds + ":" + milliseconds;
};

/**
 * Convert a time string "mm:ss" to milliseconds
 */
Tock.prototype.timeToMS = function (time) {
    var time_split = time.split(':')
    
    ms = parseInt(time_split[0], 10) * 60000;

    if (time_split.length) {
        ms += parseInt(time_split[1], 10) * 1000;
    }
    
    return ms;
}

/**
 * Called every tick for timer (count up) clocks.
 * i.e. once every this.interval ms
 */
Tock.prototype._tick = function () {

    // Increment the clock
    this.time += this.interval;

    // Get _accurate_ number of ticks since start
    // i.e. number of ticks their should have been
    this.elapsed = Math.floor(this.time / this.interval) / 10;

    // Convert to float if necessary
    if (Math.round(this.elapsed) === this.elapsed) { this.elapsed += '.0'; }

    // Check against system clock
    var t = this,
        // Get the current scope to pass to the timeout
        diff = (Date.now() - this.start_time) - this.time;

        // Run the callback function if there is one
    if (this.callback !== undefined) {
        this.callback(this);
    }

    // If we're still counting, keep ticking
    if (this.go) {
        this.timeout = window.setTimeout(function () { t._tick(); }, (this.interval - diff));
    }
};

/**
 * Called every tick for countdown clocks.
 * i.e. once every this.interval ms
 */
Tock.prototype._tickDown = function () {
    this.time += this.interval;
    this.clock_time = this.start_time;
    this.elapsed = Math.floor(this.time / this.interval) / 10;

    if (Math.round(this.elapsed) === this.elapsed) { this.elapsed += '.0'; }

    var t = this,
        diff = (Date.now() - this.start_time) - this.time;

    if (this.callback !== undefined) {
        this.callback(this);
    }

    if (this.duration_ms - this.time < 0) {
        this.final_time = 0;
        this.go = false;
        this.complete();
    }

    if (this.go) {
        this.timeout = window.setTimeout(function () { t._tickDown(); }, (this.interval - diff));
    }
};

/**
 * Called by Tock internally - use start() instead
 */
Tock.prototype._startCountdown = function (duration) {

    var t = this;

    this.duration_ms = duration;
    this.start_time = Date.now();
    this.end_time = this.start_time + this.duration;
    this.time = 0;
    this.elapsed = '0.0';
    this.go = true;

    this.timeout = window.setTimeout(function () { t._tickDown(); }, 100);
};

/**
 * Called by Tock internally - use start() instead
 */
Tock.prototype._startTimer = function () {
    this.start_time = Date.now();
    this.time = 0;
    this.elapsed = '0.0';
    this.go = true;

    var t = this;

    this.timeout = window.setTimeout(function () { t._tick(); }, 100);
};
