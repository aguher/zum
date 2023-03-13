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
import { TokenService } from 'app/services/token.service';

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";

const URL = environment.urlUploadLogo;
const URL_UPLOAD = environment.urlLogoUpload;

@Component({
  selector: 'app-customers-new',
  templateUrl: './customers-new.component.html',
  styleUrls: ['./customers-new.component.scss']
})
export class CustomersNewComponent implements OnInit {

  filtronombre:any;
  filtrocif:any;
  filtrodireccion:any;
  filtrociudad:any;
  filtroctacliente:any;
  filtroctaproveedor:any;
  filtrocodigopostal:any;
  filtropais:any;
  tabSeleccionada=1;

  filtroconnombre:any;
  filtroconapellido:any;
  filtroconempresa:any;                
  filtrocontelefono:any;  
  filtroconmail:any;  

  selectingLogo = false;
  urlUpload = null;
  uploading: boolean = false;
  files: UploadFile[];
  uploadInputERP: EventEmitter<UploadInput>;
  uploadInputBackup: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  pagination: number;
  numPage:number = 1;
  numPageContactos:number = 1;
  arrpages= [];
  arrpagescontactos = [];
  idSelected: number = null;
  customers: any = [];
  clientesfiltrados: any[];
  contacts:any =[];
  contactosfiltrados:any = [];
  originalCustomers: any = [];
  selectedCustomer: any;
  displayDialog: boolean;
  displayDialogNew: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  uploadFileERP: any = {};
  enableBtnImport: boolean = false;
  roleUser:number = -1;
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
    private _common: Common,
    private _token : TokenService
  ) {
    this.files = []; // local uploading files array
    this.uploadInputERP = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.urlUpload = environment.urlLogoUpload;
  }

  ngOnInit() {
    this.pagination = 10;//this._config.pagination

    let infoUser : any = this
    ._token
    .getInfo();

  this.roleUser = parseInt(infoUser.role);

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
          this.clientesfiltrados = this.customers;
          this.filtrar();
          this.originalCustomers = _.cloneDeep(response.items);
          this.displayPagination = false;
          if (this.customers) {
            this.displayPagination = (this.customers.length > this.pagination);
          }

        }
      }

    });

    this._api.getContacts().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.contacts = (response.items) ? response.items : null;
          this.contactosfiltrados = this.contacts;
          this.filtrarcontactos();

        }
      }

    });

  }

  selectCustomer(customer=null) {
    this.displayDialog = true;
    if (customer == null){
      this.selectedCustomer={
        id:-1,
        customer_name:''
      }
      this.selectedCustomer.id_country = 1;
    }else{
      this.selectedCustomer = customer;     
      this.selectedCustomer.id_country = 1; 
    }
  }

  cancelEdition() {
    this.displayDialog = false;
    this.customers = this.originalCustomers;
    this.uploadFileERP = {};
  }

  recargar(){
    this.displayDialog = false;
    console.log('recarga');
    this._api.getCustomers().subscribe((response) => {
      if (response !== null) {
          this.customers = (response.items) ? response.items : null;
          this.clientesfiltrados = this.customers;
          this.filtrar();
          this.originalCustomers = _.cloneDeep(response.items);
          this.displayPagination = false;
          if (this.customers) {
            this.displayPagination = (this.customers.length > this.pagination);
          }
      }

    });
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
      this.filtrar();
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

  filtrar(){
    this.clientesfiltrados = [];
    let filtroname:string = (this.filtronombre == undefined ? "" : this.filtronombre);
    let filtrocf:string = (this.filtrocif == undefined ? "" : this.filtrocif);
    let filtrodir:string = (this.filtrodireccion == undefined ? "" : this.filtrodireccion);
    let filtrociu:string = (this.filtrociudad == undefined ? "" : this.filtrociudad);
    let filtroccli:string = (this.filtroctacliente == undefined ? "" : this.filtroctacliente);
    let filtrocprov:string = (this.filtroctaproveedor == undefined ? "" : this.filtroctaproveedor);
    let filtrocp:string = (this.filtrocodigopostal == undefined ? "" : this.filtrocodigopostal);
    let filtropai:string = (this.filtropais == undefined ? "" : this.filtropais);

    

    for (let i= 0; i < this.customers.length; i++){
      if (this._common.getCleanedString(this.customers[i].customer_name).indexOf(this._common.getCleanedString(filtroname)) >= 0 &&
      this._common.getCleanedString(this.customers[i].CIF).indexOf(this._common.getCleanedString(filtrocf)) >= 0 &&
      this._common.getCleanedString(this.customers[i].address).indexOf(this._common.getCleanedString(filtrodir)) >= 0 &&
      this._common.getCleanedString(this.customers[i].city).indexOf(this._common.getCleanedString(filtrociu)) >= 0 &&
      this._common.getCleanedString(this.customers[i].account_numberc).indexOf(this._common.getCleanedString(filtroccli)) >= 0 &&
      this._common.getCleanedString(this.customers[i].account_numbers).indexOf(this._common.getCleanedString(filtrocprov)) >= 0 &&    
      this._common.getCleanedString(this.customers[i].postal_code).indexOf(this._common.getCleanedString(filtrocp)) >= 0 &&
      this._common.getCleanedString(this.customers[i].country).indexOf(this._common.getCleanedString(filtropai)) >= 0   
        ){ 
         this.clientesfiltrados.push(this.customers[i]);
       }
    } 
    this.paginar();
  }

  filtrarcontactos(){
     this.contactosfiltrados = [];
    let filtronom:string = (this.filtroconnombre == undefined ? "" : this.filtroconnombre);
    let filtroape:string = (this.filtroconapellido == undefined ? "" : this.filtroconapellido);
    let filtroemp:string = (this.filtroconempresa == undefined ? "" : this.filtroconempresa);
    let filtrofon:string = (this.filtrocontelefono == undefined ? "" : this.filtrocontelefono);
    let filtromai:string = (this.filtroconmail == undefined ? "" : this.filtroconmail);


     

    for (let i= 0; i < this.contacts.length; i++){
      if (this._common.getCleanedString(this.contacts[i].name).indexOf(this._common.getCleanedString(filtronom)) >= 0 &&
      this._common.getCleanedString(this.contacts[i].surname).indexOf(this._common.getCleanedString(filtroape)) >= 0 &&
      this._common.getCleanedString(this.contacts[i].customer_name).indexOf(this._common.getCleanedString(filtroemp)) >= 0 &&
      this._common.getCleanedString(this.contacts[i].phone).indexOf(this._common.getCleanedString(filtrofon)) >= 0 &&
      this._common.getCleanedString(this.contacts[i].email).indexOf(this._common.getCleanedString(filtromai)) >= 0 
        ){ 
         this.contactosfiltrados.push(this.contacts[i]);
       }
    } 
    this.paginarcontactos(); 
  }

  paginar(){
    this.arrpages = [];

    for (let i=0; i < this.clientesfiltrados.length;i++){
      if (i%this.pagination == 0){
        this.arrpages.push(i/this.pagination+1);
      }
          
    }

    this.numPage = 1;

  }

  paginarcontactos(){
    this.arrpagescontactos = [];

    for (let i=0; i < this.contactosfiltrados.length;i++){
      if (i%this.pagination == 0){
        this.arrpagescontactos.push(i/this.pagination+1);
      }
          
    }

    this.numPageContactos = 1;

  }


  exportExcel(): void {
    let exportData = [];
    let ws_name = '';

    exportData = this.fillExcelData();
    ws_name = 'Listado de clientes';

    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(exportData);

    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;


    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      };
      return buf;
    }
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `listado_clientes.xlsx`);
  }

  fillExcelData() {
    let exportData = [];
    this.clientesfiltrados.forEach((line) => {
        exportData.push({
          'Nombre': line.customer_name,
          'CIF': line.CIF,
          'Dirección': line.address,
          'Ciudad': line.city,
          'C.P.': line.postal_code,
          'País': line.country,
          'Cliente': line.customer,
          'Cta.Cliente': line.account_numberc,
          'Cta.Proveedor': (line.account_numbers == "0" ? "" : line.account_numbers),
          'Teléfono': line.phone,
          'E-mail': line.email
        });     
    });


    return exportData;
  }

}
