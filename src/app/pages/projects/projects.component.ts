import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications';


import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
import {SelectItem} from 'primeng/primeng';

import {TokenService} from '../../services/token.service';
import {ApiService} from '../../services/api.service';
import {Common} from '../../api/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Configuration} from '../../api/configuration';

import * as _ from "lodash";

@Component({selector: 'app-projects', templateUrl: './projects.component.html', styleUrls: ['./projects.component.scss']})
export class ProjectsComponent implements OnInit {
  @ViewChild('inputSearch')inputSearch;

  noProjects:boolean = false;
  status : SelectItem[];
  pagination : number;
  idSelected : number = null;
  projects : any = [];
  selectedCampaign : any = null;
  newCampaign : any = {
    campaign_code: '',
    campaign_name: ''
  };
  displayDialog : boolean = false;
  displayDialogNew : boolean = false;
  displayPagination : boolean = false;
  displayDialogDelete : boolean = false;
  msgDelete : string = '¿Estás seguro de eliminar el proyecto?';
  emptyMsg : string = "No hay proyectos añadidas. Añade tu primer proyecto en el formulario anterior";
  model : any = {
    projectsName: '',
    accountNumber: '',
    parent_account: '',
    type: null
  };
  autoNumbered = false;
  roleUser: number = 0;
  showInput: boolean = true;
  types : any[] = [];
  parentAccounts : any[] = [];
  dataCombos : any = {
    users: [],
    customers: [],
    teams: [],
    groups: [],
    subgroups: [],
    status: [],
    security: [
      {
        label: 'Alto',
        value: 'Alto'
      }, {
        label: 'Bajo',
        value: 'Bajo'
      }
    ]
  };
  showCol : boolean = false;
  choosenCompany: boolean = false;
  valueInputSearch = '';

  dataSelects : any = [];

  myDatePickerOptions = this._config.myDatePickerOptions;

  // Initialized to specific date (09.10.2019).
  private modelDate : Object = {
    date: {
      year: 2019,
      month: 10,
      day: 9
    }
  };

  constructor(private _notification : NotificationsService, private _api : ApiService, private _auth : AuthenticationService, private _router : Router, private _config : Configuration, private _common : Common, private _token : TokenService) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label: '';
    lsYear = (lsYear) ? lsYear.label: '';

    if (lsCompany === '' || lsYear === '') {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    _common
    .searchChanged$
    .subscribe((value) => {
      this.changeSearchInput(value);
    });
  }

