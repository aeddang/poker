import app from "./app";
import Debugger from './skeleton/log';
import bodyParser from "body-parser";
import methodOverride from "method-override";
import get from "./router/get";
import post from "./router/post";
import * as OrientDB from "./orient/db";
import * as Setup from "./orient/setup";
import * as Response from "./router/response";


const debuger = new Debugger();
debuger.tag = "INDEX"

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use('/api', get);
app.use('/api', post);
app.use(logErrors);
app.use(errorHandler);

function logErrors(err, req, res, next) {
  debuger.error(err,"log "+Date.now().toString());
  next(err);
}


function errorHandler(err, req, res, next) {
  debuger.error(err,  "errorHandler");
  res.status(err.statusCode).json(err.response);
}

//Setup.init();
//Setup.index();
