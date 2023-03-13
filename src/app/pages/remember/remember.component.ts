import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'remember',
  templateUrl: './remember.component.html',
  styleUrls: ['./remember.component.scss']
})
export class RememberComponent {

  model: any = {};
  loading = false;
  message = {
    error: '',
    success: ''
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) { }


  login() {
    this.loading = true;
    this.authenticationService.remember(this.model.email)
      .subscribe(
      (data) => {
        this.loading = false;
        if (data.estado === 'error') {
          this.message.error = 'Ha habido un error en los datos';
          this.message.success = '';
        } else {
          this.message.success = 'Hemos enviado a tu correo un email con la información';
          this.message.error = '';
        }
      },
      error => {
        this.message.error = 'Ha habido un error en los datos';
        this.message.success = '';
        this.loading = false;
      });
  }

}