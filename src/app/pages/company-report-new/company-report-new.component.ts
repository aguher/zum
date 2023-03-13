import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { Router, NavigationEnd } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { dateMonth } from '../../models/dateMonth';

@Component({ selector: 'app-company-report', templateUrl: './company-report-new.component.html', styleUrls: ['./company-report-new.component.scss'] })
export class CompanyReportNewComponent implements OnInit {
  rangoSeleccionado: string= 'Ano';
  graficasSeleccionado: boolean= false;

  selectedBudget: boolean= false;
  displayDialog: boolean= true;

  gastos:any[] = new Array();
  ctrlgastos:any[] = new Array();
  totalgastos:any[] = new Array();

  ingresos:any[] = new Array();
  ctrlingresos:any[] = new Array();
  totalingresos:any[] = new Array();

  balance:any[] = new Array();
  totalbalance:any[] = new Array();

  hoy = new Date();

  CostesFijosPresupuesto = null;
  CostesFijosReal = null;
  CostesVariablesPresupuesto = null;
  IngresosVariablesPresupuesto = null;
  IngresosVariablesReales = null;
  CostesVariablesReales = null;
  anyoseleccionado:any = this.hoy.getFullYear();


  isEditable: boolean = true;
  incomesFromDB = {};
  companySelected = '';
  yearSelected = '';
  valuesReport = null;
  fixedCost = {
    budget: [],
    real: [],
    differences: []
  };

  dataFixedCost = [];

  filter = {
    startDate: null,
    endDate: null
  };
  combos = {
    startDate: [],
    endDate: []
  };
  objCols = {
    neutral: {
      colValue: '0.00',
      colPercent: '0'
    }
  };
  //budget
  data = {
    budget: {
      totalFixedCost: '0',
      totalIncomes: '0',
      totalExpenses: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalMargin: '0',
      totalEbitda: '0',
      totalAmortizacion: '0',
      totalFinancieros: '0',
      totalEbit: '0',
      totalExtraordinarios: '0',
      totalBeneficios: '0',
      totalIs: '0',
      total: '0'
    },
    real: {
      totalFixedCost: '0',
      totalIncomes: '0',
      totalExpenses: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalMargin: '0',

      totalEbitda: '0',
      totalAmortizacion: '0',
      totalFinancieros: '0',
      totalEbit: '0',
      totalExtraordinarios: '0',
      totalBeneficios: '0',
      totalIs: '0',
      total: '0'
    },
    differences: {
      totalFixedCost: '0',
      totalIncomes: '0',
      totalExpenses: '0',
      totalEmployees: '0',
      totalFee: '0',
      totalMargin: '0',

      totalEbitda: '0',
      totalAmortizacion: '0',
      totalFinancieros: '0',
      totalEbit: '0',
      totalExtraordinarios: '0',
      totalBeneficios: '0',
      totalIs: '0',
      total: '0'
    }
  };


  loadValues: boolean = false;
  choosenCompany: boolean = false;

  valueIncome = 0;
  neutralValue = 0;
  valueTax = 0;

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
    this.fillComboDates();
    
  }

  ngOnInit() {
    this.refrescar(0);
   }

  refrescar(timeout:number){
    console.log('en refrescar');
    this.gastos = new Array();
    this.ctrlgastos = new Array();
    this.totalgastos = new Array();
  
    this.ingresos = new Array();
    this.ctrlingresos = new Array();
    this.totalingresos = new Array();
  
    this.balance = new Array();
    this.totalbalance = new Array();


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
        .getCompanyReportNew(this.anyoseleccionado)
        .subscribe((response) => {
          if (response.error) {
            this._notification.error('Iniciar Sesión', 'Se ha caducado la sesión');
            this._auth.logout();
            this._route.navigate(['/login']);
          } else {

            let report = response.report;
            this.CostesFijosPresupuesto = report.fixed_cost_budget;
            this.CostesFijosReal = report.fixed_cost_real;
            this.CostesVariablesPresupuesto = report.costes_variales_estimados;
            this.IngresosVariablesPresupuesto = report.ingresos_variales_estimados;
            this.IngresosVariablesReales = report.ingresos_variales_reales;
            this.CostesVariablesReales = report.costes_variales_reales;

            this.procesarCostesFijos(this.CostesFijosPresupuesto,0);
            this.procesarCostesFijos(this.CostesFijosReal,1);

            this.procesarCostesVariables(this.CostesVariablesPresupuesto);
            this.procesarIngresosVariables(this.IngresosVariablesPresupuesto);
            this.procesarIngresosVariablesReales(this.IngresosVariablesReales);
            this.procesarCostesVariablesReales(this.CostesVariablesReales);
            

            //cálculos finales
            this.totalingresos = this.calcularTotalParticular(this.ingresos);
            this.totalgastos = this.calcularTotalParticular(this.gastos);
            this.procesarArrayBalance();

            this.totalbalance = this.calcularTotalParticular(this.balance);

          }
        });
    }
  }

