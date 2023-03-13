import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  users: any = [];
  roles: any = [];
  teams: any = [];
  selectedUser: any = {};
  cachedUser: any = {};
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string = "No hay usuarios añadidos. Añade tu primer usuario en el formulario anterior";
  model: any = {
    name: '',
    email: '',
    password: '',
    selectedRol: '',
    selectedTeam: ''
  };

  savedUser: any = null;
  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common
  ) { }

  ngOnInit() {
    this.pagination = this._config.pagination;

    this._api.getUsers().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.users = (response.items) ? response.items : null;
          this.displayPagination = (this.users.length > this.pagination);
        }
      }
    });

    this._api.getRolesTeams().subscribe((response) => {
      if (response != null) {

        response.roles.forEach(element => {
          this.roles.push({ label: element.role, value: element.id });
        });
        response.teams.forEach(element => {
          this.teams.push({ label: element.team_name, value: element.id });
        });
        
      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los roles y equipos.");
      }
    });

  }
  lookupRowStyleClass(rowData) {
    return parseInt(rowData.status)===0 ? 'disabled-account-row' : '';
  }
  subscriptionUser(user) {
    let body = 'status=1';
    if(parseInt(user.status) === 1) {
      body = "status=0";
    }
    body += `&id_user=${user.id}`;
    this._api.subscritionUser(body).subscribe((response) => {
      if(response.status === 'OK') {
        user.status = response.new_status;
        this._notification.success('Estado de usuario', 'Se ha cambiado el estado de ' + user.nickname);
      } else {
        this._notification.error('Error', 'No se ha podido modificar el estado del usuario');
      }

    });
  }

  selectUser(user) {
    this.displayDialog = true;
    this.selectedUser = _.cloneDeep(user);
    this.selectedUser.selectedTeam = user.id_team;
    this.selectedUser.selectedRole = user.id_role;
    this.cachedUser = user;
  }

  addUser(f) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.name && this.model.email && this.model.password && this.model.selectedRol && this.model.selectedTeam) {
        let body;
        body = 'nickname=' + this.model.name;
        body += '&id_company=' + idCompany;
        body += '&email=' + this.model.email;
        body += '&password=' + this.model.password;
        body += '&id_role=' + this.model.selectedRol;
        body += '&id_team=' + this.model.selectedTeam;

        this._api.insertUser(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el usuario');
            this.users.unshift(response.item[0]);
            this.users = [...this.users];
            this.model.userName = '';
            this.model = {};
          } else {
            this._notification.error('¡Error!', response.msg);
          }

        });
      } else {
        this._notification.error('¡Aviso!', 'Debes rellenar los datos correctamente');
      }
    }
    f.resetForm();
  }

  updateApi(id) {
    let body = '';
    this.idSelected = parseInt(this.selectedUser.id, 10);
    body = 'id=' + this.selectedUser.id + '&nickname=' + this.selectedUser.nickname;
    body += '&email=' + this.selectedUser.email + '&password=' + this.selectedUser.password;
    body += '&id_role=' + this.selectedUser.selectedRole + '&id_team=' + this.selectedUser.selectedTeam;

    this._api.updateUser(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this._notification.success('¡Éxito!', 'Se ha actualizado el usuario');

      this.cachedUser.nickname = response.item[0].nickname;
      this.cachedUser.email = response.item[0].email;
      this.cachedUser.password = response.item[0].password;
      this.cachedUser.team_name = response.item[0].team_name;
      this.cachedUser.role = response.item[0].role;
    } else {
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  deleteUser(user) {
    this.displayDialogDelete = true;
    this.selectedUser = user;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedUser.id, 10);
    this._api.deleteUser(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.users, (o) => { return o.id == this.idSelected; });
      this.users.splice(idx, 1);
      this.users = [...this.users];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el usuario');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

}
