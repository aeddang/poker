import Axios from  'axios-observable';

const API_PATH = "http://localhost:10010/api/"
const API_QUERY = "?api_key=ironright"

export const ErrorCode = Object.freeze ({
  DBError : '901',
  DuplicatedKey : '902',
  UndefinedKey : '903',
  InvalidDataType : '904',
  UnauthorizedApiKey : '905',
  UnauthorizedAccessToken : '906',
  ValidationUserId : '907',
  ValidationLoginToken : '908',
  UnregisteredData : '909'
});

export function getUsers(){
  return Axios.request({
    method: 'get',
    url: API_PATH + 'users' + API_QUERY
  });
}

export function getUser(userId, rid = null){
  let addedQuery = (rid == null || rid == "") ? "" : ("&rid="+rid);
  console.log(addedQuery)
  return Axios.request({
    method: 'get',
    url: API_PATH + 'users/' + userId + API_QUERY + addedQuery
  });
}

export function signUp(userId, userData){
  return Axios.request({
    method: 'post',
    url: API_PATH + 'users/autosign/' + userId + API_QUERY,
    data: userData
  });
}
