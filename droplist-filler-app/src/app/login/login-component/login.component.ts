import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	@Input() usernameSelector:string = "";
	username = "";

	constructor(private loginService:LoginService) { }

	ngOnInit() {
		this.getUser();
	}

	public getUser () {
		this.username = this.loginService.getCookieValue (this.usernameSelector);
	}

	public setUser () {
		this.loginService.setCookieValue(this.usernameSelector, this.username);
	}

}
