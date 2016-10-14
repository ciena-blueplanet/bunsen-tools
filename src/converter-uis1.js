import Promise from 'promise'
import _ from 'lodash'
import {validateView} from './validate'
import {setRenderer} from './renderer'
import {setTransforms} from './transforms'

export function convert (uis1, outfile, detail, logger) {
  return convertSchema(uis1, logger, detail)
    .then((uis2) => {
      logger.log(uis2)
      return wrapSchema(uis2, detail, logger)
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

export function wrapSchema (uis2, detail) {
  return Promise.resolve({
    type: detail ? 'detail' : 'form',
    version: '2.0',
    cells: uis2.children
  })
}

export function convertSchema (ui1, logger, detail) {
  const newObj = {}
  logger.log('converting...')
  return convertClassName(ui1, newObj, logger)
    .then((ui2) => {
      const key = _.keys(ui1)[0]
      if (ui1[key].fieldGroups) {
        return convertFieldGroups(ui1, ui2, logger, detail)
      }
      if (ui1[key].fields) {
        logger.log('found fields instead of fieldgroups')
        ui2.children = convertFields(ui1[key].fields, logger, detail)
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

export function convertFieldGroups (ui1, ui2, logger, detail) {
  logger.log('converting field groups')
  const key = _.keys(ui1)[0]
  logger.log(ui1)
  const fgs = ui1[key].fieldGroups || []
  const children = fgs.map((fg) => {
    const fields = convertFields(fg.fields, logger, detail).concat(convertFieldsets(fg.fieldsets, logger))
    return {
      'label': fg.name || '',
      'children': fields
    }
  })
  ui2.children = children
  return Promise.resolve(ui2)
}

/*eslint-disable complexity */
export function convertFieldsets (fieldsets, logger, detail) {
  logger.log('converting fieldsets')
  return _.map(fieldsets, (fieldset, key) => {
    logger.log('key: ' + key)
    const newFieldset = {
      model: `properties.${key.split('_').join('')}`,
      collapsible: !!fieldset['switch'] || true,
      children: convertFields(fieldset.fields, logger, detail)
    }
    if (fieldset.label) {
      newFieldset.label = fieldset.label
    }
    if (fieldset.help || fieldset.description) {
      newFieldset.description = fieldset.help || fieldset.description
    }
    return newFieldset
  })
}

export function convertFields (fields, logger, detail) {
  logger.log('converting fields...')
  return _.map(fields, (field, key) => {
    const newField = {
      model: `properties.${key}`
    }
    if (field.type === 'objectarray') {
      newField.arrayOptions = convertObjectArray(field, logger)
    }
    if (field.label) {
      newField.label = field.label
    }
    if (field.help || field.description) {
      newField.description = field.help || field.description
    }
    const placeholder = field.placeholder || field.prompt
    if (placeholder) _.extend(newField, {placeholder})
    setTransforms(newField, field, logger)

    return setRenderer(newField, field, logger, detail)
  })
}

/* eslint-enable complexity */
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
        return { model: `properties.${prop}` }
      })
    }
  }
  return result
}
