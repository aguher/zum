import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { Router, NavigationEnd } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { dateMonth } from '../../models/dateMonth';

@Component({ selector: 'app-statistic-report', templateUrl: './statistic-report.component.html', styleUrls: ['./statistic-report.component.scss'] })
export class StatisticReportComponent implements OnInit {
  isEditable: boolean = true;
  incomesFromDB = 0;
  companySelected = '';
  yearSelected = '';
  valuesReport = null;
  fixedCost = [];
  objCols = {
    pessimist: {
      colValue: '0.00',
      colPercent: '0'
    },
    neutral: {
      colValue: '0.00',
      colPercent: '0'
    },
    optimist: {
      colValue: '0.00',
      colPercent: '0'
    }
  };
  totalFixedCost = _.cloneDeep(this.objCols);
  totalIncomes = _.cloneDeep(this.objCols);
  totalExpenses = _.cloneDeep(this.objCols);
  totalEmployees = _.cloneDeep(this.objCols);
  totalMargin = _.cloneDeep(this.objCols);

  totalEbitda = _.cloneDeep(this.objCols);
  totalAmortizacion = _.cloneDeep(this.objCols);
  totalFinancieros = _.cloneDeep(this.objCols);
  totalEbit = _.cloneDeep(this.objCols);
  totalExtraordinarios = _.cloneDeep(this.objCols);
  totalBeneficios = _.cloneDeep(this.objCols);
  totalIs = _.cloneDeep(this.objCols);
  total = _.cloneDeep(this.objCols);

  loadValues: boolean = false;
  choosenCompany: boolean = false;

  valueIncome = 0;
  neutralValue = 0;
  valueTax = 0;

  percOptimist = '0';
  percPessimist = '0';

  valueAmortizacion:any = 0;
  valueFinanciero:any = 0;
  valueExtraordinario:any = 0;

  constructor(private _api: ApiService, private _common: Common, private _notification: NotificationsService,
    private _auth: AuthenticationService,
    private _route: Router, ) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    this.companySelected = (lsCompany) ? lsCompany.label : '';
    this.yearSelected = (lsYear) ? lsYear.label : '';

