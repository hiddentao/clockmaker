# Clockmaker

[![Build Status](https://secure.travis-ci.org/hiddentao/clockmaker.png)](http://travis-ci.org/hiddentao/clockmaker)

Flexible timers for Javascript which can be paused and modified on-the-fly.

Clockmaker is inspired by [Mozilla's MiniDaemon](https://developer.mozilla.org/en-US/docs/Web/API/window.setInterval#A_little_framework) and provides an alternative to the built-in `setTimeout` and `setInterval` functions. It is 
especially useful when you are running multiple timers and wish to exercise 
better control over them.

Demo: [http://hiddentao.github.io/clockmaker/](http://hiddentao.github.io/clockmaker/)

Features:

* Stop and restart timers.
* Change the timer interval in real-time.
* Start and stop multiple timers in one go.
* Robust error handling.
* Uses method chaining for ease of use.
* Works in node.js and in the browser.
* Has no other dependencies.
* Small: <1 KB minified and gzipped.

## Installation

### node.js

Install using [npm](http://npmjs.org/):

    $ npm install clockmaker

### Browser

Use [bower](https://github.com/bower/bower):

    $ bower install clockmaker

## How to use

These examples are all running in node.js. At the top of each example assume 
you have the following:

```javascript
var Timer = require('clockmaker').Timer,
    Timers = require('clockmaker').Timers;
```



### Single-run timer

The basic `Timer` works in the same way as `setTimeout`:

```javascript
Timer(function(timer) {
  console.log(timer.getDelay() + ' millseconds done');
}, 2000).start();
```

Notice how `start()` needs to be called to kick-off the timer. Also notice how the `Timer` instance is passes as an argument to the handler, allowing us to query and control the timer from within our handler.

You can also explicitly construct the `Timer` object:

```javascript
var timer = new Timer(function() {
  console.log('2 seconds done');
}, 2000);

timer.start();
```

Once a basic timer has ticked and invoked its handler it cannot be started again:

```javascript
var timer = new Timer(function() {
  console.log('2 seconds done');
}, 2000);

timer.start();
timer.isStopped();  // false

// ... >2 seconds later

timer.start();      // has no effect
timer.isStopped();  // true
```

And you can stop a timer from executing its handler in the first place:

```javascript
var timer = new Timer(function() {
  console.log('You should never see this line');
}, 2000);

timer.start();
timer.isStopped();  // false

// ... <2 seconds later

timer.stop();
timer.isStopped();  // true
```


### Repeating timer

You can simulate `setInterval` behaviour by setting `repeat: true` in the options.

```javascript
Timer(function(timer) {
  console.log('Another 2 seconds passed. Number of ticks so far: ' + timer.getNumTicks());
}, 2000, {
  repeat: true
}).start();
```

The `getNumTicks()` method tells you how many times the timer has ticked. Let's stop the timer after 10 ticks:

```javascript
Timer(function(timer) {
  console.log('Another 2 seconds passed');

  if (10 === timer.getNumTicks()) {
    timer.stop();
  }
}, 2000, {
  repeat: true
}).start();
```

You can change the delay interval in real-time:

```javascript
Timer(function(timer) {
  console.log('Next tick will take 1 second longer');

  timer.setDelay(timer.getDelay() + 1000);
}, delayMs, {
  repeat: true
}).start();
```

Let's stop and restart the timer using a second timer:

```javascript
var timer = new Timer(function() {
  console.log('Another 2 seconds done');
}, 2000, {
  repeat: true
});

timer.start();


// This second timer which will stop/start the first timer every 5 seconds
Timer(function() {
  if (timer.isStopped()) {
    timer.start();
  } else {
    timer.stop();
  }
}, 5000, {
  repeat: true
}).start();
```

A timer does not keep track of how much time has elapsed when it gets stopped. 
So when it gets started again it resumes with the full time delay.


### Asynchronous handlers

The timer waits for the handler to finish executing before scheduling the next 
tick. But what if the handler is asynchronous? you can inform the timer of 
this and be given a callback:

```javascript
var timer = new Timer(function(timer, cb) {
  // ... do some stuff
  cb();
}, 2000, {
  repeat: true,
  async: true
});

timer.start();
```

In this case, until your handler invokes the `cb()` callback (see above) the timer will not schedule the next tick. This allows you to decide whether you want to schedule 
the next tick straight away (i.e. calling `cb()` straight away) or once all necessary work inside the handler is done (i.e. calling `cb()` at the end).

You can also use the callback to [handle errors](#handling-errors).

### This context

The `this` context for the handler function can be set:

```javascript
var ctx = {
  dummy: true
};

new Timer(function() {
  console.log(this.dummy);  // true
}, 2000, {
  thisObj: ctx
}).start();
```


### Synchronize to now

Sometimes you may want to reset a timer that's already running, i.e. stop and 
then restart it without actually having to do so:

```javascript
/*
In this example the second timer keeps 'resetting' the first one every 100ms. 
The net effect is that the first timer never actually completes a tick.
 */
var timer = new Timer(function() {
  console.log('hell world');  // this never gets executed
}, 2000);

timer.start();

Timer(function() {
  timer.synchronize();
}, 100).start();
```

### Handling errors

You can pass in an `onError` handler to be informed of errors:

```javascript
new Timer(function() {
  throw new Error('A dummy error');
}, 2000, {
  onError: function(err) {
    console.error(err);  // A dummy error
  }
}).start();
```

Error handling works for asynchronous handlers too:

```javascript
new Timer(function(timer, cb) {
  cb(new Error('A dummy error'));
}, 2000, {
  async: true,
  onError: function(err) {
    console.error(err);  // A dummy error
  }
}).start();
```

_Note: If you don't pass in an `onError` handler then errors are ignored._

### Multiple timers

You can control multiple timers at a time by using the `Timers` interface.

```javascript
var timers = new Timers();

var timer1 = timers.create(handlerFn, 2000, { repeat: true });
var timer2 = timers.create(aletFn, 1000);
var timer3 = ...

timer1.start(); // you can start them one a a time, or...

timers.start(); // ...start them all at once

... // some time later

timers.stop();  // stop all timers
```

## noConflict

If you're using Clockmaker in a browser app and are not using an AMD or 
CommonJS module system then it will add two new items into the global scope:

* `Timer`
* `Timers`

If these clash with existing values in your global scope then you can use the 
`.noConflict()` method calls to restore your existing values:

```javascript
// assume we're running in browser global scope, i.e. window

var Timer = 'my timer class';
var Timers = 'my timers class';

// ... load clockmaker ...

console.log(Timer); // Function
console.log(Timers); // Function

// restore my definitions

var ClockmakerTimer = Timer.noConflict();
var ClockmakerTimers = Timers.noConflict();

console.log(Timer); // 'my timer class'
console.log(Timers); // 'my timers class'
```


## Building

To build the code and run the tests:

    $ npm install -g gulp
    $ npm install
    $ gulp build


## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/clockmaker/blob/master/CONTRIBUTING.md).


## License

MIT - see [LICENSE.md](https://github.com/hiddentao/clockmaker/blob/master/LICENSE.md)