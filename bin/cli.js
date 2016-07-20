'use strict'

const commander = require('commander')
const Promise = require('promise')
const fsp = require('fs-promise')
const _ = require('lodash')
const Logger = require('../lib/logger')
let logger

function main (infile, outfile) {
  return readFile(infile).then((results) => {
    return results
  }).then((results) => {
    return parseJSON(results).then((results) => {
      return results
    }).catch((err) => {
      logger.log('ERROR: ' + err)
    })
  }).then((results) => {
    return convert(results)
  }).then((ui2) => {
    return writeFile(outfile, ui2).then((data) => {
      return data
    })
  })
}

function readFile (file) {
  logger.log('reading ' + file)
  return fsp.readFile(file, 'utf8').then((results) => {
    return results
  })
}

function writeFile (outfile, data) {
  logger.log('writing file...')
  return fsp.writeFile(outfile, `${JSON.stringify(data, null, 2)}\n`).then(() => {
    return data
  })
}

function parseJSON(string) {
  let results
  try {
    results = JSON.parse(string)
  } catch (err) {
    console.error(err)
    return Promise.reject('JSON failed to parse')
  }
  return Promise.resolve(results)
}

function convert(ui1) {
  const newObj = {}
  logger.log('converting...')
  return convertClassName(ui1, newObj).then((ui2) => {
    return convertFieldGroups(ui1, ui2)
  })
}

function convertClassName(ui1, ui2) {
  logger.log('converting class name')
  const key = _.keys(ui1)[0]
  const cssClass = ui1[key].cssClass || ''
  ui2.classNames = cssClass.split(' ')
  return Promise.resolve(ui2)
}

function convertFieldGroups(ui1, ui2) {
  logger.log('converting field groups')
  const key = _.keys(ui1)[0]
  const fgs = ui1[key].fieldGroups
  const cells = fgs.map((fg) => {
  const fields = convertFields(fg.fields).concat(convertFieldsets(fg.fieldsets))
  return {
      'label': fg.name,
      'cells': fields
    }
  })
  ui2.cells = cells
  return Promise.resolve(ui2)
}

function convertFieldsets(fieldsets) {
  logger.log('converting fieldsets')
  return _.map(fieldsets, (fieldset, key) => {
    logger.log('key: ' + key)
    return {
      model: key.split('_').join(''),
      description: fieldset.description,
      collapsible: fieldset['switch'],
      cells: convertFields(fieldset.fields)
    }
  })
}

function convertFields(fields) {
  logger.log('converting fields...')
  return _.map(fields, (field, key) => {
    return {
      model: key,
      label: field.label,
      format: getFormat(field),
      description: field.description || field.help,
      renderer: getRenderer(field.type)
    }
  })
}

function getFormat(field) {
  if (field.format) {
    return field.format
  }
  return field.validation === 'required' ? undefined : field.validation
}

function getRenderer(type) {
  const renderers = {
    'objectarray': '',
    'select': 'select',
  }
  return renderers[type]
}

commander
  .version('1.0.0')
  .arguments('<inputFile> <outputFile>')
  .option('-v, --verbose', 'more output')
  .action(function (infile, outfile) {
    logger = new Logger(commander.verbose)
    logger.log('verbosity: ' + commander.verbose)
    main(infile, outfile).then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.info('main is finished')
    })
  });

commander.parse(process.argv);
