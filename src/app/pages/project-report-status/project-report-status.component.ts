import {Component, OnInit} from '@angular/core';

import * as _ from 'lodash';

import {NotificationsService} from 'angular2-notifications';
import {ApiService} from '../../services/api.service';
import {Common} from '../../api/common';
import {dateMonth} from '../../models/dateMonth';
import {TokenService} from '../../services/token.service';

@Component({selector: 'app-project-report-status', templateUrl: './project-report-status.component.html', styleUrls: ['./project-report-status.component.scss']})
export class ProjectReportStatusComponent implements OnInit {
  filter = {
    customer: null,
    group: null,
    subgroup: null,
    team: null,
    startDate: null,
    endDate: null
  };
  combos = {
    customer: [],
    group: [],
    subgroup: [],
    team: [],
    startDate: [],
    endDate: []
  };

  estimatedTabBudget : boolean = true;
  realTabBudget : boolean = false;
  differencesTabBudget : boolean = false;

  estimatedTabApproved : boolean = true;
  realTabApproved : boolean = false;
  differencesTabApproved : boolean = false;

  estimatedTabFinished : boolean = true;
  realTabFinished : boolean = false;
  differencesTabFinished : boolean = false;

  roleUser = null;
  approvedProjects = [];
  budgetProjects = [];
  finishedProjects = [];

  monthVisibles = [
    {
      month: 'january',
      visible: true
    }, {
      month: 'february',
      visible: true
    }, {
      month: 'march',
      visible: true
    }, {
      month: 'april',
      visible: true
    }, {
      month: 'may',
      visible: true
    }, {
      month: 'june',
      visible: true
    }, {
      month: 'july',
      visible: true
    }, {
      month: 'august',
      visible: true
    }, {
      month: 'september',
      visible: true
    }, {
      month: 'october',
      visible: true
    }, {
      month: 'november',
      visible: true
    }, {
      month: 'december',
      visible: true
    }
  ];
  choosenCompany: boolean = false;

