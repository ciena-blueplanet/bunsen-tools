const fsp = require('fs-promise')
const _ = require('lodash')
const strings = require('../assets/strings')

export function isViewFile (pojo) {
  return pojo.type === 'detail' ||
      pojo.type === 'form' &&
      pojo.version.indexOf('2.') !== -1
}

export function isModelFile (pojo) {
  return pojo.type === 'object' && pojo.properties
}

export function parseJSON (string) {
  let results
  try {
    results = JSON.parse(string)
  } catch (err) {
    return Promise.reject(strings.strings.conversion.errors.invalidJson)
  }
  return Promise.resolve(results)
}

export function readFile (file) {
  return fsp.readFile(file, 'utf8')
}

export function writeFile (outfile, data) {
  return fsp.writeFile(outfile, `${JSON.stringify(data, null, 2)}\n`).then(() => {
    return data
  })
}

export function getDefaultOutputPath (inputPath = '') {
  return `${inputPath.split('.')[0]}-uis2.json`
}

export function getLegacyViewType (view) {
  if (view.type === 'form' || view.type === 'detail') {
    return Promise.resolve('bv1')
  }
  if (_.keys(view)[0] && _.keys(view)[0].split('.').length === 3) {
    return Promise.resolve('uis1')
  }
  return Promise.reject(strings.strings.conversion.errors.noViewType)
}
