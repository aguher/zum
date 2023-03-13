import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { dateMonth } from '../../models/dateMonth';
import { TokenService } from '../../services/token.service';

@Component({ selector: 'app-projects-report', templateUrl: './projects-report.component.html', styleUrls: ['./projects-report.component.scss'] })
export class ProjectsReportComponent implements OnInit {

  filter = {
    project: null,
    customer: null,
    group: null,
    subgroup: null,
    team: null,
    startDate: null,
    endDate: null
  };
  combos = {
    projects: [],
    customer: [],
    group: [],
    subgroup: [],
    team: [],
    startDate: [],
    endDate: []
  };

  dataVariableCost = [];

  data = {
    budget: {
      totalIncomes: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalVariables: '0',
      totalBeneficios: '0'
    },
    real: {
      totalIncomes: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalVariables: '0',
      totalBeneficios: '0'
    },
    differences: {
      totalIncomes: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalVariables: '0',
      totalBeneficios: '0'
    }
  };

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
  roleUser = null;

  groupsCombo = [];
  subgroupsCombo = [];
  lenProjects = 0;
  constructor(private _api: ApiService, private _common: Common, private _notification: NotificationsService, private _token: TokenService) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label : '';
    lsYear = (lsYear) ? lsYear.label : '';

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
          response.projects && response.projects.forEach(element => {
            this
              .combos
              .projects
              .push({ label: element.campaign_name, value: element.id });
          });
          response.customers && response.customers.forEach((element) => {
            this
              .combos
              .customer
              .push({ label: element.customer_name, value: element.id });
          });
          response.teams && response.teams.forEach((element) => {
            this
              .combos
              .team
              .push({ label: element.team_name, value: element.id });
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
      let body = `id_project=&customer=&team=&group=&subgroup=&start_date=&end_date=`;
      this
        ._api
        .getAllProjectsReport(body)
        .subscribe((response) => {
          this.lenProjects = response.len_projects;
          this.groupValues(response.report);
          let report = response.report;
          this.groupByVariableCost('budget', report.variables_budget);
          this.groupByVariableCost('real', report.variables_real);
          this.calculateDifferences();
        });
    }
  }

  initValues() {
    this.dataVariableCost = [];
    this.data = {
      budget: {
        totalIncomes: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalVariables: '0',
        totalBeneficios: '0'
      },
      real: {
        totalIncomes: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalVariables: '0',
        totalBeneficios: '0'
      },
      differences: {
        totalIncomes: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalVariables: '0',
        totalBeneficios: '0'
      }
    };
  }

  calculateDifferences() {
    
    let parentFC = this.dataVariableCost;
    parentFC.forEach(element => {
      this.data.budget.totalVariables = String(parseFloat(this.data.budget.totalVariables) + parseFloat(element.budget_total));
      this.data.real.totalVariables = String(parseFloat(this.data.real.totalVariables) + parseFloat(element.real_total));
      this.data.differences.totalVariables = String(parseFloat(this.data.differences.totalVariables) + parseFloat(element.differences_total));
    });


    this.data.differences.totalIncomes = (parseFloat(this.data.budget.totalIncomes) - parseFloat(this.data.real.totalIncomes)).toFixed(2);
    this.data.differences.totalEmployees = (parseFloat(this.data.budget.totalEmployees) - parseFloat(this.data.real.totalEmployees)).toFixed(2);
    this.data.differences.totalFee = (parseFloat(this.data.budget.totalFee) - parseFloat(this.data.real.totalFee)).toFixed(2);
    this.data.differences.totalVariables = (parseFloat(this.data.budget.totalVariables) - parseFloat(this.data.real.totalVariables)).toFixed(2);
    this.calculateTotal();
  }

