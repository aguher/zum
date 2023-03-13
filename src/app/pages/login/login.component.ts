import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    model: any = {};
    loading: boolean = false;
    errorLogin: boolean = false;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
    }

    login() {
        this.loading = true;
        this.authenticationService.login(this.model.email, this.model.password)
            .subscribe(
            (data) => {
                this.errorLogin = false;
                if (data.status === 'error') {
                    this.errorLogin = true;
                    this.loading = false;
                    return false;
                }

                switch (data.role) {
                    case '6':
                    case '7':
                    case '8':
                    case '10':
                        this.router.navigate(['/proyectos']);
                        break;
                    case '9':
                    case '11':
                        this.router.navigate(['/almacen']);
                        break;                      
                    case '3':
                    case '4':
                    case '5':
                        this.router.navigate(['/']);
                        break;
                }
            },
            (error) => {
                console.log(error);
                this.errorLogin = true;
                this.loading = false;
            });
    }

}