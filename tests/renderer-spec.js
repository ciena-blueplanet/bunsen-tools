'use strict'

/* eslint no-undef:0 */

var expect = require('chai').expect
var renderer = require('../lib/renderer')
var Logger = require('../lib/logger')
var _ = require('lodash')
var sinon = require('sinon')
// var Promise = require('promise')
var fixtureData = require('./fixtures/data')

describe('renderer', function () {
  let logger, data
  beforeEach(function () {
    data = _.cloneDeep(fixtureData)
    logger = new Logger()
  })

  it('.convertInstructions() converts select field instructions', function () {
    let field = data.fieldWithInstructions
    const expected = {
      domainId: '${vnfDomainId}',
      q: 'label:public,properties.vPort:1000',
      p: 'properties.port:${properties.otherprop}'
    }
    expect(renderer.convertInstructions(field, logger)).to.eql(expected)
    field.instructions.push({type: 'filter', operator: 'omit'})
    logger.warn = sinon.spy()
    renderer.convertInstructions(field, logger)
    expect(logger.warn.called).not.to.equal(undefined)
    delete field['instructions']
    const result = renderer.convertInstructions(field, logger)
    expect(result).to.equal(undefined)
  })

  it('.setModelType() sets a model type', function () {
    const options = {}
    renderer.setModelType(options, {resourceType: 'domains'})
    expect(options.modelType).to.eql('domains')
    renderer.setModelType(options, {resourceType: 'wunna.theese.things'})
    expect(options.modelType).to.eql('resource')
  })

  it('.getInstructorValue() gives a correct instructor value for a q param', function () {
    let field = {instructor: 'someotherkey'}
    let inst = {value: 'somevalueindicator'}
    expect(renderer.getInstructorValue(inst, field)).to.eql('${somevalueindicator}')
    inst.value = 'instructor'
    expect(renderer.getInstructorValue(inst, field)).to.eql('${someotherkey}')
    inst.value = '\'somevalueindicator\''
    expect(renderer.getInstructorValue(inst, field)).to.eql('somevalueindicator')
  })

  it('.setQuery() sets up a query', function () {
    let expected = {
      resourceTypeId: 'tosca.resourceTypes.Network',
      domainId: '${vnfDomainId}',
      q: 'label:public,properties.vPort:1000',
      p: 'properties.port:${properties.otherprop}'
    }
    const rendererOptions = {}
    renderer.setQuery(rendererOptions, data.fieldWithInstructions)
    expect(rendererOptions.query).to.eql(expected)

    expected = {
      resourceTypeId: 'tosca.resourceTypes.Network'
    }
    delete data.fieldWithInstructions['instructions']
    renderer.setQuery(rendererOptions, data.fieldWithInstructions)
    expect(rendererOptions.query).to.eql(expected)
  })

  it('.setRenderer() chooses the right renderer', function () {
    const field = data.fieldWithInstructions
    const expected = {
      name: 'select',
      options: {
        modelType: 'resource',
        labelAttribute: 'label-attr',
        query: {
          resourceTypeId: 'tosca.resourceTypes.Network',
          domainId: '${vnfDomainId}',
          q: 'label:public,properties.vPort:1000',
          p: 'properties.port:${properties.otherprop}'
        }
      }
    }
    const newField = {}
    renderer.setRenderer(newField, field, logger)
    expect(newField.renderer).to.eql(expected)
  })

  it('.setRendererOptions() sets options on a renderer based', function () {
    const rend = {}
    renderer.setRendererOptions(rend, data.fieldWithInstructions)
    const expected = {
      modelType: 'resource',
      labelAttribute: 'label-attr',
      query: {
        resourceTypeId: 'tosca.resourceTypes.Network',
        domainId: '${vnfDomainId}',
        q: 'label:public,properties.vPort:1000',
        p: 'properties.port:${properties.otherprop}'
      }
    }
    expect(rend.options).to.eql(expected)
  })

  it('.smartSet() only sets present properties', function () {
    const options = {'foo': 'bar'}
    renderer.smartSet(options, 'fizz', {})
    expect(options.fizz).to.equal(undefined)
    renderer.smartSet(options, 'fizz', {'fizz': 'buzz'})
    expect(options.fizz).to.eql('buzz')
    renderer.smartSet(options, 'fizz', {'fazz': 'bozz'}, 'fazz')
    expect(options.fizz).to.eql('bozz')
  })
})