  totalAmounts = {
    total: {
      estimated: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      real: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      differences: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      }
    },
    budget: {
      estimated: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      real: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      differences: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      }
    },
    approved: {
      estimated: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      real: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      differences: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      }
    },
    finished: {
      estimated: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      real: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      },
      differences: {
        incomes: '0,00',
        expenses: '0,00',
        employees: '0,00',
        benefits: '0,00',
        margin: '0,00'
      }
    }
  };

  groupsCombo = [];
  subgroupsCombo = [];
  lenProjects = 0;
  constructor(private _api : ApiService, private _common : Common, private _notification : NotificationsService, private _token : TokenService) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label: '';
    lsYear = (lsYear) ? lsYear.label: '';

    if (lsCompany === '' || lsYear === '') {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    
    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      this.fillComboDates();
      this
        ._api
        .getInfoMonthReport()
        .subscribe((response) => {
          this.groupsCombo = response.groups;
          this.subgroupsCombo = response.subgroups;
          response
            .customers
            .forEach((element) => {
              this
                .combos
                .customer
                .push({label: element.customer_name, value: element.id});
            });
          response
            .teams
            .forEach((element) => {
              this
                .combos
                .team
                .push({label: element.team_name, value: element.id});
            });
        });
    }
  }

  ngOnInit() {
    this.roleUser = parseInt(this._token.getInfo().role);
    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      let body = `customer=&team=&group=&subgroup=&start_date=&end_date=`;
      this
        ._api
        .getProjectsReport(body)
        .subscribe((response) => {
          this.lenProjects = response.len_projects;
          this.approvedProjects = response.report.approved;
          this.budgetProjects = response.report.budget;
          this.finishedProjects = response.report.finished;
          this.calculateTotal();
        });
    }
  }

  fillComboDates() {
    this
      .combos
      .startDate
      .push({label: 'Selecciona un valor', value: -1});
    this
      .combos
      .startDate
      .push({label: 'Enero', value: '0'});
    this
      .combos
      .startDate
      .push({label: 'Febrero', value: '1'});
    this
      .combos
      .startDate
      .push({label: 'Marzo', value: '2'});
    this
      .combos
      .startDate
      .push({label: 'Abril', value: '3'});
    this
      .combos
      .startDate
      .push({label: 'Mayo', value: '4'});
    this
      .combos
      .startDate
      .push({label: 'Junio', value: '5'});
    this
      .combos
      .startDate
      .push({label: 'Julio', value: '6'});
    this
      .combos
      .startDate
      .push({label: 'Agosto', value: '7'});
    this
      .combos
      .startDate
      .push({label: 'Septiembre', value: '8'});
    this
      .combos
      .startDate
      .push({label: 'Octubre', value: '9'});
    this
      .combos
      .startDate
      .push({label: 'Noviembre', value: '10'});
    this
      .combos
      .startDate
      .push({label: 'Diciembre', value: '11'});
    //end date wont to be filled until select the start date
  }

  changeStartDate(e) {
    let value = parseInt(e.value);
    if (value !== -1) {
      this.combos.endDate = [];
      switch (value) {
        case 0:
          this
            .combos
            .endDate
            .push({label: 'Enero', value: '0'});
          this
            .combos
            .endDate
            .push({label: 'Febrero', value: '1'});
          this
            .combos
            .endDate
            .push({label: 'Marzo', value: '2'});
          this
            .combos
            .endDate
            .push({label: 'Abril', value: '3'});
          this
            .combos
            .endDate
            .push({label: 'Mayo', value: '4'});
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 1:
          this
            .combos
            .endDate
            .push({label: 'Febrero', value: '1'});
          this
            .combos
            .endDate
            .push({label: 'Marzo', value: '2'});
          this
            .combos
            .endDate
            .push({label: 'Abril', value: '3'});
          this
            .combos
            .endDate
            .push({label: 'Mayo', value: '4'});
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 2:
          this
            .combos
            .endDate
            .push({label: 'Marzo', value: '2'});
          this
            .combos
            .endDate
            .push({label: 'Abril', value: '3'});
          this
            .combos
            .endDate
            .push({label: 'Mayo', value: '4'});
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 3:
          this
            .combos
            .endDate
            .push({label: 'Abril', value: '3'});
          this
            .combos
            .endDate
            .push({label: 'Mayo', value: '4'});
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 4:
          this
            .combos
            .endDate
            .push({label: 'Mayo', value: '4'});
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 5:
          this
            .combos
            .endDate
            .push({label: 'Junio', value: '5'});
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 6:
          this
            .combos
            .endDate
            .push({label: 'Julio', value: '6'});
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 7:
          this
            .combos
            .endDate
            .push({label: 'Agosto', value: '7'});
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 8:
          this
            .combos
            .endDate
            .push({label: 'Septiembre', value: '8'});
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 9:
          this
            .combos
            .endDate
            .push({label: 'Octubre', value: '9'});
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;
        case 10:
          this
            .combos
            .endDate
            .push({label: 'Noviembre', value: '10'});
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
        case 11:
          this
            .combos
            .endDate
            .push({label: 'Diciembre', value: '11'});
          break;

      }
    } else {
      this.combos.endDate = [];
    }
  }

  changeCustomer(e) {
    this.filter.group = null;
    let groups = _.filter(this.groupsCombo, (element) => {
      return element.id_customer === e.value
    });
    this.combos.group = [];
    groups.forEach((element) => {
      this
        .combos
        .group
        .push({label: element.name, value: element.id});
    });
  }

  changeGroup(e) {
    this.filter.subgroup = null;
    let subgroups = _.filter(this.subgroupsCombo, (element) => {
      return element.id_group === e.value
    });
    this.combos.subgroup = [];
    subgroups.forEach((element) => {
      this
        .combos
        .subgroup
        .push({label: element.name, value: element.id});
    });
  }

  filterValues() {
    let body = `customer=${this.filter.customer}&team=${this.filter.team}&group=${this.filter.group}&subgroup=${this.filter.subgroup}&start_date=${this.filter.startDate}&end_date=${this.filter.endDate}`;
    this
      ._api
      .getProjectsReport(body)
      .subscribe((response) => {
        this.checkMonthVisibles();
        this.lenProjects = response.len_projects;
        this.approvedProjects = response.report.approved;
        this.budgetProjects = response.report.budget;
        this.finishedProjects = response.report.finished;
        this.calculateTotal();
        this
          ._notification
          .success('Finalizado', 'Se ha realizado el filtro');
      });
  }

  clearValues() {
    this
      .monthVisibles
      .forEach((item) => {
        return item.visible = true;
      });
    this.combos.group = [];
    this.combos.subgroup = [];
      
    this.filter = {
      customer: null,
      group: null,
      subgroup: null,
      team: null,
      startDate: null,
      endDate: null
    };
    let body = `customer=&team=&group=&subgroup=&start_date=&end_date=`;
    this
      ._api
      .getProjectsReport(body)
      .subscribe((response) => {
        this.lenProjects = response.len_projects;
        this.approvedProjects = response.report.approved;
        this.budgetProjects = response.report.budget;
        this.finishedProjects = response.report.finished;
        this.calculateTotal();
      });
  }

  checkMonthVisibles() {
    this
      .monthVisibles
      .forEach((item) => {
        return item.visible = false;
      });
    if (this.filter.startDate === null) {
      this
        .monthVisibles
        .forEach((item) => {
          return item.visible = true;
        });
    } else {
      this
        .monthVisibles
        .forEach((item, index) => {
          if (index >= parseInt(this.filter.startDate)) {
            return item.visible = true;
          }
        });
      if (this.filter.endDate !== null) {
        this
          .monthVisibles
          .forEach((item, index) => {
            if (index > parseInt(this.filter.endDate)) {
              return item.visible = false;
            }
          });
      }
    }
  }

  calculateTotal() {
    this.resetTotals();
    this
      .approvedProjects
      .forEach(element => {
        this.totalAmounts.approved.estimated.benefits = String(this._common.checkFloat(this.totalAmounts.approved.estimated.benefits) + this._common.checkFloat(element.estimated.benefits));
        this.totalAmounts.approved.estimated.employees = String(this._common.checkFloat(this.totalAmounts.approved.estimated.employees) + this._common.checkFloat(element.estimated.employees));
        this.totalAmounts.approved.estimated.expenses = String(this._common.checkFloat(this.totalAmounts.approved.estimated.expenses) + this._common.checkFloat(element.estimated.expenses));
        this.totalAmounts.approved.estimated.incomes = String(this._common.checkFloat(this.totalAmounts.approved.estimated.incomes) + this._common.checkFloat(element.estimated.incomes));

        this.totalAmounts.approved.real.benefits = String(this._common.checkFloat(this.totalAmounts.approved.real.benefits) + this._common.checkFloat(element.real.benefits));
        this.totalAmounts.approved.real.employees = String(this._common.checkFloat(this.totalAmounts.approved.real.employees) + this._common.checkFloat(element.real.employees));
        this.totalAmounts.approved.real.expenses = String(this._common.checkFloat(this.totalAmounts.approved.real.expenses) + this._common.checkFloat(element.real.expenses));
        this.totalAmounts.approved.real.incomes = String(this._common.checkFloat(this.totalAmounts.approved.real.incomes) + this._common.checkFloat(element.real.incomes));

        this.totalAmounts.approved.differences.benefits = String(this._common.checkFloat(this.totalAmounts.approved.differences.benefits) + this._common.checkFloat(element.differences.benefits));
        this.totalAmounts.approved.differences.employees = String(this._common.checkFloat(this.totalAmounts.approved.differences.employees) + this._common.checkFloat(element.differences.employees));
        this.totalAmounts.approved.differences.expenses = String(this._common.checkFloat(this.totalAmounts.approved.differences.expenses) + this._common.checkFloat(element.differences.expenses));
        this.totalAmounts.approved.differences.incomes = String(this._common.checkFloat(this.totalAmounts.approved.differences.incomes) + this._common.checkFloat(element.differences.incomes));
      });

    this.totalAmounts.approved.estimated.margin = this.getMargin(this.totalAmounts.approved.estimated.benefits, this.totalAmounts.approved.estimated.incomes);
    this.totalAmounts.approved.real.margin = this.getMargin(this.totalAmounts.approved.real.benefits, this.totalAmounts.approved.real.incomes);
    this.totalAmounts.approved.differences.margin = this.getMargin(this.totalAmounts.approved.differences.benefits, this.totalAmounts.approved.differences.incomes);

    this
      .budgetProjects
      .forEach(element => {
        this.totalAmounts.budget.estimated.benefits = String(this._common.checkFloat(this.totalAmounts.budget.estimated.benefits) + this._common.checkFloat(element.estimated.benefits));
        this.totalAmounts.budget.estimated.employees = String(this._common.checkFloat(this.totalAmounts.budget.estimated.employees) + this._common.checkFloat(element.estimated.employees));
        this.totalAmounts.budget.estimated.expenses = String(this._common.checkFloat(this.totalAmounts.budget.estimated.expenses) + this._common.checkFloat(element.estimated.expenses));
        this.totalAmounts.budget.estimated.incomes = String(this._common.checkFloat(this.totalAmounts.budget.estimated.incomes) + this._common.checkFloat(element.estimated.incomes));

        this.totalAmounts.budget.real.benefits = String(this._common.checkFloat(this.totalAmounts.budget.real.benefits) + this._common.checkFloat(element.real.benefits));
        this.totalAmounts.budget.real.employees = String(this._common.checkFloat(this.totalAmounts.budget.real.employees) + this._common.checkFloat(element.real.employees));
        this.totalAmounts.budget.real.expenses = String(this._common.checkFloat(this.totalAmounts.budget.real.expenses) + this._common.checkFloat(element.real.expenses));
        this.totalAmounts.budget.real.incomes = String(this._common.checkFloat(this.totalAmounts.budget.real.incomes) + this._common.checkFloat(element.real.incomes));

        this.totalAmounts.budget.differences.benefits = String(this._common.checkFloat(this.totalAmounts.budget.differences.benefits) + this._common.checkFloat(element.differences.benefits));
        this.totalAmounts.budget.differences.employees = String(this._common.checkFloat(this.totalAmounts.budget.differences.employees) + this._common.checkFloat(element.differences.employees));
        this.totalAmounts.budget.differences.expenses = String(this._common.checkFloat(this.totalAmounts.budget.differences.expenses) + this._common.checkFloat(element.differences.expenses));
        this.totalAmounts.budget.differences.incomes = String(this._common.checkFloat(this.totalAmounts.budget.differences.incomes) + this._common.checkFloat(element.differences.incomes));
      });

    this.totalAmounts.budget.estimated.margin = this.getMargin(this.totalAmounts.budget.estimated.benefits, this.totalAmounts.budget.estimated.incomes);
    this.totalAmounts.budget.real.margin = this.getMargin(this.totalAmounts.budget.real.benefits, this.totalAmounts.budget.real.incomes);
    this.totalAmounts.budget.differences.margin = this.getMargin(this.totalAmounts.budget.differences.benefits, this.totalAmounts.budget.differences.incomes);

    this
      .finishedProjects
      .forEach(element => {
        this.totalAmounts.finished.estimated.benefits = String(this._common.checkNumber(this.totalAmounts.finished.estimated.benefits) + this._common.checkNumber(element.estimated.benefits));
        this.totalAmounts.finished.estimated.employees = String(this._common.checkNumber(this.totalAmounts.finished.estimated.employees) + this._common.checkNumber(element.estimated.employees));
        this.totalAmounts.finished.estimated.expenses = String(this._common.checkNumber(this.totalAmounts.finished.estimated.expenses) + this._common.checkNumber(element.estimated.expenses));
        this.totalAmounts.finished.estimated.incomes = String(this._common.checkNumber(this.totalAmounts.finished.estimated.incomes) + this._common.checkNumber(element.estimated.incomes));

        this.totalAmounts.finished.real.benefits = String(this._common.checkNumber(this.totalAmounts.finished.real.benefits) + this._common.checkNumber(element.real.benefits));
        this.totalAmounts.finished.real.employees = String(this._common.checkNumber(this.totalAmounts.finished.real.employees) + this._common.checkNumber(element.real.employees));
        this.totalAmounts.finished.real.expenses = String(this._common.checkNumber(this.totalAmounts.finished.real.expenses) + this._common.checkNumber(element.real.expenses));
        this.totalAmounts.finished.real.incomes = String(this._common.checkNumber(this.totalAmounts.finished.real.incomes) + this._common.checkNumber(element.real.incomes));

        this.totalAmounts.finished.differences.benefits = String(this._common.checkNumber(this.totalAmounts.finished.differences.benefits) + this._common.checkNumber(element.differences.benefits));
        this.totalAmounts.finished.differences.employees = String(this._common.checkNumber(this.totalAmounts.finished.differences.employees) + this._common.checkNumber(element.differences.employees));
        this.totalAmounts.finished.differences.expenses = String(this._common.checkNumber(this.totalAmounts.finished.differences.expenses) + this._common.checkNumber(element.differences.expenses));
        this.totalAmounts.finished.differences.incomes = String(this._common.checkNumber(this.totalAmounts.finished.differences.incomes) + this._common.checkNumber(element.differences.incomes));
      });

    this.totalAmounts.finished.estimated.margin = this.getMargin(this.totalAmounts.finished.estimated.benefits, this.totalAmounts.finished.estimated.incomes);
    this.totalAmounts.finished.real.margin = this.getMargin(this.totalAmounts.finished.real.benefits, this.totalAmounts.finished.real.incomes);
    this.totalAmounts.finished.differences.margin = this.getMargin(this.totalAmounts.finished.differences.benefits, this.totalAmounts.finished.differences.incomes);

    this.totalAmounts.total.estimated.benefits = String(this._common.checkNumber(this.totalAmounts.budget.estimated.benefits) + this._common.checkNumber(this.totalAmounts.approved.estimated.benefits) + this._common.checkNumber(this.totalAmounts.finished.estimated.benefits));
    this.totalAmounts.total.estimated.employees = String(this._common.checkNumber(this.totalAmounts.budget.estimated.employees) + this._common.checkNumber(this.totalAmounts.approved.estimated.employees) + this._common.checkNumber(this.totalAmounts.finished.estimated.employees));
    this.totalAmounts.total.estimated.expenses = String(this._common.checkNumber(this.totalAmounts.budget.estimated.expenses) + this._common.checkNumber(this.totalAmounts.approved.estimated.expenses) + this._common.checkNumber(this.totalAmounts.finished.estimated.expenses));
    this.totalAmounts.total.estimated.incomes = String(this._common.checkNumber(this.totalAmounts.budget.estimated.incomes) + this._common.checkNumber(this.totalAmounts.approved.estimated.incomes) + this._common.checkNumber(this.totalAmounts.finished.estimated.incomes));
    this.totalAmounts.total.estimated.margin = this.getMargin(this.totalAmounts.total.estimated.benefits, this.totalAmounts.total.estimated.incomes);

    this.totalAmounts.total.real.benefits = String(this._common.checkNumber(this.totalAmounts.budget.real.benefits) + this._common.checkNumber(this.totalAmounts.approved.real.benefits) + this._common.checkNumber(this.totalAmounts.finished.real.benefits));
    this.totalAmounts.total.real.employees = String(this._common.checkNumber(this.totalAmounts.budget.real.employees) + this._common.checkNumber(this.totalAmounts.approved.real.employees) + this._common.checkNumber(this.totalAmounts.finished.real.employees));
    this.totalAmounts.total.real.expenses = String(this._common.checkNumber(this.totalAmounts.budget.real.expenses) + this._common.checkNumber(this.totalAmounts.approved.real.expenses) + this._common.checkNumber(this.totalAmounts.finished.real.expenses));
    this.totalAmounts.total.real.incomes = String(this._common.checkNumber(this.totalAmounts.budget.real.incomes) + this._common.checkNumber(this.totalAmounts.approved.real.incomes) + this._common.checkNumber(this.totalAmounts.finished.real.incomes));
    this.totalAmounts.total.real.margin = this.getMargin(this.totalAmounts.total.real.benefits, this.totalAmounts.total.real.incomes);

    this.totalAmounts.total.differences.benefits = String(this._common.checkNumber(this.totalAmounts.budget.differences.benefits) + this._common.checkNumber(this.totalAmounts.approved.differences.benefits) + this._common.checkNumber(this.totalAmounts.finished.differences.benefits));
    this.totalAmounts.total.differences.employees = String(this._common.checkNumber(this.totalAmounts.budget.differences.employees) + this._common.checkNumber(this.totalAmounts.approved.differences.employees) + this._common.checkNumber(this.totalAmounts.finished.differences.employees));
    this.totalAmounts.total.differences.expenses = String(this._common.checkNumber(this.totalAmounts.budget.differences.expenses) + this._common.checkNumber(this.totalAmounts.approved.differences.expenses) + this._common.checkNumber(this.totalAmounts.finished.differences.expenses));
    this.totalAmounts.total.differences.incomes = String(this._common.checkNumber(this.totalAmounts.budget.differences.incomes) + this._common.checkNumber(this.totalAmounts.approved.differences.incomes) + this._common.checkNumber(this.totalAmounts.finished.differences.incomes));
    this.totalAmounts.total.differences.margin = this.getMargin(this.totalAmounts.total.differences.benefits, this.totalAmounts.total.differences.incomes);

  }

  resetTotals() {
    this.totalAmounts = {
      total: {
        estimated: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        real: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        differences: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        }
      },
      budget: {
        estimated: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        real: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        differences: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        }
      },
      approved: {
        estimated: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        real: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        differences: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        }
      },
      finished: {
        estimated: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        real: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        },
        differences: {
          incomes: '0,00',
          expenses: '0,00',
          employees: '0,00',
          benefits: '0,00',
          margin: '0,00'
        }
      }
    };
  }

  getMargin(benefits, income) {
    let ben = this
      ._common
      .toFloat(benefits);
    let inc = this
      ._common
      .toFloat(income);

    if (inc === 0) {
      return "0";
    }
    return String((ben / inc) * 100);
  }

  clickTab(value) {
    switch (value) {
      case 'estimated-budget':
        this.estimatedTabBudget = true;
        this.realTabBudget = false;
        this.differencesTabBudget = false;
        document
          .getElementById('estimated-budget')
          .style
          .left = '0';
        document
          .getElementById('real-budget')
          .style
          .left = '100%';
        document
          .getElementById('differences-budget')
          .style
          .left = '200%';
        document
          .getElementById('estimated-total-budget')
          .style
          .left = '0';
        document
          .getElementById('real-total-budget')
          .style
          .left = '100%';
        document
          .getElementById('differences-total-budget')
          .style
          .left = '200%';
        break;
      case 'real-budget':
        this.estimatedTabBudget = false;
        this.realTabBudget = true;
        this.differencesTabBudget = false;
        document
          .getElementById('estimated-budget')
          .style
          .left = '-100%';
        document
          .getElementById('real-budget')
          .style
          .left = '0';
        document
          .getElementById('differences-budget')
          .style
          .left = '100%';
        document
          .getElementById('estimated-total-budget')
          .style
          .left = '-100%';
        document
          .getElementById('real-total-budget')
          .style
          .left = '0';
        document
          .getElementById('differences-total-budget')
          .style
          .left = '100%';
        break;
      case 'differences-budget':
        this.estimatedTabBudget = false;
        this.realTabBudget = false;
        this.differencesTabBudget = true;
        document
          .getElementById('estimated-budget')
          .style
          .left = '-200%';
        document
          .getElementById('real-budget')
          .style
          .left = '-100%';
        document
          .getElementById('differences-budget')
          .style
          .left = '0';
        document
          .getElementById('estimated-total-budget')
          .style
          .left = '-200%';
        document
          .getElementById('real-total-budget')
          .style
          .left = '-100%';
        document
          .getElementById('differences-total-budget')
          .style
          .left = '0';
        break;

      case 'estimated-approved':
        this.estimatedTabApproved = true;
        this.realTabApproved = false;
        this.differencesTabApproved = false;
        document
          .getElementById('estimated-approved')
          .style
          .left = '0';
        document
          .getElementById('real-approved')
          .style
          .left = '100%';
        document
          .getElementById('differences-approved')
          .style
          .left = '200%';
        document
          .getElementById('estimated-total-approved')
          .style
          .left = '0';
        document
          .getElementById('real-total-approved')
          .style
          .left = '100%';
        document
          .getElementById('differences-total-approved')
          .style
          .left = '200%';
        break;
      case 'real-approved':
        this.estimatedTabApproved = false;
        this.realTabApproved = true;
        this.differencesTabApproved = false;
        document
          .getElementById('estimated-approved')
          .style
          .left = '-100%';
        document
          .getElementById('real-approved')
          .style
          .left = '0';
        document
          .getElementById('differences-approved')
          .style
          .left = '100%';
        document
          .getElementById('estimated-total-approved')
          .style
          .left = '-100%';
        document
          .getElementById('real-total-approved')
          .style
          .left = '0';
        document
          .getElementById('differences-total-approved')
          .style
          .left = '100%';
        break;
      case 'differences-approved':
        this.estimatedTabApproved = false;
        this.realTabApproved = false;
        this.differencesTabApproved = true;
        document
          .getElementById('estimated-approved')
          .style
          .left = '-200%';
        document
          .getElementById('real-approved')
          .style
          .left = '-100%';
        document
          .getElementById('differences-approved')
          .style
          .left = '0';
        document
          .getElementById('estimated-total-approved')
          .style
          .left = '-200%';
        document
          .getElementById('real-total-approved')
          .style
          .left = '-100%';
        document
          .getElementById('differences-total-approved')
          .style
          .left = '0';
        break;

      case 'estimated-finished':
        this.estimatedTabFinished = true;
        this.realTabFinished = false;
        this.differencesTabFinished = false;
        document
          .getElementById('estimated-finished')
          .style
          .left = '0';
        document
          .getElementById('real-finished')
          .style
          .left = '100%';
        document
          .getElementById('differences-finished')
          .style
          .left = '200%';
        document
          .getElementById('estimated-total-finished')
          .style
          .left = '0';
        document
          .getElementById('real-total-finished')
          .style
          .left = '100%';
        document
          .getElementById('differences-total-finished')
          .style
          .left = '200%';
        break;
      case 'real-finished':
        this.estimatedTabFinished = false;
        this.realTabFinished = true;
        this.differencesTabFinished = false;
        document
          .getElementById('estimated-finished')
          .style
          .left = '-100%';
        document
          .getElementById('real-finished')
          .style
          .left = '0';
        document
          .getElementById('differences-finished')
          .style
          .left = '100%';
        document
          .getElementById('estimated-total-finished')
          .style
          .left = '-100%';
        document
          .getElementById('real-total-finished')
          .style
          .left = '0';
        document
          .getElementById('differences-total-finished')
          .style
          .left = '100%';
        break;
      case 'differences-finished':
        this.estimatedTabFinished = false;
        this.realTabFinished = false;
        this.differencesTabFinished = true;
        document
          .getElementById('estimated-finished')
          .style
          .left = '-200%';
        document
          .getElementById('real-finished')
          .style
          .left = '-100%';
        document
          .getElementById('differences-finished')
          .style
          .left = '0';
        document
          .getElementById('estimated-total-finished')
          .style
          .left = '-200%';
        document
          .getElementById('real-total-finished')
          .style
          .left = '-100%';
        document
          .getElementById('differences-total-finished')
          .style
          .left = '0';
        break;
    }
  }

}
