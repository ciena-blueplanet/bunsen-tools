// 'use strict'
//
// /* eslint no-undef:0 */
//
// var expect = require('chai').expect
// var transforms = require('../lib/renderer')
// var Logger = require('../lib/logger')
// var _ = require('lodash')
// // var sinon = require('sinon')
// // var Promise = require('promise')
// var fixtureData = require('./fixtures/data')
//
// describe('transforms', function () {
//   let logger, data
//   beforeEach(function () {
//     data = _.cloneDeep(fixtureData)
//     logger = new Logger()
//   })
//
//   it('exists', function () {
//     expect(transforms).to.be.ok
//   })
//   //
//   // {
//   //   read: [
//   //     {
//   //       object
//   //     }
//   //   ],
//   //   write: [
//   //
//   //   ]
//   // }
//   // //
//   // // transforms: {
//   // //          additionalProperties: false,
//   // //          properties: {
//   // //            // transforms that happen when we read data in from the UI
//   // //            read: {
//   // //              '$ref': '#/definitions/transformArray'
//   // //            },
//   // //
//   // //            // transforms that happen when we write data out to the UI
//   // //            write: {
//   // //              transformArray: {
//   // //
//   //     items: {
//   //       oneOf: [
//   //         {
//   //           objectTransform: {
//   //     additionalProperties: false,
//   //     properties: {
//   //       object: {
//   //         additionalProperties: {type: 'string'},
//   //         type: 'object'
//   //       }
//   //     },
//   //     type: 'object'
//   //   },
//   //
//   //         },
//   //         {
//   //           stringTransform: {
//   //    additionalProperties: false,
//   //    properties: {
//   //      from: {type: 'string'},
//   //      global: {type: 'boolean'},
//   //      regex: {type: 'boolean'},
//   //      to: {type: 'string'}
//   //    },
//   //    required: ['from', 'to'],
//   //    type: 'object'
//   //  },
//   //         }
//   //       ]
//   //     },
//   //            }
//   //          },
//   //          type: 'object'
// //   it('.transform() converts a transform', function () {
// //     "modelTransform": {
// //                             "toObject": {
// //                                 "id": "value"
// //                             }
// //                         }
// //     "modelTransform": {"replace":{"\n":","}},
// // 38	                        "viewTransform": {"replace":{",":"\n"}}
//   // })
// })
