import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  groups: any = [];
  selectedGroup: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string = "No hay grupos añadidos. Añade tu primer grupo en el formulario anterior";
  model: any = {
    groupName: '',
    id_customer: ''
  };
  customers: any[] = [];
  cachedGroup: any = {};
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
    this._api.getCustomers().subscribe((response) => {
      if (response != null) {

        response.items && response.items.forEach(element => {
          this.customers.push({ label: element.customer_name, value: element.id });
        });

      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los clientes.");
      }
    });
    this._api.getGroups().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.groups = (response.items) ? response.items : null;
          this.displayPagination = false;
          if (this.groups) {
            this.displayPagination = (this.groups.length > this.pagination);
          }

        }
      }

    });

  }

  selectGroup(group) {
    this.displayDialog = true;
    this.selectedGroup = _.cloneDeep(group);
    this.cachedGroup = group;
  }

  addGroup() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.groupName && this.model.id_customer) {
        let body;
        body = 'group_name=' + this.model.groupName + '&id_customer=' + this.model.id_customer;
        body += '&id_company=' + idCompany;

        this._api.insertGroup(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el grupo');
            this.groups.unshift(response.items[0]);
            this.groups = [...this.groups];
            this.model.groupName = '';
          } else {
            this._notification.error('¡Error!', response.msg);
          }
          this.model = {
            groupName: '',
            id_customer: ''
          };

        });
      } else {
        this._notification.error('¡Aviso!', 'Debes rellenar los datos correctamente');
      }
    }
  }

  updateApi(id) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      let body = '';
      this.idSelected = parseInt(this.selectedGroup.id, 10);
      body = 'id=' + this.selectedGroup.id + '&group_name=' + this.selectedGroup.group_name;
      body += '&id_customer=' + this.selectedGroup.id_customer + '&id_company=' + idCompany;
      this._api.updateGroup(body).subscribe((response) => this.parseUpdate(response));
    }
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this.cachedGroup.group_name = response.item[0].group_name;
      this.cachedGroup.customer_name = response.item[0].customer_name;
      this._notification.success('¡Éxito!', 'Se ha actualizado el grupo');
    } else {
      this.groups = [...response.items];
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  deleteGroup(group) {
    this.displayDialogDelete = true;
    this.selectedGroup = group;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedGroup.id, 10);
    this._api.deleteGroup(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.groups, (o) => { return o.id == this.idSelected; });
      this.groups.splice(idx, 1);
      this.groups = [...this.groups];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el grupo');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

}
