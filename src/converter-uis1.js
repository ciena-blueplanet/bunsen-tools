import Promise from 'promise'
import _ from 'lodash'
import {validateView} from './validate'
import {setRenderer} from './renderer'
import {setTransforms} from './transforms'

export function convert (uis1, outfile, logger) {
  return convertSchema(uis1, logger)
    .then((uis2) => {
      return wrapSchema(uis2, logger)
    })
    .then((uis2) => {
      logger.log('attempting to validate view')
      return validateView(uis2, logger)
        .then((result) => {
          return result[0]
        })
    })
}

export function wrapSchema (uis2) {
  return Promise.resolve({
    type: 'form',
    version: '2.0',
    cells: [
      {
        classNames: uis2.classNames,
        children: uis2.children
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
    const newField = {
      model: key,
      label: field.label || '',
      description: field.description || field.help || ''
    }
    const placeholder = field.placeholder || field.prompt
    if (placeholder) _.extend(newField, {placeholder})
    setTransforms(newField, field, logger)
    const result = setRenderer(newField, field, logger)
    return result
  })
}
