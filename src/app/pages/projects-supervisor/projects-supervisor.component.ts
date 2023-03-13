import { Component, OnInit } from "@angular/core";

import * as _ from "lodash";
import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';

import {Router} from '@angular/router';

import { NotificationsService } from "angular2-notifications";
import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";
import { dateMonth } from "../../models/dateMonth";
import { TokenService } from "../../services/token.service";

@Component({
  selector: "app-project-supervisor",
  templateUrl: "./projects-supervisor.component.html",
  styleUrls: ["./projects-supervisor.component.scss"]
})
export class ProjectsSupervisorComponent implements OnInit {
  filter = {
    customer: null,
    group: null,
    subgroup: null,
    project: null,
    code_campaign: null
  };
  combos = {
    customer: [],
    group: [],
    subgroup: [],
    projects: [],
    codes_campaign: []
  };

  estimatedTab: boolean = true;
  realTab: boolean = false;
  differencesTab: boolean = false;

  roleUser = null;
  projects = [];

  choosenCompany: boolean = false;

  groupsCombo = [];
  subgroupsCombo = [];
  lenProjects = 0;
  constructor(
    private _api: ApiService,
    private _common: Common,
    private _notification: NotificationsService,
    private _token: TokenService,
    private _router: Router,
  ) {
    let lsCompany = JSON.parse(localStorage.getItem("selectedCompany"));
    let lsYear = JSON.parse(localStorage.getItem("selectedFiscalYear"));

    lsCompany = lsCompany ? lsCompany.label : "";
    lsYear = lsYear ? lsYear.label : "";

    if (lsCompany === "" || lsYear === "") {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      this._api.getInfoProjectsSupervisor().subscribe(response => {
        this.groupsCombo = response.groups;
        this.subgroupsCombo = response.subgroups;
        response.customers.forEach(element => {
          this.combos.customer.push({
            label: element.customer_name,
            value: element.id
          });
        });
        response.projects.forEach(element => {
          this.combos.projects.push({
            label: element.campaign_name,
            value: element.id
          });
        });
        response.codes_campaign.forEach(element => {
          this.combos.codes_campaign.push({
            label: element.campaign_code,
            value: element.campaign_code
          });
        });
      });
    }
  }

  ngOnInit() {
    this.roleUser = parseInt(this._token.getInfo().role);
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      let body = `customer=&project=&group=&subgroup=&code_campaign=`;
      this._api.getProjectsSupervisor(body).subscribe(response => {
        this.lenProjects = response.len_projects;
        this.projects = response.projects;
      });
    }
  }

  summaryProject(project) {
    this
      ._router
      .navigate(['/resumen', project.id_project]);
  }
  breakdownProject(project) {
    this
      ._router
      .navigate(['/desglose', project.id_project]);
  }

  changeCustomer(e) {
    this.filter.group = null;
    let groups = _.filter(this.groupsCombo, element => {
      return element.id_customer === e.value;
    });
    this.combos.group = [];
    groups.forEach(element => {
      this.combos.group.push({ label: element.name, value: element.id });
    });
  }

  changeGroup(e) {
    this.filter.subgroup = null;
    let subgroups = _.filter(this.subgroupsCombo, element => {
      return element.id_group === e.value;
    });
    this.combos.subgroup = [];
    subgroups.forEach(element => {
      this.combos.subgroup.push({ label: element.name, value: element.id });
    });
  }

  filterValues() {
    let body = `customer=${this.filter.customer}&project=${
      this.filter.project
    }&group=${this.filter.group}&subgroup=${
      this.filter.subgroup
    }&code_campaign=${this.filter.code_campaign}`;
    this._api.getProjectsSupervisor(body).subscribe(response => {
      this.lenProjects = response.len_projects;
      this.projects = response.projects;
      this._notification.success("Finalizado", "Se ha realizado el filtro");
    });
  }

  clearValues() {    
    this.combos.group = [];
    this.combos.subgroup = [];

    this.filter = {
      customer: null,
      group: null,
      subgroup: null,
      project: null,
      code_campaign: null
    };
    let body = `customer=&project=&group=&subgroup=&code_campaign=`;
    this._api.getProjectsSupervisor(body).subscribe(response => {
      this.lenProjects = response.len_projects;
      this.projects = response.projects;
    });
  }

  getMargin(benefits, income) {
    let ben = this._common.toFloat(benefits);
    let inc = this._common.toFloat(income);

    if (inc === 0) {
      return "0";
    }
    return String(ben / inc * 100);
  }

  clickTab(value) {
    switch (value) {
      case "estimated":
        this.estimatedTab = true;
        this.realTab = false;
        document.getElementById("estimated").style.left = "0";
        document.getElementById("real").style.left = "100%";
        break;
      case "real":
        this.estimatedTab = false;
        this.realTab = true;
        document.getElementById("estimated").style.left = "-100%";
        document.getElementById("real").style.left = "0";
        break;
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
    
      this.projects.forEach((element, key) => {
        exportData.push(
          {
            Código: element.info.projectCode,
            Proyecto: element.info.projectName,
            Equipo: element.info.team,
            Usuario: element.info.user,
            Cliente: element.info.customer,
            Grupo: element.info.group,
            Subgrupo: element.info.subgroup,
            Creado: element.info.creation_date,
            Finalizado: element.info.end_date,
            Estado: element.info.status,
            'Ingresos Presupuestado': this._common.currencyFormatES(element.estimated.incomes, false),
            'Ingresos Real': this._common.currencyFormatES(element.real.incomes, false),
            'Gastos Presupuestado': this._common.currencyFormatES(element.estimated.expenses, false),
            'Gastos Real': this._common.currencyFormatES(element.real.expenses, false),
            'Beneficio Presupuestado': this._common.currencyFormatES(element.estimated.benefits, false),
            'Beneficio Real': this._common.currencyFormatES(element.real.benefits, false),
            'Margen Presupuestado': this._common.currencyFormatES(element.estimated.margin, false),
            'Margen Real': this._common.currencyFormatES(element.real.margin, false),
          }
        );
      });
      resolve(exportData);    
    });

  }  
}
