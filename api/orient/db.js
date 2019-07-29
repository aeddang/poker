"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.db = exports.Index = exports.Class = void 0;

var _orientjs = _interopRequireDefault(require("orientjs"));

var Config = _interopRequireWildcard(require("../config"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dbServer = (0, _orientjs.default)({
  host: Config.host,
  port: Config.port,
  username: Config.ID,
  password: Config.PW
});
var Class = Object.freeze({
  User: "User"
});
exports.Class = Class;
var Index = Object.freeze({
  User: "User.id",
  UserToken: "User.snsToken"
});
exports.Index = Index;
var db = dbServer.use(Config.DB_TABLE);
exports.db = db;