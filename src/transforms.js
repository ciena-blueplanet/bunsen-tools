import _ from 'lodash'

/**
 * @typedef {Object} ObjectTransformV2
 * @property {Object} object - format of output object where values are string templates
 */

/**
 * @typedef {Object} StringTransformV2
 * @property {String} from - matching literal or regex pattern
 * @property {Boolean} global - whether or not to use global regex replace
 * @property {String} to - replacement literal or regex replace pattern
 */

/**
 * Convert UI Schema v1 string transform into a UI Schema v2 string transform
 * @param {Object} uis1Transform - UI Schema v1 string trasnform
 * @returns {StringTransformV2} UI Schema v2 string transform
 * @example
 *
 *   const uis1Transform = {'\n': ','}
 *   transformString(uis1Transform)
 *   > {
 *   >   from: '\n',
 *   >   to: ',',
 *   >   global: true
 *   > }
 */
export function transformString (uis1Transform) {
  const key = _.keys(uis1Transform)[0]
  return {
    from: key,
    to: uis1Transform[key],
    global: true
  }
}

/**
 * Convert UI Schema v1 object transform into a UI Schema v2 object transform
 * @param {Object} uis1Transform - UI Schema v1 object transform
 * @returns {ObjectTransformV2} UI Schema v2 object transform
 * @example
 *
 * const uis1Transform = {
 *   id: 'value',
 *   something: '\'someliteral\'',
 *   label: 'label',
 *   otherId: 'id'
 * }
 * transformObject(uis1Transform)
 * > {
 * >   object: {
 * >     id: '${value}',
 * >     something: 'someliteral',
 * >     label: '${label}',
 * >     otherId: '${id}'
 * >   }
 * > }
 */
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
    {fn: transformObject, key: 'write', val: _.get(oldField, 'modelTransform.toObject')},
    {fn: transformString, key: 'write', val: _.get(oldField, 'modelTransform.replace')},
    {fn: transformObject, key: 'read', val: _.get(oldField, 'viewTransform.toObject')},
    {fn: transformString, key: 'read', val: _.get(oldField, 'viewTransform.replace')}
  ]
    .forEach((data) => {
      if (data.val) {
        transforms[data.key] = [data.fn(data.val)]
      }
    })

  if (!_.isEmpty(transforms)) _.set(newField, 'transforms', transforms)

  return newField
}
