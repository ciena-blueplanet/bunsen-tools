require('colors')

module.exports = function (verbose) {
  this.verbose = verbose
  this.log = (msg) => {
    if (this.verbose) {
      console.log(msg)
    }
  }

  this.success = (msg) => {
    console.log('\nSUCCESS: '.green + '\n' + msg)
  }

  this.info = (msg) => {
    console.info('INFO: '.cyan + msg)
  }

  this.error = (msg) => {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg, null, 2)
    }
    console.error('ERROR: '.red + msg)
  }

  this.warn = (msg) => {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg, null, 2)
    }
    console.warn('WARNING: '.yellow + msg)
  }

  this.print = (msg) => {
    console.log(msg)
  }
}
