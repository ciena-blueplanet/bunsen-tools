'use strict'

/* eslint no-undef:0 */
var expect = require('chai').expect
var validate = require('../lib/validate')
var fsp = require('fs-promise')
var sinon = require('sinon')
// var Promise = require('promise')
var Logger = require('../lib/logger')
var bunsenModelValidator = require('bunsen-core/lib/validator/model')

describe('the validator', function () {
  let logger, view, model, readFileStub, infoStub, errorStub

  beforeEach(function () {
    model = JSON.stringify({
      type: 'object',
      properties: {}
    }, null, 2)
    view = JSON.stringify({
      type: 'form',
      version: '2.0',
      cells: [{}]
    }, null, 2)
    logger = new Logger(false)
    infoStub = sinon.stub(logger, 'info')
    errorStub = sinon.stub(logger, 'error')
    readFileStub = sinon.stub(fsp, 'readFile').returns(Promise.resolve(model))
  })

  afterEach(function () {
    fsp.readFile.restore()
  })

  it('exists', function () {
    expect(validate).not.to.equal(undefined)
  })

  it('.validateModel() validates a good model', function () {
    return validate.validateModel(JSON.parse(model), logger)
      .then((result) => {
        expect(result[0]).to.eql(JSON.parse(model))
      })
  })

  it('.validateModel() fails a bad model', function () {
    return validate.validateModel({}, logger)
      .catch((error) => {
        expect(error).not.to.equal(undefined)
      })
  })

  it('.validateModel() warn model validation warnings', function () {
    sinon.stub(bunsenModelValidator, 'validate').returns({warnings: ['somewarning']})
    sinon.stub(logger, 'warn')
    validate.validateModel({}, logger)
    expect(logger.warn.called).not.to.equal(undefined)
    bunsenModelValidator.validate.restore()
  })

  it('.validateView() validates a view', function () {
    return validate.validateView(JSON.parse(view), logger)
      .then((result) => {
        expect(result[0]).to.eql(JSON.parse(view))
      })
  })

  it('.validateView() fails a bad view', function () {
    return validate.validateView({}, logger)
      .catch((error) => {
        expect(error).not.to.equal(undefined)
      })
  })

  it('validates a model and a view', function () {
    expect(validate.validateViewWithModel({}, {}, logger)).not.to.equal(undefined)
  })

  it('handles validation for a model', function () {
    return validate.validate('somemodel', undefined, logger)
      .then((result) => {
        expect(infoStub.lastCall.args[0]).to.eql('detected model file')
        expect(result[0]).to.eql(JSON.parse(model))
        expect(result[1]).to.equal('valid Bunsen Model')
      })
  })

  it('handles validation for a view', function () {
    readFileStub.returns(Promise.resolve(view))
    return validate.validate('someview', undefined, logger)
      .then((result) => {
        expect(infoStub.lastCall.args[0]).to.eql('detected bunsen view file')
        expect(result[0]).to.eql(JSON.parse(view))
        expect(result[1]).to.equal('valid Bunsen View')
      })
  })

  it('handles validation for a view against a model', function () {
    readFileStub.withArgs('modelfile').returns(Promise.resolve(model))
    readFileStub.withArgs('viewfile').returns(Promise.resolve(view))
    return validate.validate('modelfile', 'viewfile', logger)
      .then((result) => {
        expect(result).to.eql(JSON.parse(view))
      })
  })

  it('Rejects if first arg is not a coherent JSON blob trying to be a model or a view', function () {
    return validate.validate(undefined, undefined, logger)
      .catch((error) => {
        expect(error).not.to.equal(undefined)
        expect(errorStub.called).not.to.equal(undefined)
      })
  })
})
