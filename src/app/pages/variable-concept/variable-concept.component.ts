import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-variable-concept',
  templateUrl: './variable-concept.component.html',
  styleUrls: ['./variable-concept.component.scss']
})
export class VariableConceptComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  variableConcept: any = [];
  selectedVariableConcept: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string = "No hay concepto variables añadidos. Añade tu primer concepto variable en el formulario anterior";
  model: any = {
    variableConceptName: '',
    accountNumber: '',
    accountContability: '',
  };
  tmpModel = [];
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

    this._api.getVariableConcept().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.variableConcept = (response.items) ? response.items : null;
          this.displayPagination = false;
          if (this.variableConcept) {
            this.displayPagination = (this.variableConcept.length > this.pagination);
          }

        }
      }

    });

  }

  selectVariableConcept(variableConcept) {
    this.tmpModel = _.cloneDeep(this.variableConcept);
    this.displayDialog = true;
    this.selectedVariableConcept = variableConcept;
  }

  addVariableConcept() {
    if (this.model.variableConceptName === '' || this.model.accountNumber === '' || this.model.accountContability === '') {
      this._notification.info('¡Aviso!', 'Debes rellenar los datos correctamente');
      return false;
    }
    if (this.model.accountNumber === this.model.accountContability ) {
      this._notification.info('¡Aviso!', 'Las cuentas no pueden repetirse');
      return false;
    }
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.variableConceptName) {
        let body;
        body = 'variable_concept_name=' + this.model.variableConceptName;
        body += '&account_number=' + this.model.accountNumber;
        body += '&account_contability=' + this.model.accountContability;
        body += '&id_company=' + dataSelected.company;
        body += '&id_fiscal_year=' + dataSelected.year;
        this._api.insertVariableConcept(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el concepto variable');
            this.variableConcept.unshift(response.items[0]);
            this.variableConcept = [...this.variableConcept];
            this.model.variableConceptName = '';
            this.model.accountContability = '';
            this.model.accountNumber = '';
          } else {
            this._notification.error('¡Error!', response.msg);
          }

        });
      } else {
        this._notification.error('¡Aviso!', 'Debes rellenar los datos correctamente');
      }
    }
  }

  updateApi() {
    if (this.selectedVariableConcept.account_number === this.selectedVariableConcept.account_contability ) {
      this._notification.info('¡Aviso!', 'Las cuentas no pueden repetirse');
      return false;
    }
    let body = '';
    this.idSelected = parseInt(this.selectedVariableConcept.id, 10);
    body = 'id=' + this.selectedVariableConcept.id + '&variable_concept_name=' + this.selectedVariableConcept.name;
    body += '&account_number=' + this.selectedVariableConcept.account_number;
    body += '&account_contability=' + this.selectedVariableConcept.account_contability;
    this._api.updateVariableConcept(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {

    if (response.status === 'ok') {
      this.displayDialog = false;
      this._notification.success('¡Éxito!', 'Se ha actualizado el concepto variable');
    } else {
      this.variableConcept = [...response.items];
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }
  cancelDialog() {
    this.displayDialog = false;
    this.variableConcept = this.tmpModel;
  }

  deleteVariableConcept(variableConcept) {
    this.displayDialogDelete = true;
    this.selectedVariableConcept = variableConcept;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedVariableConcept.id, 10);
    this._api.deleteVariableConcept(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.variableConcept, (o) => { return o.id == this.idSelected; });
      this.variableConcept.splice(idx, 1);
      this.variableConcept = [...this.variableConcept];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el concepto variable');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }
}