  calculateTotal() {
    this.data.budget.totalBeneficios =
      (
        parseFloat(this.data.budget.totalIncomes) -
        parseFloat(this.data.budget.totalEmployees) -
        parseFloat(this.data.budget.totalFee) -
        parseFloat(this.data.budget.totalVariables)
      ).toFixed(2);
    this.data.real.totalBeneficios =
      (
        parseFloat(this.data.real.totalIncomes) -
        parseFloat(this.data.real.totalEmployees) -
        parseFloat(this.data.real.totalFee) -
        parseFloat(this.data.real.totalVariables)
      ).toFixed(2);
    this.data.differences.totalBeneficios =
      (
        parseFloat(this.data.differences.totalIncomes) -
        parseFloat(this.data.differences.totalEmployees) -
        parseFloat(this.data.differences.totalFee) -
        parseFloat(this.data.differences.totalVariables)
      ).toFixed(2);
    this.dataVariableCost.forEach(element => {
      element.differences_total = parseFloat(element.budget_total) - parseFloat(element.real_total);
      if (element.children) {
        element.children.forEach(inner => {
          inner.differences = parseFloat(inner.budget) - parseFloat(inner.real);
        });
      }

    });
    this.data.differences.totalBeneficios = (parseFloat(this.data.budget.totalBeneficios) - parseFloat(this.data.real.totalBeneficios)).toFixed(2);
  }

  groupValues(reports) {
    // INCOMES
    reports.incomes_budget.forEach(element => {
      this.data.budget.totalIncomes = String(parseFloat(this.data.budget.totalIncomes) + parseFloat(element.total));
    });
    reports.incomes_real.forEach(element => {
      this.data.real.totalIncomes = String(parseFloat(this.data.real.totalIncomes) + parseFloat(element.total));
    });

    //EMPLOYEES
    reports.employees_budget.forEach(element => {
      this.data.budget.totalEmployees = String(parseFloat(this.data.budget.totalEmployees) + parseFloat(element.total));
    });
    this.calculateRealEmployees(reports.employees_real, reports.employees_real_gesad);

    // FEE DE EMPRESA
    reports.fee_budget.forEach(element => {
      this.data.budget.totalFee = String(parseFloat(this.data.budget.totalFee) + parseFloat(element.total));
    });
    reports.fee_real.forEach(element => {
      this.data.real.totalFee = String(parseFloat(this.data.real.totalFee) + parseFloat(element.amount));
    });

  }


