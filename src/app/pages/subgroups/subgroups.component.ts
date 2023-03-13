import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-subgroups',
  templateUrl: './subgroups.component.html',
  styleUrls: ['./subgroups.component.scss']
})
export class SubgroupsComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  subgroups: any = [];
  selectedSubgroup: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string = "No hay subgrupos añadidos. Añade tu primer subgrupo en el formulario anterior";
  model: any = {
    subgroupName: '',
    id_group: ''
  };
  groups: any[] = [];
  cachedSubgroup: any = {};
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
    this._api.getGroups().subscribe((response) => {
      if (response != null) {

        response.items && response.items.forEach(element => {
          this.groups.push({ label: element.group_name, value: element.id });
        });

      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los grupos.");
      }
    });
    this._api.getSubgroups().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.subgroups = (response.items) ? response.items : null;
          this.displayPagination = false;
          if (this.subgroups) {
            this.displayPagination = (this.subgroups.length > this.pagination);
          }
        }
      }

    });

  }

  selectSubgroup(subgroup) {
    this.displayDialog = true;
    this.selectedSubgroup = _.cloneDeep(subgroup);
    this.cachedSubgroup = subgroup;
  }

  addSubgroup() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.subgroupName && this.model.id_group) {
        let body;
        body = 'subgroup_name=' + this.model.subgroupName + '&id_group=' + this.model.id_group;
        body += '&id_company=' + idCompany;

        this._api.insertSubgroup(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el subgrupo');
            this.subgroups.unshift(response.items[0]);
            this.subgroups = [...this.subgroups];
            this.model.subgroupName = '';
            this.model.id_group = '';
          } else {
            this._notification.error('¡Error!', response.msg);
          }

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
      this.idSelected = parseInt(this.selectedSubgroup.id, 10);
      body = 'id=' + this.selectedSubgroup.id + '&subgroup_name=' + this.selectedSubgroup.subgroup_name;
      body += '&id_group=' + this.selectedSubgroup.id_group + '&id_company=' + idCompany;
      this._api.updateSubgroup(body).subscribe((response) => this.parseUpdate(response));
    }
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this.cachedSubgroup.subgroup_name = response.item[0].subgroup_name;
      this.cachedSubgroup.group_name = response.item[0].group_name;
      this._notification.success('¡Éxito!', 'Se ha actualizado el subgrupo');
    } else {
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  deleteSubgroup(subgroup) {
    this.displayDialogDelete = true;
    this.selectedSubgroup = subgroup;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedSubgroup.id, 10);
    this._api.deleteSubgroup(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.subgroups, (o) => { return o.id == this.idSelected; });
      this.subgroups.splice(idx, 1);
      this.subgroups = [...this.subgroups];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el subgrupo');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

}
