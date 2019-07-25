import { Subject } from 'rxjs';
import ComponentEvent from 'Skeleton/event';
import Debugger from 'Skeleton/log';
import uuidv4 from 'uuid/v4';

export const EVENT = Object.freeze ({
	LOGIN: "login",
  LOGOUT: "logout",
  ON_PROFILE: "onProfile",
  ERROR: "error",
  PROGRESS: "progress"
});

export const Status = Object.freeze ({
	Login: "login",
  Logout: "logout"
});

class UserInfo {
  constructor() {
    this.reset();
		this.debuger = new Debugger();
		this.debuger.tag = 'UserInfo';
  }

  reset() {
    this.name = '';
    this.id = '';
		this.bank= -1;
		this.rank = -1;
    this.accessToken = '';
		this.profileImg = "";
  }

  setData(userData) {
		this.debuger.log(userData, 'setData');
		this.name = userData.name;
		this.id = userData.id;
		//this.name = instenceID;
		//this.id = "ID"+uuidv4();
		this.bank= 1000;
		this.profileImg = "./static/asset/profile_image.png";
		this.rank = 1;
  }

  getStatus() {
    return this.accessToken == "" ? Status.Logout : Status.Login;
  }
}

class LoginModel {
  constructor() {
    this.delegate = new Subject();
    this.info = new UserInfo();
		this.debuger = new Debugger();
		this.debuger.tag = 'LoginModel';
  }

  remove() {
    this.delegate.complete(this);
    this.delegate = null;
    this.info = null;
  }

  getUserData() {
    return this.info;
  }

  getStatus() {
    return this.info.getStatus();
  }

  login () {
    this.delegate.next(new ComponentEvent( EVENT.PROGRESS));
		this.debuger.log("FBLogin", 'login');
		FB.login( (response) => {
			this.debuger.log(response, 'login');
      ( response.status === 'connected' ) ? this.onLogin(response.authResponse.accessToken) : this.onLoginError();
    }, {scope: 'public_profile,email'});
		//this.onLogin('accessToken');
    return this.delegate;
  }

  getProFile () {
    this.delegate.next(new ComponentEvent( EVENT.PROGRESS));
		FB.api('/me', (response) => {
      this.info.setData(response)
      this.delegate.next(new ComponentEvent( EVENT.ON_PROFILE, this.info));
    });
		//this.info.setData();
		//this.delegate.next(new ComponentEvent( EVENT.ON_PROFILE, this.info));
    return this.delegate;
  }

  logout () {
    FB.logout();
    this.info.reset();
    this.delegate.next(new ComponentEvent( EVENT.LOGOUT ));
  }

  onLogin(accessToken) {
    this.info.accessToken = accessToken;
    this.delegate.next(new ComponentEvent( EVENT.LOGIN, accessToken));
    this.getProFile();
  }

  onLoginError() {
    this.delegate.next(new ComponentEvent( EVENT.ERROR));
  }
}

export const loginModel = new LoginModel();
