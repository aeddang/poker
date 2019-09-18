import * as Rx from 'rxjs'
import Axios from  'axios-observable';
import Component from '../skeleton/component'
import * as Config from './config'

class ApiController extends Component {

  delegate:Rx.Subject
  constructor() {
    super()
  }

  remove() {
    super.remove()
    this.delegate = null
  }

  updateUser(userId, userData, serverId){
    return Axios.request({
      method: 'put',
      url: Config.API_PATH + 'users/' + userId + Config.API_QUERY,
      data: userData
    });
  }

  changeBanks(serverId, userDatas){
    return Axios.request({
      headers: {
        serverkey: Config.SERVER_KEY
      },
      method: 'put',
      url: Config.API_PATH + 'users/changebank/' + serverId + Config.API_QUERY,
      data: userDatas
    });
  }

}


export const sharedInstance = new ApiController();
