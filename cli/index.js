#!/usr/bin/env node
'use strict'

import commander from 'commander'
import Logger from '../lib/logger'
import {convert as convertUis1} from '../lib/converter-uis1'
import {convert as convertBv1} from '..//lib/converter-bv1'
import {validate} from '../lib/validate'
import {getDefaultOutputPath, parseJSON, getLegacyViewType} from '../lib/utils'
import fs from 'fs'
import fsp from 'fs-promise'
import _ from 'lodash'
import {fillString} from '../assets/strings'
import 'colors'
import packageInfo from '../package.json'

export function watch (file, callback, watching) {
  if (watching) {
    fs.watch(file, {encoding: 'buffer'}, callback)
  }
}

/**
 * convert a legacy view to bv1
 * @param {String} inFile the file to read in
 * @param {String} outFile an optional output path
 * @param {Object} logger a logger instance (for logging)
 * @returns {Object<Promise>} a promise
 */
export function converter (inFile, outFile, logger) {
  outFile = outFile || getDefaultOutputPath(inFile)
  return fsp.readFile(inFile)
    .then((legacyViewJSON) => {
      return parseJSON(legacyViewJSON)
    })
    .then((legacyView) => {
      return getLegacyViewType(legacyView)
        .then((legacyViewType) => {
          switch (legacyViewType) {
            case 'uis1':
            case 'uis1-domain-type': 
              return convertUis1(legacyView, outFile, logger)
            case 'bv1':
              return convertBv1(legacyView, outFile, logger)
          }
        })
    })
    .then((uis2View) => {
      return fsp.writeFile(outFile, JSON.stringify(uis2View, null, 2))
    })
    .then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.success(fillString('conversion.onConverted', [inFile, outFile.green]))
      return result
    })
    .catch((error) => {
      logger.error(error)
      logger.error(`${inFile} failed to convert`)
    })
}

export function validator (inFile, optionalFile, logger) {
  validate(inFile, optionalFile, logger)
    .then((results) => {
      logger.log(JSON.stringify(results[0], null, 2))
      logger.success(fillString('validation.onValid', [inFile, results[1].green]))
    })
    .catch((error) => {
      logger.error(fillString('validation.onInvalid', [inFile, error]))
    })
  logger.print(fillString('validation.onValidating', [inFile.cyan]))
}

export function validateAction (inFile, optionalFile, options) {
  let logger = new Logger(options.verbose)
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
  validator(inFile, optionalFile, logger)
  watch(inFile, (eventType, filename) => {
    logger.print(fillString('validation.onChangeObserved', [inFile]))
    validator(inFile, optionalFile, logger)
  }, options.watching)
}

export function convertAction (inFile, outFile, options) {
  let logger = new Logger(options.verbose)
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
  converter(inFile, outFile, logger)
  watch(inFile, (eventType, filename) => {
    convert(inFile, outFile, logger)
  }, options.watching)

}

export function startBunsen (commander, processHandle, convertHandler, validateHandler, version) {

  commander
    .version(version)

  commander
    .command('convert')
    .description('convert old view formats into UI Schema 2')
    .usage('[options] <legacyViewFile> [outputFilePath]')
    .arguments('<legacyViewFile> [viewFile]')
    .option('-v, --verbose', 'more output')
    .option('-w, --watch', 'watch file for changes')
    .action(_.bind(convertHandler, commander))

  commander
    .command('validate')
    .description('validate a Bunsen Model or View, or validate a Bunsen View against a Bunsen Model')
    .option('-v, --verbose', 'more output')
    .option('-w, --watch', 'watch file for changes')
    .usage('[options] <viewFile>')
    .usage('[options] <modelFile> [viewFile]')
    .arguments('<modelOrViewFile> [viewFile]')
    .action(_.bind(validateHandler, commander))

  commander.parse(processHandle.argv)
  return commander
}


startBunsen(
  commander,
  process,
  convertAction,
  validateAction,
  packageInfo.version
)
