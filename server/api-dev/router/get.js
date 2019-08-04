import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./response";

const router = express.Router();
const debuger = new Debugger();
debuger.tag = "GET"

router.use((req, res, next) => {
    debuger.log(req.originalUrl,Date.now().toString());
    next();
});

router.get('/users/', (req, res, next) => {
  let response = new Response();
  OrientDB.db.class.get('User').then(
    (User) => {
       User.list().then(
         (users)=>{
           response.code = Res.ResponseCode.Success;
           response.data = users;
           res.status(Res.StatusCode.Success).json(response);
         }
       )
    },
    (error) => {
       response.code = Res.ResponseCode.DBError;
       response.data = error;
       let errorData = {statusCode: Res.StatusCode.InternalServerError, response:response};
       next(errorData);
    }
  );

});

router.post('/users/:id', (req, res, next) => {
  res.send('Hello get Router!\n');
});

router.delete('/users/', (req, res) => {
  res.send('Hello get Router!\n');
});


export default router;
