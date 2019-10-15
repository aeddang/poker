"use strict";

var _express = _interopRequireDefault(require("express"));

var _articles = _interopRequireDefault(require("./router/articles"));

var _cors = _interopRequireDefault(require("cors"));

var _crypto = _interopRequireDefault(require("crypto"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _base64url = _interopRequireDefault(require("base64url"));

var _path = _interopRequireDefault(require("path"));

var _methodOverride = _interopRequireDefault(require("method-override"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = Number(process.env.PORT || 2053);
var app = (0, _express.default)();
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
};
app.use((0, _cors.default)(corsOptions));
app.use(_bodyParser.default.urlencoded({
  extended: true
}));
app.use(_bodyParser.default.json());
app.use((0, _methodOverride.default)());
app.post('/', function (req, res) {
  var signed_request = req.body.signed_request;
  var encodedList = signed_request.split('.');
  var payload = base64UrlDecode(encodedList[1]);
  var sig = base64UrlDecode(encodedList[0]);
  var data = JSON.parse(_base64url.default.decode(payload));
  var expectedSig = getHash(payload);

  if (sig != expectedSig) {
    console.log('Bad Signed JSON signature!');
    return res.send(null);
  }

  res.sendFile(_path.default.resolve(__dirname + '/../dist/index.html'));

  function base64UrlDecode(decode) {
    return decode.replace(/-/gi, '+').replace(/_/gi, '/');
  }

  ;

  function getHash(string) {
    var hmac = _crypto.default.createHmac('sha256', 'df601c25d0c8bafc620310c4dc3e01bc');

    hmac.update(string);
    return hmac.digest('base64').replace(/=/gi, '');
  }

  ;
});
app.use('/', _express.default.static(__dirname + '/../dist'));
app.use('/articles', _articles.default);
var server = app.listen(port, function () {
  console.log('Express listening on port ' + port);
});