  calculateRealEmployees(costs, cost_gesad) {
    this.data.real.totalEmployees = '0';
    costs.forEach(element => {
      element.accumulate = true;
    });
    // a cada item de coste de empleado de tracker, le ponemos un flag para saber si luego hay que sumarlo al total
    cost_gesad.forEach(element => {
      let match = false;
      costs.forEach(inner => {
        if (this.matchMonth(element.id_month, inner.date)) {
          inner.accumulate = false;
        }
      });
      if (this.passDates(element.id_month)) {
        this.data.real.totalEmployees = String(parseFloat(this.data.real.totalEmployees) + parseFloat(element.amount));
      }
    });

    costs.forEach(element => {
      if (element.accumulate && this.passDateFormat(element.date)) {
        this.data.real.totalEmployees = String(parseFloat(this.data.real.totalEmployees) + parseFloat(element.cost));
      }
    });
  }
  matchMonth(source, destination) {
    let month = destination.split('-')[1];
    let numberMonth = parseInt(month);
    switch (source) {
      case 'january':
        return (numberMonth === 1) ? true : false;
      case 'february':
        return (numberMonth === 2) ? true : false;
      case 'march':
        return (numberMonth === 3) ? true : false;
      case 'april':
        return (numberMonth === 4) ? true : false;
      case 'may':
        return (numberMonth === 5) ? true : false;
      case 'june':
        return (numberMonth === 6) ? true : false;
      case 'july':
        return (numberMonth === 7) ? true : false;
      case 'august':
        return (numberMonth === 8) ? true : false;
      case 'september':
        return (numberMonth === 9) ? true : false;
      case 'october':
        return (numberMonth === 10) ? true : false;
      case 'november':
        return (numberMonth === 11) ? true : false;
      case 'december':
        return (numberMonth === 12) ? true : false;
    }
  }
  passDateFormat(date) {
    let month = date.split('-')[1];
    let passedStart = true;
    let passedEnd = true;

    if (!this.filter.startDate && !this.filter.endDate) {
      return true;
    }
    if (this.filter.startDate && (parseInt(this.filter.startDate) + 1) > parseInt(month)) {
      passedStart = false;
    }
    if (this.filter.endDate && (parseInt(this.filter.endDate) + 1) < parseInt(month)) {
      passedEnd = false;
    }

    return passedStart && passedEnd;
  }
  passStartDate(month) {
    if (this.filter.startDate) {
      switch (month) {
        case 'january':
          return parseInt(this.filter.startDate) <= 0 ? true : false;
        case 'february':
          return parseInt(this.filter.startDate) <= 1 ? true : false;
        case 'march':
          return parseInt(this.filter.startDate) <= 2 ? true : false;
        case 'april':
          return parseInt(this.filter.startDate) <= 3 ? true : false;
        case 'may':
          return parseInt(this.filter.startDate) <= 4 ? true : false;
        case 'june':
          return parseInt(this.filter.startDate) <= 5 ? true : false;
        case 'july':
          return parseInt(this.filter.startDate) <= 6 ? true : false;
        case 'august':
          return parseInt(this.filter.startDate) <= 7 ? true : false;
        case 'september':
          return parseInt(this.filter.startDate) <= 8 ? true : false;
        case 'october':
          return parseInt(this.filter.startDate) <= 9 ? true : false;
        case 'november':
          return parseInt(this.filter.startDate) <= 10 ? true : false;
        case 'december':
          return parseInt(this.filter.startDate) <= 11 ? true : false;
      }
    }
    return true;
  }

  passEndDate(month) {
    if (this.filter.endDate) {
      switch (month) {
        case 'january':
          return parseInt(this.filter.endDate) >= 0 ? true : false;
        case 'february':
          return parseInt(this.filter.endDate) >= 1 ? true : false;
        case 'march':
          return parseInt(this.filter.endDate) >= 2 ? true : false;
        case 'april':
          return parseInt(this.filter.endDate) >= 3 ? true : false;
        case 'may':
          return parseInt(this.filter.endDate) >= 4 ? true : false;
        case 'june':
          return parseInt(this.filter.endDate) >= 5 ? true : false;
        case 'july':
          return parseInt(this.filter.endDate) >= 6 ? true : false;
        case 'august':
          return parseInt(this.filter.endDate) >= 7 ? true : false;
        case 'september':
          return parseInt(this.filter.endDate) >= 8 ? true : false;
        case 'october':
          return parseInt(this.filter.endDate) >= 9 ? true : false;
        case 'november':
          return parseInt(this.filter.endDate) >= 10 ? true : false;
        case 'december':
          return parseInt(this.filter.endDate) >= 11 ? true : false;
      }
    }
    return true;
  }

  passDates(month) {
    return this.passStartDate(month) && this.passEndDate(month);
  }

  addNewChildren(element, typeField) {
    let containerData = {
      childrenData: {},
      budgetParentAmount: 0,
      realParentAmount: 0,
    };

    if (typeField === 'budget') {
      containerData.budgetParentAmount = parseFloat(element.total);
      containerData.realParentAmount = 0;
      containerData.childrenData = {
        id_children: element.id_children,
        name: element.name_child,
        budget: element.total,
        real: 0,
        differences: 0
      };
    } else {
      containerData.budgetParentAmount = 0;
      containerData.realParentAmount = parseFloat(element.total);
      containerData.childrenData = {
        id_children: element.id_children,
        name: element.name_child,
        budget: 0,
        real: element.total,
        differences: 0
      };
    }

    return containerData;
  }

