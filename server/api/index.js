import app from "./app";
import getApi from "./router/get";
import * as OrientDB from "./orient/db";


console.log(OrientDB.db);

app.use('/api', getApi);
