'use strict'

/* eslint no-undef:0 */

var expect = require('chai').expect
var converter = require('../lib/converter-bv1')
var fsp = require('fs-promise')

describe('the bv1 view converter', function () {
  beforeEach(function () {
  })

  it('exists', function () {
    expect(converter).to.be.ok
  })

  describe('.convert()', function () {
    it('converts legacy Bunsen views to UIS2', function () {
      return fsp.readFile('tests/views/bv1/test-1.json')
        .then((viewJSON) => {
          const expected = {
            version: '2.0',
            type: 'form',
            cells: [ { extends: 'main', label: 'Main' } ],
            cellDefinitions: { main: { children: [Object] } }
          }
          const view = JSON.parse(viewJSON)
          converter.convert(view)
            .then((result) => {
              expect(result).to.eql(expected)
            })
        })
    })
  })
})
