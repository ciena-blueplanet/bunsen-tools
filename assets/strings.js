'use strict'

require('colors')
var _ = require('lodash')
var Logger = require('../lib/logger')

const DIVIDER = '------------------------------'

const CHANGE_OBSERVED =
`
<FILENAME> changed, re-validating...
`

const CONVERTING =
`
${DIVIDER}${DIVIDER}
CONVERTING <FILENAME>`

const CONVERTED =
`Tada! ┬─┬ ノ( ^_^ノ)'
<INFILE> has been converted to <OUTFILE>
${DIVIDER}${DIVIDER}
`

const NO_VIEW_TYPE = 'Not a valid Bunsen or UI Schema view'

const INVALID =
`Dang! (╯°□°)╯︵ ┻━┻')
<FILENAME> is not valid

<ERROR>
${DIVIDER}${DIVIDER}
`

const INVALID_JSON = 'Unable to parse JSON'

const VALID =
`Tada! ┬─┬ ノ( ^_^ノ)
<FILENAME> is a <MSG>
${DIVIDER}${DIVIDER}
`

const VALIDATING =
`
${DIVIDER}${DIVIDER}
Validating <FILENAME>
`

const STRINGS = {
  conversion: {
    onConverted: CONVERTED,
    onConverting: CONVERTING,
    errors: {
      noViewType: NO_VIEW_TYPE,
      invalidJson: INVALID_JSON
    }
  },
  validation: {
    onChangeObserved: CHANGE_OBSERVED,
    onInvalid: INVALID,
    onValid: VALID,
    onValidating: VALIDATING
  }
}

module.exports = {
  strings: STRINGS,
  fillString: (string, args) => {
    let logger = new Logger()
    let stringAsset = _.get(STRINGS, string)
    if (!stringAsset) {
      logger.error('Requested a non-existant string asset')
    }
    return _.reduce(args, (result, arg) => {
      return result.replace(/<\w+>/, arg)
    }, stringAsset)
  }
}
