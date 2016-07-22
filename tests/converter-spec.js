'use strict'

/* eslint no-undef:0 */

var expect = require('chai').expect
var converter = require('../lib/converter')
var Logger = require('../lib/logger')
var fsp = require('fs-promise')
var sinon = require('sinon')
var validate = require('../lib/validate')
var utils = require('../lib/utils')

// var Promise = require('promise')
var data = require('./fixtures/data')

describe('the converter', function () {
  let logger
  beforeEach(function () {
    logger = new Logger()
  })

  it('exists', function () {
    expect(converter).to.be.ok
  })

  describe('.convert()', function () {
    let readFileSpy, writeFileSpy
    let parseJSONSpy, validateViewSpy

    beforeEach(function () {
      const valResult = [data.uiSchema2, 'valid Bunsen View']
      readFileSpy = sinon.stub(fsp, 'readFile').returns(Promise.resolve('hello'))
      writeFileSpy = sinon.stub(fsp, 'writeFile').returns(Promise.resolve('hello'))
      parseJSONSpy = sinon.stub(utils, 'parseJSON').returns(Promise.resolve(data.uiSchema2))
      validateViewSpy = sinon.stub(validate, 'validateView').returns(Promise.resolve(valResult))
    })

    afterEach(function () {
      fsp.readFile.restore()
      fsp.writeFile.restore()
      utils.parseJSON.restore()
      validate.validateView.restore()
    })

    it('.convert() converts the schema', function () {
      return converter.convert('somefile', 'someotherfile', logger)
        .then((result) => {
          console.log(result)
          expect(readFileSpy.lastCall.args[0]).to.eql('somefile')
          expect(parseJSONSpy.called).to.be.ok
          expect(validateViewSpy.called).to.be.ok
          expect(writeFileSpy.lastCall.args[1]).to.eql(`${JSON.stringify(data.uiSchema2, null, 2)}\n`)
        })
    })
  })

  it('.wrapsSchema() to give it the final shape', function () {
    const expected = {
      type: 'form',
      version: '2.0',
      cells: [
        {
          classNames: '',
          children: []
        }
      ]
    }
    return converter.wrapSchema({classNames: '', children: []})
      .then((result) => {
        expect(result).to.eql(expected)
      })
  })

  it('.converClassName() converts css classes', function () {
    const expected = {
      classNames: {
        cell: 'somecssclass'
      }
    }
    return converter.convertClassName(data.uiSchema1, {}, logger)
      .then((result) => {
        expect(result).to.eql(expected)
      })
  })

  it('.convertFields() converts fields', function () {
    const result = converter.convertFields(data.fields, logger)
    const expected = [
      {
        model: 'fieldA',
        label: 'somelabel',
        description: 'help'
      },
      {
        model: 'fieldB',
        label: 'someotherlabel',
        description: 'description'
      }
    ]
    expect(result).to.eql(expected)
  })

  it('.convertFieldGroups()converts fieldgroups', function () {
    const expected = {
      children: [
        {
          label: 'somename',
          children: [
            { model: 'somefield', description: '', label: '' },
            { model: 'someotherfield', description: '', label: '' },
            {
              model: 'somefieldset',
              collapsible: true,
              description: '',
              label: '',
              children: [
                { model: 'somefieldset_field', description: '', label: '' }
              ]
            }
          ]
        }
      ]
    }
    return converter.convertFieldGroups(data.uiSchema1, {}, logger)
      .then((result) => {
        expect(result).to.eql(expected)
      })
  })

  it('.convertFieldsets() converts fieldsets', function () {
    const expected = [
      {
        model: 'fieldSetA',
        label: 'Alabel',
        description: 'Ahelp',
        collapsible: true,
        children: [ {model: 'cellA', label: 'cellAlabel', description: ''} ]
      },
      {
        model: 'fieldSetB',
        label: 'Blabel',
        description: 'Bdescription',
        collapsible: true,
        children: [ {model: 'cellB', label: 'cellBlabel', description: ''} ]
      }
    ]
    const result = converter.convertFieldsets(data.fieldsets, logger)
    expect(result).to.eql(expected)
  })

  it('.convertSchema() converts a schema', function () {
    return converter.convertSchema(data.uiSchema1, logger)
      .then((result) => {
        expect(result).to.eql(data.uiSchema2)
      })
  })

  it('.getFormat() gets the format', function () {
    expect(converter.getFormat({format: 'heythere'})).to.eql('heythere')
    expect(converter.getFormat({validation: 'required'})).to.eql(undefined)
    expect(converter.getFormat({validation: 'something'})).to.eql('something')
  })

  it('.setRenderer() chooses the right renderer', function () {
    expect(converter.setRenderer({}, 'select').renderer.name).to.eql('select')
  })
})
