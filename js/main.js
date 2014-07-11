var MINI = require('minified');
var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

$.ready(function() {

  // in order to simulate console.log and console.error for each code example
  // we are going to create multiple console* objects. So we need to keep track 
  // of how many we've done so far
  var consolesCreated = 0;

  // make each section example work
  $('.examples section').each(function(e) {
    e = $(e);

    var outputDiv = $('.output', e);

    var _refreshScroll = function() {
      outputDiv[0].scrollTop = outputDiv[0].scrollHeight;
    }

    // create 'console' shim
    var _console = {
      log: function(msg) {
        outputDiv.add(EE('p', msg));
        _refreshScroll();
      },
      error: function(err) {
        outputDiv.add(EE('p', { '@class' : 'error' }, err.toString()));
        _refreshScroll();
      },  
      action: function(msg) {
        outputDiv.add(EE('p', { '@class' : 'action' }, '>> ' + msg));
        _refreshScroll();
      }
    };
    var _myConsoleName = 'console' + (++consolesCreated);
    window[_myConsoleName] = _console;

    var timer = eval($('pre', e).text().replace(/console\./mg, _myConsoleName + '.'));
    if (!timer._onError) {
      timer._onError = console.error;      
    }

    $('button', e).on('click', function(e) {
      e.preventDefault();
      outputDiv.show();

      if ('start' === $(this).text().toLowerCase()) {
        _console.action('timer.start()');
        timer.start();
      } else if ('stop' === $(this).text().toLowerCase()) {
        _console.action('timer.stop()');
        timer.stop();
      } else if ('synchronize' === $(this).text().toLowerCase()) {
        _console.action('timer.synchronize()');
        timer.synchronize();
      }
    });
  });

});