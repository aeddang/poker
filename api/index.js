"use strict";

var _app = _interopRequireDefault(require("./app"));

var _get = _interopRequireDefault(require("./router/get"));

var OrientDB = _interopRequireWildcard(require("./orient/db"));

var Setup = _interopRequireWildcard(require("./orient/setup"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(OrientDB.db);

_app.default.use('/api', _get.default); //Setup.init();


Setup.index();