    if (this.companySelected === '' || this.yearSelected === '') {
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
      this
        ._api
        .getCompanyReportStatistic()
        .subscribe((response) => {
          if (response.error) {
            this._notification.error('Iniciar Sesión', 'Se ha caducado la sesión');
            this._auth.logout();
            this._route.navigate(['/login']);
          } else {
            this.valuesReport = response.report;
            this.percOptimist = response.percents.optimist;
            this.percPessimist = response.percents.pessimist;

            this.valueTax = parseFloat(response.tax);
            this.neutralValue = response.report.incomes;
            this.valueIncome = response.report.incomes;

            this.groupValues(response.report);
            this.incomesFromDB = response.report.incomes;
            this.groupExtras(response.report.amortizacion, response.report.financiero, response.report.extraordinario);
            this.groupByFixedCost(response.report.fixed_cost, response.report.incomes, response.others);
          }
        });
    }
  }

  ngOnInit() { }

  groupExtras(amortizacion, financiero, extraordinario) {

    
    amortizacion && amortizacion.forEach(element => {
      this.valueAmortizacion += parseFloat(element.total);
    });
    financiero && financiero.forEach(element => {
      this.valueFinanciero += parseFloat(element.total);
    });
    extraordinario && extraordinario.forEach(element => {
      this.valueExtraordinario += parseFloat(element.total);
    });
    // AMORTIZACIONES
    this.totalAmortizacion.pessimist.colValue = this.valueAmortizacion;
    this.totalAmortizacion.pessimist.colPercent = this.getMarginPessimist(this.totalAmortizacion.pessimist.colValue);

    this.totalAmortizacion.neutral.colPercent = this.getMargin(this.valueAmortizacion);
    this.totalAmortizacion.neutral.colValue = this.valueAmortizacion, false;

    this.totalAmortizacion.optimist.colValue = this.valueAmortizacion;
    this.totalAmortizacion.optimist.colPercent = this.getMarginOptimist(this.totalAmortizacion.optimist.colValue);

    // GASTOS FINANCIEROS
    this.totalFinancieros.pessimist.colValue = parseFloat(this.valueFinanciero);
    this.totalFinancieros.pessimist.colPercent = this.getMarginPessimist(this.totalFinancieros.pessimist.colValue);

    this.totalFinancieros.neutral.colValue = this.valueFinanciero, false;
    this.totalFinancieros.neutral.colPercent = this.getMargin(this.totalFinancieros.neutral.colValue);

    this.totalFinancieros.optimist.colValue = parseFloat(this.valueFinanciero);
    this.totalFinancieros.optimist.colPercent = this.getMarginOptimist(this.totalFinancieros.optimist.colValue);

    // GASTOS EXTRAORDINARIOS
    this.totalExtraordinarios.pessimist.colValue = (parseFloat(this.valueExtraordinario)).toFixed(2);
    this.totalExtraordinarios.pessimist.colPercent = this.getMarginPessimist(this.totalExtraordinarios.pessimist.colValue);

    this.totalExtraordinarios.neutral.colValue = this.valueExtraordinario, false;
    this.totalExtraordinarios.neutral.colPercent = this.getMargin(this.valueExtraordinario);

    this.totalExtraordinarios.optimist.colValue = (parseFloat(this.valueExtraordinario)).toFixed(2);
    this.totalExtraordinarios.optimist.colPercent = this.getMarginOptimist(this.totalExtraordinarios.optimist.colValue);
  }

  groupByFixedCost(fixedCosts, incomes, others) {
    let divisorPessimist = this.getPessimist(incomes);
    let divisorOptimist = this.getOptimist(incomes);
    let parentRow = null;
    let idx = 0;
    _.forEach(fixedCosts, (element, index) => {
      // empezamos con un nuevo padre
      if (parentRow === null || parentRow !== element.parent_name) {
        parentRow = element.parent_name;
        this
          .fixedCost
          .push({
            parent: true,
            name: element.parent_name,
            pessimist: {
              colValue: element.total,
              colPercent: this.getMarginPessimist(element.total)
            },
            neutral: {
              colValue: element.total,
              colPercent: this.getMargin(element.total)
            },
            optimist: {
              colValue: element.total,
              colPercent: this.getMarginOptimist(element.total)
            }
          });
        // idx es el indice donde se ha insertado el padre
        idx = this.fixedCost.length - 1;
        this
          .fixedCost
          .push({
            parent: false,
            name: element.children_name,
            pessimist: {
              colValue: element.total,
              colPercent: this.getMarginPessimist(element.total)
            },
            neutral: {
              colValue: element.total,
              colPercent: this.getMargin(element.total)
            },
            optimist: {
              colValue: element.total,
              colPercent: this.getMarginOptimist(element.total)
            }
          });
      } else {
        this
          .fixedCost
          .push({
            parent: false,
            name: element.children_name,
            pessimist: {
              colValue: element.total,
              colPercent: this.getMarginPessimist(element.total)
            },
            neutral: {
              colValue: element.total,
              colPercent: this.getMargin(element.total)
            },
            optimist: {
              colValue: element.total,
              colPercent: this.getMarginOptimist(element.total)
            }
          });
        let newValue = (parseFloat(this.fixedCost[idx].neutral.colValue) + parseFloat(element.total)).toFixed(2);
        this.fixedCost[idx].pessimist = {
          colValue: newValue,
          colPercent: this.getMarginPessimist(newValue)
        };
        this.fixedCost[idx].neutral = {
          colValue: newValue,
          colPercent: this.getMargin(newValue)
        };
        this.fixedCost[idx].optimist = {
          colValue: newValue,
          colPercent: this.getMarginOptimist(newValue)
        };
      }
    });

    let parentFC = this
      .fixedCost
      .filter((element) => {
        return element.parent;
      });
    parentFC.forEach(element => {
      let valueTotal = (parseFloat(this.totalFixedCost.neutral.colValue) + parseFloat(element.neutral.colValue)).toFixed(2);
      this.totalFixedCost.pessimist.colValue = valueTotal;

      this.totalFixedCost.neutral.colValue = valueTotal;

      this.totalFixedCost.optimist.colValue = valueTotal;
    });
    this.totalFixedCost.pessimist.colPercent = this.getMarginPessimist(this.totalFixedCost.pessimist.colValue);
    this.totalFixedCost.optimist.colPercent = this.getMarginOptimist(this.totalFixedCost.optimist.colValue);
    this.totalFixedCost.neutral.colPercent = this.getMargin(this.totalFixedCost.neutral.colValue);

    // TOTAL EBITDA
    this.totalEbitda.pessimist.colValue = (this.totalMargin.pessimist.colValue - this.totalFixedCost.pessimist.colValue).toFixed(2);
    this.totalEbitda.pessimist.colPercent = this.getPercent(parseFloat(this.totalEbitda.pessimist.colValue), divisorPessimist);

    this.totalEbitda.neutral.colValue = (this.totalMargin.neutral.colValue - this.totalFixedCost.neutral.colValue).toFixed(2);
    this.totalEbitda.neutral.colPercent = this.getMargin(this.totalEbitda.neutral.colValue);

    this.totalEbitda.optimist.colValue = (this.totalMargin.optimist.colValue - this.totalFixedCost.optimist.colValue).toFixed(2);
    this.totalEbitda.optimist.colPercent = this.getPercent(parseFloat(this.totalEbitda.optimist.colValue), divisorOptimist);

    // TOTAL EBIT
    this.totalEbit.pessimist.colValue = (this.totalEbitda.pessimist.colValue - this.totalAmortizacion.pessimist.colValue - this.totalFinancieros.pessimist.colValue).toFixed(2);
    this.totalEbit.pessimist.colPercent = this.getMarginPessimist(this.totalEbit.pessimist.colValue);

    this.totalEbit.neutral.colValue = (this.totalEbitda.neutral.colValue - this.valueAmortizacion - this.valueFinanciero).toFixed(2);
    this.totalEbit.neutral.colPercent = this.getMargin(this.totalEbit.neutral.colValue);

    this.totalEbit.optimist.colValue = (this.totalEbitda.optimist.colValue - this.totalAmortizacion.optimist.colValue - this.totalFinancieros.optimist.colValue).toFixed(2);
    this.totalEbit.optimist.colPercent = this.getMarginOptimist(this.totalEbit.optimist.colValue);

    // BENEFICIOS ANTES IS
    this.totalBeneficios.pessimist.colValue = this._common.toFloat(this.totalEbit.pessimist.colValue) - this._common.toFloat(this.totalExtraordinarios.pessimist.colValue);
    this.totalBeneficios.pessimist.colPercent = this.getMarginPessimist(this.totalBeneficios.pessimist.colValue);

    this.totalBeneficios.neutral.colValue = this._common.toFloat(this.totalEbit.neutral.colValue) - this._common.toFloat(this.totalExtraordinarios.neutral.colValue);
    this.totalBeneficios.neutral.colPercent = this.getMargin(this.totalBeneficios.neutral.colValue);

    this.totalBeneficios.optimist.colValue = this._common.toFloat(this.totalEbit.optimist.colValue) - this._common.toFloat(this.totalExtraordinarios.optimist.colValue);
    this.totalBeneficios.optimist.colPercent = this.getMarginOptimist(this.totalBeneficios.optimist.colValue);

    // IMPUESTO SOCIEDADES
    this.totalIs.pessimist.colValue = this.getPercentIS(this.totalBeneficios.pessimist.colValue);
    this.totalIs.pessimist.colPercent = this.getMarginPessimist(this.totalIs.pessimist.colValue);

    this.totalIs.neutral.colValue = this.getPercentIS(this.totalBeneficios.neutral.colValue);
    this.totalIs.neutral.colPercent = this.getMargin(this.totalIs.neutral.colValue);

    this.totalIs.optimist.colValue = this.getPercentIS(this.totalBeneficios.optimist.colValue);
    this.totalIs.optimist.colPercent = this.getMarginOptimist(this.totalIs.optimist.colValue);

    //TOTAL
    this.calculateTotal();
    this.loadValues = true;
  }

  calculateTotal() {
    let incomes = this.incomesFromDB;
    let divisorPessimist = this.getPessimist(incomes);
    let divisorOptimist = this.getOptimist(incomes);
    let pessimist = parseFloat(this.totalBeneficios.pessimist.colValue) - parseFloat(this.totalIs.pessimist.colValue);
    let neutral = parseFloat(this.totalBeneficios.neutral.colValue) - parseFloat(this.totalIs.neutral.colValue);
    let optimist = parseFloat(this.totalBeneficios.optimist.colValue) - parseFloat(this.totalIs.optimist.colValue);

    this.total.pessimist.colValue = pessimist;
    this.total.pessimist.colPercent = this.getMarginPessimist(pessimist);

    this.total.neutral.colValue = neutral
    this.total.neutral.colPercent = this.getMargin(neutral);

    this.total.optimist.colValue = optimist;
    this.total.optimist.colPercent = this.getMarginOptimist(optimist);
  }

  groupValues(reports) {

    let divisorPessimist = this.getPessimist(reports.incomes);
    let divisorOptimist = this.getOptimist(reports.incomes);
    // INCOMES
    this.totalIncomes.pessimist.colValue = divisorPessimist;

    this.totalIncomes.neutral.colValue = reports.incomes;

    this.totalIncomes.optimist.colValue = divisorOptimist;

    // EXPENSES
    this.totalExpenses.pessimist.colValue = (parseFloat(reports.expenses)).toFixed(2);
    this.totalExpenses.pessimist.colPercent = this.getMarginPessimist(reports.expenses);

    this.totalExpenses.neutral.colValue = (parseFloat(reports.expenses)).toFixed(2);
    this.totalExpenses.neutral.colPercent = this.getMargin(reports.expenses);

    this.totalExpenses.optimist.colValue = (parseFloat(reports.expenses)).toFixed(2);
    this.totalExpenses.optimist.colPercent = this.getMarginOptimist(reports.expenses);

    //EMPLOYEES
    this.totalEmployees.pessimist.colValue = (parseFloat(reports.employees)).toFixed(2);
    this.totalEmployees.pessimist.colPercent = this.getMarginPessimist(reports.employees);

    this.totalEmployees.neutral.colValue = (parseFloat(reports.employees)).toFixed(2);
    this.totalEmployees.neutral.colPercent = this.getMargin(reports.employees);

    this.totalEmployees.optimist.colValue = (parseFloat(reports.employees)).toFixed(2);
    this.totalEmployees.optimist.colPercent = this.getMarginOptimist(reports.employees);

    //MARGIN
    this.totalMargin.pessimist.colValue = (parseFloat(this.totalIncomes.pessimist.colValue) - parseFloat(this.totalExpenses.neutral.colValue) - parseFloat(this.totalEmployees.neutral.colValue)).toFixed(2);
    this.totalMargin.pessimist.colPercent = this.getPercent((this.totalIncomes.pessimist.colValue - this.totalExpenses.neutral.colValue - this.totalEmployees.neutral.colValue), divisorPessimist);

    this.totalMargin.neutral.colValue = (parseFloat(this.totalIncomes.neutral.colValue) - parseFloat(this.totalExpenses.neutral.colValue) - parseFloat(this.totalEmployees.neutral.colValue)).toFixed(2);
    this.totalMargin.neutral.colPercent = this.getMargin(this.totalMargin.neutral.colValue);

    this.totalMargin.optimist.colValue = (parseFloat(this.totalIncomes.optimist.colValue) - parseFloat(this.totalExpenses.neutral.colValue) - parseFloat(this.totalEmployees.neutral.colValue)).toFixed(2);
    this.totalMargin.optimist.colPercent = this.getPercent((this.totalIncomes.optimist.colValue - this.totalExpenses.neutral.colValue - this.totalEmployees.neutral.colValue), divisorOptimist);
  }

  getMargin(value) {
    this.valueIncome = parseFloat(String(this.valueIncome));
    if (this.valueIncome === 0) {
      return '0';
    }
    value = parseFloat(value);
    return this
      ._common
      .toFixValue((value / this.valueIncome) * 100, 2, '');
  }

  getMarginPessimist(value) {
    if (parseFloat(this.totalIncomes.pessimist.colValue) === 0) {
      return '0';
    }
    value = parseFloat(value);
    return this
      ._common
      .toFixValue((value / parseFloat(this.totalIncomes.pessimist.colValue)) * 100, 2, '');
  }

  getMarginOptimist(value) {
    if (parseFloat(this.totalIncomes.optimist.colValue) === 0) {
      return '0';
    }
    value = parseFloat(value);
    return this
      ._common
      .toFixValue((value / parseFloat(this.totalIncomes.optimist.colValue)) * 100, 2, '');
  }

  getPercent(value, divisor) {
    value = parseFloat(value);
    divisor = parseFloat(divisor);
    if (divisor === 0) {
      return 0;
    }

    return this
      ._common
      .toFixValue((value / divisor) * 100, 2, '');
  }

  getPessimist(value) {
    if (this.percPessimist === null) {
      return '0.00';
    } else if (this.percPessimist === '0') {
      this._notification.error('Aviso', 'El porcentaje pesimista no puede ser 0.');
      return '0.00';
    } else {
      value = parseFloat(value);
      return (((100 - parseFloat(this.percPessimist)) / 100) * value).toFixed(2);
    }
  }

  getOptimist(value) {
    if (this.percOptimist === null) {
      return '0.00';
    } else if (this.percOptimist === '0') {
      this._notification.error('Aviso', 'El porcentaje optimista no puede ser 0.');
      return '0.00';
    } else {
      value = parseFloat(value);
      return (((100 + parseFloat(this.percOptimist)) / 100) * value).toFixed(2);
    }
  }

  getPercentIS(value) {
    value = parseFloat(value);
    if (value <= 0) {
      return 0;
    } else {
      return ((this.valueTax / 100) * value).toFixed(2);
    }
  }

  
  parserValue(value) {
    const DECIMAL_SEPARATOR = ".";
    const fractionSize = 2;
    const PADDING = "000000";

    let [integer,
      fraction = ""] = (value || "")
        .toString()
        .split(DECIMAL_SEPARATOR);

    fraction = fraction.replace(',', '');
    fraction = fraction.replace(/[a-zA-Z]+/g, '');
    fraction = fractionSize > 0
      ? DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : "";

    integer = integer.replace(',', '');
    integer = integer.replace(/[a-zA-Z]+/g, '');

    return integer + fraction;
  }

  blurred(value, previous, type) {
    if (value.target.className.indexOf('dirty') > -1) {
      type.colValue = previous;
      this._notification.info('Información', 'Pulsa Enter o Tabulador para almacenar el valor');
    } else {
      type.colValue = this._common.currencyFormatES(value.currentTarget.value, false);
    }
  }

  resetClass(value) {
    if (value.which === 13 || value.which === 9) {
      value.target.className = '';
    } else {
      value.target.className = 'dirty';
    }
  }

}

