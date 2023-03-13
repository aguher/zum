import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as _ from 'lodash';
import { NotificationsService } from 'angular2-notifications';

import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';

import { ApiService } from '../../../services/api.service';
import { TokenService } from '../../../services/token.service';
import { Common } from '../../../api/common';
import { dateMonthStr } from '../../../models/dateMonthStr';
import { dateMonthInt } from '../../../models/dateMonthInt';
import { dateMonth } from '../../../models/dateMonth';


@Component({
  selector: 'lines-subconcept',
  templateUrl: './lines-subconcept.component.html',
  styleUrls: ['./lines-subconcept.component.scss']
})
export class LinesSubconceptComponent implements OnInit, OnDestroy {
  @Input() idProject;
  wrong_income: boolean = true;
  role: number = 0;
  isEditable: boolean = true;
  lines = [];
  total = {
    budget_total: 0,
    real_total: 0,
    benefit_total: 0,
    margin_total: 0
  };
  fee = {
    id: null,
    budget: {
      amount: 0,
      units: 0,
      price: 0,
      total: 0,
    },
    real: {
      units: 0,
      total: 0,
    },
    others: {
      benefits: 0,
      margin: 0,
    }
  };
  info: any = {};
  totalIncome = new dateMonthStr();
  income = new dateMonthStr();
  subtotal = new dateMonthInt();
  totalExpensesEstimated = new dateMonth();
  employeesCostEstimated = new dateMonth();

  benefitsEstimated = new dateMonth();
  marginEstimated = new dateMonth();

  startMonth = null;
  endMonth = null;
  incomes = null;
  idFee = 0;
  feeIncome = new dateMonthStr();
  linesIncomesConcepts = [];
  constructor(private _api: ApiService, private _common: Common, private _notification: NotificationsService, private _token: TokenService) { }

