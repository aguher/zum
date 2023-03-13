import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-fixed-concept',
  templateUrl: './fixed-concept.component.html',
  styleUrls: ['./fixed-concept.component.scss']
})
export class FixedConceptComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  fixedConcept: any = [];
  selectedFixedConcept: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  msgDelete: string = '¿Estás seguro de eliminar el concepto fijo?';
  emptyMsg: string = "No hay concepto fijos añadidos. Añade tu primer concepto fijo en el formulario anterior";
  model: any = {
    fixedConceptName: '',
    accountNumber: '',
    parent_account: '',
    type: null
  };
  types: any[] = [];
  maskSelected = null;
  parentAccounts: any[] = [];
  selectedType:boolean = false;
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
    this.collectParentAccount();
    this.types.push({ label: 'Selecciona un tipo', value: null });
    this.types.push({ label: 'Cuenta', value: 0 });
    this.types.push({ label: 'Subcuenta', value: 1 });

    this._api.getFixedConcept().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.fixedConcept = (response.items) ? response.items : null;
          this.displayPagination = false;
          if(this.fixedConcept) {
            this.displayPagination = (this.fixedConcept.length > this.pagination);
          }

        }
      }

    });

  }

  changeType(e) {
    if (e.value === 1 || e.value === 0) {
      this.selectedType = true;
    } else {
      this.selectedType = false;
    }
    switch(e.value) {
      case 0:
        this.maskSelected = '9999999';
        break;
      case 1:
        this.maskSelected = '9999999';
        break;
    }
  }

  collectParentAccount() {
    this._api.getParentAccount().subscribe((response) => {
      if (response !== null) {
        if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.parentAccounts = [];
          response.items.forEach(element => {
            this.parentAccounts.push({ label: element.name, value: element.id });
          });
        }
      }
    });
  }

  selectFixedConcept(fixedConcept) {
    this.displayDialog = true;
    this.selectedFixedConcept = fixedConcept;
  }

  addFixedConcept() {
    if (this.model.fixedConceptName === '' || this.model.accountNumber === '' || this.model.type === null) {
      this._notification.info('¡Aviso!', 'Debes rellenar los datos correctamente');
      return false;
    }
    if (this.model.fixedConceptName !== '' && this.model.accountNumber !== '' && this.model.type === 1 && this.model.parent_account === '') {
      this._notification.info('¡Aviso!', 'Debe rellenar los datos de la cuenta padre');
      return false;
    }
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      let body;
      body = 'fixed_concept_name=' + this.model.fixedConceptName;
      body += '&account_number=' + this.model.accountNumber;
      body += '&id_company=' + dataSelected.company;
      body += '&id_fiscal_year=' + dataSelected.year;
      body += '&id_parent=' + this.model.parent_account
      this._api.insertFixedConcept(body).subscribe((response) => {
        if (response.status === 'ok') {
          this._notification.success('¡Éxito!', 'Se ha añadido el concepto fijo');
          this.fixedConcept = []
          this.fixedConcept = response.items;
          this.fixedConcept = [...this.fixedConcept];
          this.model.fixedConceptName = '';
          this.model.accountNumber = '';
          this.model.parent_account = '';
          this.model.type = null;

          this.collectParentAccount();
        } else {
          this.fixedConcept = [...response.items];
          this.displayDialog = false;
          this._notification.error('¡Error!', response.msg);
        }

      });
    }
  }

  updateApi() {
    let body = '';
    this.idSelected = parseInt(this.selectedFixedConcept.id, 10);
    body = 'id=' + this.selectedFixedConcept.id + '&fixed_concept_name=' + this.selectedFixedConcept.name;
    body += '&account_number=' + this.selectedFixedConcept.account_number + '&id_parent=' + this.selectedFixedConcept.id_parent;
    this._api.updateFixedConcept(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this._notification.success('¡Éxito!', 'Se ha actualizado el concepto fijo');
      this.collectParentAccount();
    } else {
      this.fixedConcept = [...response.items];
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  deleteChildrenConcept(item) {
    this.displayDialogDelete = true;
    this.msgDelete = '¿Estás seguro de eliminar el concepto fijo?';
    this.selectedFixedConcept = item;
  }

  deleteParentConcept(item) {
    this.displayDialogDelete = true;
    this.msgDelete = '¿Estás seguro de eliminar el concepto padre?';
    this.selectedFixedConcept = item;
  }

  deleteApi(item) {
    this.idSelected = parseInt(this.selectedFixedConcept.id, 10);
    if (item.id_parent !== '0') {
      this._api.deleteFixedConcept(this.idSelected).subscribe((response) => this.parseDeleted(response));
    } else {
      let dataSelected = this._common.getIdCompanyYearSelected();
      if (!dataSelected) {
        this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
      } else {
        let body;

        body = 'id_company=' + dataSelected.company;
        body += '&id_fiscal_year=' + dataSelected.year;
        body += '&id_parent=' + this.idSelected

        this._api.deleteParentFixedConcept(body).subscribe((response) => this.parseDeleted(response));
      }
    }
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.fixedConcept, (o) => { return o.id == this.idSelected; });
      this.fixedConcept.splice(idx, 1);
      this.fixedConcept = [...this.fixedConcept];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el concepto fijo');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }
}
