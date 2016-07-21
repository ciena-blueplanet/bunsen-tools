#!/usr/bin/env node

'use strict'

const commander = require('commander')
const Promise = require('promise')
const fsp = require('fs-promise')
const _ = require('lodash')
const Logger = require('../lib/logger')
const UIS2 = require('bunsen-core/lib/validator/view-schemas/v2')
const bunsenValidator = require('bunsen-core/lib/validator/index')
const zSchema = require('z-schema')
const zSchemaValidator = new zSchema()

let logger

function convert (infile, outfile) {
  return readFile(infile)
    .then((ui1JSON) => {
      return parseJSON(ui1JSON).catch((err) => {
        logger.log('ERROR: ' + err)
      })
    })
    .then((ui1) => {
      return convertSchema(ui1)
    })
    .then((ui2) => {
      return wrapSchema(ui2)
    })
    .then((ui2) => {
      return validate(ui2)
    })
    .then((validUi2) => {
      return writeFile(outfile, validUi2)
    })
}

function wrapSchema (ui2) {
  return Promise.resolve({
    cellsbells: [
      {
        classNames: ui2.classNames,
        cells: ui2.cells
      }
    ]
  })
}


function validate (ui2) {
  logger.log('validating ')
  const validation = zSchemaValidator.validate(ui2, UIS2)
  logger.error(JSON.stringify(zSchemaValidator.getLastErrors(), null, 2))
  return Promise.resolve(ui2)
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

function parseJSON (string) {
  let results
  try {
    results = JSON.parse(string)
  } catch (err) {
    logger.error(err)
    return Promise.reject('JSON failed to parse')
  }
  return Promise.resolve(results)
}

function convertSchema (ui1) {
  const newObj = {}
  logger.log('converting...')
  return convertClassName(ui1, newObj).then((ui2) => {
    return convertFieldGroups(ui1, ui2)
  })
}

function convertClassName (ui1, ui2) {
  logger.log('converting class name')
  const key = _.keys(ui1)[0]
  const cssClass = ui1[key].cssClass || ''
  ui2.classNames = cssClass.split(' ')
  return Promise.resolve(ui2)
}

function convertFieldGroups (ui1, ui2) {
  logger.log('converting field groups')
  const key = _.keys(ui1)[0]
  logger.log(ui1)
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

function convertFieldsets (fieldsets) {
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

function convertFields (fields) {
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

function getFormat (field) {
  if (field.format) {
    return field.format
  }
  return field.validation === 'required' ? undefined : field.validation
}

function getRenderer (type) {
  const renderers = {
    'objectarray': '',
    'select': 'select'
  }
  return renderers[type]
}

function getDefaultOutputPath(inputPath) {
  return `${inputPath.split('.')[0]}-uis2.json`
}

commander
  .version('1.0.0')
  .option('-v, --verbose', 'more output')

commander
  .command('convert')
  .usage('[options] <legacyViewFile> [outputFilePath]')
  .arguments('<legacyViewFile> [viewFile]')
  .action(function (infile, outfile) {
    console.log(infile)
    if (!infile) {
      logger.warn('no input file specified')
      return
    }
    outfile = outfile || getDefaultOutputPath(infile)
    logger = new Logger(commander.verbose)
    logger.log('verbose mode')
    convert(infile, outfile).then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.info('convert is finished')
    })
  })

commander
  .command('validate')
  .usage('[options] <viewFile>')
  .usage('[options] <modelFile> [viewFile]')
  .arguments('<modelOrViewFile> [viewFile]')
  .action((infile, outfile) => {
    logger.info('validating...')
  })

commander.parse(process.argv)
