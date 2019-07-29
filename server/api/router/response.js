

export default class Response {
  constructor() {
    this.code = '';
    this.data = {};
  }
}

export const StatusCode = Object.freeze ({
  Success : '200',
  Created : '201',
  BadRequest : '400',
  Unauthorized : '401',
  Forbidden : '403',
  NotFound : '404',
  MethodNotAllowed : '405',
  NotAcceptable : '406',
  Conflict : '409',
  InternalServerError : '500',
  ServiceUnavailable : '503'
});

export const ResponseCode = Object.freeze ({
  Success : '200',
  DBError : '901'
});
