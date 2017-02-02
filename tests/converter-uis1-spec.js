'use strict'

/* eslint no-undef:0 */

var expect = require('chai').expect
var converter = require('../lib/converter-uis1')
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
    expect(converter).not.to.equal(undefined)
  })

  describe('.convert()', function () {
    let validateViewSpy

    beforeEach(function () {
      const valResult = [data.uiSchema2, 'valid Bunsen View']
      sinon.stub(fsp, 'readFile').returns(Promise.resolve('hello'))
      sinon.stub(utils, 'parseJSON').returns(Promise.resolve(data.uiSchema2))
      sinon.stub(fsp, 'writeFile').returns(Promise.resolve('hello'))
      validateViewSpy = sinon.stub(validate, 'validateView').returns(Promise.resolve(valResult))
    })

    afterEach(function () {
      fsp.readFile.restore()
      fsp.writeFile.restore()
      utils.parseJSON.restore()
      validate.validateView.restore()
    })

    it('converts the schema', function () {
      return converter.convert({foo: {fields: []}}, 'someotherfile', logger)
        .then((result) => {
          expect(validateViewSpy.called).not.to.equal(undefined)
        })
    })
  })

  it('.wrapsSchema() to give it the final shape', function () {
    const expected = {
      type: 'form',
      version: '2.0',
      cells: []
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

  it('.convertFields() converts field transforms', function () {
    const result = converter.convertFields({field: data.fieldWithTransforms}, logger)
    const expected = [{
      label: 'test-field',
      description: '',
      model: 'properties.field',
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
    }]
    expect(result).to.eql(expected)
  })

  it('.convertFields() converts fields', function () {
    const result = converter.convertFields(data.fields, logger)
    const expected = [
      {
        model: 'properties.fieldA',
        label: 'somelabel',
        description: 'help',
        placeholder: 'test-prompt'
      },
      {
        model: 'properties.fieldB',
        label: 'someotherlabel',
        description: 'description',
        placeholder: 'test-placeholder'
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
            {model: 'properties.somefield', description: '', label: ''},
            {model: 'properties.someotherfield', description: '', label: ''},
            {
              model: 'properties.somefieldset',
              collapsible: true,
              description: '',
              label: '',
              children: [
                {model: 'properties.somefieldset_field', description: '', label: ''}
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
        model: 'properties.fieldSetA',
        label: 'Alabel',
        description: 'Ahelp',
        collapsible: true,
        children: [ {model: 'properties.cellA', label: 'cellAlabel', description: ''} ]
      },
      {
        model: 'properties.fieldSetB',
        label: 'Blabel',
        description: 'Bdescription',
        collapsible: true,
        children: [ {model: 'properties.cellB', label: 'cellBlabel', description: ''} ]
      }
    ]
    const result = converter.convertFieldsets(data.fieldsets, logger)
    expect(result).to.eql(expected)
  })

  it('.convertArrays() converts objectArrays into array fields', function () {
    const objArray = {
      type: 'objectarray',
      description: 'some description',
      label: 'some label',
      order: 'field1,field2,field3,field4'
    }

    const arrayOptions = {
      autoAdd: true,
      compact: true,
      itemCell: {
        children: [
          {model: 'properties.field1'},
          {model: 'properties.field2'},
          {model: 'properties.field3'},
          {model: 'properties.field4'}
        ]
      },
      showLabel: false,
      sortable: true
    }

    const result = converter.convertObjectArray(objArray, logger)
    expect(result).to.eql(arrayOptions)
  })

  it('.convertSchema() converts a schema', function () {
    return converter.convertSchema(data.uiSchema1, logger)
      .then((result) => {
        expect(result).to.eql(data.uiSchema2)
      })
  })
})
