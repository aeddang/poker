import * as Rx from 'rxjs'
import Axios from  'axios-observable';
import Component from '../skeleton/component'
import Config from './config'


class ApiController extends Component {

  delegate:Rx.Subject
  constructor() {
    super()
  }

  remove() {
    super.remove()
    this.delegate = null
  }

  autoSign(userId, userData){

  }

}


const api = new ApiController();
