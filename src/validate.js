const UIS2 = require('bunsen-core/lib/validator/view-schemas/v2')
const bunsenValidator = require('bunsen-core/lib/validator/index')
const ZSchema = require('z-schema')
const zSchemaValidator = new ZSchema()
import {parseJSON, readFile, isViewFile, isModelFile} from '../lib/utils'
import {validate as modelValidator} from 'bunsen-core/lib/validator/model'
const Promise = require('promise')

export function validate (inFile, optionalFile, logger) {
  return readFile(inFile)
    .then((infileJSON) => {
      logger.log('read file')
      return parseJSON(infileJSON).catch((err) => {
        logger.error(`Parsing JSON: ${err}`)
      })
    })
    .then((pojo) => {
      logger.log('parsed file')
      if (isModelFile(pojo)) {
        logger.info('detected model file')
        return validateModel(pojo)
      }
      if (isViewFile(pojo)) {
        logger.info('detected bunsen view file')
        if (optionalFile) {
          return readfile(optionalFile)
            .then((modelJSON) => {
              return parseJSON(modelJSON).catch((err) => {
                logger.error(JSON.stringify(err, null, 2))
              })
            })
            .then((model) => {
              return validateViewWithModel(pojo, model)
            })
        }
        return validateView(pojo)
          .catch((errors) => {
            logger.error(JSON.stringify(errors, null, 2))
          })
      }
      return Promise.reject('<viewOrModelFile> must be a valid Bunsen view or Bunsen Model')
    })
}

export function validateView (ui2) {
  zSchemaValidator.validate(ui2, UIS2)
  if (zSchemaValidator.getLastErrors()) {
    return Promise.reject(zSchemaValidator.getLastErrors())
  }
  return Promise.resolve([ui2, 'valid Bunsen View'])
}

export function validateModel (model) {
  console.log('validating model...')
  const results = modelValidator(model)
  if (results.errors && results.errors.length) {
    return Promise.reject(results.errors)
  }
  if (results.warnings && results.warnings.length) {
    logger.warn(results.warnings)
  }
  return Promise.resolve([model, 'valid Bunsen Model'])
}

export function validateViewWithModel (view, model) {
  return Promise.resolve(view)
}
