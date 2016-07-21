#!/usr/bin/env node


'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _validate = require('../lib/validate');

var _utils = require('../lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = void 0;

function convert(infile, outfile) {
  return (0, _utils.readFile)(infile).then(function (ui1JSON) {
    return (0, _utils.parseJSON)(ui1JSON).catch(function (err) {
      logger.error(err);
    });
  }).then(function (ui1) {
    return convertSchema(ui1);
  }).then(function (ui2) {
    return wrapSchema(ui2);
  }).then(function (ui2) {
    logger.log('attempting to validate view');
    return (0, _validate.validateView)(ui2);
  }).then(function (validUi2) {
    logger.log('validated');
    return (0, _utils.writeFile)(outfile, validUi2);
  }).catch(function (err) {
    console.log('it errored');
    // const error = err instanceof Object ? JSON.stringify(err, null, 2) : err
    logger.error(err);
  });
}

function wrapSchema(ui2) {
  return _promise2.default.resolve({
    type: 'form',
    version: '2.0',
    cells: [{
      classNames: ui2.classNames,
      children: ui2.children
    }]
  });
}

function convertSchema(ui1) {
  var newObj = {};
  logger.log('converting...');
  return convertClassName(ui1, newObj).then(function (ui2) {
    return convertFieldGroups(ui1, ui2);
  });
}

function convertClassName(ui1, ui2) {
  logger.log('converting class name');
  var key = _lodash2.default.keys(ui1)[0];
  ui2.classNames = {
    cell: ui1[key].cssClass || ''
  };
  return _promise2.default.resolve(ui2);
}

function convertFieldGroups(ui1, ui2) {
  logger.log('converting field groups');
  var key = _lodash2.default.keys(ui1)[0];
  logger.log(ui1);
  var fgs = ui1[key].fieldGroups;
  var children = fgs.map(function (fg) {
    var fields = convertFields(fg.fields).concat(convertFieldsets(fg.fieldsets));
    return {
      'label': fg.name,
      'children': fields
    };
  });
  ui2.children = children;
  return _promise2.default.resolve(ui2);
}

function convertFieldsets(fieldsets) {
  logger.log('converting fieldsets');
  return _lodash2.default.map(fieldsets, function (fieldset, key) {
    logger.log('key: ' + key);
    return {
      model: key.split('_').join(''),
      description: fieldset.description || fieldset.help || '',
      collapsible: fieldset['switch'],
      children: convertFields(fieldset.fields)
    };
  });
}

function convertFields(fields) {
  logger.log('converting fields...');
  return _lodash2.default.map(fields, function (field, key) {
    return setRenderer({
      model: key,
      label: field.label,
      description: field.description || field.help || ''
    }, field.type);
  });
}

function getFormat(field) {
  if (field.format) {
    return field.format;
  }
  return field.validation === 'required' ? undefined : field.validation;
}

function setRenderer(field, type) {
  var renderers = {
    'select': {
      name: 'select'
    }
  };
  if (renderers[type]) {
    field.renderer = renderers[type];
  }
  return field;
}

_commander2.default.version('1.0.0').option('-v, --verbose', 'more output');

_commander2.default.command('convert').usage('[options] <legacyViewFile> [outputFilePath]').arguments('<legacyViewFile> [viewFile]').action(function (infile, outfile) {
  console.log(infile);
  if (!infile) {
    logger.warn('no input file specified');
    return;
  }
  outfile = outfile || (0, _utils.getDefaultOutputPath)(infile);
  logger = new _logger2.default(_commander2.default.verbose);
  logger.log('verbose mode');
  convert(infile, outfile, logger).then(function (result) {
    logger.log(JSON.stringify(result, null, 2));
    logger.info('convert is finished');
  });
});

_commander2.default.command('validate').usage('[options] <viewFile>').usage('[options] <modelFile> [viewFile]').arguments('<modelOrViewFile> [viewFile]').action(function (inFile, optionalFile) {
  logger = new _logger2.default(_commander2.default.verbose);
  (0, _validate.validate)(inFile, optionalFile, logger).then(function (results) {
    logger.log(JSON.stringify(results[0]));
    logger.info('---------------------');
    logger.info('Tada! ┬─┬ ノ( ^_^ノ)');
    logger.info(inFile + ' is a ' + results[1]);
  }).catch(function (error) {
    logger.error('---------------------');
    logger.error('Dang! (╯°□°)╯︵ ┻━┻');
    logger.error(error);
    logger.error(inFile + ' is not valid');
  });
  logger.info('validating...');
});

_commander2.default.parse(process.argv);