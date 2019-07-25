"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.index = index;

var OrientDB = _interopRequireWildcard(require("./db"));

var _log = _interopRequireDefault(require("../skeleton/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var debuger = new _log.default();
debuger.tag = "DB Setup";

function init() {
  OrientDB.db.class.create('User').then(function (User) {
    debuger.log('created User');
    setupUser(User);
  }, function (error) {
    return debuger.error(error.message, 'created User');
  });
}

function index() {
  OrientDB.db.index.create({
    name: OrientDB.Index.User,
    type: 'unique'
  }).then(function (index) {
    return debuger.log('created User Index');
  }, function (error) {
    return debuger.error(error.message, 'created User Index');
  });
  OrientDB.db.index.create({
    name: OrientDB.Index.UserToken,
    type: 'fulltext'
  }).then(function (index) {
    return debuger.log('created UserToken Index');
  }, function (error) {
    return debuger.error(error.message, 'created UserToken Index');
  });
}

function setupUser(User) {
  User.property.create([{
    name: 'id',
    type: 'String'
  }, {
    name: 'profileImg',
    type: 'String'
  }, {
    name: 'name',
    type: 'String'
  }, {
    name: 'snsToken',
    type: 'String'
  }, {
    name: 'bank',
    type: 'String'
  }]).then(function (property) {
    debuger.log(property, 'setup User');
  });
}