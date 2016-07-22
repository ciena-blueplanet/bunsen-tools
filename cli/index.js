#!/usr/bin/env node

'use strict'

import commander from 'commander'
import Logger from '../lib/logger'
import {convert} from '../lib/converter'
import {validate} from '../lib/validate'
import {getDefaultOutputPath} from '../lib/utils'

let logger

commander
  .version('1.0.0')
  .option('-v, --verbose', 'more output')

commander
  .command('convert')
  .usage('[options] <legacyViewFile> [outputFilePath]')
  .arguments('<legacyViewFile> [viewFile]')
  .action((inFile, outFile) => {
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
        logger.info('---------------------')
        logger.info('Tada! ┬─┬ ノ( ^_^ノ)')
        logger.info(`${inFile} has been converted to ${outFile}`)
      })
      .catch((error) => {
        logger.error('---------------------')
        logger.error('Dang! (╯°□°)╯︵ ┻━┻')
        logger.error(error)
        logger.error(`${inFile} failed to convert`)
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
        logger.log(JSON.stringify(results[0], null, 2))
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
