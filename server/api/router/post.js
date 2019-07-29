import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./response";


const router = express.Router();
const debuger = new Debugger();
debuger.tag = "POST"

router.use((req, res, next) => {
    debuger.log(req.originalUrl, Date.now().toString());
    next();
});


router.post('/users/:id', (req, res, next) => {
  let response = new Response();
  OrientDB.db.class.get('User').then(
    (User) => {
       User.create({
         id: req.params.id,
         profileImg: req.body.profileImg,
         name: req.body.name,
         snsToken: req.body.snsToken
      }).then(
         (user)=>{
           response.code = Res.ResponseCode.Success;
           response.data = user;
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




export default router;
