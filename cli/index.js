#!/usr/bin/env node
'use strict'

import commander from 'commander'
import Logger from '../lib/logger'
import {convert} from '../lib/converter'
import {validate} from '../lib/validate'
import {getDefaultOutputPath} from '../lib/utils'
import fs from 'fs'

import {fillString} from '../assets/strings'
import 'colors'

let logger

export function watch (app, file, callback) {
  if (commander.watch) {
    fs.watch(file, {encoding: 'buffer'}, callback)
  }
}

export function converter (inFile, outFile, logger) {
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
  outFile = outFile || getDefaultOutputPath(inFile)
  logger = new Logger(commander.verbose)
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

export function validateAction (inFile, optionalFile) {
  logger = new Logger(commander.verbose)
  validator(inFile, optionalFile, logger)
  watch(this, inFile, (eventType, filename) => {
    logger.print(fillString('validation.onChangeObserved', [inFile]))
    validator(inFile, optionalFile, logger)
  })
}

export function convertAction (inFile, outFile) {
  converter(inFile, outFile)
  watch(commander, inFile, (eventType, filename) => {
    convert(inFile, outFile, logger)
  })
}

export function startBunsen (processHandle) {
  commander
    .version('1.0.0')
    .option('-v, --verbose', 'more output')
    .option('-w, --watch', 'watch file for changes')

  commander
    .command('convert')
    .usage('[options] <legacyViewFile> [outputFilePath]')
    .arguments('<legacyViewFile> [viewFile]')
    .action(convertAction)

  commander
    .command('validate')
    .usage('[options] <viewFile>')
    .usage('[options] <modelFile> [viewFile]')
    .arguments('<modelOrViewFile> [viewFile]')
    .action(validateAction)

  commander.parse(processHandle.argv)

  return commander
}

startBunsen(process)
