"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = _log;
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var colors = require('colors');

var IS_DEBUG = true;
var IS_WARNNING = true;
var DEBUG_LEVEL = 1;
var DEBUG_TAG = '';
colors.setTheme({
  prompt: 'grey',
  info: 'green',
  warn: 'yellow',
  log: 'white',
  error: 'red'
});

var Debugger =
/*#__PURE__*/
function () {
  function Debugger() {
    _classCallCheck(this, Debugger);

    this.tag = '';
  }

  _createClass(Debugger, [{
    key: "info",
    value: function info(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _log(this.tag, 'info', value, key);
    }
  }, {
    key: "log",
    value: function log(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      if (!IS_DEBUG) return;
      if (DEBUG_LEVEL > level) return;
      if (DEBUG_TAG != "" && DEBUG_TAG != this.tag) return;

      _log(this.tag, 'log', value, key);
    }
  }, {
    key: "error",
    value: function error(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _log(this.tag, 'error', value, key);
    }
  }, {
    key: "warn",
    value: function warn(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (!IS_WARNNING) return;

      _log(this.tag, 'warn', value, key);
    }
  }]);

  return Debugger;
}();

exports.default = Debugger;

function _log(tag, debugType, value) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  var type = _typeof(value);

  var header = '[' + tag + ']' + (key != '' ? " " + key : "") + ' -> ';

  if (type == 'object') {
    console[debugType](header.prompt);
    console.dir(value);
  } else {
    console[debugType](header.prompt + String(value)[debugType]);
  }
}