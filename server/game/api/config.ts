export const API_KEY = 'ironright';
export const SERVER_KEY = 'ironrightGameServer';
export const API_PATH = 'http://localhost:2083/api//';
export const API_QUERY = "?api_key=" + API_KEY;

enum ErrorCode {
  DBError = '901',
  DuplicatedKey = '902',
  UndefinedKey = '903',
  InvalidDataType = '904',
  UnauthorizedApiKey = '905',
  UnauthorizedAccessToken = '906',
  ValidationUserId = '907',
  ValidationLoginToken = '908',
  UnregisteredData = '909'
}
