import { Component, OnInit, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from 'environments/environment';
import * as XLSX from 'xlsx';

import { Common } from '../../api/common';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';

import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

const PORT = ":8081";
const URL = environment.urlUpload;
const URL_UPLOAD = environment.urlFolderUpload;

const URL_LOGO = environment.urlUploadLogo;
const URL_UPLOAD_LOGO = environment.urlLogoUpload;
@Component({ selector: 'app-setting', templateUrl: './setting.component.html', styleUrls: ['./setting.component.scss'] })
export class SettingComponent implements OnInit {
  budget: any = {
    pesimist: 0,
    optimist: 0
  };
  urlUpload = null;
  selectedYear: any = {};
  fiscalYears: any = [];
  selectedCompany: any = {};
  displayDialogDelete: boolean = false;
  displayDialogDeleteYear: boolean = false;
  displayImportDialog: boolean = false;
  formData: FormData;
  files: UploadFile[];
  uploadInputLogo: EventEmitter<UploadInput>;
  uploadInputERP: EventEmitter<UploadInput>;
  uploadInputBackup: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  addingNewCompany: boolean = false;
  erpItemsError: any = [];
  fixedImportedLen = 0;
  variablesExpensesImportedLen = 0;
  variablesIncomesImportedLen = 0;
  loadingErp: boolean = false;
  enableBtnImport: boolean = false;
  arrayBadProjects: any = [];
  arrayBadAccounts: any = [];

  input_tax = 0;
  taxes = [];

  accounts: any = [];
  amortizacion = null;
  extraordinario = null;
  financiero = null;
  flagUpdated: boolean = false;

  constructor(private _http: Http, private _notification: NotificationsService, private _api: ApiService, private _auth: AuthenticationService, private _router: Router, private _config: Configuration, private _common: Common) {
    this.getBudgetCost();
    this.getFiscalYears();
    this.getCompanies();
    this.getAccountFixed();

    this.files = []; // local uploading files array
    this.uploadInputLogo = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputERP = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputBackup = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.urlUpload = environment.urlLogoUpload;
  }

  ngOnInit() {
    this._api.getTaxesValue().subscribe(response => {
      this.taxes = response.data;
    });
  }

  companies: any[] = [];
  csvData: any[] = [];
  uploadFileLogo: any = {};
  uploadFileERP: any = {};
  requestERP: any = {
    error: false,
    success: false
  };
  uploadFileBackup: any = {};
  requestBackup: any = {
    error: false,
    success: false
  };
  backupInProcess = false;
  linkBackup = '';

  createBackup() {
    this.backupInProcess = true;
    this
      ._api
      .generateBackup()
      .subscribe((response) => {
        if (response.status === 'OK') {
          this.linkBackup = response.file;
          this
            ._notification
            .success('Copia de segurirad', 'Se ha almacenado una copia de la base de datos.');
        } else {
          this
            ._notification
            .error('Copia de segurirad', 'ha habido un error al crear la copia de seguridad.');
        }
        this.backupInProcess = false;
      });
  }

  downloadLink() {
    window.location.href = this.linkBackup;
  }

  getBudgetCost() {
    this
      ._api
      .getBudgetCost()
      .subscribe((response) => {
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
            .error("Error!", response.msg);

        } else {
          this.budget.pesimist = response.items.pesimist;
          this.budget.optimist = response.items.optimist;
        }

      })
  }
  toggleAutoNumbered(company) {
    let value = !company.company.auto_number;

    this._api.toggleAutoNumbered(`id=${company.company.id}`, value).subscribe(response => {
      if(response.status === 'ok') {
        this._notification.success('Éxito', 'Se ha modificado la auto numeración');
      } else {
        this._notification.error('Error', 'No se ha modificado la auto numeración');
      }
    })
  }

  handleUpload(data, type: string): void {
    this.uploadFileERP = {};
    this.uploadFileLogo = {};
    this.uploadFileBackup = {};
    if (data && data.file && data.file.response) {
      switch (type) {
        case 'logo':
          if (data.file.type === 'image/jpeg') {
            this.uploadFileLogo = data.file.response;
            this.enableBtnImport = true;
          } else {
            this._notification.error('Error', 'Solo están permitidos archivos JPG de imagen');
          }
          break;
        case 'erp':
          if(data.file.name.split('.')[1] ==='xlsx') {
          //if (data.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.uploadFileERP = data.file.response;
            this.enableBtnImport = true;
          } else {
            this._notification.error('Error', 'Solo están permitidos archivos Excel');
          }
          break;
        case 'backup':
          this.uploadFileBackup = data.file.response;
          break;
      }
    }
  }

  importERP() {
    this.loadingErp = true;
    this.uploadFileERP.status = '';
    this.enableBtnImport = false;
    this.displayImportDialog = true;
    //Reiniciamos las lineas del excel que puedan tener fallos
    this._api.getInfoImportERP().subscribe((response) => {
      // Borrar todas las lineas de costes fijos y variables relacionadas con la compañia y año fiscal
      let projectsIds = 'ids_projects=';
      let arrayCodeProjects = [];
      let arrayCodeFixed = [];
      let arrayCodeVariables = [];

      arrayCodeFixed = response.fixed;
      arrayCodeVariables = response.variables;
      response.projects.forEach(element => {
        projectsIds += `${element.id},`;
        arrayCodeProjects.push({ code: element.campaign_code, id: element.id });
      });
      projectsIds = projectsIds.slice(0, -1);
      this._api.resetValuesFixedVariables(projectsIds).subscribe((response) => {
        if (response.status === 'ok') {
          this.erpItemsError = [];
          let name = this.uploadFileERP.generatedName;
          this
            ._http
            .get(URL_UPLOAD + name, { responseType: 2 })
            .subscribe(data => this.extractData(data, arrayCodeProjects, arrayCodeFixed, arrayCodeVariables), err => this.handleError(err));
        } else {
          this._notification.error('Aviso', 'No se han podido eliminar los datos anteriores de ERP');
        }
      });

    });

  }

  private extractData(res, arrayProjectsIds, arrayCodeFixed, arrayCodeVariables) {
    var workbook: any;
    let dataVariablesExpenses = [];
    let dataVariablesIncomes = [];
    let dataFixed = [];

    var arraybuffer = res._body;
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");
    workbook = XLSX.read(bstr, { type: "binary" });
    var worksheetname = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[worksheetname];
    var json = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    let companySelected: any = this
      ._common
      .getIdCompanyYearSelected();

    // Iteramos sobre cada linea del Excel
    _.forOwn(json, (item) => {
      let found = false;
      let idProject = '';


      found = false;
      // Comprobamos si es un concepto fijo
      let idxFixed = _.findIndex(arrayCodeFixed, (o) => { return o.account_number == item.Cuenta });

      if (idxFixed === -1) {
        // si no es un concepto fijo, es variable
        for (var element of arrayProjectsIds) {
          // buscamos el proyecto relacionado
          if (String(item.Proyecto) == element.code) {
            found = true;
            idProject = element.id;
            break;
          }
        }
        if (!found) {
          let tmp = item;
          tmp.Fecha = this.parserDate(item.Fecha);
          this.arrayBadProjects.push(tmp);
        } else {
          let idxVariable = _.findIndex(arrayCodeVariables, (o) => { return o.account_number == item.Cuenta });
          let idxVariableIncome = _.findIndex(arrayCodeVariables, (o) => { return o.account_contability == item.Cuenta });
          // Si es un concepto variable y existe el proyecto
          if (idxVariable === -1 && idxVariableIncome === -1) {
            let tmp = item;
            tmp.Fecha = this.parserDate(item.Fecha);
            this.arrayBadAccounts.push(tmp);
          } else {
            if (idxVariableIncome >=0 && String(item.Cuenta).startsWith("7")) {
              dataVariablesIncomes.push(
                {
                  id_variable_concept: arrayCodeVariables[idxVariableIncome].id,
                  type: 1,
                  id_month: this._common.getMonthFromDate(this.convertDate(item.Fecha)),
                  amount: item.Importe,
                  id_campaign: idProject,
                }
              );
            } else if (idxVariable >=0 && String(item.Cuenta).startsWith("6")) {
              dataVariablesExpenses.push(
                {
                  id_variable_concept: arrayCodeVariables[idxVariable].id,
                  type: 1,
                  id_month: this._common.getMonthFromDate(this.convertDate(item.Fecha)),
                  amount: item.Importe,
                  id_campaign: idProject,
                }
              );
            }

          }
        }

      } else {
        // Es concepto fijo, lo añadimos directamente
        dataFixed.push(
          {
            id_fixed_concept: arrayCodeFixed[idxFixed].id,
            type: 1,
            id_month: this._common.getMonthFromDate(this.convertDate(item.Fecha)),
            amount: item.Importe,
            id_company: companySelected.company,
            id_fiscal_year: companySelected.year,
          }
        );
      }
    });

    this._api.importErp(dataVariablesExpenses, dataVariablesIncomes, dataFixed).subscribe((response) => {
      this._notification.success('Importación', 'Se han importado correctamente los datos');
      this.uploadFileERP.status = '';
      this.fixedImportedLen = response.updatedFixed;
      this.variablesExpensesImportedLen = response.updatedVariablesExpenses;
      this.variablesIncomesImportedLen = response.updatedVariablesIncomes;
      this.loadingErp = false;
    });
  }

  private convertDate(date) {
    let newDate = XLSX.SSF.parse_date_code(date, { date1904: false });
    return `${newDate.y}-${newDate.m}-${newDate.d}`;
  }

  private parserDate(date) {
    let newDate = XLSX.SSF.parse_date_code(date, { date1904: false });
    return `${newDate.d}-${newDate.m}-${newDate.y}`;
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure We'd also
    // dig deeper into the error to get a better message
    let errMsg = (error.message)
      ? error.message
      : error.status
        ? `${error.status} - ${error.statusText}`
        : 'Server error';
    console.error(errMsg); // log to console instead
    return errMsg;
  }

  onUploadOutputLogo(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      this.startUploadLogo();
    } else if (output.type === 'addedToQueue') {
      this
        .files
        .push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
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
      this.handleUpload(output, 'logo');
    }
  }

  onUploadOutputErp(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      this.startUploadERP();
    } else if (output.type === 'addedToQueue') {
      this
        .files
        .push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
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
      this.handleUpload(output, 'erp');
    }
  }

  onUploadOutputBackup(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      this.startUploadBackup();
    } else if (output.type === 'addedToQueue') {
      this
        .files
        .push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
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
      this.handleUpload(output, 'backup');
    }
  }
  startUploadLogo(): void { // manually start uploading
    const event: UploadInput = {
      type: 'uploadAll',
      url: URL_LOGO,
      method: 'POST',
      data: {
        foo: 'bar'
      },
      concurrency: 1 // set sequential uploading of files with concurrency 1
    }

    this.uploadInputLogo.emit(event);
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

    this.uploadInputERP.emit(event);
  }
  startUploadBackup(): void { // manually start uploading
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
      .uploadInputBackup
      .emit(event);
  }

  getFiscalYears() {
    this
      ._api
      .getFiscalYears()
      .subscribe((response) => {
        if (response.error) {
          this
            ._auth
            .logout();
          this
            ._router
            .navigate(['/login']);
        }
        this.fiscalYears = [];
        this.fiscalYears = response.items;
        this
          .fiscalYears
          .unshift({ label: 'Selecciona ejercicio', value: null });
      })
  }

  restoreDB() {
    let fileName = `filename=${this.uploadFileBackup.generatedName}`;
    this
      ._api
      .restoreDB(fileName)
      .subscribe((response) => {
        if (response.status == 'OK') {
          this._notification.success('Copia de seguridad', 'Se ha restaurado satisfactoriamente la copia de seguridad');
          this.uploadFileERP = {};
          this.uploadFileBackup = {};
        }
      });
  }

  removeCompany(company) {
    this.displayDialogDelete = true;
    this.selectedCompany = company;
  }

  editCompany(company) {
    this.uploadFileLogo = {};
    this.companies.forEach((item) => {
      if (item.company.id !== company.id) {
        return item.company.visible = false;
      }
    });
    company.edit = true;
    this.selectedCompany = company;
  }
  cancelSave(company) {
    company.edit = false;
    this.companies.forEach((item) => {
      item.company.visible = true;
    });
  }
  saveCompany(company) {
    company.edit = false;
    if (company.name) {
      let body;
      body = 'company_name=' + company.name + '&id_company=' + company.id;
      body += '&address=' + company.address + '&CIF=' + company.cif + '&address_bis=' + company.address_bis;
      if (company.remove_logo) {
        body += '&logo=""';
      } else if (this.uploadFileLogo.generatedName !== undefined) {
        body += '&logo=' + this.uploadFileLogo.generatedName;
      }

      this
        ._api
        .updateCompany(body)
        .subscribe((response) => {
          if (response.status === 'no_updated') {
            this.companies.forEach((item) => {
              item.company.visible = true;
            });
          }
          else if (response.status === 'ok') {
            this.companies.forEach((item) => {
              item.company.visible = true;
            });
            this
              ._notification
              .success('¡Éxito!', 'Se ha actualizado la empresa');
            company.new = false;
            company.edit = false;
            company.remove_logo = false;
            if (response.company.logo !== undefined) {
              company.logo = response.company.logo;
            }
            this
              ._common
              .companiesChanged$
              .emit(this.companies);
            let companyUpdated = {
              label: company.name,
              value: { id: company.id, name: company.name, address: company.address, address_bis: company.address_bis, cif: company.cif, logo: company.logo }
            };
            this._common.updateDataCompany(companyUpdated);

          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
          }

        });
    } else {
      this
        ._notification
        .error('¡Aviso!', 'Debes rellenar los datos correctamente');
    }
  }

  addFiscalYear(company) {
    company.editYear = true;
    company
      .years
      .push({ 'id_company': company.id, 'tax': 0, 'year': 0, 'new': true, 'serie': ''});
  }
  saveFiscalYear(company) {
    let body = "id_company=" + company.id,
      yearSelected = company.years[company.years.length - 1];

    body += "&id_fiscal_year=" + yearSelected.year;
    body += "&tax=" + yearSelected.tax;
    body += "&serie=" + yearSelected.serie;

    this
      ._api
      .insertFiscalYear(body)
      .subscribe((response) => {
        if (response === null || response.status === 'error') {
          this
            ._notification
            .error("Error!", response.msg);
          company
            .years
            .pop();
        } else {
          company.years[company.years.length - 1].new = false;
          company.years[company.years.length - 1].id = response.id;
          this
            ._notification
            .success("Éxito!", "Se ha añadido el ejercicio.");
          this
            ._common
            .companiesChanged$
            .emit(this.companies);
        }
        company.editYear = false;

      });

  }

  deleteTax(tax) {
    this._api.deleteTax(tax.value).subscribe(response => {
      if(response.status === 'ok') {
        this._notification.success("Éxito", "Se ha eliminado el tipo " + tax.value);
        _.remove(this.taxes, (item) => {
          return item.id === tax.id;
        })
      }
      else {
        this._notification.error("Error", response.msg);
      }
    })
  }
  addTax() {
    if(!this.input_tax) {
      this._notification.error("Erro", "debe introducir un tipo");
    } else {
      this._api.addTax(this.input_tax).subscribe(response => {
        this.taxes.push({
          id:response.id,
          value: response.value,
        });
        this._notification.success("Éxito", "Se ha añadido el Tipo de IVA");
      })
    }
  }

  removeFiscalYear(year) {
    this.displayDialogDeleteYear = true;
    this.selectedYear = year;
  }

  deleteYear(year) {
    _.remove(this.companies, { year });
    if (year.id) {
      this
        ._api
        .deleteFiscalYear(year.id)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this
              ._notification
              .success('¡Éxito!', 'Se ha eliminado el ejercicio');
            this.displayDialogDeleteYear = false;
            _.forOwn(this.companies, function (value, key) {
              let val = value['company'].years;
              _.remove(val, year);
            });
            this
              ._common
              .companiesChanged$
              .emit(this.companies);
          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
            this.displayDialogDelete = false;
          }

        });
    }
  }
  onChangeSerie(year) {
    if (!year.new) {
      let body = "id=" + year.id;
      body += "&year=" + year.year;
      body += "&tax=" + year.tax;
      body += "&serie=" + year.serie;
      body += "&id_company=" + year.id_company;
      this
        ._api
        .updateFiscalYear(body)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this
              ._notification
              .success('¡Éxito!', 'Se ha actualizado el ejercicio');
          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
          }
        });
    }
  }
  onChangeYear(year) {
    if (!year.new) {
      let body = "id=" + year.id;
      body += "&year=" + year.year;
      body += "&tax=" + year.tax;
      body += "&serie=" + year.serie;
      body += "&id_company=" + year.id_company;
      this
        ._api
        .updateFiscalYear(body)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this
              ._notification
              .success('¡Éxito!', 'Se ha actualizado el ejercicio');
          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
          }
        });
    }
  }

  updateBudgetPercent() {
    let body = "optimist=" + this.budget.optimist;
    body += "&pesimist=" + this.budget.pesimist;

    this
      ._api
      .updateBudgetCost(body)
      .subscribe((response) => {
        if (response.status === 'ok') {
          this
            ._notification
            .success('¡Éxito!', 'Se ha actualizado el porcentaje');
        } else {
          this
            ._notification
            .error('¡Error!', response.msg);
        }
      });
  }

  getAccountFixed() {
    this.accounts = [];
    this.accounts.push({ label: 'Seleccione una cuenta', value: 0 });
    this
      ._api
      .getAccountFixed()
      .subscribe((response) => {
        if (response.status === 'ok') {
          response.items.forEach(element => {
            this.accounts.push({ label: element.name, value: element.id });
          });
          this.amortizacion = (response.accounts.amortizacion != 0) ? response.accounts.amortizacion : null;
          this.financiero = (response.accounts.financiero != 0) ? response.accounts.financiero : null;
          this.extraordinario = (response.accounts.extraordinario != 0) ? response.accounts.extraordinario : null;
        }
      })
  }
  updateAccountsCompany() {
    let body = '';
    if ((this.amortizacion !== this.financiero) && (this.amortizacion !== this.extraordinario) && (this.financiero !== this.extraordinario)) {
      body += `&amortizacion=${this.amortizacion}`;
      body += `&financiero=${this.financiero}`;
      body += `&extraordinario=${this.extraordinario}`;

      this
        ._api
        .updateAccountsCompany(body)
        .subscribe((response) => {
          if (response.status == 'ok') {
            this._notification.success('Cuentas', 'Se ha almacenado el valor correctamente.');
          }
        });
    } else {
      this._notification.error('Cuidado', 'No puede haber cuentas repetidas.');
    }
    this.flagUpdated = false;
  }

  getCompanies() {
    this
      ._api
      .getCompanies()
      .subscribe((response) => {
        if (response.error) {
          this
            ._auth
            .logout();
          this
            ._router
            .navigate(['/login']);
        }
        let parsed = [];

        response.items.forEach(item => {
          if(item.company.auto_number === '0') {
            item.company.auto_number = false;
          } else {
            item.company.auto_number = true;
          }
          parsed.push(item);
        });
        this.companies = parsed;
      })
  }

  addCompany() {
    if (!this.addingNewCompany) {
      this.addingNewCompany = true;
      let newCompany = {
        company: {
          id: '',
          name: '',
          address: '',
          address_bis: '',
          logo: '',
          cif: '',
          edit: false,
          editYear: false,
          remove_logo: false,
          new: true,
          years: []
        }
      };
      this
        .companies
        .unshift(newCompany);
    }
  }
  cancelNewCompany() {
    this.companies.splice(0, 1);
    this.addingNewCompany = false;
  }

  deleteCompany(company) {
    let idCompany = this
      ._common
      .getIdCompanySelected();
    if (!idCompany) {
      this
        ._notification
        .error("Error!", "Debes seleccionar una empresa desde el menu de selección.")
      this.displayDialogDelete = false;

    } else if (idCompany === company.id) {
      this
        ._notification
        .error("Error!", "No puedes eliminar una empresa si esta seleccionada.")
      this.displayDialogDelete = false;

    } else if (idCompany !== company.id) {
      if (company.name) {
        this
          ._api
          .deleteCompany(company.id)
          .subscribe((response) => {
            if (response.status === 'ok') {
              this
                ._notification
                .success('¡Éxito!', 'Se ha eliminado la empresa');
              this.displayDialogDelete = false;
              _.remove(this.companies, { company });
              this
                ._common
                .companiesChanged$
                .emit(this.companies);
            } else {
              this
                ._notification
                .error('¡Error!', response.msg);
              this.displayDialogDelete = false;
            }

          });
      } else {
        this
          ._notification
          .error('¡Aviso!', 'Debes rellenar los datos correctamente');
        this.displayDialogDelete = false;
      }
    }

  }

  saveNewCompany(company) {
    if (company.name) {
      let body;
      body = 'company_name=' + company.name;
      body += '&address=' + company.address + '&CIF=' + company.cif + '&address_bis=' + company.address_bis;
      if (this.uploadFileLogo.generatedName !== undefined) {
        body += '&logo=' + this.uploadFileLogo.generatedName;
      }

      this
        ._api
        .addCompany(body)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this
              ._notification
              .success('¡Éxito!', 'Se ha añadido la empresa');
            company.id = response.id;
            company.new = false;
            company.edit = false;
            this.addingNewCompany = false;
            this.uploadFileLogo = {};
            if (response.company.logo !== undefined) {
              company.logo = response.company.logo;
            }
            this
              ._common
              .companiesChanged$
              .emit(this.companies);
          } else {
            this
              ._notification
              .error('¡Error!', response.msg);
          }

        });
    } else {
      this
        ._notification
        .error('¡Aviso!', 'Debes rellenar los datos correctamente');
    }
  }



}
