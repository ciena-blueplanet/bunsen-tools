import Promise from 'promise'
import _ from 'lodash'
import {readFile, writeFile, parseJSON} from './utils'
import {validateView} from './validate'

export function convert (infile, outfile, logger) {
  return readFile(infile)
    .then((ui1JSON) => {
      return parseJSON(ui1JSON).catch((err) => {
        logger.error(err)
      })
    })
    .then((ui1) => {
      return convertSchema(ui1, logger)
    })
    .then((ui2) => {
      return wrapSchema(ui2, logger)
    })
    .then((ui2) => {
      logger.log('attempting to validate view')
      return validateView(ui2, logger)
    })
    .then((validUi2) => {
      logger.log('validated')
      return writeFile(outfile, validUi2, logger)
    })
}

export function wrapSchema (ui2) {
  return Promise.resolve({
    type: 'form',
    version: '2.0',
    cells: [
      {
        classNames: ui2.classNames,
        children: ui2.children
      }
    ]
  })
}

export function convertSchema (ui1, logger) {
  const newObj = {}
  logger.log('converting...')
  return convertClassName(ui1, newObj, logger).then((ui2) => {
    return convertFieldGroups(ui1, ui2, logger)
  })
}

export function convertClassName (ui1, ui2, logger) {
  logger.log('converting class name')
  const key = _.keys(ui1)[0]
  ui2.classNames = {
    cell: ui1[key].cssClass || ''
  }
  return Promise.resolve(ui2)
}

export function convertFieldGroups (ui1, ui2, logger) {
  logger.log('converting field groups')
  const key = _.keys(ui1)[0]
  logger.log(ui1)
  const fgs = ui1[key].fieldGroups || []
  const children = fgs.map((fg) => {
    const fields = convertFields(fg.fields, logger).concat(convertFieldsets(fg.fieldsets, logger))
    return {
      'label': fg.name || '',
      'children': fields
    }
  })
  ui2.children = children
  return Promise.resolve(ui2)
}

export function convertFieldsets (fieldsets, logger) {
  logger.log('converting fieldsets')
  return _.map(fieldsets, (fieldset, key) => {
    logger.log('key: ' + key)
    return {
      model: key.split('_').join(''),
      label: fieldset.label || '',
      description: fieldset.description || fieldset.help || '',
      collapsible: fieldset['switch'] || true,
      children: convertFields(fieldset.fields, logger)
    }
  })
}

export function convertFields (fields, logger) {
  logger.log('converting fields...')
  return _.map(fields, (field, key) => {
    return setRenderer({
      model: key,
      label: field.label || '',
      description: field.description || field.help || ''
    }, field.type)
  })
}

export function getFormat (field) {
  if (field.format) {
    return field.format
  }
  return field.validation === 'required' ? undefined : field.validation
}

export function setRenderer (field, type) {
  const renderers = {
    'select': {
      name: 'select'
    }
  }
  if (renderers[type]) {
    field.renderer = renderers[type]
  }
  return field
}
