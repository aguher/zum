import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable()
export class TokenService {

	getInfo() {
		let token = localStorage.getItem('token');
		let info:User;
		if (token && token !== 'undefined') {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace('-', '+').replace('_', '/');
			info = JSON.parse(window.atob(base64)).data;
		}
		return info;
	}
}