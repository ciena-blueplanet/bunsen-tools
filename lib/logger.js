'use strict';

require('colors');

module.exports = function (verbose) {
  var _this = this;

  this.verbose = verbose;
  this.log = function (msg) {
    if (_this.verbose) {
      console.log('LOG: ' + msg);
    }
  };

  this.info = function (msg) {
    console.info('INFO: '.blue + msg);
  };

  this.error = function (msg) {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg, null, 2);
    }

    console.error('ERROR: '.red + msg);
  };

  this.warning = function (msg) {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg, null, 2);
    }
    console.warning('WARNING: '.yellow + msg);
  };
};