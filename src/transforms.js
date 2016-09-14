import _ from 'lodash'

export function transformString (uis1Transform) {
  const key = _.keys(uis1Transform)[0]
  const uis2Transform = {
    from: key,
    to: uis1Transform[key],
    global: true
  }
  return uis2Transform
}

export function transformObject (uis1Transform) {
  const keywords = ['value', 'id', 'label']
  return {
    object: _.reduce(uis1Transform, (result, value, key) => {
      if (value && value.split && value.split('\'').length === 3) {
        value = value.split('\'')[1]
      }
      if (_.indexOf(keywords, value) !== -1) {
        value = '${' + value + '}'
      }
      result[key] = value
      return result
    }, {})
  }
}

export function setTransforms (newField, oldField, logger) {
  const transforms = {}

  ;[
    {fn: transformObject, val: _.get(oldField, 'modelTransform.toObject')},
    {fn: transformString, val: _.get(oldField, 'modelTransform.replace')},
    {fn: transformObject, val: _.get(oldField, 'viewTransform.toObject')},
    {fn: transformString, val: _.get(oldField, 'viewTransform.replace')}
  ]
    .forEach((data) => {
      if (data.val) {
        transforms.write = [data.fn(data.val)]
      }
    })

  if (!_.isEmpty(transforms)) _.set(newField, 'transforms', transforms)

  return newField
}
