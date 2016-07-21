'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = validate;
exports.validateView = validateView;
exports.validateModel = validateModel;
exports.validateViewWithModel = validateViewWithModel;

var _utils = require('../lib/utils');

var _model = require('bunsen-core/lib/validator/model');

var UIS2 = require('bunsen-core/lib/validator/view-schemas/v2');
var bunsenValidator = require('bunsen-core/lib/validator/index');
var ZSchema = require('z-schema');
var zSchemaValidator = new ZSchema();

var Promise = require('promise');

function validate(inFile, optionalFile, logger) {
  return (0, _utils.readFile)(inFile).then(function (infileJSON) {
    logger.log('read file');
    return (0, _utils.parseJSON)(infileJSON).catch(function (err) {
      logger.error('Parsing JSON: ' + err);
    });
  }).then(function (pojo) {
    logger.log('parsed file');
    if ((0, _utils.isModelFile)(pojo)) {
      logger.info('detected model file');
      return validateModel(pojo);
    }
    if ((0, _utils.isViewFile)(pojo)) {
      logger.info('detected bunsen view file');
      if (optionalFile) {
        return readfile(optionalFile).then(function (modelJSON) {
          return (0, _utils.parseJSON)(modelJSON).catch(function (err) {
            logger.error(JSON.stringify(err, null, 2));
          });
        }).then(function (model) {
          return validateViewWithModel(pojo, model);
        });
      }
      return validateView(pojo).catch(function (errors) {
        logger.error(JSON.stringify(errors, null, 2));
      });
    }
    return Promise.reject('<viewOrModelFile> must be a valid Bunsen view or Bunsen Model');
  });
}

function validateView(ui2) {
  zSchemaValidator.validate(ui2, UIS2);
  if (zSchemaValidator.getLastErrors()) {
    return Promise.reject(zSchemaValidator.getLastErrors());
  }
  return Promise.resolve([ui2, 'valid Bunsen View']);
}

function validateModel(model) {
  console.log('validating model...');
  var results = (0, _model.validate)(model);
  if (results.errors && results.errors.length) {
    return Promise.reject(results.errors);
  }
  if (results.warnings && results.warnings.length) {
    logger.warn(results.warnings);
  }
  return Promise.resolve([model, 'valid Bunsen Model']);
}

function validateViewWithModel(view, model) {
  return Promise.resolve(view);
}