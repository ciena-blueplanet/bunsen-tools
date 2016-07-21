'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isViewFile = isViewFile;
exports.isModelFile = isModelFile;
exports.parseJSON = parseJSON;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.getDefaultOutputPath = getDefaultOutputPath;
var ZSchema = require('z-schema');
var zSchemaValidator = new ZSchema();
var fsp = require('fs-promise');

function isViewFile(pojo) {
  return pojo.type === 'detail' || pojo.type === 'form' && pojo.version.indexOf('2.') !== -1;
}

function isModelFile(pojo) {
  return pojo.type === 'object' && pojo.properties;
}

function parseJSON(string) {
  var results = void 0;
  try {
    results = JSON.parse(string);
  } catch (err) {
    return Promise.reject(err, 'JSON failed to parse');
  }
  return Promise.resolve(results);
}

function readFile(file) {
  return fsp.readFile(file, 'utf8').then(function (results) {
    return results;
  });
}

function writeFile(outfile, data) {
  return fsp.writeFile(outfile, JSON.stringify(data, null, 2) + '\n').then(function () {
    return data;
  });
}

function getDefaultOutputPath(inputPath) {
  return inputPath.split('.')[0] + '-uis2.json';
}