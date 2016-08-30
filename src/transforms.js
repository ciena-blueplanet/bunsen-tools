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
  if (oldField.modelTransform) {
    if (oldField.modelTransform['toObject']) {
      transforms.write = [transformObject(oldField.modelTransform.toObject)]
    }
    if (oldField.modelTransform['replace']) {
      transforms.write = [transformString(oldField.modelTransform.replace)]
    }
  }
  if (oldField.viewTransform) {
    if (oldField.viewTransform['toObject']) {
      transforms.read = [transformObject(oldField.viewTransform.toObject)]
    }
    if (oldField.viewTransform['replace']) {
      transforms.read = [transformString(oldField.viewTransform.replace)]
    }
  }
  if (!_.isEmpty(transforms)) _.set(newField, 'transforms', transforms)
  return newField
}