procesarArrayBalance(){
  let elemento = [];
  let elementogasto, elementoingreso;
  let indiceingreso;

    if (this.gastos) {
      for(let i =0; i< this.gastos.length; i++){
        elementogasto = this.gastos[i];
        elemento[0] = elementogasto[0];

        indiceingreso = this.ctrlingresos.indexOf(this.ctrlgastos[i]);
        elementoingreso = this.ingresos[indiceingreso];

        for(let j =1; j< elementogasto.length; j++){
           elemento[j] = -parseFloat(elementogasto[j]);
           if (indiceingreso >= 0){
             elemento[j] += parseFloat(elementoingreso[j]);
           }
        }
        this.balance.push(elemento);
        elemento = [];
      }
    }
}

calcularTotalParticular(arr:any):any{
  let dev = new Array(25);
  dev[0] = "Total";
  for (let j=1; j < dev.length; j++){
    dev[j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
  }
    let indice:number;
    if (arr) {
      for (let i = 0; i <  arr.length; i++){
          for (let j=1; j < arr[i].length; j++){
            dev[j] +=parseFloat(arr[i][j]);
          }
      }
    }
   return dev;
}

  procesarCostesFijos(arr:any, bReal:number ){
    let indice:number;
    if (arr) {
      for (let i = 0; i <  arr.length; i++){
          if(this.ctrlgastos.indexOf(arr[i].id_parent) < 0){
              this.ctrlgastos.push(arr[i].id_parent);
              this.gastos.push(new Array(25));//añado nuevo elemento
              for (let j=1; j < this.gastos[this.gastos.length-1].length; j++){
                this.gastos[this.gastos.length-1][j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
              }
              indice = this.gastos.length-1;
              this.gastos[indice][0] = arr[i].parent_name;
          }else{
            indice =this.ctrlgastos.indexOf(arr[i].id_parent);
          }
            this.gastos[indice][this.capturarMes(arr[i].id_month) + (12*bReal)] += parseFloat(arr[i].total);
      };
  }

}

procesarIngresosVariables(arr:any){
  let indice:number;
  let indiceingresos:number;
  if (arr) {
    for (let i = 0; i <  arr.length; i++){
        if(this.ctrlgastos.indexOf(arr[i].id) < 0){
            this.ctrlgastos.push(arr[i].id);
            this.ctrlingresos.push(arr[i].id);//estoy suponiendo que siempre lo meto también en ingresos
            this.gastos.push(new Array(25));//añado nuevo elemento
            this.ingresos.push(new Array(25));

            for (let j=1; j < this.gastos[this.gastos.length-1].length; j++){
              this.gastos[this.gastos.length-1][j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
              this.ingresos[this.ingresos.length-1][j] = 0;
            }
            indice = this.gastos.length-1;
            indiceingresos = this.ingresos.length-1;
            this.gastos[indice][0] = arr[i].name;
            this.ingresos[indiceingresos][0] = arr[i].name;
        }else{
          indice =this.ctrlgastos.indexOf(arr[i].id);
          indiceingresos =this.ctrlingresos.indexOf(arr[i].id);
        }
          //this.gastos[indice][this.capturarMes(arr[i].id_month)] += parseFloat(arr[i].amount);
          this.ingresos[indiceingresos][parseInt(arr[i].id_month)] += parseFloat(arr[i].amount);
    };
  }
}

procesarIngresosVariablesReales(arr:any){
  let indice:number;
  let indiceingresos:number;
  if (arr) {
    for (let i = 0; i <  arr.length; i++){
        if(this.ctrlgastos.indexOf(arr[i].id) < 0){
            this.ctrlgastos.push(arr[i].id);
            this.ctrlingresos.push(arr[i].id);//estoy suponiendo que siempre lo meto también en ingresos
            this.gastos.push(new Array(25));//añado nuevo elemento
            this.ingresos.push(new Array(25));

            for (let j=1; j < this.gastos[this.gastos.length-1].length; j++){
              this.gastos[this.gastos.length-1][j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
              this.ingresos[this.ingresos.length-1][j] = 0;
            }
            indice = this.gastos.length-1;
            indiceingresos = this.ingresos.length-1;
            this.gastos[indice][0] = arr[i].name;
            this.ingresos[indiceingresos][0] = arr[i].name;
        }else{
          indice =this.ctrlgastos.indexOf(arr[i].id);
          indiceingresos =this.ctrlingresos.indexOf(arr[i].id);
        }
          //this.gastos[indice][this.capturarMes(arr[i].id_month)] += parseFloat(arr[i].amount);
          this.ingresos[indiceingresos][12+parseInt(arr[i].id_month)] += parseFloat(arr[i].amount);
    };
  }
}



procesarCostesVariables(arr:any){
  let indice:number;
  let indiceingresos:number;
  if (arr) {
    for (let i = 0; i <  arr.length; i++){
        if(this.ctrlgastos.indexOf(arr[i].id) < 0){
            this.ctrlgastos.push(arr[i].id);
            this.ctrlingresos.push(arr[i].id);//estoy suponiendo que siempre lo meto también en ingresos
            this.gastos.push(new Array(25));//añado nuevo elemento
            this.ingresos.push(new Array(25));

            for (let j=1; j < this.gastos[this.gastos.length-1].length; j++){
              this.gastos[this.gastos.length-1][j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
              this.ingresos[this.ingresos.length-1][j] = 0;
            }
            indice = this.gastos.length-1;
            indiceingresos = this.ingresos.length-1;
            this.gastos[indice][0] = arr[i].name;
            this.ingresos[indiceingresos][0] = arr[i].name;
        }else{
          indice =this.ctrlgastos.indexOf(arr[i].id);
          indiceingresos =this.ctrlingresos.indexOf(arr[i].id);
        }
          this.gastos[indice][parseInt(arr[i].id_month)] += parseFloat(arr[i].amount);
          //this.ingresos[indiceingresos][this.capturarMes(arr[i].month)] += parseFloat(arr[i].ingresoestimado);
    };
}

}

procesarCostesVariablesReales(arr:any){
  let indice:number;
  let indiceingresos:number;
  if (arr) {
    for (let i = 0; i <  arr.length; i++){
        if(this.ctrlgastos.indexOf(arr[i].id) < 0){
            this.ctrlgastos.push(arr[i].id);
            this.ctrlingresos.push(arr[i].id);//estoy suponiendo que siempre lo meto también en ingresos
            this.gastos.push(new Array(25));//añado nuevo elemento
            this.ingresos.push(new Array(25));

            for (let j=1; j < this.gastos[this.gastos.length-1].length; j++){
              this.gastos[this.gastos.length-1][j] = 0;//lo relleno entero de ceros excepto la primera que va el índice
              this.ingresos[this.ingresos.length-1][j] = 0;
            }
            indice = this.gastos.length-1;
            indiceingresos = this.ingresos.length-1;
            this.gastos[indice][0] = arr[i].name;
            this.ingresos[indiceingresos][0] = arr[i].name;
        }else{
          indice =this.ctrlgastos.indexOf(arr[i].id);
          indiceingresos =this.ctrlingresos.indexOf(arr[i].id);
        }
          this.gastos[indice][12+parseInt(arr[i].id_month)] += parseFloat(arr[i].amount);
          //this.ingresos[indiceingresos][this.capturarMes(arr[i].month)] += parseFloat(arr[i].ingresoestimado);
    };
}

}

  initValues() {
    this.data = {
      budget: {
        totalFixedCost: '0',
        totalIncomes: '0',
        totalExpenses: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalMargin: '0',
        totalEbitda: '0',
        totalAmortizacion: '0',
        totalFinancieros: '0',
        totalEbit: '0',
        totalExtraordinarios: '0',
        totalBeneficios: '0',
        totalIs: '0',
        total: '0'
      },
      real: {
        totalFixedCost: '0',
        totalIncomes: '0',
        totalExpenses: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalMargin: '0',

        totalEbitda: '0',
        totalAmortizacion: '0',
        totalFinancieros: '0',
        totalEbit: '0',
        totalExtraordinarios: '0',
        totalBeneficios: '0',
        totalIs: '0',
        total: '0'
      },
      differences: {
        totalFixedCost: '0',
        totalIncomes: '0',
        totalExpenses: '0',
        totalEmployees: '0',
        totalFee: '0',
        totalMargin: '0',

        totalEbitda: '0',
        totalAmortizacion: '0',
        totalFinancieros: '0',
        totalEbit: '0',
        totalExtraordinarios: '0',
        totalBeneficios: '0',
        totalIs: '0',
        total: '0'
      }
    };
  }

  calculateDifferences() {
    this.data.differences.totalFixedCost = String(parseFloat(this.data.budget.totalFixedCost) - parseFloat(this.data.real.totalFixedCost));
    this.data.differences.totalIncomes = String(parseFloat(this.data.budget.totalIncomes) - parseFloat(this.data.real.totalIncomes));
    this.data.differences.totalExpenses = String(parseFloat(this.data.budget.totalExpenses) - parseFloat(this.data.real.totalExpenses));
    this.data.differences.totalEmployees = String(parseFloat(this.data.budget.totalEmployees) - parseFloat(this.data.real.totalEmployees));
    this.data.differences.totalFee = String(parseFloat(this.data.budget.totalFee) - parseFloat(this.data.real.totalFee));
    this.data.differences.totalMargin = String(parseFloat(this.data.budget.totalMargin) - parseFloat(this.data.real.totalMargin));
    this.data.differences.totalEbitda = String(parseFloat(this.data.budget.totalEbitda) - parseFloat(this.data.real.totalEbitda));
    this.data.differences.totalAmortizacion = String(parseFloat(this.data.budget.totalAmortizacion) - parseFloat(this.data.real.totalAmortizacion));
    this.data.differences.totalFinancieros = String(parseFloat(this.data.budget.totalFinancieros) - parseFloat(this.data.real.totalFinancieros));
    this.data.differences.totalEbit = String(parseFloat(this.data.budget.totalEbit) - parseFloat(this.data.real.totalEbit));
    this.data.differences.totalExtraordinarios = String(parseFloat(this.data.budget.totalExtraordinarios) - parseFloat(this.data.real.totalExtraordinarios));
    this.data.differences.totalBeneficios = String(parseFloat(this.data.budget.totalBeneficios) - parseFloat(this.data.real.totalBeneficios));
    this.data.differences.totalIs = String(parseFloat(this.data.budget.totalIs) - parseFloat(this.data.real.totalIs));
    this.data.differences.total = String(parseFloat(this.data.budget.total) - parseFloat(this.data.real.total));
    this.dataFixedCost.forEach((element) => {
      element.differences_total = parseFloat(element.budget_total) - parseFloat(element.real_total);
      element.children.forEach(child => {
        child.differences = parseFloat(child.budget) - parseFloat(child.real);
      });
    });
  }

  filterValues() {
    this.dataFixedCost = [];
    this.initValues();
    this.groupValues(this.valuesReport);
    this.incomesFromDB = {
      budget: this.valuesReport.incomes_budget,
      real: this.valuesReport.incomes_real
    };

    let report = this.valuesReport;
    this.groupByFixedCost('budget', report.fixed_cost_budget, report.incomes_budget, report.amortizacion_budget, report.financiero_budget, report.extraordinario_budget);
    this.groupByFixedCost('real', report.fixed_cost_real, report.incomes_real, report.amortizacion_real, report.financiero_real, report.extraordinario_real);
    this.calculateDifferences();
  }

  clearValues() {
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.filterValues();
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
        id_children: element.id_fixed_concept,
        name: element.children_name,
        budget: element.total,
        real: 0,
        differences: 0
      };
    } else {
      containerData.budgetParentAmount = 0;
      containerData.realParentAmount = parseFloat(element.total);
      containerData.childrenData = {
        id_children: element.id_fixed_concept,
        name: element.children_name,
        budget: 0,
        real: element.total,
        differences: 0
      };
    }

    return containerData;
  }

  addNewParent(element, typeField) {
    if (this.passStartDate(element.id_month) && this.passEndDate(element.id_month)) {

      let containerData = this.addNewChildren(element, typeField);
      this.dataFixedCost
        .push({
          id_parent: element.id_parent,
          parent: true,
          name: element.parent_name,
          budget_total: containerData.budgetParentAmount,
          real_total: containerData.realParentAmount,
          differences_total: (containerData.budgetParentAmount - containerData.realParentAmount),
          children: [containerData.childrenData]
        });
    }
  }

  groupByFixedCost(typeField, fixedCosts, incomes, amortizacion, financiero, extraordinario) {
    let parentRow = null;
    let childrenRow = null;
    let idx = 0;
    let idxChild = 0;

    if (fixedCosts) {
      _.forEach(fixedCosts, (element, index) => {
        //si es la primera iteracion, añado al array el valor directamente, de la info del padre y del hijo
        if (this.dataFixedCost.length === 0) {
          this.addNewParent(element, typeField);
        } else {
          let found = false;
          this.dataFixedCost.forEach((fcIterator, idx) => {
            if (fcIterator.id_parent == element.id_parent) { // es el mismo padre, añadimos un hijo
              found = true;
              let foundChild = false;
              if (this.passStartDate(element.id_month) && this.passEndDate(element.id_month)) {
                this.dataFixedCost[idx].children.forEach(fcChildIterator => {
                  if (fcChildIterator.id_children == element.id_fixed_concept && typeField === 'budget') {
                    fcChildIterator.budget = parseFloat(fcChildIterator.budget) + parseFloat(element.total);
                    fcIterator.budget_total = parseFloat(fcIterator.budget_total) + parseFloat(element.total);
                    foundChild = true;
                  } else if (fcChildIterator.id_children == element.id_fixed_concept && typeField === 'real') {
                    fcChildIterator.real = parseFloat(fcChildIterator.real) + parseFloat(element.total);
                    fcIterator.real_total = parseFloat(fcIterator.real_total) + parseFloat(element.total);
                    foundChild = true;
                  }
                });
                if (!foundChild) { // si no encontramos al hijo, lo añadimos directamente
                  let containerData = this.addNewChildren(element, typeField);
                  //sumamos los valores del hijo al padre
                  this.dataFixedCost[idx].budget_total = parseFloat(this.dataFixedCost[idx].budget_total) + containerData.budgetParentAmount;
                  this.dataFixedCost[idx].real_total = parseFloat(this.dataFixedCost[idx].real_total) + containerData.realParentAmount;
                  this.dataFixedCost[idx].children.push(containerData.childrenData);
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

    let parentFC = this.dataFixedCost;
    parentFC.forEach(element => {
      if (typeField === 'budget') {
        this.data.budget.totalFixedCost = String(parseFloat(this.data.budget.totalFixedCost) + parseFloat(element.budget_total));
      } else if (typeField === 'real') {
        this.data.real.totalFixedCost = String(parseFloat(this.data.real.totalFixedCost) + parseFloat(element.real_total));
      }
      this.data.differences.totalFixedCost = String(parseFloat(this.data.differences.totalFixedCost) - parseFloat(this.data.real.totalFixedCost));
    });

    // TOTAL EBITDA
    this.data[typeField].totalEbitda = (this.data[typeField].totalMargin - this.data[typeField].totalFixedCost).toFixed(2);

    // AMORTIZACIONES
    let valueAmortizacion = 0;
    amortizacion && amortizacion.forEach(element => {
      valueAmortizacion += parseFloat(element.total);
    });
    this.data[typeField].totalAmortizacion = valueAmortizacion;


    // GASTOS FINANCIEROS
    let valueFinanciero = 0;
    financiero && financiero.forEach(element => {
      valueFinanciero += parseFloat(element.total);
    });
    this.data[typeField].totalFinancieros = valueFinanciero;

    // TOTAL EBIT
    this.data[typeField].totalEbit = (this.data[typeField].totalEbitda - valueAmortizacion - valueFinanciero).toFixed(2);

    // GASTOS EXTRAORDINARIOS
    let valueExtraordinario = 0;
    extraordinario && extraordinario.forEach(element => {
      valueExtraordinario += parseFloat(element.total);
    });
    this.data[typeField].totalExtraordinarios = valueExtraordinario;

    // BENEFICIOS ANTES IS
    this.data[typeField].totalBeneficios = this._common.toFloat(this.data[typeField].totalEbit) - this._common.toFloat(this.data[typeField].totalExtraordinarios);

    // IMPUESTO SOCIEDADES
    this.data[typeField].totalIs = this.getPercentIS(this.data[typeField].totalBeneficios);

    //TOTAL
    this.calculateTotal(typeField);
    this.loadValues = true;
  }

  calculateTotal(typeField) {
    let incomes = this.incomesFromDB;
    let neutral = parseFloat(this.data[typeField].totalBeneficios) - parseFloat(this.data[typeField].totalIs);

    this.data[typeField].total = neutral
  }

  groupValues(reports) {
    this.initValues();
    // INCOMES
    if (reports.incomes_budget.length) {
      reports.incomes_budget.forEach(element => {
        if (this.passDates(element.id_month)) {
          this.data.budget.totalIncomes = String(parseFloat(this.data.budget.totalIncomes) + parseFloat(element.total));
        }
      });
    }

    if (reports.incomes_real.length) {
      reports.incomes_real.forEach(element => {
        if (this.passDates(element.id_month)) {
          this.data.real.totalIncomes = String(parseFloat(this.data.real.totalIncomes) + parseFloat(element.total));
        }
      });
    }

    // EXPENSES
    //this.data.budget.totalExpenses = reports.expenses_budget.amount;
    reports.expenses_budget && reports.expenses_budget.forEach(element => {
      if (this.passDates(element.id_month)) {
        this.data.budget.totalExpenses = String(parseFloat(this.data.budget.totalExpenses) + parseFloat(element.total));
      }
    });

    if (reports.expenses_real && reports.expenses_real.length) {
      reports.expenses_real.forEach(element => {
        if (this.passDates(element.id_month)) {
          this.data.real.totalExpenses = String(parseFloat(this.data.real.totalExpenses) + parseFloat(element.total));
        }
      });
    }

    //EMPLOYEES
    if (reports.employees_budget && reports.employees_budget.length) {
      reports.employees_budget.forEach(element => {
        if (this.passDates(element.id_month)) {
          this.data.budget.totalEmployees = String(parseFloat(this.data.budget.totalEmployees) + parseFloat(element.amount));
        }
      });
    }

    this.calculateRealEmployees(reports.employees_real, reports.employees_real_gesad);

    // FEE DE EMPRESA

    reports.fee_budget && reports.fee_budget.forEach(element => {
      if (this.passDates(element.id_month)) {
        this.data.budget.totalFee = String(parseFloat(this.data.budget.totalFee) + parseFloat(element.amount));
      }
    });
    reports.fee_real && reports.fee_real.forEach(element => {
      if (this.passDates(element.id_month)) {
        this.data.real.totalFee = String(parseFloat(this.data.real.totalFee) + parseFloat(element.amount));
      }
    });


    //MARGIN
    this.data.budget.totalMargin =
      (parseFloat(this.data.budget.totalIncomes) -
        parseFloat(this.data.budget.totalExpenses) -
        parseFloat(this.data.budget.totalFee) -
        parseFloat(this.data.budget.totalEmployees)).toFixed(2);
    this.data.real.totalMargin =
      (parseFloat(this.data.real.totalIncomes) -
        parseFloat(this.data.real.totalExpenses) -
        parseFloat(this.data.real.totalFee) -
        parseFloat(this.data.real.totalEmployees)).toFixed(2);
  }

  calculateRealEmployees(costs, cost_gesad) {
    this.data.real.totalEmployees = '0';
    costs.forEach(element => {
      element.accumulate = true;
    });
    // a cada item de coste de empleado de tracker, le ponemos un flag para saber si luego hay que sumarlo al total
    if (cost_gesad) {
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
    }

    costs.forEach(element => {
      if (element.accumulate && this.passDateFormat(element.date)) {
        this.data.real.totalEmployees = String(parseFloat(this.data.real.totalEmployees) + parseFloat(element.cost));
      }
    });
  }

  capturarMes(source) {
    switch (source) {
      case 'january':
        return 1;
      case 'february':
        return 2;
      case 'march':
        return 3;
      case 'april':
        return 4;
      case 'may':
        return 5;
      case 'june':
        return 6;
      case 'july':
        return 7;
      case 'august':
        return 8;
      case 'september':
        return 9;
      case 'october':
        return 10;
      case 'november':
        return 11;
      case 'december':
        return 12;
    }
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

  blurred(value, previous, typeField) {
    if (value.target.className.indexOf('dirty') > -1) {
      typeField.colValue = previous;
      this._notification.info('Información', 'Pulsa Enter o Tabulador para almacenar el valor');
    } else {
      typeField.colValue = this._common.currencyFormatES(value.currentTarget.value, false);
    }
  }

  resetClass(value) {
    if (value.which === 13 || value.which === 9) {
      value.target.className = '';
    } else {
      value.target.className = 'dirty';
    }
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

}
