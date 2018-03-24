import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {

  constructor() { }

  public getCookieValue(a) {
		var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
		return b ? b.pop() : '';
  }
  
  public setCookieValue(key, value) {
    document.cookie = key+"="+value;
  }

}
