import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { dateMonthStr } from '../../models/dateMonthStr';
import { dateMonth } from '../../models/dateMonth';
import { dateMonthInt } from '../../models/dateMonthInt';


import * as _ from "lodash";

@Component({ selector: 'app-breakdown-resume', templateUrl: './breakdown-resume.component.html', styleUrls: ['./breakdown-resume.component.scss'] })
export class BreakdownResumeComponent implements OnInit {
  private sub: any;
  id;
  lines = [];
  info: any = {};
  expenses: any[] = [];
  incomesEstimated = new dateMonthStr();
  incomesReal = new dateMonthStr();
  incomesDifferences = new dateMonthStr();

  employeesCostReal = new dateMonthStr();
  employeesCostEstimated = new dateMonthStr();

  feeLineEstimated = new dateMonth();

  totalExpensesEstimated = new dateMonth();
  totalExpensesReal = new dateMonth();
  totalExpensesDifferences = new dateMonth();

  marginEstimated = new dateMonth();
  marginReal = new dateMonth();
  marginDifferences = new dateMonth();
  benefitsEstimated = new dateMonth();
  benefitsReal = new dateMonth();
  benefitsDifferences = new dateMonth();
  accumulateMonths: any[] = [new dateMonth(), new dateMonth()];

  constructor( private actRoute: ActivatedRoute, private _api: ApiService, private _common: Common, private _notification: NotificationsService, private router: Router) { }

  ngOnInit() {
    this.sub = this
      .actRoute
      .params
      .subscribe(params => {
        this.id = +params['id']; // (+) converts string 'id' to a number
        let body = `id=${this.id}`;
        this
          ._api
          .getInfoCampaign(body)
          .subscribe((response) => {
            if (response !== null) {
              this.info.campaign_code = response.info.campaign_code;
              this.info.campaign_name = response.info.campaign_name;
              this.info.creation_date = this
                ._common
                .parseDatefromDate(response.info.creation_date);
              this.info.end_date = this
                ._common
                .parseDatefromDate(response.info.end_date);
              this.info.customer = response.info.customer;
              this.info.team = response.info.team;
              this.info.user = response.info.user;
              this.info.group = response.info.grupo;
              this.info.subgroup = response.info.subgroup;
              this.info.status = response.info.status;
              this.fillFeeLines(response.feeIncomes);
              this.fillIncomes(response.incomes_no_filtered);
              this.fillEmployeeCost(response.employees_cost_no_filtered, response.employees_cost_estimated, response.employees_cost_real);

              let expenses = response.expenses;
              // Para obtener el total de lo presupuestado
              this._api.getSubconcept(`id_project=${this.id}`).subscribe((response) => {
                _.forEach(response.items, (element, key) => {
                  this.lines.push({
                    id: element.id,
                    totals: new dateMonthInt(),
                    budget: {
                      amount: 0,
                      units: 0,
                      price: 0,
                      total: 0,
                    },
                    subconcepts: []
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
                          id:element.id,
                          total_budget,
                          lines: new dateMonthStr(),
                        }
                      );
                    }
                  });
                }
                let subtotal = 0;
                this.lines.forEach((items) => {
                  items.subconcepts.forEach((inner) => {
                    subtotal += this._common.toFloat(inner.total_budget);
                  });
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
                if(response.fee && response.fee[0]) {
                  tmp.budget.amount = response.fee[0].amount;
                  tmp.budget.units = response.fee[0].unit_budget;
                  tmp.budget.price = response.fee[0].price;
                }

                tmp.budget.total = tmp.budget.amount * tmp.budget.units * tmp.budget.price;
                let feeValue = this._common.currencyFormatES(tmp.budget.total);
                this.incomesEstimated.total = subtotal + this._common.toFloat(feeValue);
                // rellenamos el valor de las lineas de subconceptos
                this._api.getLinesSubconcept(this.id).subscribe((response) => {
                  if (response.estado === 'error') {
                    this._notification.warn('Aviso', response.msg);
                  } else {
                    response.lines.forEach(element => {
                      let varConcept = _.find(this.lines, (inner) => {
                        return inner.id === element.id_variable_concept;
                      });
                      let subconcept = _.find(varConcept.subconcepts, (item) => {
                        return item.id == element.id_subconcept;
                      });
                      if (subconcept) {
                        subconcept.lines[element.id_month] = this._common.currencyFormatES(element.amount, false);
                      }
                    });
                  }
                  this.fillExpenses(expenses);
                });

                _.forOwn(this.incomesDifferences, (value, key) => {
                  this.incomesDifferences[key] = this
                    ._common
                    .currency(this.incomesReal[key] - this.incomesEstimated[key]);
                });
              });
            }
          });

      });
  }