  onScroll() {
    var nav = document.getElementById('header-cloned-budget');
    if (window.pageYOffset > 425) {
      nav
        .classList
        .add("show");
    } else {
      nav
        .classList
        .remove("show");
    }
  }
  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }
  ngOnInit() {
    window.addEventListener('scroll', this.onScroll);
    this.role = parseInt(this._token.getInfo().role);
    let body = `id=${this.idProject}&type=0`;
    let type =0;
    this._api.getInfoCampaign(body).subscribe((response) => {
      if (response !== null) {
        this.info.campaign_code = response.info.campaign_code;
        this.info.campaign_name = response.info.campaign_name;
        this.checkEditableRows(response.info.id_status);
        this.fillEmployeeCost(response.employees_cost_no_filtered, response.employees_cost_estimated);
        this.idFee = response.idFee;
        this.fillFeeIncome(response.feeIncomes, response.totalFeeIncome);        
        this.fillIncomes(response.variable_concepts);
      }
    });
    this._api.getSubconcept(`id_project=${this.idProject}`).subscribe((response) => {
      this.startMonth = parseInt(response.info_project[0].start_date_budget.split('-')[1]);
      this.endMonth = parseInt(response.info_project[0].end_date_budget.split('-')[1]);

      _.forEach(response.items, (element, key) => {
        this.lines.push({
          id: element.id,
          name: element.name,
          account: element.account_number,
          subconcepts: [],
          totals: new dateMonthInt(),
          wrong_value: true,
          budget: {
            amount: 0,
            units: 0,
            price: 0,
            total: 0,
          }
        });
      });
      if (response.subconcepts) {
        response.subconcepts.forEach((element) => {
          let varConcept = _.find(this.lines, (inner) => {
            return inner.id === element.id_variable_concept;
          });
          if (varConcept) {
            let total_budget = element.amount * element.unit_budget * element.price;

            varConcept.budget.total += this._common.toFloat(element.amount) * this._common.toFloat(element.unit_budget) * this._common.toFloat(element.unit_real);
            varConcept.subconcepts.push(
              {
                id: element.id,
                name: element.name,
                total: this._common.currencyFormatES(this._common.toFloat(element.amount) * this._common.toFloat(element.unit_budget) * this._common.toFloat(element.unit_real), false),
                total_budget,
                lines: new dateMonthStr(),
                wrong_value: true,
              }
            );
          }
        });
      }
      // rellenamos para cada linea de subconceptos de conceptos variables, el mes correcto
      this._api.getLinesSubconcept(this.idProject).subscribe((response) => {
        if(response.status === 'ok') {
          let values = response.lines;
          values.forEach(element => {
  
            let varConcept = _.find(this.lines, (inner) => {
              return inner.id === element.id_variable_concept;
            });
            if (varConcept) {
              let lineSubconcept = _.find(varConcept.subconcepts, (inner) => {
                return inner.id === element.id_subconcept;
              });
              if(lineSubconcept) {
                lineSubconcept.lines[element.id_month] = this._common.currencyFormatES(element.amount, false);
              }
              
            }  
          });
          this.calculateTotalsSubconcepts();
          this.checkTotalLinesSubconcept();
        } else {
          this._notification.warn('Aviso', response.msg);
        }
        
      });
      let tmp = {
        budget: {
          amount: 0,
          units: 0,
          price: 0,
          total: 0,
        },
        real: {
          units: 0,
          total: 0,
        },
        others: {
          benefits: 0,
          margin: 0,
        }
      };
      if (response.fee && response.fee.length) {
        tmp.budget.amount = response.fee[0].amount;
        tmp.budget.units = response.fee[0].unit_budget;
        tmp.budget.price = response.fee[0].price;
        tmp.budget.total = tmp.budget.amount * tmp.budget.units * tmp.budget.price;
        tmp.real.total = response.fee[0].unit_real * tmp.budget.amount * tmp.budget.units;
        tmp.real.units = response.fee[0].unit_real;

        this.fee.id = response.fee[0].id;
      }

      this.fee.budget.amount = this._common.currencyFormatES(tmp.budget.amount, false);
      this.fee.budget.units = this._common.currencyFormatES(tmp.budget.units, false);
      this.fee.budget.price = this._common.currencyFormatES(tmp.budget.price, false);
      this.fee.budget.total = this._common.currencyFormatES(tmp.budget.total);

      this.fee.real.units = this._common.currencyFormatES(tmp.real.units, false);
      this.fee.real.total = 0;

      this.fee.others.benefits = this._common.currencyFormatES(tmp.budget.total);
      this.fee.others.margin = 100;

      this.calculateTotals();
      this.calculateTotalsSubconcepts();
    });

  }
  fillFeeIncome(fees, total_fee) {
    if(fees) {
      let total_acc = 0;
      this.feeIncome = new dateMonthStr();
      this.feeIncome.total = this._common.currencyFormatES(total_fee.total, false);
      fees.forEach(inner => {
        this.feeIncome[inner.id_month] = this._common.currencyFormatES(inner.amount, false);
        total_acc += parseFloat(inner.amount);
      });    
      this.feeIncome.wrong_income = false;
      if (total_acc !== parseFloat(this.feeIncome.total)) {
        this.feeIncome.wrong_income = true;
      }
     
    }
    
  }
  fillIncomes(incomes) {
    let total_acc = 0;
    incomes.forEach(element => {
      _.extend(element, { 'incomes_estimated': {} });
      element.wrong_income = false;
    });
    incomes.forEach(element => {

      _.extend(element.incomes_estimated, { 'january': '0.00' });
      _.extend(element.incomes_estimated, { 'february': '0.00' });
      _.extend(element.incomes_estimated, { 'march': '0.00' });
      _.extend(element.incomes_estimated, { 'april': '0.00' });
      _.extend(element.incomes_estimated, { 'may': '0.00' });
      _.extend(element.incomes_estimated, { 'june': '0.00' });
      _.extend(element.incomes_estimated, { 'july': '0.00' });
      _.extend(element.incomes_estimated, { 'august': '0.00' });
      _.extend(element.incomes_estimated, { 'september': '0.00' });
      _.extend(element.incomes_estimated, { 'october': '0.00' });
      _.extend(element.incomes_estimated, { 'november': '0.00' });
      _.extend(element.incomes_estimated, { 'december': '0.00' });

      element.estimated_incomes.forEach(inner => {
        element.incomes_estimated[inner.id_month] = this._common.currencyFormatES(inner.amount, false);
      });

      total_acc = 0;
      total_acc = this._common.checkNumber(element.incomes_estimated.january);
      total_acc += this._common.checkNumber(element.incomes_estimated.february);
      total_acc += this._common.checkNumber(element.incomes_estimated.march);
      total_acc += this._common.checkNumber(element.incomes_estimated.april);
      total_acc += this._common.checkNumber(element.incomes_estimated.may);
      total_acc += this._common.checkNumber(element.incomes_estimated.june);
      total_acc += this._common.checkNumber(element.incomes_estimated.july);
      total_acc += this._common.checkNumber(element.incomes_estimated.august);
      total_acc += this._common.checkNumber(element.incomes_estimated.september);
      total_acc += this._common.checkNumber(element.incomes_estimated.october);
      total_acc += this._common.checkNumber(element.incomes_estimated.november);
      total_acc += this._common.checkNumber(element.incomes_estimated.december);

      element.incomes_estimated.total = this._common.currencyFormatES(total_acc);
      if (total_acc !== parseFloat(parseFloat(element.total_incomes_budget.total).toFixed(2))) {
        element.wrong_income = true;
      }
    });
    this.incomes = incomes;

    this.checkTotalIncome();
  }

  calculateBenefitsMargin() {
    _.forOwn(this.benefitsEstimated, (value, key) => {
      if (key === 'total') {
        this.benefitsEstimated[key] = this._common.currencyFormatES(this._common.checkNumber(this.total.budget_total) - this._common.checkNumber(this.totalExpensesEstimated[key]));
      } else {
        this.benefitsEstimated[key] = this._common.currencyFormatES(this._common.checkNumber(this.totalIncome[key]) - this._common.checkNumber(this.totalExpensesEstimated[key]));
      }
    });
    _.forOwn(this.marginEstimated, (value, key) => {
      if (key === 'total') {
        this.marginEstimated[key] = this._common.marginCalculate(this.total.budget_total, this.totalExpensesEstimated[key]);
      } else {
        this.marginEstimated[key] = this._common.marginCalculate(this.totalIncome[key], this.totalExpensesEstimated[key]);
      }
    });
  }

  calculateTotalsSubconcepts() {
    let total = 0;
    let subtotal = 0;
    this.subtotal = new dateMonthInt();
    this.lines.forEach(concept => {
      concept.totals = new dateMonthInt();
      subtotal += concept.budget.total;
      concept.subconcepts.forEach(subconcept => {
        concept.totals.january += this._common.checkNumber(subconcept.lines.january);
        concept.totals.february += this._common.checkNumber(subconcept.lines.february);
        concept.totals.march += this._common.checkNumber(subconcept.lines.march);
        concept.totals.april += this._common.checkNumber(subconcept.lines.april);
        concept.totals.may += this._common.checkNumber(subconcept.lines.may);
        concept.totals.june += this._common.checkNumber(subconcept.lines.june);
        concept.totals.july += this._common.checkNumber(subconcept.lines.july);
        concept.totals.august += this._common.checkNumber(subconcept.lines.august);
        concept.totals.september += this._common.checkNumber(subconcept.lines.september);
        concept.totals.october += this._common.checkNumber(subconcept.lines.october);
        concept.totals.november += this._common.checkNumber(subconcept.lines.november);
        concept.totals.december += this._common.checkNumber(subconcept.lines.december);
      });
      total = 0;
      _.forOwn(concept.totals, (element) => {
        total += element;
      })
      concept.wrong_value = false;

      if (total !== concept.budget.total) {
        concept.wrong_value = true;
      }
      this.subtotal.january += this._common.checkNumber(concept.totals.january);
      this.subtotal.february += this._common.checkNumber(concept.totals.february);
      this.subtotal.march += this._common.checkNumber(concept.totals.march);
      this.subtotal.april += this._common.checkNumber(concept.totals.april);
      this.subtotal.may += this._common.checkNumber(concept.totals.may);
      this.subtotal.june += this._common.checkNumber(concept.totals.june);
      this.subtotal.july += this._common.checkNumber(concept.totals.july);
      this.subtotal.august += this._common.checkNumber(concept.totals.august);
      this.subtotal.september += this._common.checkNumber(concept.totals.september);
      this.subtotal.october += this._common.checkNumber(concept.totals.october);
      this.subtotal.november += this._common.checkNumber(concept.totals.november);
      this.subtotal.december += this._common.checkNumber(concept.totals.december);

    });

    this.subtotal.total = subtotal;
    _.forOwn(this.totalExpensesEstimated, (element, key) => {
      this.totalExpensesEstimated[key] = this._common.checkNumber(this.subtotal[key]) + this._common.checkNumber(this.employeesCostEstimated[key]);
    });
    this.calculateBenefitsMargin();
  }

  calculateTotals() {
    let subtotal = {
      budget_total: 0,
      real_total: 0,
      benefit_total: 0,
      margin_total: 0
    };
    this.lines.forEach((items) => {
      items.subconcepts.forEach((inner) => {
        subtotal.budget_total += this._common.toFloat(inner.total_budget);
      });
    });

    this.total.budget_total = subtotal.budget_total + this._common.toFloat(this.fee.budget.total);
  }
  updateFeeIncome(value, previous, fee_company, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = 'entertabeado';
      if (value.currentTarget.value === '') {
        value.currentTarget.value = 0;
      }

      let body = `&id_project=${this.idProject}`;
      body += `&id_month=${month}`;
      body += `&id_fee_company=${this.idFee}`;
      body += `&type=0`;
      body += `&amount=${value.currentTarget.value.replace(',', '.')}`;

      let newValue = parseFloat(value.currentTarget.value.replace(',', '.'));

      if (this._common.toFloat(previous) !== newValue && this.checkUpperValueFeeIncome()) {
        this._api.updateFeeIncome(body).subscribe((response) => {
          if (response && response.status === 'ok') {
            let total = 0;
            _.forOwn(this.feeIncome, (element, key) => {
              if (key !== 'total') {
                total += this._common.checkNumber(element);
              }
            });
            
            this.feeIncome.wrong_income = false;
            if (total !== parseFloat(this.feeIncome.total)) {
              this.feeIncome.wrong_income = true;
            }
            this._notification.success('Correcto', 'Se ha almacenado el ingreso de ' + newValue + '€');
            this.checkTotalIncome();
            this.calculateTotalsSubconcepts();
          } else {
            this._notification.error('Error', 'No se ha podido almacenar el ingreso');
            fee_company[month] = previous;
          }
        });
      } else if (!this.checkUpperValueFeeIncome()) {
        this._notification.error('Error', 'Se ha superado el total de ingresos.');
        fee_company[month] = this._common.toFloat(previous);
      }
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }
  updateIncome(value, previous, variable_concept, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = 'entertabeado';
      if (value.currentTarget.value === '') {
        value.currentTarget.value = 0;
      }
      let body = `&id_project=${this.idProject}`;
      body += `&id_month=${month}`;
      body += `&id_variable_concept=${variable_concept.id_variable_concept}`;
      body += `&type=0`;
      body += `&amount=${value.currentTarget.value.replace(',', '.')}`;

      let newValue = parseFloat(value.currentTarget.value.replace(',', '.'));

      if (this._common.toFloat(previous) !== newValue && this.checkUpperValueIncome(variable_concept)) {
        this._api.updateIncomeVariableConcept(body).subscribe((response) => {
          if (response && response.status === 'ok') {
            let total = 0;
            _.forOwn(variable_concept.incomes_estimated, (element, key) => {
              if (key !== 'total') {
                total += this._common.checkNumber(element);
              }
            });

            variable_concept.incomes_estimated.total = this._common.currencyFormatES(total, false);
            variable_concept.wrong_income = false;
            if (total !== parseFloat(parseFloat(variable_concept.total_incomes_budget.total).toFixed(2))) {
              variable_concept.wrong_income = true;
            }
            this._notification.success('Correcto', 'Se ha almacenado el ingreso de ' + newValue + '€');
            this.checkTotalIncome();
            this.calculateTotalsSubconcepts();
          } else {
            this._notification.error('Error', 'No se ha podido almacenar el ingreso');
            variable_concept.incomes_estimated[month] = previous;
          }
        });
      } else if (!this.checkUpperValueIncome(variable_concept)) {
        this._notification.error('Error', 'Se ha superado el total de ingresos.');
        variable_concept.incomes_estimated[month] = this._common.toFloat(previous);
      }
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }

  updateLineSubconcept(value, previous, concept, subconcept, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = 'entertabeado';
      if (value.currentTarget.value === '') {
        value.currentTarget.value = 0;
      }
      let body = `&id_project=${this.idProject}`;
      body += `&id_month=${month}`;
      body += `&id_variable_concept=${concept.id}`;
      body += `&id_subconcept=${subconcept.id}`;
      body += `&amount=${value.currentTarget.value.replace(',', '.')}`;

      let newValue = parseFloat(value.currentTarget.value.replace(',', '.'));

      if (this._common.toFloat(previous) !== newValue && this.checkUpperValueSubconcept(subconcept)) {
        this._api.updateLineSubconcept(body).subscribe((response) => {
          if (response && response.status === 'ok') {
            this._notification.success('Correcto', 'Se ha almacenado el valor de ' + newValue + '€');
            subconcept.lines[month] = this._common.currencyFormatES(newValue, false);
            this.checkTotalSubconcept(subconcept);
            this.calculateTotalsSubconcepts();
          } else {
            this._notification.error('Error', 'No se ha podido almacenar el valor');
            this.income[month] = previous;
          }
        });
      } else if (!this.checkUpperValueSubconcept(subconcept)) {
        this._notification.error('Error', `Se ha superado el total del concepto ${concept.name}.`);
        subconcept.lines[month] = this._common.checkNumber(previous);
      }
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }


  blurred(event, previous, value, type) {
    if (event.target.className.indexOf('dirty') > -1) {
      value[type] = this._common.currencyFormatES(previous, false);
      this._notification.info('Información', 'Pulsa Enter o Tabulador para almacenar el valor');
    }
  }

  checkUpperValueSubconcept(subconcept) {
    let total = 0;
    _.forOwn(subconcept.lines, (element) => {
      total += this._common.checkNumber(element);
    });
    if (total > this._common.checkNumber(subconcept.total)) {
      return false;
    }
    return true;
  }

  checkTotalIncome() {
    let total = 0;
    // reseteamos la linea que muestra el total de ingresos desglosados por concepto variable
    this.totalIncome = new dateMonthStr();
    // recorremos el objeto de incomes, que contiene para cada concepto variable
    // un objeto con los incomes 'presupuestados'
    this.incomes.forEach(element => {
      _.forOwn(element.incomes_estimated, (element, key) => {
        if(key !== 'total') {
          total += this._common.checkNumber(element);
          this.totalIncome[key] = this._common.checkNumber(this.totalIncome[key]) + this._common.checkNumber(element);
        }
      });
    });
    //recorremos el desglose de fee, para que sea sumado tambien
    _.forOwn(this.feeIncome, (element, key) => {
      if(key !== 'total') {
        total += this._common.checkNumber(element);
        this.totalIncome[key] = this._common.checkNumber(this.totalIncome[key]) + this._common.checkNumber(element);
      }
    });
    this.wrong_income = false;
    if (total !== parseFloat(this.total.budget_total.toFixed(2))) {
      this.wrong_income = true;
    }
    return true;
  }
  checkTotalSubconcept(subconcept) {
    let total = 0;
    _.forOwn(subconcept.lines, (element) => {
      total += this._common.checkNumber(element);
    });
    subconcept.wrong_value = false;
    if (total !== this._common.checkNumber(subconcept.total)) {
      subconcept.wrong_value = true;
      return false;
    }

    return true;
  }
  checkTotalLinesSubconcept() {
    let total = 0;
    this.lines.forEach(subconcepts => {
      subconcepts.subconcepts.forEach(subconcept => {
        total = 0;
        _.forOwn(subconcept.lines,(element, key) => {
          if (key !== 'total') {
            total = total + this._common.checkNumber(element);
          }
        });
        subconcept.wrong_value = false;
        if (total !== this._common.checkNumber(subconcept.total)) {
          subconcept.wrong_value = true;
        }
      });
    });
  }
  checkUpperValueFeeIncome() {
    let total = 0;
    // recorremos el objeto de incomes, que contiene para cada concepto variable
    // un objeto con los incomes 'presupuestados'
    _.forOwn(this.feeIncome, (element, key) => {
      if(key !== 'total') {
        total += this._common.checkNumber(element);
      }
    });
    if (total > parseFloat(this.feeIncome.total)) {
      return false;
    }
    return true;
  }
  checkUpperValueIncome(income) {
    let total = 0;
    // recorremos el objeto de incomes, que contiene para cada concepto variable
    // un objeto con los incomes 'presupuestados'    
    _.forOwn(income.incomes_estimated, (element, key) => {
      if(key !== 'total') {
        total += this._common.checkNumber(element);
      }
    });
    if (total > parseFloat(income.total_incomes_budget.total)) {
      return false;
    }
    return true;
  }

  resetClass(value) {
    // No dejamos usar la coma
    if(value.which === 188) {
      value.preventDefault();
    }
    if (value.which === 13 || value.which === 9) {
      value.target.className = '';
    } else {
      value.target.className = 'dirty';
    }
  }

  fillEmployeeCost(costs, cost_employee_estimated) {
    this.employeesCostEstimated.total = 0;
    let sumValue = 0;

    cost_employee_estimated.forEach(element => {
      this.employeesCostEstimated[element.id_month] = (element.amount) ? this._common.currencyFormatES(element.amount, false) : '0,00';
    });

    this.sumEmployeeCost();
  }

  sumEmployeeCost() {
    let totalCost = 0;
    _.forOwn(this.employeesCostEstimated, (element, key) => {
      if (key !== 'total') {
        totalCost += this._common.checkNumber(element);
      }
    });

    this.employeesCostEstimated.total = this._common.currencyFormatES(totalCost);
  }

  checkEditableRows(status) {
    this.isEditable = false;
    // If status is budget
    if ((status === '1' || status === '2') && this.role !== 4) {
      this.isEditable = true;
    }
  }

  changeEstimatedEmployeesCost(value, previous, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = 'entertabeado';
      if (value.currentTarget.value === '') {
        value.currentTarget.value = 0;
      }
      let body = `&id_campaign=${this.idProject}`;
      body += `&id_month=${month}`;
      body += `&amount=${value.currentTarget.value.replace(',', '.')}`;

      let newValue = parseFloat(value.currentTarget.value.replace(',', '.'));

      if (parseFloat(previous) !== newValue) {
        this._api.updateEstimatedEmployeeCost(body).subscribe((response) => {
          if (response && response.status === 'ok' && _.isNaN(newValue)) {
            this._notification.success('Correcto', 'Se ha eliminado el coste de personal');
            this.sumEmployeeCost();
          } else if (response && response.status === 'ok') {
            this._notification.success('Correcto', 'Se ha almacenado el coste de personal de ' + newValue + '€');
            this.sumEmployeeCost();
          } else {
            this._notification.error('Error', 'No se ha podido almacenar el coste de personal');
          }
          this.calculateTotalsSubconcepts();
          this.calculateBenefitsMargin();
          if (value.which === 13) {
            value.target.blur();
          }
        });
      }

    }
  }

  exportExcel(): void {
    let exportData = [];
    let ws_name = '';

    exportData = this.fillExcelData();
    ws_name = 'Presupuesto Mensual';

    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(exportData);

    if (this.role === 3 || this.role === 7 || this.role === 6 || this.role === 5 || this.role === 4) {
      wb.SheetNames.push(ws_name);
      wb.Sheets[ws_name] = ws;
    }

    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      };
      return buf;
    }

    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `presupuesto-mensual-${this.info.campaign_code}-${this.info.campaign_name}.xlsx`);
  }

  fillExcelData() {
    let exportData = [];

    if (this.role === 3 || this.role === 6 || this.role === 5 || this.role === 4) {
      this.incomes.forEach((element, key) => {
        // ingresos
        exportData.push(
          {
            '': `${element.name_variable_concept}(${element.account_contability})`,
            ' ': '',
            Total: this._common.currencyFormatES(this._common.toFloat(element.total_incomes_budget.total), false),
            Enero: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.january), false),
            Febrero: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.february), false),
            Marzo: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.march), false),
            Abril: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.april), false),
            Mayo: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.may), false),
            Junio: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.june), false),
            Julio: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.july), false),
            Agosto: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.august), false),
            Septiembre: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.september), false),
            Octubre: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.october), false),
            Noviembre: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.november), false),
            Diciembre: this._common.currencyFormatES(this._common.toFloat(element.incomes_estimated.december), false)
          }
        );
      });
      // fee de empresa
      exportData.push(
        {
          '': `Fee de empresa`,
          ' ': '',
          Total: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.total), false),
          Enero: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.january), false),
          Febrero: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.february), false),
          Marzo: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.march), false),
          Abril: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.april), false),
          Mayo: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.may), false),
          Junio: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.june), false),
          Julio: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.july), false),
          Agosto: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.august), false),
          Septiembre: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.september), false),
          Octubre: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.october), false),
          Noviembre: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.november), false),
          Diciembre: this._common.currencyFormatES(this._common.toFloat(this.feeIncome.december), false)
        }
      );
      // Total de ingresos
      exportData.push(
        {
          '': `INGRESOS`,
          ' ': '',
          Total: this._common.currencyFormatES(this._common.toFloat(this.total.budget_total), false),
          Enero: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.january), false),
          Febrero: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.february), false),
          Marzo: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.march), false),
          Abril: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.april), false),
          Mayo: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.may), false),
          Junio: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.june), false),
          Julio: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.july), false),
          Agosto: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.august), false),
          Septiembre: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.september), false),
          Octubre: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.october), false),
          Noviembre: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.november), false),
          Diciembre: this._common.currencyFormatES(this._common.toFloat(this.totalIncome.december), false)
        }
      );
    }
    //space between last row
    exportData.push(
      {
        '': '',
        ' ': '',
        Total: '',
        Enero: '',
        Febrero: '',
        Marzo: '',
        Abril: '',
        Mayo: '',
        Junio: '',
        Julio: '',
        Agosto: '',
        Septiembre: '',
        Octubre: '',
        Noviembre: '',
        Diciembre: ''
      }
    );
    this.lines.forEach((element, key) => {
      exportData.push(
        {
          '': `${element.name}(${element.account})`,
          ' ': '',
          Total: this._common.currencyFormatES(this._common.toFloat(element.budget.total), false),
          Enero: this._common.currencyFormatES(this._common.toFloat(element.totals.january), false),
          Febrero: this._common.currencyFormatES(this._common.toFloat(element.totals.february), false),
          Marzo: this._common.currencyFormatES(this._common.toFloat(element.totals.march), false),
          Abril: this._common.currencyFormatES(this._common.toFloat(element.totals.april), false),
          Mayo: this._common.currencyFormatES(this._common.toFloat(element.totals.may), false),
          Junio: this._common.currencyFormatES(this._common.toFloat(element.totals.june), false),
          Julio: this._common.currencyFormatES(this._common.toFloat(element.totals.july), false),
          Agosto: this._common.currencyFormatES(this._common.toFloat(element.totals.august), false),
          Septiembre: this._common.currencyFormatES(this._common.toFloat(element.totals.september), false),
          Octubre: this._common.currencyFormatES(this._common.toFloat(element.totals.october), false),
          Noviembre: this._common.currencyFormatES(this._common.toFloat(element.totals.november), false),
          Diciembre: this._common.currencyFormatES(this._common.toFloat(element.totals.december), false)
        }
      );
      if (element.subconcepts.length > 0) {
        element.subconcepts.forEach(subconcept => {
          exportData.push(
            {
              '': '',
              ' ': `${subconcept.name}`,
              Total: this._common.currencyFormatES(this._common.toFloat(subconcept.total), false),
              Enero: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.january), false),
              Febrero: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.february), false),
              Marzo: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.march), false),
              Abril: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.april), false),
              Mayo: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.may), false),
              Junio: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.june), false),
              Julio: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.july), false),
              Agosto: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.august), false),
              Septiembre: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.september), false),
              Octubre: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.october), false),
              Noviembre: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.november), false),
              Diciembre: this._common.currencyFormatES(this._common.toFloat(subconcept.lines.december), false)
            }
          );
        });
      }

    });

    exportData.push(
      {
        '': 'Subtotal',
        ' ': '',
        Total: this._common.currencyFormatES(this.subtotal.total, false),
        Enero: this._common.currencyFormatES(this.subtotal.january, false),
        Febrero: this._common.currencyFormatES(this.subtotal.february, false),
        Marzo: this._common.currencyFormatES(this.subtotal.march, false),
        Abril: this._common.currencyFormatES(this.subtotal.april, false),
        Mayo: this._common.currencyFormatES(this.subtotal.may, false),
        Junio: this._common.currencyFormatES(this.subtotal.june, false),
        Julio: this._common.currencyFormatES(this.subtotal.july, false),
        Agosto: this._common.currencyFormatES(this.subtotal.august, false),
        Septiembre: this._common.currencyFormatES(this.subtotal.september, false),
        Octubre: this._common.currencyFormatES(this.subtotal.october, false),
        Noviembre: this._common.currencyFormatES(this.subtotal.november, false),
        Diciembre: this._common.currencyFormatES(this.subtotal.december, false)
      }
    );
    //space between last row
    exportData.push(
      {
        '': '',
        ' ': '',
        Total: '',
        Enero: '',
        Febrero: '',
        Marzo: '',
        Abril: '',
        Mayo: '',
        Junio: '',
        Julio: '',
        Agosto: '',
        Septiembre: '',
        Octubre: '',
        Noviembre: '',
        Diciembre: ''
      }
    );

    exportData.push(
      {
        '': 'Personal Propio',
        ' ': '',
        Total: this._common.currencyFormatES(this.employeesCostEstimated.total, false),
        Enero: this._common.currencyFormatES(this.employeesCostEstimated.january, false),
        Febrero: this._common.currencyFormatES(this.employeesCostEstimated.february, false),
        Marzo: this._common.currencyFormatES(this.employeesCostEstimated.march, false),
        Abril: this._common.currencyFormatES(this.employeesCostEstimated.april, false),
        Mayo: this._common.currencyFormatES(this.employeesCostEstimated.may, false),
        Junio: this._common.currencyFormatES(this.employeesCostEstimated.june, false),
        Julio: this._common.currencyFormatES(this.employeesCostEstimated.july, false),
        Agosto: this._common.currencyFormatES(this.employeesCostEstimated.august, false),
        Septiembre: this._common.currencyFormatES(this.employeesCostEstimated.september, false),
        Octubre: this._common.currencyFormatES(this.employeesCostEstimated.october, false),
        Noviembre: this._common.currencyFormatES(this.employeesCostEstimated.november, false),
        Diciembre: this._common.currencyFormatES(this.employeesCostEstimated.december, false)
      }
    );
    //space between last row
    exportData.push(
      {
        '': '',
        ' ': '',
        Total: '',
        Enero: '',
        Febrero: '',
        Marzo: '',
        Abril: '',
        Mayo: '',
        Junio: '',
        Julio: '',
        Agosto: '',
        Septiembre: '',
        Octubre: '',
        Noviembre: '',
        Diciembre: ''
      }
    );
    exportData.push(
      {
        '': 'GASTOS',
        ' ': '',
        Total: this._common.currencyFormatES(this.totalExpensesEstimated.total, false),
        Enero: this._common.currencyFormatES(this.totalExpensesEstimated.january, false),
        Febrero: this._common.currencyFormatES(this.totalExpensesEstimated.february, false),
        Marzo: this._common.currencyFormatES(this.totalExpensesEstimated.march, false),
        Abril: this._common.currencyFormatES(this.totalExpensesEstimated.april, false),
        Mayo: this._common.currencyFormatES(this.totalExpensesEstimated.may, false),
        Junio: this._common.currencyFormatES(this.totalExpensesEstimated.june, false),
        Julio: this._common.currencyFormatES(this.totalExpensesEstimated.july, false),
        Agosto: this._common.currencyFormatES(this.totalExpensesEstimated.august, false),
        Septiembre: this._common.currencyFormatES(this.totalExpensesEstimated.september, false),
        Octubre: this._common.currencyFormatES(this.totalExpensesEstimated.october, false),
        Noviembre: this._common.currencyFormatES(this.totalExpensesEstimated.november, false),
        Diciembre: this._common.currencyFormatES(this.totalExpensesEstimated.december, false)
      }
    );

    //space between last row
    exportData.push(
      {
        '': '',
        ' ': '',
        Total: '',
        Enero: '',
        Febrero: '',
        Marzo: '',
        Abril: '',
        Mayo: '',
        Junio: '',
        Julio: '',
        Agosto: '',
        Septiembre: '',
        Octubre: '',
        Noviembre: '',
        Diciembre: ''
      }
    );
    if (this.role === 3 || this.role === 6 || this.role === 5 || this.role === 4) {
      exportData.push(
        {
          '': 'BENEFICIOS',
          ' ': '',
          Total: this.benefitsEstimated.total,
          Enero: this.benefitsEstimated.january,
          Febrero: this.benefitsEstimated.february,
          Marzo: this.benefitsEstimated.march,
          Abril: this.benefitsEstimated.april,
          Mayo: this.benefitsEstimated.may,
          Junio: this.benefitsEstimated.june,
          Julio: this.benefitsEstimated.july,
          Agosto: this.benefitsEstimated.august,
          Septiembre: this.benefitsEstimated.september,
          Octubre: this.benefitsEstimated.october,
          Noviembre: this.benefitsEstimated.november,
          Diciembre: this.benefitsEstimated.december
        }
      );

      exportData.push(
        {
          '': 'MARGEN',
          ' ': '',
          Total: this.marginEstimated.total,
          Enero: this.marginEstimated.january,
          Febrero: this.marginEstimated.february,
          Marzo: this.marginEstimated.march,
          Abril: this.marginEstimated.april,
          Mayo: this.marginEstimated.may,
          Junio: this.marginEstimated.june,
          Julio: this.marginEstimated.july,
          Agosto: this.marginEstimated.august,
          Septiembre: this.marginEstimated.september,
          Octubre: this.marginEstimated.october,
          Noviembre: this.marginEstimated.november,
          Diciembre: this.marginEstimated.december
        }
      );

    }

    return exportData;
  }

}


