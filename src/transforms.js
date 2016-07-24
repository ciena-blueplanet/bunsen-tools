import _ from 'lodash'

export function transformString (uis1Transform) {
  const uis2Transform = {
    from: _.keys(uis1Transform)[0],
    to: uis1Transform[_.keys(uis1Transform)[0]],
    global: true
  }
  return uis2Transform
}

export function transformObject (uis1Transform) {
  const keywords = ['value', 'id', 'label']
  return {
    object: _.reduce(uis1Transform, (result, value, key) => {
      if (value.split('\'').length === 3) {
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
  newField.transforms = {}
  if (oldField.modelTransform) {
    if (oldField.modelTransform['toObject']) {
      newField.transforms.write = [transformObject(oldField.modelTransform.toObject)]
    }
    if (oldField.modelTransform['replace']) {
      newField.transforms.write = [transformString(oldField.modelTransform.replace)]
    }
  }
  if (oldField.viewTransform) {
    if (oldField.viewTransform['toObject']) {
      newField.transforms.read = [transformObject(oldField.viewTransform.toObject)]
    }
    if (oldField.viewTransform['replace']) {
      newField.transforms.read = [transformString(oldField.viewTransform.replace)]
    }
  }
  return newField
}
