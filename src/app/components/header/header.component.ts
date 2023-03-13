import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/primeng';

import { NotificationsService } from 'angular2-notifications';

import { AuthenticationService } from '../../services/authentication.service';
import { TokenService } from '../../services/token.service';
import { Common } from '../../api/common';


import { ApiService } from '../../services/api.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  profileInfo: any = {};
  companies: SelectItem[];
  fiscalYears: SelectItem[];
  isHidden: boolean = true;
  visibleSubmenu: boolean = false;
  password:string = "";
  passwordrpt:string = "";

  storeCompany: any;
  storeYear: any;
  selectedCompany: any = {
    id: null,
    name: ''
  };
  selectedYear: any;
  companiesData: any = [];
  displayDialogPassword = false;

  roleUser: number = 0
  loaded: boolean = false;
  idCompany: number = 0;
  showSelectCompany: boolean = true;

  showSearchBar: boolean = true;
  urllogo:string = "https://www.zumweb.es/authentication/logo/";

  constructor(
    private _auth: AuthenticationService,
    private _route: Router,
    private _common: Common,
    private _token: TokenService,
    private _notification: NotificationsService,
    private _api: ApiService,
  ) {
    _auth.isLogged$.subscribe(value => this.logoutUser(value));
    _route.events.subscribe((val) => {
      // see also 
      if (val instanceof NavigationEnd) {
        let url = val.url.split('/')[1];
        switch (url) {
          case 'desglose':
          case 'informe-proyectos':
            this.showSearchBar = false;
            break;
          default:
            this.showSearchBar = true;
        }
      }
    });
  }

  ngOnInit() {
    this.profileInfo = this._token.getInfo();
    if (this.profileInfo) {
      this.profileInfo.initials = this.getInitials();
      this.roleUser = parseInt(this.profileInfo.role);
      this.idCompany = parseInt(this.profileInfo.id_company);
      this.getCompanies();
      setTimeout(_ => this.loaded = true, 100);
    }
  }

  updatePassword() {
    this.displayDialogPassword = true;
    this.password = "";
    this.passwordrpt = "";
  }

  updatePasswordApi(){
    let body = '';


      if (this.password != this.passwordrpt){
        this
        ._notification
        .error('¡Error!', "La contraseña no coincide");

      }else if (this.password.length < 6){
        this
        ._notification
        .error('¡Error!', "Debe tener al menos 6 caracteres");
      } else{

        body = `id_user=${this.profileInfo.id_user}&password=${this.password}`;

        this
        ._api
        .updatePassword(body)
        .subscribe((response) => this.parsePassword(response));
      }


  }

  parsePassword(response) {
    if (response.status === 'ok') {
      this.displayDialogPassword = false;
      this
        ._notification
        .success('¡Éxito!', response.msg);
    } else {
      this.displayDialogPassword = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  getCompanies() {
    this.companies = [];
    this.fiscalYears = [];
    this.fiscalYears.push({ label: 'Selecciona el ejercicio', value: null });
    this.companies.push({ label: 'Selecciona la empresa', value: null });
    this._api.getCompanies().subscribe((response) => {
      if (response.error) {
        this._auth.logout();
        this._route.navigate(['/login']);
      }

      this.companiesData = response.items;
      if (this.companiesData) {
        this.companiesData.forEach(element => {
          this.companies.push({ label: element.company.name, value: { id: element.company.id, name: element.company.name, address: element.company.address, address_bis: element.company.address_bis, cif: element.company.cif, logo: element.company.logo, phone: element.company.phone, credits: element.company.credits, rgpd: element.company.rgpd  } });
        });
        this.updateCompany();
      }
      if (this.profileInfo.role !== '3') {
        // seleccionamos directamente la empresa
        this.showSelectCompany = false;
        this.fiscalYears = [];
        this.fiscalYears.push({ label: 'Selecciona el ejercicio', value: null });
        let company = this.profileInfo.id_company;
        let fiscalYears = _.filter(this.companiesData, (item) => {
          return item.company.id === company
        });
        fiscalYears[0].company.years.forEach(element => {
          this.fiscalYears.push({ label: element.year, value: { id: element.id, name: element.year } });
        });
        this.selectedCompany.id = this.profileInfo.id_company;
        this.selectedCompany.name = this.profileInfo.company_name;
      }
    });
    this._common.companiesChanged$.subscribe(value => {
      this.companies = [];
      this.companies.push({ label: 'Selecciona la empresa', value: null });
      this.companiesData = value;
      this.companiesData.forEach(element => {
        this.companies.push({ label: element.company.name, value: { id: element.company.id, name: element.company.name } });
      });
      this.updateCompany();
    });
  }

  onChangeCompany(company) {
    this.fiscalYears = [];
    this.fiscalYears.push({ label: 'Selecciona el ejercicio', value: null });
    let fiscalYears = _.filter(this.companiesData, { company });
    fiscalYears[0].company.years.forEach(element => {
      this.fiscalYears.push({ label: element.year, value: { id: element.id, name: element.year } });
    });
  }

  getInitials() {
    let nickname = this.profileInfo.nickname,
      parsedNick = nickname.split(' ');
    switch (parsedNick.length) {
      case 1:
        return parsedNick[0].substr(0, 2);
      case 2:
        return parsedNick[0].substr(0, 1) + parsedNick[1].substr(0, 1);
      case 3:
        return parsedNick[0].substr(0, 1) + parsedNick[1].substr(0, 1) + parsedNick[2].substr(0, 1);
    }
    return
  }

  logoutUser(logged) {
    if (!logged) {
      this._route.navigate(['/login']);
    } else {
      this.updateCompany();
    }
  }

  toggleMenu() {
    this.isHidden = !this.isHidden;
  }

  closeMenu() {
    this.isHidden = true;
  }

  openSubmenu() {
    this.visibleSubmenu = true;
  }

  hideSubmenu() {
    this.visibleSubmenu = false;
  }

  logout() {
    this._auth.logout();
  }

  onSearchChange(searchValue: string) {
    this._common.searchChanged$.emit(searchValue);
  }

  updateDataCompany() {
    this.closeMenu();
    setTimeout(() => {
      if (!this.selectedCompany || !this.selectedYear) {
        this._notification.error("Error!", "Debes seleccionar empresa y ejercicio.");
      } else {        
        let company = { label: this.selectedCompany.name, value: { id: this.selectedCompany.id, name: this.selectedCompany.name, address: this.selectedCompany.address, address_bis: this.selectedCompany.address_bis, cif: this.selectedCompany.cif, logo: this.selectedCompany.logo, phone: this.selectedCompany.phone, credits: this.selectedCompany.credits, rgpd: this.selectedCompany.rgpd } },
          year = { label: this.selectedYear.name, value: { id: this.selectedYear.id, name: this.selectedYear.name } };

        this._common.updateDataCompany(company, year);
        this._api.updateLastLogin(this.selectedCompany.id, this.selectedYear.id).subscribe((response)=>{
          this.updateCompany();
          this.closeMenu();

          location.reload();
        });
        
      }
    }, 500);
  }

  updateCompany() {
    let company = localStorage.getItem('selectedCompany'),
      fiscalYear = localStorage.getItem('selectedFiscalYear');
    if (company) {
      this.storeCompany = JSON.parse(company);
    }
    if (fiscalYear) {
      this.storeYear = JSON.parse(fiscalYear);
    }
  }

}
