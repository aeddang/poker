"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponseCode = exports.StatusCode = exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Response = function Response() {
  _classCallCheck(this, Response);

  this.code = '';
  this.data = {};
};

exports.default = Response;
var StatusCode = Object.freeze({
  Success: '200',
  Created: '201',
  BadRequest: '400',
  Unauthorized: '401',
  Forbidden: '403',
  NotFound: '404',
  MethodNotAllowed: '405',
  NotAcceptable: '406',
  Conflict: '409',
  InternalServerError: '500',
  ServiceUnavailable: '503'
});
exports.StatusCode = StatusCode;
var ResponseCode = Object.freeze({
  Success: '200',
  DBError: '901'
});
exports.ResponseCode = ResponseCode;