  addNewParent(element, typeField) {
    if (this.passStartDate(element.id_month) && this.passEndDate(element.id_month)) {
      let tmpContainer = {
        childrenData: {},
        budgetParentAmount: 0,
        realParentAmount: parseFloat(element.total),
      };
      let containerData = (typeField === 'real') ? tmpContainer : this.addNewChildren(element, typeField);
      if (typeField === 'real') {
        this.dataVariableCost
          .push({
            id_parent: element.id_parent,
            parent: true,
            name: element.name_parent,
            budget_total: containerData.budgetParentAmount,
            real_total: containerData.realParentAmount,
            differences_total: (containerData.budgetParentAmount - containerData.realParentAmount)
          });
      } else {
        this.dataVariableCost
          .push({
            id_parent: element.id_parent,
            parent: true,
            name: element.name_parent,
            budget_total: containerData.budgetParentAmount,
            real_total: containerData.realParentAmount,
            differences_total: (containerData.budgetParentAmount - containerData.realParentAmount),
            children: [containerData.childrenData]
          });
      }

    }
  }

  groupByVariableCost(typeField, variableCost) {
    let parentRow = null;
    let childrenRow = null;
    let idx = 0;
    let idxChild = 0;

    _.forEach(variableCost, (element, index) => {
      //si es la primera iteracion, añado al array el valor directamente, de la info del padre y del hijo
      if (this.dataVariableCost.length === 0) {
        this.addNewParent(element, typeField);
      } else {
        let found = false;
        this.dataVariableCost.forEach((fcIterator, idx) => {
          if (fcIterator.id_parent == element.id_parent) { // es el mismo padre, añadimos un hijo
            found = true;
            let foundChild = false;
            if (this.passStartDate(element.id_month) && this.passEndDate(element.id_month)) {
              if (this.dataVariableCost[idx].children && element.id_children) {
                this.dataVariableCost[idx].children.forEach(fcChildIterator => {
                  if (fcChildIterator.id_children == element.id_children) {
                    fcChildIterator.budget = parseFloat(fcChildIterator.budget) + parseFloat(element.total);
                    fcIterator.budget_total = parseFloat(fcIterator.budget_total) + parseFloat(element.total);
                    foundChild = true;
                  }
                });
              } else { //es para real, que no tiene hijos
                fcIterator.real_total = parseFloat(fcIterator.real_total) + parseFloat(element.total);
                foundChild = true;
              }

              if (!foundChild) { // si no encontramos al hijo, lo añadimos directamente
                let containerData = this.addNewChildren(element, typeField);
                //sumamos los valores del hijo al padre
                this.dataVariableCost[idx].budget_total = parseFloat(this.dataVariableCost[idx].budget_total) + containerData.budgetParentAmount;
                this.dataVariableCost[idx].real_total = parseFloat(this.dataVariableCost[idx].real_total) + containerData.realParentAmount;
                this.dataVariableCost[idx].children.push(containerData.childrenData);
              }
            }
          }
        });
        // si no encontramos al padre, lo añadimos
        if (!found) {
          this.addNewParent(element, typeField);
        }
      }

    });

  }

