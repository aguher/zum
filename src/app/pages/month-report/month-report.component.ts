import { Component, OnInit } from '@angular/core';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { dateMonth } from '../../models/dateMonth';

import * as _ from 'lodash';
@Component({ selector: 'app-month-report', templateUrl: './month-report.component.html', styleUrls: ['./month-report.component.scss'] })
export class MonthReportComponent implements OnInit {
  showChart: boolean = true;
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
  valuesTotal = {
    incomes: {
      real: 0,
      estimated: 0,
      differences: 0
    },
    expenses: {
      real: 0,
      estimated: 0,
      differences: 0
    },
    benefits: {
      real: 0,
      estimated: 0,
      differences: 0
    }
  };
  groupsCombo = [];
  subgroupsCombo = [];
  lenProjects = 0;
  monthValues = null;
  choosenCompany: boolean = false;

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

  public lineChartData: Array<any> = [
    {
      data: [],
      label: 'Ingresos-Real'
    }, {
      data: [],
      label: 'Ingresos-Pto'
    }, {
      data: [],
      label: 'Ingresos-Dif'
    }, {
      data: [],
      label: 'Costes-Real'
    }, {
      data: [],
      label: 'Costes-Pto'
    }, {
      data: [],
      label: 'Costes-Dif'
    }, {
      data: [],
      label: 'Beneficios-Real'
    }, {
      data: [],
      label: 'Beneficios-Pto'
    }, {
      data: [],
      label: 'Beneficios-Dif'
    }
  ];
  public lineChartLabels: Array<any> = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SEP',
    'OCT',
    'NOV',
    'DIC'
  ];
  public lineChartOptions: any = {
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false
          },
          ticks: {
            fontColor: "#80A9DD",
            fontSize: 12,
            beginAtZero: true
          }
        }
      ],
      yAxes: [
        {
          gridLines: {
            display: true,
            color: '#4087D1'
          },
          ticks: {
            fontColor: "#80A9DD",
            fontSize: 12,
            beginAtZero: true
          }
        }
      ]
    },
    maintainAspectRatio: false,
    responsive: true,
    yLabels: {
      display: true
    }

  };
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'transparent',
      borderColor: '#015f34',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#01AB5D',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#01f786',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#dc2d2d',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#E76F6F',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#f2b1b1',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#957b00',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#E1BB00',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }, {
      backgroundColor: 'transparent',
      borderColor: '#ffdc2f',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  constructor(private _api: ApiService, private _common: Common, private _notification: NotificationsService, ) {
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
      this.showChart = true;
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
                .push({ label: element.customer_name, value: element.id });
            });
          response
            .teams
            .forEach((element) => {
              this
                .combos
                .team
                .push({ label: element.team_name, value: element.id });
            });
        });
    }

  }

  ngOnInit() {
    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      let body = `customer=&team=&group=&subgroup=`;
      this
        ._api
        .getMonthReport(body)
        .subscribe((response) => {
          this.lenProjects = response.len_projects;
          this.monthValues = response;
          this.calculateTotal();
          this.sendValuesChart();
        });
    }
  }

  filterValues() {
    if ((this.filter.startDate !== null && this.filter.endDate === null) || (this.filter.startDate === null && this.filter.endDate !== null)) {
      this
        ._notification
        .error("Aviso", "Debes rellenar mes de inicio y fin");
    } else {
      let body = `customer=${this.filter.customer}&team=${this.filter.team}&group=${this.filter.group}&subgroup=${this.filter.subgroup}`;
      this
        ._api
        .getMonthReport(body)
        .subscribe((response) => {
          this.checkMonthVisibles();
          this.lenProjects = response.len_projects;
          this.monthValues = response;
          this.checkMonthSelected();
          this.calculateTotal();
          this.sendValuesChart();
        });
    }
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
    let body = `customer=&team=&group=&subgroup=`;
    this
      ._api
      .getMonthReport(body)
      .subscribe((response) => {
        this.lenProjects = response.len_projects;
        this.monthValues = response;
        this.calculateTotal();
        this.sendValuesChart();
      });
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

  checkMonthSelected() {
    let start = this.combos.startDate;
    let end = this.combos.endDate;
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
    this.valuesTotal = {
      incomes: {
        real: 0,
        estimated: 0,
        differences: 0
      },
      expenses: {
        real: 0,
        estimated: 0,
        differences: 0
      },
      benefits: {
        real: 0,
        estimated: 0,
        differences: 0
      }
    };
    let idx = 0;
    if (this.monthValues.incomes) {
      _.forOwn(this.monthValues.incomes.real, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.incomes.real += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.incomes.estimated, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.incomes.estimated += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.incomes.differences, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.incomes.differences += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
    }
    if (this.monthValues.expenses) {
      _.forOwn(this.monthValues.expenses.real, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.expenses.real += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.expenses.estimated, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.expenses.estimated += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.expenses.differences, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.expenses.differences += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
    }
    if (this.monthValues.benefit) {
      _.forOwn(this.monthValues.benefit.real, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.benefits.real += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.benefit.estimated, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.benefits.estimated += parseFloat(item);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.benefit.differences, (item, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this.valuesTotal.benefits.differences += parseFloat(item);
        }
        idx++;
      });
    }

  }

  sendValuesChart() {
    this.lineChartData = [
      {
        data: [],
        label: 'Ingresos-Real'
      }, {
        data: [],
        label: 'Ingresos-Pto'
      }, {
        data: [],
        label: 'Ingresos-Dif'
      }, {
        data: [],
        label: 'Costes-Real'
      }, {
        data: [],
        label: 'Costes-Pto'
      }, {
        data: [],
        label: 'Costes-Dif'
      }, {
        data: [],
        label: 'Beneficios-Real'
      }, {
        data: [],
        label: 'Beneficios-Pto'
      }, {
        data: [],
        label: 'Beneficios-Dif'
      }
    ];
    let idx = 0;
    if (this.monthValues.incomes) {
      _.forOwn(this.monthValues.incomes.real, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[0]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;

      _.forOwn(this.monthValues.incomes.estimated, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[1]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;

      _.forOwn(this.monthValues.incomes.differences, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[2]
            .data
            .push(element);
        }
        idx++;
      });

      idx = 0;
    }
    if (this.monthValues.expenses) {
      _.forOwn(this.monthValues.expenses.real, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[3]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.expenses.estimated, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[4]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.expenses.differences, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[5]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;
    }
    if (this.monthValues.benefit) {
      _.forOwn(this.monthValues.benefit.real, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[6]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.benefit.estimated, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[7]
            .data
            .push(element);
        }
        idx++;
      });
      idx = 0;
      _.forOwn(this.monthValues.benefit.differences, (element, key) => {
        if ((idx >= parseInt(this.filter.startDate) && idx <= parseInt(this.filter.endDate)) || (this.filter.startDate === null && this.filter.endDate === null)) {
          this
            .lineChartData[8]
            .data
            .push(element);
        }
        idx++;
      });
    }

    this.showChart = false;
    this.lineChartLabels = [];
    setTimeout(() => {
      if (this.filter.startDate === null && this.filter.endDate === null) {
        this
          .lineChartLabels
          .push('ENE');
        this
          .lineChartLabels
          .push('FEB');
        this
          .lineChartLabels
          .push('MAR');
        this
          .lineChartLabels
          .push('ABR');
        this
          .lineChartLabels
          .push('MAY');
        this
          .lineChartLabels
          .push('JUN');
        this
          .lineChartLabels
          .push('JUL');
        this
          .lineChartLabels
          .push('AGO');
        this
          .lineChartLabels
          .push('SEP');
        this
          .lineChartLabels
          .push('OCT');
        this
          .lineChartLabels
          .push('NOV');
        this
          .lineChartLabels
          .push('DIC');
      } else {
        for (let i = 0; i < 12; i++) {
          if ((i >= parseInt(this.filter.startDate) && i <= parseInt(this.filter.endDate))) {
            switch (i) {
              case 0:
                this
                  .lineChartLabels
                  .push('ENE');
                break;
              case 1:
                this
                  .lineChartLabels
                  .push('FEB');
                break;
              case 2:
                this
                  .lineChartLabels
                  .push('MAR');
                break;
              case 3:
                this
                  .lineChartLabels
                  .push('ABR');
                break;
              case 4:
                this
                  .lineChartLabels
                  .push('MAY');
                break;
              case 5:
                this
                  .lineChartLabels
                  .push('JUN');
                break;
              case 6:
                this
                  .lineChartLabels
                  .push('JUL');
                break;
              case 7:
                this
                  .lineChartLabels
                  .push('AGO');
                break;
              case 8:
                this
                  .lineChartLabels
                  .push('SEP');
                break;
              case 9:
                this
                  .lineChartLabels
                  .push('OCT');
                break;
              case 10:
                this
                  .lineChartLabels
                  .push('NOV');
                break;
              case 11:
                this
                  .lineChartLabels
                  .push('DIC');
                break;
            }
          }
        }
      }

      this.showChart = true;
    }, 0);

  }

}