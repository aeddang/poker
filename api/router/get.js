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
debuger.tag = "GET";
router.use(function (req, res, next) {
  debuger.log(req, Date.now().toString());
  next();
});
router.get('/', function (req, res) {
  res.send('Hello get Router!\n');
});
router.get('/2', function (req, res) {
  res.send('Hello get Router2!\n');
});
router.get('/3', function (req, res) {
  res.send('Hello get Router3!\n');
});
var _default = router;
exports.default = _default;