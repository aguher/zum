import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { NotificationsService } from 'angular2-notifications';
import { Common } from '../../../api/common';
import { TokenService } from 'app/services/token.service';

@Component({
  selector: 'app-customers-edit',
  templateUrl: './customers-edit.component.html',
  styleUrls: ['./customers-edit.component.scss']
})
export class CustomersEditComponent implements OnInit {
  
  selectedNewAddress:any;
  tabSeleccionada = 1;
  direcciones:any;
  bHayDirecciones= false;
  numPage = 1;
  pagination = 5;
  arrpages;
  selectedAddress=null;
  countries = [];
  roleUser : number =-1;
  

  constructor(    
    private _notification: NotificationsService,
    private _api: ApiService, 
    private _common: Common,
    private _token : TokenService) {
     }


  @Input() selectedCustomer;

  @Output() cancelar= new EventEmitter<boolean>();
  @Output() insertar= new EventEmitter<string>();

  pais:any;

  ngOnInit() {
    this._api.getCountries().subscribe((response) => {
      response.items.forEach(element => {
        this.countries.push({label: element.Country, value: element.id});

        this.pais = 1;
      });
    });

    let infoUser : any = this
    ._token
    .getInfo();

  this.roleUser = parseInt(infoUser.role);

  }

  cancelEdition(){
    this.tabSeleccionada = 1;
    this.cancelar.emit();
  }

  paginar(){
    this.arrpages = [];

    for (let i=0; i < this.direcciones.length;i++){
      if (i%this.pagination == 0){
        this.arrpages.push(i/this.pagination+1);
      }
          
    }

    this.numPage = 1;

  }

  selectAddress(dir){
    this.selectedAddress = dir;
  }

  cargardirecciones(){
    this.selectedNewAddress={
      address: '',
      city:'',
      postal_code:'',
      id:'',
      telefono:'',
      Nombre:''
    };

    this.bHayDirecciones= false;

    this
    ._api
    .getCustomerAddresses(this.selectedCustomer.id)
    .subscribe((response) => {
      if (response !== null) {
        if (response.error) {
        } else if (response.status === 'error') {
          this
            ._notification
            .error("Aviso!", response.msg);
        } else {
          this.direcciones = response.items;
          if (this.direcciones!= undefined) {
            this.bHayDirecciones= true;
            this.paginar();
          }else{
            this.direcciones = [];
          }
        }
      }
    });
    
  }

  addCustomer() {
     let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.selectedCustomer.customer_name) {
        let body;
        body = 'customer_name=' + this.selectedCustomer.customer_name;
        body += '&cif=' + this.selectedCustomer.CIF + '&address=' + this.selectedCustomer.address + '&city=' + this.selectedCustomer.city + '&postal_code=' + this.selectedCustomer.postal_code + '&account_numberc=' + this.selectedCustomer.account_numberc + '&account_numbers=' + this.selectedCustomer.account_numbers + '&email=' + this.selectedCustomer.email + '&phone=' + this.selectedCustomer.phone;
/*         if (this.uploadFileERP) {
          body += '&logo=' + this.uploadFileERP.generatedName;
        } */

        body += '&id_company=' + idCompany;
        this._api.insertCustomer(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el cliente');
/*             this.customers.unshift(response.items[0]);
            this.customers = [...this.customers];
            this.selectedCustomer.customerName = '';
            this.selectedCustomer.CIF = '';
            this.selectedCustomer.address = '';
            this.selectedCustomer.city = '';
            this.selectedCustomer.postal_code = '';
            this.selectedCustomer.country = -1;
            this.uploadFileERP = {};
            this.selectingLogo = false; */
          } else {
            this._notification.error('¡Error!', response.msg);
          }

        });
      } else {
        this._notification.error('¡Aviso!', 'Debes rellenar los datos correctamente');
      }
    } 
    this.insertar.emit(this.selectedCustomer.customer_name);
  }

  updateApi(id) {
    let idCompany = this._common.getIdCompanySelected();
    let body = '';
    body = 'id=' + this.selectedCustomer.id + '&customer_name=' + this.selectedCustomer.customer_name;
    body += '&cif=' + this.selectedCustomer.CIF + '&address=' + this.selectedCustomer.address + '&id_company=' + idCompany
    + '&city=' + this.selectedCustomer.city 
    + '&postal_code=' + this.selectedCustomer.postal_code 
    + '&country=' + this.selectedCustomer.country
    + '&account_numberc=' + this.selectedCustomer.account_numberc
    + '&account_numbers=' + this.selectedCustomer.account_numbers
    + '&email=' + this.selectedCustomer.email 
    + '&phone=' + this.selectedCustomer.phone;

    this._api.updateCustomer(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this._notification.success('¡Éxito!', 'Se ha actualizado el cliente');
      //this.originalCustomers = _.cloneDeep(this.customers);
    } else {
      //this.customers = [...response.items];
      this._notification.error('¡Error!', response.msg);
    }
    this.cancelar.emit();
  }

  updateAddress(id, id_inner) {
      //corrijo id_inner con la página

    id_inner = +id_inner + (this.numPage-1)*this.pagination;

    let idCompany = this._common.getIdCompanySelected();
    let body = 'id=' + this.selectedAddress.id;
    body += '&address=' + this.selectedAddress.address;
    body += '&city=' + this.selectedAddress.city;
    body += '&postal_code=' + this.selectedAddress.postal_code;
    body += '&name=' + this.selectedAddress.Nombre;
    body += '&phone=' + this.selectedAddress.telefono;

    this._api.updateAddress(body).subscribe((response) => { 
      this.selectedAddress= null; 
      if (response.status === 'ok') {
        this
          ._notification
          .success('Dirección actualizada', response.msg);
      } else {
        this
          ._notification
          .error('Error', response.msg);
      }
    });  
  }

  addAddress() {
    let body = 'id_customer=' + this.selectedCustomer.id;
    body += '&address=' + this.selectedNewAddress.address;
    body += '&city=' + this.selectedNewAddress.city;
    body += '&postal_code=' + this.selectedNewAddress.postal_code;
    body += '&name=' + this.selectedNewAddress.nombre;
    body += '&phone=' + this.selectedNewAddress.telefono;

     this
      ._api
      .addAddress(body)
      .subscribe((response) => {

        if (response.status === 'ok') {
          this
            ._notification
            .success('Dirección añadida correctamente', response.msg);
        } else {
          this
            ._notification
            .error('Error', response.msg);
        }

        this
          .direcciones
          .push({
            id: response.items.id,
            address: this.selectedNewAddress.address,
            postal_code: this.selectedNewAddress.postal_code,
            city: this.selectedNewAddress.city,
            Nombre: this.selectedNewAddress.nombre,
            telefono: this.selectedNewAddress.telefono
          });
          this.bHayDirecciones = true;
          this.paginar();

          this.selectedNewAddress={
            address: '',
            city:'',
            postal_code:'',
            id:'',
            Nombre:'',
            telefono:''
          };
      }); 
  }

  removeAddress(id, id_inner) {
    //corrijo id_inner con la página

    id_inner = +id_inner + (this.numPage-1)*this.pagination;

    this
      ._api
      .removeAddress(id)
      .subscribe((response) => {
        this
          .direcciones
          .splice(id_inner, 1);
          if (this.direcciones.length % this.pagination == 0) this.paginar();
          this.selectedAddress=null;
        if (response.status === 'ok') {
          this
            ._notification
            .success('Eliminado', response.msg);
        } else {
          this
            ._notification
            .error('Error', response.msg);
        }
      });
  }

}
