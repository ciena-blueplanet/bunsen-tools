'use strict'

/* eslint no-undef:0 */
/* eslint no-unused-vars:0 */

var expect = require('chai').expect
var cli = require('../bin/index')
var Logger = require('../lib/logger')
var sinon = require('sinon')
var fs = require('fs')
var commander = require('commander')
var EventEmitter = require('events').EventEmitter

describe('the cli', function () {
  let logger = new Logger(false)

  beforeEach(function () {
    sinon.stub(fs, 'watch')
    sinon.stub(cli, 'validateAction')
    sinon.stub(cli, 'convertAction')
    sinon.stub(logger, 'warn')
  })

  afterEach(function () {
    fs.watch.restore()
    if (cli.validateAction.restore) cli.validateAction.restore()
    if (cli.convertAction.restore) cli.convertAction.restore()
    if (cli.validator.restore) cli.validator.restore()
    logger.warn.restore()
  })

  it('.watch() watches', function () {
    const file = 'somefile'
    const callback = sinon.spy()
    cli.watch(file, callback, true)
    expect(fs.watch.called).to.be.ok
    expect(fs.watch.lastCall.args).to.eql([file, {encoding: 'buffer'}, callback])
  })

  it('has the right arguments', function () {
    const processMock = {argv: ['', '', 'validate', 'someotherarg']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cmdr.rawArgs).to.eql(processMock.argv)
  })

  it('calls validate when told', function () {
    const processMock = {argv: ['', '', 'validate', 'someotherarg']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cli.validateAction.called).not.to.be.ok
  })

  it('calls convert when told', function () {
    const processMock = {argv: ['', '', 'convert', 'someotherarg']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cli.convertAction.called).not.to.be.ok
  })

  it('has options set', function () {
    const processMock = {argv: ['', '', 'validate', 'somearg', 'someotherarg', '-v', '-w']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cmdr.args[2].verbose).to.be.ok
    expect(cmdr.args[2].watch).to.be.ok
  })

  it('.converter() bails if no file specified', function () {
    cli.convertAction.restore()
    sinon.stub(cli, 'converter')
    const cmdr = cli.convertAction(logger, undefined, undefined)
    expect(logger.warn.called).to.be.ok
    expect(cli.converter.called).not.to.be.ok
  })

  it('.validateAction() bails if no file specified', function () {
    cli.validateAction.restore()
    const cmdr = cli.validateAction(logger, false, undefined, undefined)
    expect(logger.warn.called).to.be.ok
    expect(cli.validator.called).not.to.be.ok
  })
})
