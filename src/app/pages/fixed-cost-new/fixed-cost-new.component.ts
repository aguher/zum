import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { Observable } from 'rxjs/Observable';
import { utils, write, WorkBook } from 'xlsx';

import { saveAs } from 'file-saver';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';
import { TokenService } from '../../services/token.service';

import * as _ from "lodash";

@Component({
  selector: 'app-fixed-cost-new',
  templateUrl: './fixed-cost-new.component.html',
  styleUrls: ['./fixed-cost-new.component.scss']
})



export class FixedCostNewComponent implements OnInit {

  @Output() notificarCambio = new EventEmitter<boolean>();

  private concepts:any= new Array();
  private ctrlgastosfijos:any[] = new Array();
  private ctrlgastosvbles:any[] = new Array();

  private variableconcepts:any= new Array();
  private variableconceptsexpenses:any = new Array();


  //esto casi seguro que se puede poner en 1 solo
  private fixedExpenses:any = new Array();
  private variableExpenses:any= new Array();
  private variableIncome:any= new Array();

  choosenCompany: boolean = false;
  showChart: boolean = false;
  displayAnalize: boolean = false;
  isEditable: boolean = false;
  analysisMonths: any[] = [];

  tablaSeleccionada:string = 'CF';

  public lineChartData: Array<any> = [{ data: [], label: 'Presupuestados' }, { data: [], label: 'Reales' }, { data: [], label: 'Diferencias' }];
  accumulateMonths: any[] = [
    {
      january: 0,
      february: 0,
      march: 0,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 0
    },
    {
      january: 0,
      february: 0,
      march: 0,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 0

    },
    {
      january: 0,
      february: 0,
      march: 0,
      april: 0,
      may: 0,
      june: 0,
      july: 0,
      august: 0,
      september: 0,
      october: 0,
      november: 0,
      december: 0,
      total: 0

    }
  ];
  conceptFixed: any[] = [];
  conceptFixedReal: any[] = [];
  conceptFixedDifferences: any[] = [];
  numConceptFixed: number = 0;
  allConcepts: boolean = false;
  nameToAnalysis: string = '';

  public lineChartLabels: Array<any> = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  public lineChartOptions: any = {
    scales: {
      xAxes: [{
        gridLines: {
          display: false
        },
        ticks: {
          fontColor: "#80A9DD",
          fontSize: 12,
          beginAtZero: true
        }
      }],
      yAxes: [{
        gridLines: {
          display: true,
          color: '#4087D1'
        },
        ticks: {
          fontColor: "#80A9DD",
          fontSize: 12,
          beginAtZero: true
        }
      }]
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
      borderColor: 'rgba(72,134,254,1)',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(234,47,74,1)',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(254,183,0,0.8)',
      pointBackgroundColor: '#FE9804',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common,
    private _token: TokenService,
  ) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label : '';
    lsYear = (lsYear) ? lsYear.label : '';

    if (lsCompany === '' || lsYear === '') {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

  }

  ngOnInit() {
    this.isEditable = (parseInt(this._token.getInfo().role) === 4) ? false : true
    this.collectFixedConcept();
    //this.collectFixedConcept();
    this.collectVariableConcept();
    this.collectVariableConceptbis();
    


  }

  tecleado(event) {
    if (event.key === "Enter" || event.key === "Tab") {
      let params = event.target.id.toString().split(';');

      let importe = event.target.value;
      let mes = params[1];
      let id_concepto = params[0];
      let indice; 
      let diferencia = 0;
      let indicepadre; 
      let body = '';

      if (params[2] == "CF"){

      indice = this.ctrlgastosfijos.indexOf(id_concepto);
      indicepadre  = this.ctrlgastosfijos.indexOf(this.concepts[indice].id_parent);

      body = `id_fixed_concept=${id_concepto}`;
      body += `&id_month=${mes}`;
      body += `&amount=${this.checkNumber(importe)}`;
      body += `&type=${0}`;

      this._api.updateFixedCost(body).subscribe((response) => {
        if (response.status === 'ok') {
          this._notification.success('Exito', 'Se ha modificado el concepto fijo ' + this.concepts[indice].name);
          importe = importe.replace('.','');
          importe = importe.replace(',','.');

          //this.concepts[indice][element.id_month] += parseFloat(element.amount);
          diferencia = parseFloat(importe)-this.concepts[indice][mes];
          this.concepts[indice]["total"] += diferencia;
          this.concepts[indice][mes] = importe;
          if (indicepadre >= 0){
            this.concepts[indicepadre][mes] += diferencia;
            this.concepts[indicepadre]["total"] += diferencia;
          }
        }
      });

      }else if(params[2] == "IV"){

        indice = this.ctrlgastosvbles.indexOf(id_concepto);

        body = `id_variable_concept=${id_concepto}`;
        body += `&id_month=${mes}`;
        body += `&amount=${this.checkNumber(importe)}`;
        body += `&type=${0}`;
  
        this._api.updateVariableIncome(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('Exito', 'Se ha modificado el concepto variable ' + this.variableconcepts[indice].name);
            importe = importe.replace('.','');
            importe = importe.replace(',','.');
  
            //this.concepts[indice][element.id_month] += parseFloat(element.amount);
            diferencia = parseFloat(importe)-this.variableconcepts[indice][mes];
            this.variableconcepts[indice]["total"] += diferencia;
            this.variableconcepts[indice][mes] = importe;
          }
        });        

      }else if(params[2] == "CV"){
        indice = this.ctrlgastosvbles.indexOf(id_concepto);

        body = `id_variable_concept=${id_concepto}`;
        body += `&id_month=${mes}`;
        body += `&amount=${this.checkNumber(importe)}`;
        body += `&type=${0}`;
  
        this._api.updateVariableExpenses(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('Exito', 'Se ha modificado el concepto variable ' + this.variableconceptsexpenses[indice].name);
            importe = importe.replace('.','');
            importe = importe.replace(',','.');
  
            //this.concepts[indice][element.id_month] += parseFloat(element.amount);
            diferencia = parseFloat(importe)-this.variableconceptsexpenses[indice][mes];
            this.variableconceptsexpenses[indice]["total"] += diferencia;
            this.variableconceptsexpenses[indice][mes] = importe;
          }
        });        

      }
      this.notificarCambio.emit(true);
    }
  }

  completararray(vect:any,ctrl:any){
    vect.forEach(function(element) {
         element.january = 0;
         element.february = 0;
         element.march = 0;
         element.april = 0;
         element.may = 0;
         element.june = 0;
         element.july = 0;
         element.august = 0;
         element.september = 0;
         element.october = 0;
         element.november = 0;
         element.december = 0;
         element.total = 0;
         if (ctrl.indexOf(element.id) == -1){
           ctrl.push(element.id);
       }
    });
  }



