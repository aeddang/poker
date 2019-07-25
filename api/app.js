"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = Number(process.env.PORT || 8000);
var app = (0, _express.default)();
var apiServer = app.listen(port, function () {
  console.log('Express listening on port ' + port);
});
var _default = app;
exports.default = _default;