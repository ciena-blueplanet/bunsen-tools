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

let logger = new Logger()

export function watch (app, file, callback) {
  if (commander.watch) {
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
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
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
              return convertUis1(legacyView, outFile, logger)
              break;
            case 'bv1':
              console.log(convertBv1(legacyView, outFile, logger))
              return convertBv1(legacyView, outFile, logger)
          } 
        })
    })
    .then((uis2View) => {
      console.log(uis2View)
      return fsp.writeFile(outFile, JSON.stringify(uis2View, null, 2))
    })      
    .then((result) => {
      logger.log(JSON.stringify(result, null, 2))
      logger.success(fillString('conversion.onConverted', [inFile, outFile.green]))
    })
    .catch((error) => {
      logger.error(error)
      logger.error(`${inFile} failed to convert`)
    })
  logger.print(fillString('conversion.onConverting', [inFile.cyan]))
}

export function validator (inFile, optionalFile, logger) {
  if (!inFile) {
    logger.warn('no input file specified')
    return
  }
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
  logger.verbose = commander.verbose
  return commander
}

startBunsen(process)