collectGastosFijos(vect:any, ctrl:any){
    this._api.getExpensesFixed('0').subscribe((response) => {
      if (response.status === 'error') {
        this._notification.success('Info', response.msg);
      } else {
        this.fixedExpenses = response.items;
        console.log(this.fixedExpenses);

        if (this.fixedExpenses){
          this.fixedExpenses.forEach(function(element){
            let indice = ctrl.indexOf(element.id);
            vect[indice][element.id_month] += parseFloat(element.amount);
            vect[indice]["total"] += parseFloat(element.amount);
            //debemos actualizar al padre también

            let indicepadre = ctrl.indexOf(vect[indice].id_parent);
            if (indicepadre >= 0){
              vect[indicepadre][element.id_month] += parseFloat(element.amount);
              vect[indicepadre]["total"] += parseFloat(element.amount);
            }
          });
        }
      }
    });
  }

  collectGastosVariables(vect:any, ctrl:any){
      this._api.getExpensesVariable('0').subscribe((response) => {
        if (response.status === 'error') {
          this._notification.success('Info', response.msg);
        } else {
          this.variableExpenses = response.items;

          if (this.variableExpenses){
            this.variableExpenses.forEach(function(element){
              let indice = ctrl.indexOf(element.id);
              vect[indice][element.id_month] += parseFloat(element.amount);
              vect[indice]["total"] += parseFloat(element.amount);
              //debemos actualizar al padre también

            });
          }
        }
      });
    }





    collectIngresosVariables(vect:any, ctrl:any){
        this._api.getIncomeVariable('0').subscribe((response) => {
          if (response.status === 'error') {
            this._notification.success('Info', response.msg);
          } else {
            this.variableIncome = response.items;

            if (this.variableIncome){
              this.variableIncome.forEach(function(element){
                let indice = ctrl.indexOf(element.id);
                vect[indice][element.id_month] += parseFloat(element.amount);
                vect[indice]["total"] += parseFloat(element.amount);
                //debemos actualizar al padre también

              });
            }
          }
        });
      }




  collectFixedConcept() {
    this._api.getFixedConcept().subscribe((response) => {
     if (response != null) {
       this.concepts = response.items;
       console.log(this.concepts);

       this.completararray(this.concepts,this.ctrlgastosfijos);
       this.collectGastosFijos(this.concepts,this.ctrlgastosfijos);
      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los costes fijos.");
      }
    });
  }

  collectVariableConcept() {
    this._api.getVariableConcept().subscribe((response) => {
     if (response != null) {
       this.variableconceptsexpenses = response.items;
       this.completararray(this.variableconceptsexpenses,this.ctrlgastosvbles);
       this.collectGastosVariables(this.variableconceptsexpenses,this.ctrlgastosvbles);
      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los costes variables.");
      }
    });

  }

  collectVariableConceptbis() {
    this._api.getVariableConcept().subscribe((response) => {
     if (response != null) {
       this.variableconcepts= response.items;
       this.completararray(this.variableconcepts,this.ctrlgastosvbles);
       this.collectIngresosVariables(this.variableconcepts,this.ctrlgastosvbles);
      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los costes variables.");
      }
    });

  }


  checkNumber(number) {
    number = String(number);
    let parse = parseFloat(number.replace(',', '.'));

    return (isNaN(parse) ? 0 : parse);
  }
}
