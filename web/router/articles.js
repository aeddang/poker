"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.use(function (req, res, next) {
  console.log('Time: ', Date.now().toString());
  next();
});
router.get('/', function (req, res) {
  res.send('articles');
});
router.get('/read/:id', function (req, res) {
  res.send('You are reading article ' + req.params.id);
});
var _default = router;
exports.default = _default;