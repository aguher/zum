import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';
import { environment } from 'environments/environment';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

const URL = environment.urlUploadLogo;
const URL_UPLOAD = environment.urlLogoUpload;
@Component({
  selector: 'app-customer',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  selectingLogo = false;
  urlUpload = null;
  uploading: boolean = false;
  files: UploadFile[];
  uploadInputERP: EventEmitter<UploadInput>;
  uploadInputBackup: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  pagination: number;
  idSelected: number = null;
  customers: any = [];
  originalCustomers: any = [];
  selectedCustomer: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  uploadFileERP: any = {};
  enableBtnImport: boolean = false;
  requestERP: any = {
    error: false,
    success: false
  };
  emptyMsg: string = "No hay clientes añadidos. Añade tu primer cliente en el formulario anterior";
  model: any = {
    customerName: '',
    CIF: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    logo: ''
  };
  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common
  ) {
    this.files = []; // local uploading files array
    this.uploadInputERP = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.urlUpload = environment.urlLogoUpload;
  }

  ngOnInit() {
    this.pagination = this._config.pagination;

    this._api.getCustomers().subscribe((response) => {
      console.log(response);
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.customers = (response.items) ? response.items : null;
          this.originalCustomers = _.cloneDeep(response.items);
          this.displayPagination = false;
          if (this.customers) {
            this.displayPagination = (this.customers.length > this.pagination);
          }

        }
      }

    });

  }

  selectCustomer(customer) {
    this.displayDialog = true;
    this.selectedCustomer = customer;
  }

  cancelEdition() {
    this.displayDialog = false;
    this.customers = this.originalCustomers;
    this.uploadFileERP = {};
  }

  addCustomer() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.customerName) {
        let body;
        body = 'customer_name=' + this.model.customerName;
        body += '&cif=' + this.model.CIF + '&address=' + this.model.address + '&city=' + this.model.city + '&postal_code=' + this.model.postal_code + '&country=' + this.model.country;
        if (this.uploadFileERP) {
          body += '&logo=' + this.uploadFileERP.generatedName;
        }

        body += '&id_company=' + idCompany;
        this._api.insertCustomer(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el cliente');
            this.customers.unshift(response.items[0]);
            this.customers = [...this.customers];
            this.model.customerName = '';
            this.model.CIF = '';
            this.model.address = '';
            this.model.city = '';
            this.model.postal_code = '';
            this.model.country = -1;
            this.uploadFileERP = {};
            this.selectingLogo = false;
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
    let body = '';
    this.idSelected = parseInt(this.selectedCustomer.id, 10);
    body = 'id=' + this.selectedCustomer.id + '&customer_name=' + this.selectedCustomer.customer_name;
    body += '&cif=' + this.selectedCustomer.CIF + '&address=' + this.selectedCustomer.address + '&city=' + this.selectedCustomer.city + '&postal_code=' + this.selectedCustomer.postal_code + '&country=' + this.selectedCustomer.country;
    if (this.uploadFileERP && this.uploadFileERP.generatedName) {
      body += '&logo=' + this.uploadFileERP.generatedName;
    } else if (!this.uploadFileERP && this.selectedCustomer.logo === '') {
      body += '&logo=""';
    } else {
      body += '&logo=' + this.selectedCustomer.logo;
    }
    this._api.updateCustomer(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this._notification.success('¡Éxito!', 'Se ha actualizado el cliente');
      this.originalCustomers = _.cloneDeep(this.customers);
    } else {
      this.customers = [...response.items];
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
    this.uploadFileERP = {};
  }

  deleteCustomer(customer) {
    this.displayDialogDelete = true;
    this.selectedCustomer = customer;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedCustomer.id, 10);
    this._api.deleteCustomer(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.customers, (o) => { return o.id == this.idSelected; });
      this.customers.splice(idx, 1);
      this.customers = [...this.customers];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el cliente');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  handleUpload(data, type: string, editMode: boolean = false): void {
    this.uploadFileERP = {};
    if (data && data.file && data.file.response) {
      switch (type) {
        case 'erp':
          if (data.file.type === 'image/jpeg') {
            if (editMode) {
              this.selectedCustomer.logo = data.file.response.generatedName;
            }
            this.uploadFileERP = data.file.response;
            this.enableBtnImport = true;
            this.uploading = false;
          } else {
            this._notification.error('Error', 'Solo están permitidos archivos JPEG');
          }
          break;
      }
    }
  }

  onUploadOutputErp(output: UploadOutput, editMode: boolean = false): void {

    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      this.startUploadERP();
    } else if (output.type === 'addedToQueue') {
      this.files.push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
      this.uploading = true;
      // update current data in files array for uploading file
      const index = this
        .files
        .findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this
        .files
        .filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'done') { // on drop event
      this.handleUpload(output, 'erp', editMode);
    }
  }

  startUploadERP(): void { // manually start uploading
    const event: UploadInput = {
      type: 'uploadAll',
      url: URL,
      method: 'POST',
      data: {
        foo: 'bar'
      },
      concurrency: 1 // set sequential uploading of files with concurrency 1
    }

    this
      .uploadInputERP
      .emit(event);
  }
}
