require('colors')

module.exports = function (verbose) {
  this.verbose = verbose
  this.log = (msg) => {
    if (this.verbose) {
      console.log('LOG: ' + msg)
    }
  }

  this.info = (msg) => {
    console.info('INFO: '.blue + msg)
  }

  this.error = (msg) => {
    if (this.verbose) {
      console.error('ERROR: '.red + msg)
    }
  }

  this.warning = (msg) => {
    console.warning('WARNING: '.yellow + msg)
  }
}
