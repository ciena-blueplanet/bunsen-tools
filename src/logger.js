require('colors')

const logLevelColors = {
  error: 'red',
  info: 'cyan',
  success: 'green',
  warn: 'yellow'
}

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

  /**
   * Print message
   * @param {String} msg - message to print
   */
  this.print = (msg) => {
    console.log(msg)
  }

  /**
   * Generate methods for various log levels
   */
  for (var logLevel in logLevelColors) {
    if (!logLevelColors.hasOwnProperty(logLevel)) {
      continue
    }

    /**
     * Log message at a given log level
     * @param {String} msg - message to log
     */
    this[logLevel] = (msg) => {
      const color = logLevelColors[logLevel]
      const label = logLevel.toUpperCase()[color]
      const sep = logLevel === 'success' ? '\n' : ' '

      if (msg instanceof Object) {
        msg = JSON.stringify(msg, null, 2)
      }

      console[logLevel](`${label}:${sep}${msg}`)
    }
  }
}
