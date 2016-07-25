'use strict'

/* eslint no-undef:0 */
/* eslint no-unused-vars:0 */

var expect = require('chai').expect
var cli = require('../bin/index')
// // var fsp = require('fs-promise')
var sinon = require('sinon')
var process = require('process')
var fs = require('fs')

describe('the cli', function () {
  let commander

  beforeEach(function () {
    sinon.stub(fs, 'watch')
  })

  afterEach(function () {
    fs.watch.restore()
  })

  it('has the right arguments', function () {
    const processMock = {argv: ['validate', 'someotherarg']}
    const commander = cli.startBunsen(processMock)
    expect(commander.rawArgs).to.eql(processMock.argv)
  })

  it('calls validate when told', function () {
    sinon.stub(cli, 'validator')
    const commander = cli.startBunsen({argv: ['', '', 'validate', 'something']})
    expect(cli.validator.called).not.to.be.ok
  })

  it('calls convert when told', function () {
    sinon.stub(cli, 'converter')
    const commander = cli.startBunsen({argv: ['', '', 'convert', 'something']})
    expect(cli.converter.called).not.to.be.ok
  })

  it('has options set', function () {
    const processMock = {argv: ['', '', 'validate', 'somearg', 'someotherarg', '-v', '-w']}
    const commander = cli.startBunsen(processMock)
    expect(commander.verbose).to.be.ok
    expect(commander.watch).to.be.ok
  })
})
