import Axios from  'axios-observable';
import * as Config from  "./config"


export function getUsers(){
  return Axios.request({
    method: 'get',
    url: Config.API_PATH + 'users' + Config.API_QUERY
  });
}

export function getRanks(groupId){
  return Axios.request({
    method: 'get',
    url: Config.API_PATH + 'ranks/' + Config.API_QUERY + "&groupId=" + groupId
  });
}

export function getUser(userId, rid = null){
  let addedQuery = (rid == null || rid == "") ? "" : ("&rid="+rid);
  console.log(addedQuery)
  return Axios.request({
    method: 'get',
    url: encodeURIComponent(Config.API_PATH + 'users/' + userId + Config.API_QUERY + addedQuery)
  });
}

export function signUp(userId, userData){
  return Axios.request({
    method: 'post',
    url: Config.API_PATH + 'users/autosign/' + userId + Config.API_QUERY,
    data: userData
  });
}

export function updateUser(userId, loginToken, userData){
  return Axios.request({
    method: 'put',
    headers: {
        'loginToken': loginToken
    },
    url: Config.API_PATH + 'users/' + userId + Config.API_QUERY,
    data: userData
  });
}

export function updateUserBank(userData, bank){
  return Axios.request({
    method: 'put',
    headers: {
        'loginToken': userData.loginToken
    },
    url: Config.API_PATH + 'users/updatebank/' + userData.id + Config.API_QUERY,
    data: {"rid": userData.rid,"bank":bank}
  });
}


export const ErrorCode = Object.freeze ({
  DBError : '901',
  DuplicatedKey : '902',
  UndefinedKey : '903',
  InvalidDataType : '904',
  UnauthorizedApiKey : '905',
  UnauthorizedAccessToken : '906',
  ValidationUserId : '907',
  ValidationLoginToken : '908',
  ValidationServerKey : '909',
  UnregisteredData : '910'
});
