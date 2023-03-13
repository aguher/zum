import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';


import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/primeng';

import { TokenService } from '../../services/token.service';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  choosenCompany: boolean = false;
  noBudgets: boolean = false;
  budgets: any = [];
  displayPagination: boolean = false;
  pagination: number = 20;

  idSelected = null;

  selectedBudget: any = null;
  newBudget: any = {
    name: ''
  };

  infoUser: any = {};

  showCol: boolean = false;

  roleUser: number = 0;

  displayDialogDelete: boolean = false;
  displayDialog: boolean = false;
  displayDialogNew: boolean = false;

  dataCombos: any = {
    users: [],
    customers: [],
    teams: [],
    groups: [],
    subgroups: []
  };
  dataSelects: any = [];

  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common,
    private _token: TokenService
  ) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label : '';
    lsYear = (lsYear) ? lsYear.label : '';

    if (lsCompany === '' || lsYear === '') {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }
  }

  ngOnInit() {
    this.infoUser = this._token.getInfo();
    this.roleUser = parseInt(this.infoUser.role);
    this.setPermissions(this.roleUser);
    this
      ._api
      .getBudgets()
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
            this
              ._auth
              .logout();
            this
              ._router
              .navigate(['/login']);
          } else if (response.status === 'error') {
            this
              ._notification
              .error("Aviso!", response.msg);
            this.noBudgets = true;
          } else {
            response
              .items
              .forEach(element => {
                element.creation_date_no_parsed = element.creation_date;
                element.end_date_no_parsed = element.end_date;
                element.creation_date = this
                  ._common
                  .parseDatefromDate(new Date(element.creation_date));
                element.end_date = this
                  ._common
                  .parseDatefromDate(new Date(element.end_date));
              });
            this.budgets = response.items;
            this.displayPagination = (this.budgets.length > this.pagination);
            this.noBudgets = false;
          }
        }
      });

    this
      ._api
      .getDataCombos()
      .subscribe((response) => {
        if (response.status !== 'error') {
          this.dataSelects = response;
          response
            .users
            .forEach((element) => {
              this
                .dataCombos
                .users
                .push({ label: element.nickname, value: element.id });
            });
          response
            .customers
            .forEach((element) => {
              this
                .dataCombos
                .customers
                .push({ label: element.customer_name, value: element.id });
            });
          response
            .teams
            .forEach((element) => {
              this
                .dataCombos
                .teams
                .push({ label: element.team_name, value: element.id });
            });
          response
            .groups
            .forEach((element) => {
              this
                .dataCombos
                .groups
                .push({ label: element.name, value: element.id });
            });
        }

      });
  }

  createNewBudget() {
    this.displayDialogNew = true;
    this.newBudget.name = '';
    this.newBudget.id_user = '';
    this.newBudget.id_customer = '';
    this.newBudget.id_team = '';
    this.newBudget.id_group = '';
    this.newBudget.id_subgroup = '';
    this.dataCombos.groups = [];
    this.dataCombos.subgroups = [];
    this.dataCombos.users = [];
  }

  addBudget() {
    if (this.newBudget.name === '' || this.newBudget.id_customer === '' || this.newBudget.id_group === '' || this.newBudget.id_subgroup === '') {
      this
        ._notification
        .info('¡Aviso!', 'Debes rellenar los datos correctamente');
      return false;
    }
    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      let body;
      body = 'name=' + this.newBudget.name;
      body += '&id_company=' + dataSelected.company;
      body += '&id_fiscal_year=' + dataSelected.year;
      body += '&id_user=' + this.infoUser.id_user;
      body += '&id_customer=' + this.newBudget.id_customer;
      body += '&id_team=' + this.infoUser.id_team;
      body += '&id_group=' + this.newBudget.id_group;
      body += '&id_subgroup=' + this.newBudget.id_subgroup;

      this
        ._api
        .addBudget(body)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this.displayDialogNew = false;
            this.budgets = []
            this.budgets = response.items;
            this.budgets = [...this.budgets];
            this
              ._notification
              .success('¡Éxito!', 'Se ha añadido el presupuesto');
          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
          }
        });
    }
  }

  changeCustomer(e) {
    let groups = _.filter(this.dataSelects.groups, (element) => {
      return element.id_customer === e.value
    });
    this.dataCombos.groups = [];
    this.dataCombos.subgroups = [];
    groups.forEach((element) => {
      this
        .dataCombos
        .groups
        .push({ label: element.name, value: element.id });
    });
  }

  changeGroup(e) {
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === e.value
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this
        .dataCombos
        .subgroups
        .push({ label: element.name, value: element.id });
    });
  }

  setPermissions(role) {
    switch (role) {
      case 4:
      case 5:
        this.showCol = false;
        break;
      case 3:
      case 6:
      case 7:
      case 8:
        this.showCol = true;
        break;
    }
  }

  selectBudget(item, index) {

    this.displayDialog = true;
    this.selectedBudget = _.cloneDeep(item);
    this.selectedBudget.idx = index;

    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === this.selectedBudget.id_team
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this
        .dataCombos
        .users
        .push({ label: element.nickname, value: element.id });
    });
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === this.selectedBudget.id_group
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this
        .dataCombos
        .subgroups
        .push({ label: element.name, value: element.id });
    });
  }

  updateBudget() {
    let body = '';
    this.idSelected = parseInt(this.selectedBudget.id, 10);

    body = `id=${this.idSelected}`;
    body += `&idx=${this.selectedBudget.idx}`;
    body += `&name=${this.selectedBudget.name}`;
    body += `&id_user=${this.selectedBudget.id_user}`;
    body += `&id_customer=${this.selectedBudget.id_customer}`;
    body += `&id_team=${this.selectedBudget.id_team}`;
    body += `&id_group=${this.selectedBudget.id_group}`;
    body += `&id_subgroup=${this.selectedBudget.id_subgroup}`;
    this
      ._api
      .updateBudget(body)
      .subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha actualizado el presupuesto');
      this.updateRows(response);
    } else {
      this.displayDialog = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  updateRows(response) {
    this.budgets[parseInt(response.idx)].name = response.item[0].name;
    this.budgets[parseInt(response.idx)].user = response.item[0].user;
    this.budgets[parseInt(response.idx)].id_user = response.item[0].id_user;
    this.budgets[parseInt(response.idx)].customer = response.item[0].customer;
    this.budgets[parseInt(response.idx)].team = response.item[0].team;
    this.budgets[parseInt(response.idx)].grupo = response.item[0].grupo;
    this.budgets[parseInt(response.idx)].subgroup = response.item[0].subgroup;
  }


  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);
    this
      ._api
      .deleteBudget(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  deleteBudget(item) {
    this.displayDialogDelete = true;
    this.selectedBudget = item;
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.budgets, (o) => {
        return o.id == this.idSelected;
      });
      this
        .budgets
        .splice(idx, 1);
      this.budgets = [...this.budgets];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el proyecto');
      if (this.budgets.length === 0) {
        this.noBudgets = true;
      }
    } else {
      this.displayDialogDelete = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  resumeBudget(budget) {
    this
      ._router
      .navigate(['/presupuesto', budget.id]);
  }
}