  fillIncomes(incomes) {
    let estimated = null,
      real = null,
      totalAmount = 0;

    estimated = _.filter(incomes, (e) => {
      return e.type === '0';
    });
    real = _.filter(incomes, (e) => {
      return e.type === '1';
    });
    this.incomesReal.total = '0.00';
    this.incomesEstimated.total = '0.00';

    estimated.forEach((element) => {
      this.incomesEstimated[element.id_month] = 
        parseFloat(this.incomesEstimated[element.id_month]) + parseFloat(this._common.currency(element.amount));
    });

    totalAmount = 0;
    real.forEach(element => {
      this.incomesReal[element.id_month] = 
        parseFloat(this.incomesReal[element.id_month]) +  parseFloat(this._common.currency(element.amount));
      totalAmount += parseFloat(element.amount);
    });
    this.incomesReal.total = this._common.currency(totalAmount);

  }
  /**
   * fillEmployeeCost
   * @param costs valor de costes de personal de tracker
   * @param cost_database valor de coste de personal introducido desde GesAd para estimados
   * @param cost_database_real valor de coste de personal introducido desde GesAd para reales
   */
  fillEmployeeCost(costs, cost_database, cost_database_real) {
    this.employeesCostReal.total = 0;
    let sumValue = 0,
      totalMonths = new dateMonth();

    costs.forEach(element => {
      sumValue = parseFloat(element.cost.toFixed(2));
      switch (element.date.split('-')[1]) {
        case '01':
          this.employeesCostReal.january += sumValue;
          totalMonths.january += sumValue;
          break;
        case '02':
          this.employeesCostReal.february += sumValue;
          totalMonths.february += sumValue;
          break;
        case '03':
          this.employeesCostReal.march += sumValue;
          totalMonths.march += sumValue;
          break;
        case '04':
          this.employeesCostReal.april += sumValue;
          totalMonths.april += sumValue;
          break;
        case '05':
          this.employeesCostReal.may += sumValue;
          totalMonths.may += sumValue;
          break;
        case '06':
          this.employeesCostReal.june += sumValue;
          totalMonths.june += sumValue;
          break;
        case '07':
          this.employeesCostReal.july += sumValue;
          totalMonths.july += sumValue;
          break;
        case '08':
          this.employeesCostReal.august += sumValue;
          totalMonths.august += sumValue;
          break;
        case '09':
          this.employeesCostReal.september += sumValue;
          totalMonths.september += sumValue;
          break;
        case '10':
          this.employeesCostReal.october += sumValue;
          totalMonths.october += sumValue;
          break;
        case '11':
          this.employeesCostReal.november += sumValue;
          totalMonths.november += sumValue;
          break;
        case '12':
          this.employeesCostReal.december += sumValue;
          totalMonths.december += sumValue;
          break;
      }

    });

    cost_database.forEach(element => {
      this.employeesCostEstimated[element.id_month] = element.amount;
      switch (element.id_month) {
        case 'january':
          totalMonths.january = element.amount;
          break;
        case 'february':
          totalMonths.february = element.amount;
          break;
        case 'march':
          totalMonths.march = element.amount;
          break;
        case 'april':
          totalMonths.april = element.amount;
          break;
        case 'may':
          totalMonths.may = element.amount;
          break;
        case 'june':
          totalMonths.june = element.amount;
          break;
        case 'july':
          totalMonths.july = element.amount;
          break;
        case 'august':
          totalMonths.august = element.amount;
          break;
        case 'september':
          totalMonths.september = element.amount;
          break;
        case 'october':
          totalMonths.october = element.amount;
          break;
        case 'november':
          totalMonths.november = element.amount;
          break;
        case 'december':
          totalMonths.december = element.amount;
          break;
      }
    });
    let totalCost = this._common.checkNumber(totalMonths.january) +
      this._common.checkNumber(totalMonths.february) +
      this._common.checkNumber(totalMonths.march) +
      this._common.checkNumber(totalMonths.april) +
      this._common.checkNumber(totalMonths.may) +
      this._common.checkNumber(totalMonths.june) +
      this._common.checkNumber(totalMonths.july) +
      this._common.checkNumber(totalMonths.august) +
      this._common.checkNumber(totalMonths.september) +
      this._common.checkNumber(totalMonths.october) +
      this._common.checkNumber(totalMonths.november) +
      this._common.checkNumber(totalMonths.december);

    this.employeesCostEstimated.total = Number(totalCost.toFixed(2));

    totalMonths = new dateMonth();

    cost_database_real.forEach(element => {
      this.employeesCostReal[element.id_month] = element.amount;
      switch (element.id_month) {
        case 'january':
          totalMonths.january = element.amount;
          break;
        case 'february':
          totalMonths.february = element.amount;
          break;
        case 'march':
          totalMonths.march = element.amount;
          break;
        case 'april':
          totalMonths.april = element.amount;
          break;
        case 'may':
          totalMonths.may = element.amount;
          break;
        case 'june':
          totalMonths.june = element.amount;
          break;
        case 'july':
          totalMonths.july = element.amount;
          break;
        case 'august':
          totalMonths.august = element.amount;
          break;
        case 'september':
          totalMonths.september = element.amount;
          break;
        case 'october':
          totalMonths.october = element.amount;
          break;
        case 'november':
          totalMonths.november = element.amount;
          break;
        case 'december':
          totalMonths.december = element.amount;
          break;
      }
    });
    totalCost = 0;
    totalCost = this._common.checkNumber(totalMonths.january) +
      this._common.checkNumber(totalMonths.february) +
      this._common.checkNumber(totalMonths.march) +
      this._common.checkNumber(totalMonths.april) +
      this._common.checkNumber(totalMonths.may) +
      this._common.checkNumber(totalMonths.june) +
      this._common.checkNumber(totalMonths.july) +
      this._common.checkNumber(totalMonths.august) +
      this._common.checkNumber(totalMonths.september) +
      this._common.checkNumber(totalMonths.october) +
      this._common.checkNumber(totalMonths.november) +
      this._common.checkNumber(totalMonths.december);

    this.employeesCostReal.total = Number(totalCost.toFixed(2));
  }

