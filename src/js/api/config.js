
export const API_KEY = 'ironright';
export const API_PATH = "http://localhost:10010/api/";
export const API_QUERY = "?api_key=" + API_KEY;

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
