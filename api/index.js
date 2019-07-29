"use strict";

var _app = _interopRequireDefault(require("./app"));

var _log = _interopRequireDefault(require("./skeleton/log"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _get = _interopRequireDefault(require("./router/get"));

var OrientDB = _interopRequireWildcard(require("./orient/db"));

var Setup = _interopRequireWildcard(require("./orient/setup"));

var Response = _interopRequireWildcard(require("./router/response"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debuger = new _log.default();
debuger.tag = "INDEX";

_app.default.use(_bodyParser.default.urlencoded({
  extended: true
}));

_app.default.use(_bodyParser.default.json());

_app.default.use((0, _methodOverride.default)());

_app.default.use('/api', _get.default);

_app.default.use(logErrors);

_app.default.use(errorHandler);

function logErrors(err, req, res, next) {
  debuger.error(err, "log " + Date.now().toString());
  next(err);
}

function errorHandler(err, req, res, next) {
  debuger.error(err, "errorHandler");
  res.status(err.statusCode).json(err.response);
} //Setup.init();
//Setup.index();