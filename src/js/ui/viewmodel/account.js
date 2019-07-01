import { Subject } from 'rxjs';
import ComponentEvent from 'Skeleton/event';
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
  }

  reset() {
    this.name = '';
    this.id = '';
		this.bank= -1;
		this.rank = -1;
    this.accessToken = '';
  }

  setData(userData) {
		//this.name = userData.name;
		//this.id = userData.id;
		this.name = 'N'+uuidv4();
		this.id = "ID"+uuidv4();
		this.bank= 1000;
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
		/*
		FB.login( (response) => {
      ( response.Status === 'connected' ) ? this.onLogin(response.authResponse.accessToken) : this.onLoginError();
    }, {scope: 'public_profile,email'});
		*/
		this.onLogin('accessToken');
    return this.delegate;
  }

  getProFile () {
    this.delegate.next(new ComponentEvent( EVENT.PROGRESS));
		/*
		FB.api('/me', (response) => {
      this.info.setData(response)
      this.delegate.next(new ComponentEvent( EVENT.ON_PROFILE, this.info));
    });
		*/
		this.info.setData();
		this.delegate.next(new ComponentEvent( EVENT.ON_PROFILE, this.info));
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
