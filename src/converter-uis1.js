import _ from 'lodash'
import Promise from 'promise'

import {setRenderer} from './renderer'
import {setTransforms} from './transforms'
import {validateView} from './validate'

export function convert (uis1, outfile, logger) {
  return convertSchema(uis1, logger)
    .then((uis2) => {
      logger.log(uis2)
      return wrapSchema(uis2, logger)
    })
    .then((uis2) => {
      logger.log(JSON.stringify(uis2, null, 2))
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
    cells: uis2.children
  })
}

export function convertSchema (ui1, logger) {
  const newObj = {}
  logger.log('converting...')
  return convertClassName(ui1, newObj, logger)
    .then((ui2) => {
      const key = _.keys(ui1)[0]
      if (ui1[key].fieldGroups) {
        return convertFieldGroups(ui1, ui2, logger)
      }
      if (ui1[key].fields) {
        logger.log('found fields instead of fieldgroups')
        ui2.children = convertFields(ui1[key].fields, logger)
        return Promise.resolve(ui2)
      }
    })
    .then((uis2) => {
      uis2.children.splice(0, 0, {
        children: [
          {model: 'label'},
          {model: 'description'}
        ],
        label: 'General'
      })

      return uis2
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
      model: `properties.${key.split('_').join('')}`,
      label: fieldset.label || '',
      description: fieldset.description || fieldset.help || '',
      collapsible: !!fieldset['switch'] || true,
      children: convertFields(fieldset.fields, logger)
    }
  })
}

export function convertFields (fields, logger) {
  logger.log('converting fields...')
  return _.map(fields, (field, key) => {
    const newField = {
      model: `properties.${key}`,
      label: _.get(field, 'label', ''),
      description: _.get(field, 'description', field.help || '')
    }
    if (field.type === 'objectarray') {
      newField.arrayOptions = convertObjectArray(field, logger)
    }
    const placeholder = field.placeholder || field.prompt
    if (placeholder) _.extend(newField, {placeholder})
    setTransforms(newField, field, logger)
    return setRenderer(newField, field, logger)
  })
}

export function convertObjectArray (field, logger) {
  const result = {
    autoAdd: true,
    compact: true,
    showLabel: false,
    sortable: true
  }
  if (field.order) {
    result.itemCell = {
      children: _.map(field.order.split(','), (prop) => {
        return {model: `properties.${prop}`}
      })
    }
  }
  return result
}
