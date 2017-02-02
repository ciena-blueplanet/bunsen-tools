'use strict'

/* eslint no-undef:0 */
var expect = require('chai').expect
var utils = require('../lib/utils')
var fsp = require('fs-promise')
var sinon = require('sinon')
var Promise = require('promise')
var strings = require('../assets/strings')

describe('utils', function () {
  it('checks if a file is a view file or not', function () {
    let value = 'string'
    expect(utils.isViewFile(value)).to.equal(false)
    value = {}
    expect(utils.isViewFile(value)).to.equal(false)
    value = {type: 'form', version: '2.0'}
    expect(utils.isViewFile(value)).to.equal(true)
  })

  it('checks if a file is a model or not', function () {
    let value = 'string'
    expect(utils.isModelFile(value)).to.equal(false)
    value = {'foo': 'bar'}
    expect(utils.isModelFile(value)).to.equal(false)
    value = []
    expect(utils.isModelFile(value)).to.equal(false)
    value = {'type': 'object', properties: {}}
    expect(utils.isModelFile(value)).not.to.equal(undefined)
  })

  it('promisizes a jsonParse fail', function () {
    return utils.parseJSON('"0')
     .catch((err) => {
       expect(err).to.eql(strings.strings.conversion.errors.invalidJson)
     })
  })

  it('promisizes a jsonParse success', function () {
    return utils.parseJSON('{"foo": "bar"}')
     .then((result) => {
       expect(result).not.to.equal(undefined)
     })
  })

  describe('.getLegacyViewType(view)', function () {
    it('determines bv1 type', function () {
      return utils.getLegacyViewType({type: 'form'})
        .then((result) => {
          expect(result).to.eql('bv1')
        })
    })
    it('determines uis1 type', function () {
      return utils.getLegacyViewType({'onea.theseCrazy.things': {}})
        .then((result) => {
          expect(result).to.eql('uis1')
        })
    })
    it('rejects if neither', function () {
      return utils.getLegacyViewType({})
        .catch((error) => {
          expect(error).to.eql(strings.strings.conversion.errors.noViewType)
        })
    })
  })
  it('reads a file', function () {
    return utils.readFile('tests/models/fragment.json').then((results) => {
      expect(results).not.to.equal(undefined)
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
