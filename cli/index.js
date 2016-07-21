#!/usr/bin/env node

'use strict'

import commander from 'commander'
import Promise from 'promise'
import _ from 'lodash'
import Logger from '../lib/logger'

import {validate, validateView} from '../lib/validate'
import {getDefaultOutputPath, readFile, writeFile, parseJSON} from '../lib/utils'

let logger

function convert (infile, outfile) {
  return readFile(infile)
    .then((ui1JSON) => {
      return parseJSON(ui1JSON).catch((err) => {
        logger.error(err)
      })
    })
    .then((ui1) => {
      return convertSchema(ui1)
    })
    .then((ui2) => {
      return wrapSchema(ui2)
    })
    .then((ui2) => {
      logger.log('attempting to validate view')
      return validateView(ui2)
    })
    .then((validUi2) => {
      logger.log('validated')
      return writeFile(outfile, validUi2)
    })
    .catch((err) => {
      console.log('it errored')
      // const error = err instanceof Object ? JSON.stringify(err, null, 2) : err
      logger.error(err)
    })
}

function wrapSchema (ui2) {
  return Promise.resolve({
    type: 'form',
    version: '2.0',
    cells: [
      {
        classNames: ui2.classNames,
        children: ui2.children
      }
    ]
  })
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
  ui2.classNames = {
    cell: ui1[key].cssClass || ''
  }
  return Promise.resolve(ui2)
}

function convertFieldGroups (ui1, ui2) {
  logger.log('converting field groups')
  const key = _.keys(ui1)[0]
  logger.log(ui1)
  const fgs = ui1[key].fieldGroups
  const children = fgs.map((fg) => {
    const fields = convertFields(fg.fields).concat(convertFieldsets(fg.fieldsets))
    return {
      'label': fg.name,
      'children': fields
    }
  })
  ui2.children = children
  return Promise.resolve(ui2)
}

function convertFieldsets (fieldsets) {
  logger.log('converting fieldsets')
  return _.map(fieldsets, (fieldset, key) => {
    logger.log('key: ' + key)
    return {
      model: key.split('_').join(''),
      description: fieldset.description || fieldset.help || '',
      collapsible: fieldset['switch'],
      children: convertFields(fieldset.fields)
    }
  })
}

function convertFields (fields) {
  logger.log('converting fields...')
  return _.map(fields, (field, key) => {
    return setRenderer({
      model: key,
      label: field.label,
      description: field.description || field.help || '',
    }, field.type)
  })
}

function getFormat (field) {
  if (field.format) {
    return field.format
  }
  return field.validation === 'required' ? undefined : field.validation
}

function setRenderer (field, type) {
  const renderers = {
    'select': {
      name: 'select'
    }
  }
  if (renderers[type]) {
    field.renderer = renderers[type]
  }
  return field
}

commander
  .version('1.0.0')
  .option('-v, --verbose', 'more output')

commander
  .command('convert')
  .usage('[options] <legacyViewFile> [outputFilePath]')
  .arguments('<legacyViewFile> [viewFile]')
  .action((infile, outfile) => {
    console.log(infile)
    if (!infile) {
      logger.warn('no input file specified')
      return
    }
    outfile = outfile || getDefaultOutputPath(infile)
    logger = new Logger(commander.verbose)
    logger.log('verbose mode')
    convert(infile, outfile, logger).then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.info('convert is finished')
    })
  })

commander
  .command('validate')
  .usage('[options] <viewFile>')
  .usage('[options] <modelFile> [viewFile]')
  .arguments('<modelOrViewFile> [viewFile]')
  .action((inFile, optionalFile) => {
    logger = new Logger(commander.verbose)
    validate(inFile, optionalFile, logger)
      .then((results) => {
        logger.log(JSON.stringify(results[0]))
        logger.info('---------------------')
        logger.info('Tada! ┬─┬ ノ( ^_^ノ)')
        logger.info(`${inFile} is a ${results[1]}`)
      })
      .catch((error) => {
        logger.error('---------------------')
        logger.error('Dang! (╯°□°)╯︵ ┻━┻')
        logger.error(error)
        logger.error(`${inFile} is not valid`)
      })
    logger.info('validating...')
  })

commander.parse(process.argv)
