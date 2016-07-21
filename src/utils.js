const fsp = require('fs-promise')

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
    return Promise.reject(err, 'JSON failed to parse')
  }
  return Promise.resolve(results)
}

export function readFile (file) {
  return fsp.readFile(file, 'utf8').then((results) => {
    return results
  })
}

export function writeFile (outfile, data) {
  return fsp.writeFile(outfile, `${JSON.stringify(data, null, 2)}\n`).then(() => {
    return data
  })
}

export function getDefaultOutputPath (inputPath) {
  return `${inputPath.split('.')[0]}-uis2.json`
}
