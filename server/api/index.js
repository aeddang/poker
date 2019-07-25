import app from "./app";
import getApi from "./router/get";
import * as OrientDB from "./orient/db";
import * as Setup from "./orient/setup";

console.log(OrientDB.db);
app.use('/api', getApi);


//Setup.init();
Setup.index();
