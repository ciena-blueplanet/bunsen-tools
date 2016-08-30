import _ from 'lodash'

export function convertInstructions (field, logger) {
  if (!field.instructions || !field.instructions.length) {
    return
  }
  let operators = {
    'contains': {
      values: [],
      param: 'p'
    },
    'equals': {
      param: 'q',
      values: []
    },
    'byProvider': {
      param: 'domainId',
      template: 'value',
      values: []
    }
  }
  _.each(field.instructions, (inst, key) => {
    inst = inst.and || inst.or || inst
    if (inst.type === 'filter') {
      if (operators[inst.operator] && operators[inst.operator].param) {
        operators[inst.operator].values.push(getInstructorValue(inst, field))
      } else {
        logger.warn('The instruction operator ' + inst.operator + ' is not supported at this time.')
      }
    }
  })
  return _.reduce(operators, (result, operator, key) => {
    if (operator.values) {
      result[operator.param] = (operator.values).join(',')
    }
    return result
  }, {})
}

export function getInstructorValue (inst, field) {
  let value = '${' + inst.value + '}'
  if (inst.value && inst.value.split && inst.value.split('\'').length === 3) {
    value = inst.value.split('\'')[1]
  }
  if (inst.value === 'instructor') {
    value = '${' + field.instructor + '}'
  }
  if (inst.key) {
    value = `${inst.key}:${value}`
  }
  return value
}

export function setModelType (options, field) {
  if (field.resourceType) {
    if (field.resourceType.split('.').length === 3) {
      options.modelType = 'resource'
      return
    }
    options.modelType = field.resourceType
  }
}

export function setQuery (options, field, logger) {
  const query = {}
  if (field.resourceType && field.resourceType.split('.').length === 3) {
    _.extend(query, {resourceTypeId: field.resourceType})
  }
  if (field.instructions) {
    _.extend(query, convertInstructions(field, logger))
  }
  if (!_.isEmpty(query)) {
    options.query = query
  }
}

export function smartSet (options, rAttr, uisField, fAttr) {
  fAttr = fAttr || rAttr
  if (uisField[fAttr]) {
    options[rAttr] = uisField[fAttr]
  }
}

export function setRenderer (newField, field, logger) {
  if (!field.type) {
    return newField
  }
  const renderers = {
    'select': {
      name: 'select'
    }
  }
  const renderer = renderers[field.type]
  if (renderer) {
    setRendererOptions(renderer, field, logger)
    newField.renderer = renderer
  }
  return newField
}

export function setRendererOptions (renderer, uis1Field, logger) {
  const options = {}
  setModelType(options, uis1Field)
  smartSet(options, 'valueAttribute', uis1Field)
  smartSet(options, 'labelAttribute', uis1Field)
  setQuery(options, uis1Field, logger)
  if (!_.isEmpty(options)) {
    renderer.options = options
  }
}
