"use strict";

var _express = _interopRequireDefault(require("express"));

var _articles = _interopRequireDefault(require("./router/articles"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = Number(process.env.PORT || 2083);
var app = (0, _express.default)();


app.use('/', _express.default.static(__dirname + '/../dist'));
app.use('/articles', _articles.default);
var server = app.listen(port, function () {
  console.log('Express listening on port ' + port);
});
