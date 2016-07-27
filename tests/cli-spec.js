'use strict'

/* eslint no-undef:0 */
/* eslint no-unused-vars:0 */

var expect = require('chai').expect
var cli = require('../bin/index')
var Logger = require('../lib/logger')
var sinon = require('sinon')
var fs = require('fs')
var commander = require('commander')
var utils = require('../lib/utils')

describe('the cli', function () {
  let logger = new Logger(false)

  beforeEach(function () {
    sinon.stub(fs, 'watch')
    sinon.stub(cli, 'validateAction')
    sinon.stub(cli, 'convertAction')
    sinon.stub(logger, 'warn')
    sinon.stub(logger, 'error')
    sinon.stub(utils, 'parseJSON').returns(Promise.reject('someerror'))
    sinon.stub(logger, 'print')
    sinon.stub(logger, 'success')
    sinon.stub(logger, 'log')
  })

  afterEach(function () {
    fs.watch.restore()
    if (cli.validateAction.restore) cli.validateAction.restore()
    if (cli.convertAction.restore) cli.convertAction.restore()
    if (cli.converter.restore) cli.converter.restore()
    logger.warn.restore()
    logger.log.restore()
    utils.parseJSON.restore()
    logger.error.restore()
    logger.print.restore()
    logger.success.restore()
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

  it('crashes on bad json', function () {
    return cli.converter('somefile', null, logger)
      .catch((error) => {
        expect(error).to.be.ok
      })
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
    const processMock = {argv: ['', '', 'convert', 'something']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cli.converter.called).not.to.be.ok
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

  it('.validator() bails if no file specified', function () {
    cli.validateAction.restore()
    sinon.stub(cli, 'validator')
    const cmdr = cli.validateAction(logger, undefined, undefined)
    expect(logger.warn.called).to.be.ok
    expect(cli.validator.called).not.to.be.ok
  })
})
