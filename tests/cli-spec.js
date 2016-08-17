'use strict'

/* eslint no-undef:0 */
/* eslint no-unused-vars:0 */

var expect = require('chai').expect
var cli = require('../bin/index')
var Logger = require('../lib/logger')
var sinon = require('sinon')
var fs = require('fs')
var fsp = require('fs-promise')
var commander = require('commander')
var utils = require('../lib/utils')
var uis1Converter = require('../lib/converter-uis1')
var bv1Converter = require('../lib/converter-bv1')

describe('the cli', function () {
  let logger = new Logger(false)

  beforeEach(function () {
    sinon.stub(fs, 'watch')
    sinon.stub(cli, 'validateAction')
    sinon.stub(cli, 'convertAction')
    sinon.stub(logger, 'warn')
    sinon.stub(logger, 'error')
    sinon.stub(fsp, 'writeFile').returns(Promise.resolve({}))
    sinon.stub(fsp, 'readFile').returns(Promise.resolve('yup'))
    sinon.stub(uis1Converter, 'convert').returns(Promise.resolve('yeah'))
    sinon.stub(bv1Converter, 'convert').returns(Promise.resolve('yeah'))
    sinon.stub(utils, 'getLegacyViewType').returns(Promise.resolve('uis1'))
    sinon.stub(utils, 'parseJSON').returns(Promise.reject('someerror'))
    sinon.stub(logger, 'print')
    sinon.stub(logger, 'success')
    sinon.stub(logger, 'log')
  })

  afterEach(function () {
    fs.watch.restore()
    if (cli.validateAction.restore) cli.validateAction.restore()
    if (cli.convertAction.restore) cli.convertAction.restore()
    if (cli.validator.restore) cli.validator.restore()
    if (cli.converter.restore) cli.converter.restore()
    logger.warn.restore()
    logger.log.restore()
    utils.parseJSON.restore()
    logger.error.restore()
    logger.print.restore()
    logger.success.restore()
    uis1Converter.convert.restore()
    bv1Converter.convert.restore()
    utils.getLegacyViewType.restore()
    fsp.writeFile.restore()
    fsp.readFile.restore()
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
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, '1.1.1')
    expect(cmdr.rawArgs).to.eql(processMock.argv)
  })

  it('calls validate when told', function () {
    const processMock = {argv: ['', '', 'validate', 'someotherarg']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, '1.1.1')
    expect(cli.validateAction.called).not.to.be.ok
  })

  it('calls convert when told', function () {
    const processMock = {argv: ['', '', 'convert', 'someotherarg']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, '1.1.1')
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

  it('has options set', function () {
    const processMock = {argv: ['', '', 'validate', 'somearg', 'someotherarg', '-v', '-w']}
    const cmdr = cli.startBunsen(commander, processMock, cli.validateAction, cli.convertAction, logger, '1.1.1')
    expect(cmdr.args[2].verbose).to.be.ok
    expect(cmdr.args[2].watch).to.be.ok
  })

  it('.converter() works', function () {
    console.log(cli.converter)
    utils.parseJSON.returns(Promise.resolve('great'))
    return cli.converter('somefile', 'someoutfile', logger)
      .then((result) => {
        expect(result).to.be.ok
      })
  })

  it('.converter() bails if no file specified', function () {
    cli.convertAction.restore()
    const cmdr = cli.convertAction(undefined, undefined, {verbose: true, watch: false})
    expect(cli.converter.called).not.to.be.ok
  })

  it('.validateAction() bails if no file specified', function () {
    cli.validateAction.restore()
    const cmdr = cli.validateAction(undefined, undefined, {verbose: true, watch: false}) 
    expect(cli.validator.called).not.to.be.ok
  })
})