  ngOnInit() {
    this.showInput = (parseInt(this._token.getInfo().role) >= 6) ? false : true;
    let infoUser : any = this
      ._token
      .getInfo();

    this.roleUser = parseInt(infoUser.role);
    this.status = [];
    this
      .status
      .push({label: 'Aprobado', value: 'Aprobado'});
    this
      .status
      .push({label: 'Presupuestado', value: 'Presupuestado'});
    this
      .status
      .push({label: 'Finalizado', value: 'Finalizado'});
    this.pagination = 10;
    this._api.isAutoNumbered().subscribe(response => {
      this.autoNumbered = parseInt(response.autoNumbered) === 1 ? true: false;
    })
    this
      ._api
      .getCampaigns("","")
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
            this.noProjects = true;
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
            this.projects = response.items;
            this.displayPagination = (this.projects.length > this.pagination);
            this.noProjects = false;
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
          response
            .status
            .forEach((element) => {
              this
                .dataCombos
                .status
                .push({ label: element.status, value: element.id });
            });
        }

      });

    this.setPermissions(infoUser.role);

  }

  changeSearchInput(value : string) {
    this.inputSearch.nativeElement.value = value;
    this
      .inputSearch
      .nativeElement
      .dispatchEvent(new Event('keyup'));
  }

  setPermissions(role) {
    switch (role) {
      case '4':
      case '6':
      case '7':
      case '8':
        this.showCol = false;
        break;
      case '3':
      case '5':
        this.showCol = true;
        break;
    }
  }

  lookupRowStyleClass(rowData) {
    return rowData.security_level === 'Alto'
      ? 'high-security'
      : 'low-security';
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
        .push({label: element.name, value: element.id});
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
        .push({label: element.name, value: element.id});
    });
  }

  changeTeam(e) {
    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === e.value
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this
        .dataCombos
        .users
        .push({label: element.nickname, value: element.id});
    });
  }

  selectCampaign(item, index) {
    let creationDate = this.getDateParsed(item.creation_date_no_parsed),
      endDate = this.getDateParsed(item.end_date_no_parsed);
    this.displayDialog = true;
    this.selectedCampaign = _.cloneDeep(item);
    this.selectedCampaign.idx = index;
    this.selectedCampaign.security_level = item.security_level;
    this.selectedCampaign.creation_date_model = {
      date: {
        year: creationDate[0],
        month: creationDate[1],
        day: creationDate[2]
      }
    };
    this.selectedCampaign.end_date_model = {
      date: {
        year: endDate[0],
        month: endDate[1],
        day: endDate[2]
      }
    };
    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === this.selectedCampaign.id_team
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this
        .dataCombos
        .users
        .push({label: element.nickname, value: element.id});
    });
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === this.selectedCampaign.id_group
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this
        .dataCombos
        .subgroups
        .push({label: element.name, value: element.id});
    });
  }

  getDateParsed(date) {
    let arrayDate = date.split('-');
    arrayDate = _.map(arrayDate, function (element) {
      return parseInt(element);
    });

    return arrayDate;
  }

  deleteCampaign(item) {
    this.displayDialogDelete = true;
    this.selectedCampaign = item;
  }

  updateRows(response) {
    this.projects[parseInt(response.idx)].campaign_code = response.item[0].campaign_code;
    this.projects[parseInt(response.idx)].campaign_name = response.item[0].campaign_name;
    this.projects[parseInt(response.idx)].user = response.item[0].user;
    this.projects[parseInt(response.idx)].id_user = response.item[0].id_user;
    this.projects[parseInt(response.idx)].customer = response.item[0].customer;
    this.projects[parseInt(response.idx)].team = response.item[0].team;
    this.projects[parseInt(response.idx)].grupo = response.item[0].grupo;
    this.projects[parseInt(response.idx)].subgroup = response.item[0].subgroup;
    this.projects[parseInt(response.idx)].status = response.item[0].status;
    this.projects[parseInt(response.idx)].security_level = response.item[0].security_level;
    this.projects[parseInt(response.idx)].creation_date_no_parsed = response.item[0].creation_date;
    this.projects[parseInt(response.idx)].end_date_no_parsed = response.item[0].end_date;
    this.projects[parseInt(response.idx)].creation_date = this
      ._common
      .parseDatefromDate(new Date(response.item[0].creation_date));
    this.projects[parseInt(response.idx)].end_date = this
      ._common
      .parseDatefromDate(new Date(response.item[0].end_date));
  }

  createCampaign() {
    this.displayDialogNew = true;
    this.newCampaign.campaign_code = '';
    this.newCampaign.campaign_name = '';
    this.newCampaign.id_user = '';
    this.newCampaign.id_customer = '';
    this.newCampaign.id_team = '';
    this.newCampaign.id_group = '';
    this.newCampaign.id_subgroup = '';
    this.newCampaign.id_status = '';
    this.newCampaign.creation_date_model = '';
    this.newCampaign.end_date_model = '';
    this.newCampaign.security = '';
    this.dataCombos.groups = [];
    this.dataCombos.subgroups = [];
    this.dataCombos.users = [];
  }
  
  resumeCampaign(campaign) {
    this
      ._router
      .navigate(['/proyecto', campaign.id]);
  }

  summaryProject(project) {
    this
      ._router
      .navigate(['/resumen', project.id]);
  }
  breakdownCampaign(campaign) {
    this
      ._router
      .navigate(['/desglose', campaign.id]);
  }

  addCampaign() {
    if(!this.autoNumbered && this.newCampaign.campaign_code === '') {
      this
        ._notification
        .info('¡Aviso!', 'Debes rellenar el código de proyecto');
      return false;
    }
    if (this.newCampaign.campaign_name === '' ||
       this.newCampaign.id_user === '' || this.newCampaign.id_customer === '' || this.newCampaign.id_team === '' || 
      this.newCampaign.id_group === '' || this.newCampaign.id_subgroup === '' || this.newCampaign.id_status === '' || 
      this.newCampaign.creation_date_model === '' || this.newCampaign.end_date_model === '') {
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
      if (this.checkDates(this.newCampaign.creation_date_model, this.newCampaign.end_date_model)) {
        let body;
        body = 'campaign_code=' + this.newCampaign.campaign_code;
        body += '&campaign_name=' + this.newCampaign.campaign_name;
        body += '&id_company=' + dataSelected.company;
        body += '&id_fiscal_year=' + dataSelected.year;
        body += '&id_user=' + this.newCampaign.id_user;
        body += '&id_customer=' + this.newCampaign.id_customer;
        body += '&id_team=' + this.newCampaign.id_team;
        body += '&id_group=' + this.newCampaign.id_group;
        body += '&id_subgroup=' + this.newCampaign.id_subgroup;
        body += '&id_status=' + this.newCampaign.id_status;
        body += '&id_security=' + this.newCampaign.security;
        body += `&creation_date=${this.newCampaign.creation_date_model.date.year}-${this.newCampaign.creation_date_model.date.month}-${this.newCampaign.creation_date_model.date.day}`;
        body += `&end_date=${this.newCampaign.end_date_model.date.year}-${this.newCampaign.end_date_model.date.month}-${this.newCampaign.end_date_model.date.day}`;
        body += `&auto_number=${this.autoNumbered}`;
        this
          ._api
          .insertCampaign(body)
          .subscribe((response) => {
            if (response.status === 'ok') {
              this.displayDialogNew = false;
              this.projects = []
              this.projects = response.items;
              this.projects = [...this.projects];
              this.projects.forEach(element => {
                element.creation_date_no_parsed = element.creation_date;
                element.end_date_no_parsed = element.end_date;
                element.creation_date = this
                  ._common
                  .parseDatefromDate(new Date(element.creation_date));
                element.end_date = this
                  ._common
                  .parseDatefromDate(new Date(element.end_date));
              });
              this
                ._notification
                .success('¡Éxito!', 'Se ha añadido el proyecto');
            } else {
              this
                ._notification
                .error('¡Error!', response.msg);
            }

          });
      } else {
        this
          ._notification
          .error('Error!', 'La fecha de inicio deber ser menor o igual a la de fin.');
      }
    }
  }

  updateApi() {
    let body = '';
    this.idSelected = parseInt(this.selectedCampaign.id, 10);
    if (this.checkDates(this.selectedCampaign.creation_date_model, this.selectedCampaign.end_date_model)) {
      body = 'id=' + this.idSelected + '&campaign_code=' + this.selectedCampaign.campaign_code;
      body += `&idx=${this.selectedCampaign.idx}`;
      body += `&campaign_name=${this.selectedCampaign.campaign_name}`;
      body += `&id_user=${this.selectedCampaign.id_user}`;
      body += `&id_customer=${this.selectedCampaign.id_customer}`;
      body += `&id_team=${this.selectedCampaign.id_team}`;
      body += `&id_group=${this.selectedCampaign.id_group}`;
      body += `&id_subgroup=${this.selectedCampaign.id_subgroup}`;
      body += `&id_status=${this.selectedCampaign.id_status}`;
      body += `&id_security=${this.selectedCampaign.security_level}`;
      body += `&creation_date=${this.selectedCampaign.creation_date_model.date.year}-${this.selectedCampaign.creation_date_model.date.month}-${this.selectedCampaign.creation_date_model.date.day}`;
      body += `&end_date=${this.selectedCampaign.end_date_model.date.year}-${this.selectedCampaign.end_date_model.date.month}-${this.selectedCampaign.end_date_model.date.day}`;
      body += `&auto_number=${this.autoNumbered}`;
      this
        ._api
        .updateCampaign(body)
        .subscribe((response) => this.parseUpdate(response));
    } else {
      this._notification.error('Error', 'La fecha de inicio no puede ser mayor que la de fin');
    }
  }

  checkDates(start_date, end_date) {
    let start= new Date(`${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`);
    let end= new Date(`${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`);

    return start <= end;
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha actualizado el proyecto');
      this.updateRows(response);
    } else {
      this.displayDialog = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);
    this
      ._api
      .deleteCampaigns(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.projects, (o) => {
        return o.id == this.idSelected;
      });
      this
        .projects
        .splice(idx, 1);
      this.projects = [...this.projects];
      if(this.projects.length === 0) {
        this.noProjects = true;
      }
      this.displayDialogDelete = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha eliminado el proyecto');
    } else {
      this.displayDialogDelete = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  exportExcel():void {
    let exportProjects = null;

    this.fillExcelData().then((response) => {
      exportProjects = response;
      const ws_name_1 = 'Listado de proyectos';
      const wb: WorkBook = { SheetNames: [], Sheets: {} };
      const ws_1: any = utils.json_to_sheet(exportProjects);
      
      wb.SheetNames.push(ws_name_1);
      wb.Sheets[ws_name_1] = ws_1;
  
      const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
  
      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }
  
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `listado-proyectos.xlsx`);
    });
    
  }  

  fillExcelData() {
    return new Promise((resolve, reject) => {
      let exportData = [];
      this
      ._api
      .getExcelData().subscribe(response => {
        let values = response;
        this.projects.forEach((element, key) => {

          exportData.push(
            {
              Código: element.campaign_code,
              Proyecto: element.campaign_name,
              Equipo: element.team,
              Usuario: element.user,
              Cliente: element.customer,
              Grupo: element.grupo,
              Subgrupo: element.subgroup,
              Creado: element.creation_date,
              Finalizado: element.end_date,
              Estado: element.status,
              'Ingresos Presupuesto': this._common.currencyFormatES(values[element.id].estimated.incomes, false),
              'Ingresos Real': this._common.currencyFormatES(values[element.id].real.incomes, false),
              'Personal Propio Presupuesto': this._common.currencyFormatES(values[element.id].estimated.employees, false),
              'Personal Propio Real': this._common.currencyFormatES(values[element.id].real.employees, false),
              'Coste Presupuesto': this._common.currencyFormatES(values[element.id].estimated.expenses, false),
              'Coste Real': this._common.currencyFormatES(values[element.id].real.expenses, false),
              'Beneficio Presupuesto': this._common.currencyFormatES(values[element.id].estimated.profit, false),
              'Beneficio Real': this._common.currencyFormatES(values[element.id].real.profit, false),
            }
          );
        });
        resolve(exportData);
    
      });
    });

  }  
}
