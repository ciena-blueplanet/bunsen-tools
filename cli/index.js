#!/usr/bin/env node
'use strict'

import commander from 'commander'
import Logger from '../lib/logger'
import {convert} from '../lib/converter'
import {validate} from '../lib/validate'
import {getDefaultOutputPath} from '../lib/utils'
import fs from 'fs'
import _ from 'lodash'

import {fillString} from '../assets/strings'
import 'colors'

import packageInfo from '../package.json'

export function watch (file, callback, watching) {
  console.log('watching')
  if (watching) {
    fs.watch(file, {encoding: 'buffer'}, callback)
  }
}

export function converter (inFile, outFile, logger) {
  outFile = outFile || getDefaultOutputPath(inFile)
  logger.log('verbose mode')
  convert(inFile, outFile, logger)
    .then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.success(fillString('conversion.onConverted', [inFile, outFile.green]))
    })
    .catch((error) => {
      logger.error('---------------------')
      logger.error('Dang! (╯°□°)╯︵ ┻━┻')
      logger.error(error)
      logger.error(`${inFile} failed to convert`)
    })
  logger.print(fillString('conversion.onConverting', [inFile.cyan]))
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

export function validateAction (logger, watching, inFile, optionalFile) {
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
  validator(inFile, optionalFile, logger)
  watch(inFile, (eventType, filename) => {
    logger.print(fillString('validation.onChangeObserved', [inFile]))
    validator(inFile, optionalFile, logger)
  }, watching)
}

export function convertAction (logger, watching, inFile, outFile) {
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
  converter(inFile, outFile, logger)
  watch(inFile, (eventType, filename) => {
    convert(inFile, outFile, logger)
  }, watching)
}

export function startBunsen (commander, processHandle, convertHandler, validateHandler, logger, version) {
  commander
    .version(version)

  commander
    .command('convert')
    .alias('c')
    .description('convert old view formats into UI Schema 2')
    .option('-v, --verbose', 'more output')
    .option('-w, --watch', 'watch file for changes')
    .usage('[options] <legacyViewFile> [outputFilePath]')
    .arguments('<legacyViewFile> [viewFile]')
    .action(_.bind(convertHandler, null, logger, commander.watch))

  commander
    .command('validate')
    .alias('v')
    .description('validate a Bunsen Model or View, or validate a Bunsen View against a Bunsen Model')
    .option('-v, --verbose', 'more output')
    .option('-w, --watch', 'watch file for changes')
    .usage('[options] <viewFile>')
    .usage('[options] <modelFile> [viewFile]')
    .arguments('<modelOrViewFile> [viewFile]')
    .action(_.bind(validateHandler, null, logger, commander.watch))

  commander.parse(processHandle.argv)

  logger.verbose = commander.verbose

  return commander
}

let logger = new Logger()

startBunsen(
  commander,
  process,
  convertAction,
  validateAction,
  logger,
  packageInfo.version
)