  fillExpenses(expenses) {
    let total_acc = 0,
      calendar_items_estimated = new dateMonth(),
      calendar_items_real = new dateMonth();

    expenses.forEach(element => {
      _.extend(element, { 'filtered_estimated': {} });
      _.extend(element, { 'filtered_real': {} });
    });
    expenses.forEach(element => {
      _.extend(element.filtered_estimated, { 'january': 0 });
      _.extend(element.filtered_estimated, { 'february': 0 });
      _.extend(element.filtered_estimated, { 'march': 0 });
      _.extend(element.filtered_estimated, { 'april': 0 });
      _.extend(element.filtered_estimated, { 'may': 0 });
      _.extend(element.filtered_estimated, { 'june': 0 });
      _.extend(element.filtered_estimated, { 'july': 0 });
      _.extend(element.filtered_estimated, { 'august': 0 });
      _.extend(element.filtered_estimated, { 'september': 0 });
      _.extend(element.filtered_estimated, { 'october': 0 });
      _.extend(element.filtered_estimated, { 'november': 0 });
      _.extend(element.filtered_estimated, { 'december': 0 });
      
      element
        .estimated_expenses
        .forEach(inner => {
          element.filtered_estimated[inner.id_month] = parseFloat(element.filtered_estimated[inner.id_month]) + parseFloat(inner.amount);
        });

      total_acc = this._common.checkNumber(element.filtered_estimated.january);
      total_acc += this._common.checkNumber(element.filtered_estimated.february);
      total_acc += this._common.checkNumber(element.filtered_estimated.march);
      total_acc += this._common.checkNumber(element.filtered_estimated.april);
      total_acc += this._common.checkNumber(element.filtered_estimated.may);
      total_acc += this._common.checkNumber(element.filtered_estimated.june);
      total_acc += this._common.checkNumber(element.filtered_estimated.july);
      total_acc += this._common.checkNumber(element.filtered_estimated.august);
      total_acc += this._common.checkNumber(element.filtered_estimated.september);
      total_acc += this._common.checkNumber(element.filtered_estimated.october);
      total_acc += this._common.checkNumber(element.filtered_estimated.november);
      total_acc += this._common.checkNumber(element.filtered_estimated.december);

      element.filtered_estimated.total = total_acc;

      _.extend(element.filtered_real, { 'january': 0 });
      _.extend(element.filtered_real, { 'february': 0 });
      _.extend(element.filtered_real, { 'march': 0 });
      _.extend(element.filtered_real, { 'april': 0 });
      _.extend(element.filtered_real, { 'may': 0 });
      _.extend(element.filtered_real, { 'june': 0 });
      _.extend(element.filtered_real, { 'july': 0 });
      _.extend(element.filtered_real, { 'august': 0 });
      _.extend(element.filtered_real, { 'september': 0 });
      _.extend(element.filtered_real, { 'october': 0 });
      _.extend(element.filtered_real, { 'november': 0 });
      _.extend(element.filtered_real, { 'december': 0 });

      element
        .real_expenses
        .forEach(inner => {
          element.filtered_real[inner.id_month] = parseFloat(element.filtered_real[inner.id_month]) + parseFloat(inner.amount);
        });

      total_acc = this._common.checkNumber(element.filtered_real.january);
      total_acc += this._common.checkNumber(element.filtered_real.february);
      total_acc += this._common.checkNumber(element.filtered_real.march);
      total_acc += this._common.checkNumber(element.filtered_real.april);
      total_acc += this._common.checkNumber(element.filtered_real.may);
      total_acc += this._common.checkNumber(element.filtered_real.june);
      total_acc += this._common.checkNumber(element.filtered_real.july);
      total_acc += this._common.checkNumber(element.filtered_real.august);
      total_acc += this._common.checkNumber(element.filtered_real.september);
      total_acc += this._common.checkNumber(element.filtered_real.october);
      total_acc += this._common.checkNumber(element.filtered_real.november);
      total_acc += this._common.checkNumber(element.filtered_real.december);

      element.filtered_real.total = total_acc;
    });

    this.expenses = expenses;

    this.setTotalByMonth(this.expenses, 1);
    this.calculateTotalsSubconcepts();
    this.calculateDifferencesBenefitsMargin();
  }
  fillFeeLines(lines) {
    if(lines) {
      lines.forEach(element => {
        this.feeLineEstimated[element.id_month] = (element.amount) ? this._common.currencyFormatES(element.amount, false) : '0,00';
      });
      this.sumFeeLines();
    }
  }

