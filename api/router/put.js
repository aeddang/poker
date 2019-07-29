"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _log = _interopRequireDefault(require("../skeleton/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

var debuger = new _log.default();
debuger.tag = "PUT";
router.use(function (req, res, next) {
  debuger.log(req, Date.now().toString());
  next();
});
router.put('/users', function (req, res, next) {
  res.send(req);
});
var _default = router;
exports.default = _default;