  fillComboDates() {
    this
      .combos
      .startDate
      .push({ label: 'Selecciona un valor', value: -1 });
    this
      .combos
      .startDate
      .push({ label: 'Enero', value: '0' });
    this
      .combos
      .startDate
      .push({ label: 'Febrero', value: '1' });
    this
      .combos
      .startDate
      .push({ label: 'Marzo', value: '2' });
    this
      .combos
      .startDate
      .push({ label: 'Abril', value: '3' });
    this
      .combos
      .startDate
      .push({ label: 'Mayo', value: '4' });
    this
      .combos
      .startDate
      .push({ label: 'Junio', value: '5' });
    this
      .combos
      .startDate
      .push({ label: 'Julio', value: '6' });
    this
      .combos
      .startDate
      .push({ label: 'Agosto', value: '7' });
    this
      .combos
      .startDate
      .push({ label: 'Septiembre', value: '8' });
    this
      .combos
      .startDate
      .push({ label: 'Octubre', value: '9' });
    this
      .combos
      .startDate
      .push({ label: 'Noviembre', value: '10' });
    this
      .combos
      .startDate
      .push({ label: 'Diciembre', value: '11' });
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
            .push({ label: 'Enero', value: '0' });
          this
            .combos
            .endDate
            .push({ label: 'Febrero', value: '1' });
          this
            .combos
            .endDate
            .push({ label: 'Marzo', value: '2' });
          this
            .combos
            .endDate
            .push({ label: 'Abril', value: '3' });
          this
            .combos
            .endDate
            .push({ label: 'Mayo', value: '4' });
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 1:
          this
            .combos
            .endDate
            .push({ label: 'Febrero', value: '1' });
          this
            .combos
            .endDate
            .push({ label: 'Marzo', value: '2' });
          this
            .combos
            .endDate
            .push({ label: 'Abril', value: '3' });
          this
            .combos
            .endDate
            .push({ label: 'Mayo', value: '4' });
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 2:
          this
            .combos
            .endDate
            .push({ label: 'Marzo', value: '2' });
          this
            .combos
            .endDate
            .push({ label: 'Abril', value: '3' });
          this
            .combos
            .endDate
            .push({ label: 'Mayo', value: '4' });
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 3:
          this
            .combos
            .endDate
            .push({ label: 'Abril', value: '3' });
          this
            .combos
            .endDate
            .push({ label: 'Mayo', value: '4' });
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 4:
          this
            .combos
            .endDate
            .push({ label: 'Mayo', value: '4' });
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 5:
          this
            .combos
            .endDate
            .push({ label: 'Junio', value: '5' });
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 6:
          this
            .combos
            .endDate
            .push({ label: 'Julio', value: '6' });
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 7:
          this
            .combos
            .endDate
            .push({ label: 'Agosto', value: '7' });
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 8:
          this
            .combos
            .endDate
            .push({ label: 'Septiembre', value: '8' });
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 9:
          this
            .combos
            .endDate
            .push({ label: 'Octubre', value: '9' });
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
          break;
        case 10:
          this
            .combos
            .endDate
            .push({ label: 'Noviembre', value: '10' });
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
        case 11:
          this
            .combos
            .endDate
            .push({ label: 'Diciembre', value: '11' });
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
        .push({ label: element.name, value: element.id });
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
        .push({ label: element.name, value: element.id });
    });
  }

  filterValues() {
    this.initValues();
    let body = `id_project=${this.filter.project}&customer=${this.filter.customer}&team=${this.filter.team}&group=${this.filter.group}&subgroup=${this.filter.subgroup}&start_date=${this.filter.startDate}&end_date=${this.filter.endDate}`;
    this
      ._api
      .getAllProjectsReport(body)
      .subscribe((response) => {
        this.checkMonthVisibles();
        this.lenProjects = response.len_projects;
        this.groupValues(response.report);
        let report = response.report;
        this.groupByVariableCost('budget', report.variables_budget);
        this.groupByVariableCost('real', report.variables_real);
        this.calculateDifferences();
        this
          ._notification
          .success('Finalizado', 'Se ha realizado el filtro');
      });
  }

  clearValues() {
    this.initValues();
    this
      .monthVisibles
      .forEach((item) => {
        return item.visible = true;
      });
    this.combos.group = [];
    this.combos.subgroup = [];

    this.filter = {
      project: null,
      customer: null,
      group: null,
      subgroup: null,
      team: null,
      startDate: null,
      endDate: null
    };
    let body = `project=&customer=&team=&group=&subgroup=&start_date=&end_date=`;
    this
      ._api
      .getAllProjectsReport(body)
      .subscribe((response) => {
        this.lenProjects = response.len_projects;
        this.groupValues(response.report);
        let report = response.report;
        this.groupByVariableCost('budget', report.variables_budget);
        this.groupByVariableCost('real', report.variables_real);
        this.calculateDifferences();
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


}
