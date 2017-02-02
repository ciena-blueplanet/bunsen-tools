'use strict'

/* eslint no-undef:0 */
var expect = require('chai').expect
var Logger = require('../lib/logger')
// var fsp = require('fs-promise')
var sinon = require('sinon')
// var Promise = require('promise')
require('colors')

function spyDuring (obj, method, callback) {
  const logSpy = sinon.stub(obj, method)
  callback(logSpy)
  obj[method].restore()
  return logSpy
}

describe('the logger', function () {
  let logger
  beforeEach(function () {
    logger = new Logger(true)
  })

  it('exists', function () {
    expect(logger).not.to.equal(undefined)
  })

  it('logs a message if in verbose mode', function () {
    const spy = spyDuring(console, 'log', () => {
      logger.log('test')
    })
    expect(spy.lastCall.args[0]).to.eql('test')
  })

  it('prints a sucess message', function () {
    const spy = spyDuring(console, 'log', () => {
      logger.success('test')
    })
    expect(spy.lastCall.args[0]).to.eql('\nSUCCESS: '.green + '\ntest')
  })

  it('it prints a message regardless of mode', function () {
    logger.verbose = false
    const spy = spyDuring(console, 'log', () => {
      logger.print('test')
    })
    expect(spy.called).not.to.equal(undefined)
  })

  it('does not log a message if not in verbose mode', function () {
    logger.verbose = false
    const spy = spyDuring(console, 'log', () => {
      logger.log('test')
    })
    expect(spy.called).to.equal(false)
  })

  it('logs a warning as a string', function () {
    const spy = spyDuring(console, 'warn', () => {
      logger.warn('test')
    })
    expect(spy.lastCall.args[0]).to.eql('WARNING: '.yellow + 'test')
  })

  it('logs a warning as an object', function () {
    const errorObj = {'foo': 'bar'}
    const spy = spyDuring(console, 'warn', () => {
      logger.warn(errorObj)
    })
    expect(spy.lastCall.args[0]).to.eql('WARNING: '.yellow + JSON.stringify(errorObj, null, 2))
  })

  it('logs a bit of info', function () {
    const spy = spyDuring(console, 'info', () => {
      logger.info('test')
    })
    expect(spy.lastCall.args[0]).to.eql('INFO: '.cyan + 'test')
  })

  it('logs errors as strings', function () {
    const spy = spyDuring(console, 'error', () => {
      logger.error('test')
    })
    expect(spy.lastCall.args[0]).to.eql('ERROR: '.red + 'test')
  })

  it('logs errors as an object', function () {
    const errorObj = {'foo': 'bar'}
    const spy = spyDuring(console, 'error', () => {
      logger.error(errorObj)
    })
    expect(spy.lastCall.args[0]).to.eql('ERROR: '.red + JSON.stringify(errorObj, null, 2))
  })
})
