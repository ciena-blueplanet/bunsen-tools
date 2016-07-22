'use strict'

/* eslint no-undef:0 */
var expect = require('chai').expect
var utils = require('../lib/utils')
var fsp = require('fs-promise')
var sinon = require('sinon')
var Promise = require('promise')

describe('utils', function () {
  it('checks if a file is a view file or not', function () {
    let value = 'string'
    expect(utils.isViewFile(value)).not.to.be.ok
    value = {}
    expect(utils.isViewFile(value)).not.to.be.ok
    value = {type: 'form', version: '2.0'}
    expect(utils.isViewFile(value)).to.be.ok
  })

  it('checks if a file is a model or not', function () {
    let value = 'string'
    expect(utils.isModelFile(value)).not.to.be.ok
    value = {'foo': 'bar'}
    expect(utils.isModelFile(value)).not.to.be.ok
    value = []
    expect(utils.isModelFile(value)).not.to.be.ok
    value = {'type': 'object', properties: {}}
    expect(utils.isModelFile(value)).to.be.ok
  })

  it('promisizes a jsonParse fail', function () {
    return utils.parseJSON('"0')
     .catch((err) => {
       expect(err[1]).to.eql('JSON failed to parse')
     })
  })

  it('promisizes a jsonParse success', function () {
    return utils.parseJSON('{"foo": "bar"}')
     .then((result) => {
       expect(result).to.be.ok
     })
  })

  it('reads a file', function () {
    return utils.readFile('tests/models/fragment.json').then((results) => {
      expect(results).to.be.ok
    })
  })

  it('writes a file', function () {
    const spy = sinon.stub(fsp, 'writeFile').returns(Promise.resolve('test'))
    const args = [
      'tests/models/fragment.json',
      'some data'
    ]
    return utils.writeFile(args[0], args[1]).then((results) => {
      expect(spy.lastCall.args).to.eql([args[0], '"some data"\n'])
    })
  })

  it('gets a default outputPath', function () {
    expect(utils.getDefaultOutputPath('somefile')).to.eql('somefile-uis2.json')
  })
})
