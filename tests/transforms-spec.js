'use strict'

/* eslint no-undef:0 */

var expect = require('chai').expect
var transforms = require('../lib/transforms')
var Logger = require('../lib/logger')
var _ = require('lodash')

describe('transforms', function () {
  let logger
  beforeEach(function () {
    logger = new Logger()
  })

  it('exists', function () {
    expect(transforms).to.be.ok
  })

  it('.setTransforms() converts the transforms', function () {
    const field = {
      modelTransform: {
        toObject: {
          id: 'value',
          something: '\'someliteral\'',
          label: 'label',
          otherId: 'id'
        }
      },
      viewTransform: {
        replace: {'\n': ','}
      }
    }
    let expected = {
      transforms: {
        write: [
          {
            object: {
              id: '${value}',
              something: 'someliteral',
              label: '${label}',
              otherId: '${id}'
            }
          }
        ],
        read: [
          {
            from: '\n',
            to: ',',
            global: true
          }
        ]
      }
    }
    expect(transforms.setTransforms({}, field, logger)).to.eql(expected)
    
    const toObject  = _.cloneDeep(field.modelTransform.toObject)
    const replace  = _.cloneDeep(field.viewTransform.replace)
    const flippedField = {
      viewTransform: {
        toObject: toObject,
      },
      modelTransform: {
        replace: replace
      }
    }
		expected = {
      transforms: {
        read: [
          {
            object: {
              id: '${value}',
              something: 'someliteral',
              label: '${label}',
              otherId: '${id}'
            }
          }
        ],
        write: [
          {
            from: '\n',
            to: ',',
            global: true
          }
        ]
      }
    }
		expect(transforms.setTransforms({}, flippedField, logger)).to.eql(expected) 

  })

  it('.transformObject() converts object transforms', function () {
    const writeObject = {
      id: 'value',
      something: '\'someliteral\'',
      label: 'label',
      otherId: 'id'
    }
    const expected = {
      object: {
        id: '${value}',
        something: 'someliteral',
        label: '${label}',
        otherId: '${id}'
      }
    }
    expect(transforms.transformObject(writeObject)).to.eql(expected)
  })

  it('.transformString() converts string transforms', function () {
    const writeString = {'\n': ','}
    const expected = {
      from: '\n',
      to: ',',
      global: true
    }
    expect(transforms.transformString(writeString)).to.eql(expected)
  })
})
