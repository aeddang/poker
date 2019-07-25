import * as OrientDB from "./db";
import Debugger from '../skeleton/log';

const debuger = new Debugger();
debuger.tag = "DB Setup"

export function init(){
  OrientDB.db.class.create(OrientDB.Class.User)
     .then(
        (User) => {
            debuger.log('created User');
            setupUser(User)
        },
        (error) => debuger.error(error.message, 'created User')
     );
}

export function index(){
  OrientDB.db.index.create({
      name: OrientDB.Index.User,
      type: 'unique'
  }).then(
      (index) => debuger.log('created User Index'),
      (error) => debuger.error(error.message, 'created User Index')
  );

  OrientDB.db.index.create({
      name: OrientDB.Index.UserToken,
      type: 'fulltext'
  }).then(
      (index) => debuger.log('created UserToken Index'),
      (error) => debuger.error(error.message, 'created UserToken Index')
  );
}

function setupUser(User){
  User.property.create([
     {name: 'id',         type: 'String'},
     {name: 'profileImg', type: 'String'},
     {name: 'name',       type: 'String'},
     {name: 'snsToken',   type: 'String'},
     {name: 'bank',       type: 'String'}
  ]).then(
      (property) => {
          debuger.log(property, 'setup User');
      }
  );
}
