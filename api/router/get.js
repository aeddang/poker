"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _log = _interopRequireDefault(require("../skeleton/log"));

var OrientDB = _interopRequireWildcard(require("../orient/db"));

var Res = _interopRequireWildcard(require("./response"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

var debuger = new _log.default();
debuger.tag = "GET";
router.use(function (req, res, next) {
  debuger.log(req.originalUrl, Date.now().toString());
  next();
});
router.get('/users/', function (req, res, next) {
  var response = new Res.default();
  OrientDB.db.class.get('User').then(function (User) {
    User.list().then(function (users) {
      response.code = Res.ResponseCode.Success;
      response.data = users;
      res.status(Res.StatusCode.Success).json(response);
    });
  }, function (error) {
    response.code = Res.ResponseCode.DBError;
    response.data = error;
    var errorData = {
      statusCode: Res.StatusCode.InternalServerError,
      response: response
    };
    next(errorData);
  });
});
router.post('/users/:id', function (req, res, next) {
  res.send('Hello get Router!\n');
});
router.delete('/users/', function (req, res) {
  res.send('Hello get Router!\n');
});
var _default = router;
exports.default = _default;