  sumFeeLines() {
    let totalCost = 0;
    _.forOwn(this.feeLineEstimated, (element, key) => {
      if (key !== 'total') {
        totalCost += this._common.checkNumber(element);
      }
    });
    this.feeLineEstimated.total = this._common.currencyFormatES(totalCost);
  }
  calculateTotalsSubconcepts() {
    let total = 0;
    let subtotal = 0;
    let subtotalMonth = new dateMonthInt();
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

      subtotalMonth.january += this._common.checkNumber(concept.totals.january);
      subtotalMonth.february += this._common.checkNumber(concept.totals.february);
      subtotalMonth.march += this._common.checkNumber(concept.totals.march);
      subtotalMonth.april += this._common.checkNumber(concept.totals.april);
      subtotalMonth.may += this._common.checkNumber(concept.totals.may);
      subtotalMonth.june += this._common.checkNumber(concept.totals.june);
      subtotalMonth.july += this._common.checkNumber(concept.totals.july);
      subtotalMonth.august += this._common.checkNumber(concept.totals.august);
      subtotalMonth.september += this._common.checkNumber(concept.totals.september);
      subtotalMonth.october += this._common.checkNumber(concept.totals.october);
      subtotalMonth.november += this._common.checkNumber(concept.totals.november);
      subtotalMonth.december += this._common.checkNumber(concept.totals.december);

    });

    subtotalMonth.total = subtotal;
    
    _.forOwn(this.totalExpensesEstimated, (element, key) => {
      
      this.totalExpensesEstimated[key] = this._common.checkNumber(subtotalMonth[key]) + this._common.checkNumber(this.employeesCostEstimated[key]);
    });
    this.calculateExpensesDifferences();
    this.calculateBenefitsMargin(0);
  }

  setTotalByMonth(items, idx) {
    let total = 0,
      type = null;
    this.accumulateMonths[idx].january = 0;
    this.accumulateMonths[idx].february = 0;
    this.accumulateMonths[idx].march = 0;
    this.accumulateMonths[idx].april = 0;
    this.accumulateMonths[idx].may = 0;
    this.accumulateMonths[idx].june = 0;
    this.accumulateMonths[idx].july = 0;
    this.accumulateMonths[idx].august = 0;
    this.accumulateMonths[idx].september = 0;
    this.accumulateMonths[idx].october = 0;
    this.accumulateMonths[idx].november = 0;
    this.accumulateMonths[idx].december = 0;
    this.accumulateMonths[idx].total = 0;

    _.forEach(items, (element) => {
      total = 0;
      type = (idx === 0) ? element.filtered_estimated : element.filtered_real

      this.accumulateMonths[idx].january += this._common.checkNumber(type.january);
      total = this._common.checkNumber(type.january);
      this.accumulateMonths[idx].february += this._common.checkNumber(type.february);
      total += this._common.checkNumber(type.february);
      this.accumulateMonths[idx].march += this._common.checkNumber(type.march);
      total += this._common.checkNumber(type.march);
      this.accumulateMonths[idx].april += this._common.checkNumber(type.april);
      total += this._common.checkNumber(type.april);
      this.accumulateMonths[idx].may += this._common.checkNumber(type.may);
      total += this._common.checkNumber(type.may);
      this.accumulateMonths[idx].june += this._common.checkNumber(type.june);
      total += this._common.checkNumber(type.june);
      this.accumulateMonths[idx].july += this._common.checkNumber(type.july);
      total += this._common.checkNumber(type.july);
      this.accumulateMonths[idx].august += this._common.checkNumber(type.august);
      total += this._common.checkNumber(type.august);
      this.accumulateMonths[idx].september += this._common.checkNumber(type.september);
      total += this._common.checkNumber(type.september);
      this.accumulateMonths[idx].october += this._common.checkNumber(type.october);
      total += this._common.checkNumber(type.october);
      this.accumulateMonths[idx].november += this._common.checkNumber(type.november);
      total += this._common.checkNumber(type.november);
      this.accumulateMonths[idx].december += this._common.checkNumber(type.december);
      total += this._common.checkNumber(type.december);
      this.accumulateMonths[idx].total += total;
    });

    this.calculateSubtotalExpenses(idx);
    this.calculateBenefitsMargin(idx);
  }

  calculateSubtotalExpenses(idx) {
    if (idx === 0) {
      _.forOwn(this.totalExpensesEstimated, (value, key) => {
        this.totalExpensesEstimated[key] = Number((this._common.checkNumber(this.employeesCostEstimated[key]) + this._common.checkNumber(this.accumulateMonths[idx][key])).toFixed(2));
      });
    } else if (idx === 1) {
      _.forOwn(this.totalExpensesReal, (value, key) => {
        this.totalExpensesReal[key] = Number((this._common.checkNumber(this.employeesCostReal[key]) + this._common.checkNumber(this.accumulateMonths[idx][key])).toFixed(2));
      });
    }
  }

  calculateExpensesDifferences() {
    _.forOwn(this.totalExpensesDifferences, (value, key) => {
      this.totalExpensesDifferences[key] = this._common.currency(this.totalExpensesReal[key] - this.totalExpensesEstimated[key]);
    });
  }

  calculateBenefitsMargin(idx) {
    if (idx === 0) {
      _.forOwn(this.benefitsEstimated, (value, key) => {
        this.benefitsEstimated[key] = Number((this._common.checkNumber(this.incomesEstimated[key]) - this._common.checkNumber(this.totalExpensesEstimated[key])).toFixed(2));
      });
      _.forOwn(this.marginEstimated, (value, key) => {
        this.marginEstimated[key] = this._common.marginCalculate(this.incomesEstimated[key], this.totalExpensesEstimated[key]);
      });
    } else if (idx === 1) {
      _.forOwn(this.benefitsReal, (value, key) => {
        this.benefitsReal[key] = Number((this._common.checkNumber(this.incomesReal[key]) - this._common.checkNumber(this.totalExpensesReal[key])).toFixed(2));
      });
      _.forOwn(this.marginReal, (value, key) => {
        this.marginReal[key] = this._common.marginCalculate(this.incomesReal[key], this.totalExpensesReal[key]);
      });
    }
  }

  calculateDifferencesBenefitsMargin() {
    _.forOwn(this.benefitsDifferences, (value, key) => {
      this.benefitsDifferences[key] = this
        ._common
        .currency(this.benefitsReal[key] - this.benefitsEstimated[key]);
    });
    this.getPercentMargin();
  }
  getPercentMargin() {
    _.forOwn(this.benefitsReal, (value, key) => {
      if ((this.incomesReal[key] - this.incomesEstimated[key]) === 0) {
        this.marginDifferences[key] = 0;
      } else {
        this.marginDifferences[key] = ((this.benefitsReal[key] - this.benefitsEstimated[key]) / (this.incomesReal[key] - this.incomesEstimated[key])) * 100;
      }
    });
  }


  updateProject() {
    this
      .router
      .navigate(['/desglose', this.id]);
  }
}
