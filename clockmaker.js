(function (root, factory) {
  "use strict";

  // AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  }
  // CommonJS
  else if (typeof exports === 'object') {
    module.exports = factory();
  }
  // Browser
  else {
    var clockmaker = factory();

    Object.keys(clockmaker).forEach(function(key) {
      var exported = clockmaker[key];

      var previous = root[key];

      // every export gets a .noConflict() method to allow clients to restore
      // the previous values for the overridden global scope keys
      exported.noConflict = function() {
        root[key] = previous;
        return exported;
      };

      root[key] = exported;
    });
  }
}(this, function () {
  "use strict";

  /** Function binder */
  var __bind = function(fn, fnThis) {
    return function() {
      fn.apply(fnThis, arguments);
    };
  };


  var Clockmaker = {};


  /** 
   * Construct a new timer
   *
   * @param {Function} fn The handler function to invoke on each tick.
   * @param {Number} delayMs The timer delay in milliseconds.
   * @param {Object} [options] Additional options.
   * @param {Object} [options.thisObj] The `this` object to invoke `fn` with. If ommitted then `fn` is used as `this`.
   * @param {Boolean} [options.repeat] Whether the timer should keep repeating until we stop it.
   * @param {Boolean} [options.async] Whether `fn` is asynchronous (i.e. accepts a callback).
   * @param {Function} [options.onError] Function to call if `fn` throws an error.
   *
   * @return {Timer} A `Timer`.
   */
  var Timer = Clockmaker.Timer = function(fn, delayMs, options) {
    if (!(this instanceof Timer)) {
      return new Timer(fn, delayMs, options);
    }

    this._fn = fn;
    this._delayMs = delayMs;

    options = options || {};
    this._fnThis = options.thisObj || this._fn;
    this._repeat = !!options.repeat;
    this._onError = options.onError;
    this._async = !!options.async;

    this._state = 'stopped';
    this._timerHandle = null;
    this._runCount = 0;

    this._doTick = __bind(this._doTick, this);
    this._doAfterTick = __bind(this._doAfterTick, this);
  };



  /**
   * Schedule next timer tick.
   */
  Timer.prototype._scheduleNextTick = function() {
    // currently stopped?
    if ('stopped' === this._state) {
      return;
    }

    // only do once?
    if (0 < this._runCount && !this._repeat) {
      this._state = 'stopped';
      return;
    }

    this._timerHandle = setTimeout(this._doTick, this._delayMs);
  };




  /**
   * Execute a timer tick, i.e. execute the callbak function.
   */
  Timer.prototype._doTick = function() {
    this._runCount++;

    try {
      if (this._async) {
        this._fn.call(this._fnThis, this, this._doAfterTick);
      } else {
        this._fn.call(this._fnThis, this);
        this._doAfterTick();
      }
    } catch (err) {
      this._doAfterTick(err);
    }
  };



  /**
   * Timer tick execution completed, now handle any errors.
   */
  Timer.prototype._doAfterTick = function(err) {
    if (err && this._onError) {
      this._onError(err);
    }

    this._scheduleNextTick();
  };



  /**
   * Start the timer.
   * @return {this}
   */
  Timer.prototype.start = function() {
    if ('started' === this._state) {
      return;
    }

    this._state = 'started';
    this._scheduleNextTick();

    return this;
  };



  /**
   * Re-synchronise the tick schedule.
   *
   * This resets the internal timer to start from now.
   *
   * @return {this}
   */
  Timer.prototype.synchronize = function() {
    if (this._timerHandle) {
      clearTimeout(this._timerHandle);
      this._timerHandle = null;
    }

    this._scheduleNextTick();

    return this;
  };




  /**
   * Stop the timer.
   * @return {this}
   */
  Timer.prototype.stop = function() {
    if (this._timerHandle) {
      clearTimeout(this._timerHandle);
      this._timerHandle = null;
    }

    this._state = 'stopped';

    return this;
  };



  /**
   * Set the timer delay in milliseconds.
   * @return {this}
   */
  Timer.prototype.setDelay = function(delayMs) {
    this._delayMs = delayMs;

    return this;
  };



  /**
   * Get the timer delay.
   * @return {Integer} The current timer delay in milliseconds.
   */
  Timer.prototype.getDelay = function() {
    return this._delayMs;
  };



  /**
   * Get the no. of times the timer has ticked.
   * @return {Integer} The no. of times the timer has ticked.
   */
  Timer.prototype.getNumTicks = function() {
    return this._runCount;
  };



  /**
   * Get whether this timer has stopped.
   */
  Timer.prototype.isStopped = function() {
    return 'stopped' === this._state;
  };




  /**
   * Manage a collection of `Timer` objects.
   *
   * @constructor
   */
  var Timers = Clockmaker.Timers = function() {
    if (!(this instanceof Timers)) {
      return new Timers();
    }

    this._timers = [];
  };



  /**
   * Create a new timer and add it to this collection.
   *
   * @see Timer()

   * @return {Timer} The new `Timer`, not yet started.
   */
  Timers.prototype.create = function(fn, delayMs, options) {
    var t = new Timer(fn, delayMs, options);

    this._timers.push(t);

    return t;
  };



  /**
   * Add a timer to this collection.
   *
   * @param {Timer} timer The timer.
   * @return this
   */
  Timers.prototype.add = function(timer) {
    this._timers.push(timer);
    return this;
  };



  /**
   * Start all the timers.
   * @return this
   */
  Timers.prototype.start = function() {
    this._timers.forEach(function(t) {
      t.start();
    });

    return this;
  };


  /**
   * Stop all the timers.
   * @return this
   */
  Timers.prototype.stop = function() {
    this._timers.forEach(function(t) {
      t.stop();
    });

    return this;
  };



  return Clockmaker;

}));



