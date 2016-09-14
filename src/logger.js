require('colors')

module.exports = function (verbose) {
  /**
 * Verbose flag
 * @type {Boolean}
 */
  this.verbose = verbose

  /**
   * Log message when verbose flag is enabled
   * @param {String} msg - message to log
   */
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

  /**
   * Print message
   * @param {String} msg - message to print
   */
  this.print = (msg) => {
    console.log(msg)
  }
}
