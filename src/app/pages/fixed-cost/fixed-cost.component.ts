import { Component, OnInit } from '@angular/core';
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
  selector: 'app-fixed-cost',
  templateUrl: './fixed-cost.component.html',
  styleUrls: ['./fixed-cost.component.scss']
})
export class FixedCostComponent implements OnInit {
  private concepts: Observable<any>;
  choosenCompany: boolean = false;
  showChart: boolean = false;
  displayAnalize: boolean = false;
  isEditable: boolean = false;
  analysisMonths: any[] = [];
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
    this.isEditable = (parseInt(this._token.getInfo().role) === 4) ? false : true;
    this.collectFixedConcept();
    // wait to have the estimated concepts, and then got the reals
    let gotConcepts = this.concepts.subscribe((value) => {
      this.collectFixedConceptReal();
    });
  }

  fillExcelData(type) {
    let exportData = [];
    let items = null;
    let sumTotals = { total: 0, jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 };
    switch (type) {
      case 'real':
        items = this.conceptFixedReal;
        break;
      case 'estimated':
        items = this.conceptFixed;
        break;
      case 'differences':
        items = this.conceptFixedDifferences;
        break;
    }

    items.forEach(element => {
      exportData.push(
        {
          'Cuenta/Subcuenta': (element.id_parent === '0') ? `${element.name}(${element.account_number})` : ` - ${element.name}(${element.account_number})`,
          Total: this._common.currencyFormatES(this._common.toFloat(element.total_amount), false),
          Enero: this._common.currencyFormatES(this._common.toFloat(element.january), false),
          Febrero: this._common.currencyFormatES(this._common.toFloat(element.february), false),
          Marzo: this._common.currencyFormatES(this._common.toFloat(element.march), false),
          Abril: this._common.currencyFormatES(this._common.toFloat(element.april), false),
          Mayo: this._common.currencyFormatES(this._common.toFloat(element.may), false),
          Junio: this._common.currencyFormatES(this._common.toFloat(element.june), false),
          Julio: this._common.currencyFormatES(this._common.toFloat(element.july), false),
          Agosto: this._common.currencyFormatES(this._common.toFloat(element.august), false),
          Septiembre: this._common.currencyFormatES(this._common.toFloat(element.september), false),
          Octubre: this._common.currencyFormatES(this._common.toFloat(element.october), false),
          Noviembre: this._common.currencyFormatES(this._common.toFloat(element.november), false),
          Diciembre: this._common.currencyFormatES(this._common.toFloat(element.december), false)
        }
      );
      if (element.id_parent === '0') {
        sumTotals.total += this._common.toFloat(element.total_amount);
        sumTotals.jan += this._common.toFloat(element.january);
        sumTotals.feb += this._common.toFloat(element.february);
        sumTotals.mar += this._common.toFloat(element.march);
        sumTotals.apr += this._common.toFloat(element.april);
        sumTotals.may += this._common.toFloat(element.may);
        sumTotals.jun += this._common.toFloat(element.june);
        sumTotals.jul += this._common.toFloat(element.july);
        sumTotals.aug += this._common.toFloat(element.august);
        sumTotals.sep += this._common.toFloat(element.september);
        sumTotals.oct += this._common.toFloat(element.october);
        sumTotals.nov += this._common.toFloat(element.november);
        sumTotals.dec += this._common.toFloat(element.december);
      }
    });
    //space between last row
    exportData.push(
      {
        'Cuenta/Subcuenta': '',
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
        'Cuenta/Subcuenta': 'Totales',
        Total: this._common.currencyFormatES(sumTotals.total),
        Enero: this._common.currencyFormatES(sumTotals.jan, false),
        Febrero: this._common.currencyFormatES(sumTotals.feb, false),
        Marzo: this._common.currencyFormatES(sumTotals.mar, false),
        Abril: this._common.currencyFormatES(sumTotals.apr, false),
        Mayo: this._common.currencyFormatES(sumTotals.may, false),
        Junio: this._common.currencyFormatES(sumTotals.jun, false),
        Julio: this._common.currencyFormatES(sumTotals.jul, false),
        Agosto: this._common.currencyFormatES(sumTotals.aug, false),
        Septiembre: this._common.currencyFormatES(sumTotals.sep, false),
        Octubre: this._common.currencyFormatES(sumTotals.oct, false),
        Noviembre: this._common.currencyFormatES(sumTotals.nov, false),
        Diciembre: this._common.currencyFormatES(sumTotals.dec, false)
      }
    );

    return exportData;
  }


  exportExcel(): void {
    let exportDataEstimated = [];
    let exportDataReal = [];
    let exportDataDifferences = [];

    exportDataEstimated = this.fillExcelData('estimated');
    exportDataReal = this.fillExcelData('real');
    exportDataDifferences = this.fillExcelData('differences');

    const ws_name_1 = 'Presupuestados';
    const ws_name_2 = 'Reales';
    const ws_name_3 = 'Diferencias';
    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws_1: any = utils.json_to_sheet(exportDataEstimated);
    const ws_2: any = utils.json_to_sheet(exportDataReal);
    const ws_3: any = utils.json_to_sheet(exportDataDifferences);
    wb.SheetNames.push(ws_name_1, ws_name_2, ws_name_3);
    wb.Sheets[ws_name_1] = ws_1;
    wb.Sheets[ws_name_2] = ws_2;
    wb.Sheets[ws_name_3] = ws_3;
    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      };
      return buf;
    }

    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'costes-fijos.xlsx');
  }

  checkNumber(number) {
    number = String(number);
    let parse = parseFloat(number.replace(',', '.'));

    return (isNaN(parse) ? 0 : parse);
  }

  resetTotalMonths(idx) {
    this.accumulateMonths[idx] = {
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
    };
  }

  onEditComplete(value, typeConcept, idx) {
    let changedValued = typeConcept[value.index],
      total_acc = 0,
      parentValue = null;

    parentValue = _.filter(typeConcept, function (o) { return o.id === changedValued.id_parent });
    this.accumulateParent(parentValue[0], typeConcept);

    let parents = _.filter(typeConcept, (value) => {
      return value.id_parent === '0';
    });
    this.accumulateMonths[idx].total = 0;
    this.resetTotalMonths(idx);
    _.forEach(parents, (element) => {

      this.accumulateParent(element, typeConcept);
      total_acc = 0;
      total_acc = this.sumTotal(element);
      element.total_amount = total_acc;
      this.setTotalByMonth(element, idx);
    });


    total_acc = this.checkNumber(changedValued.january);
    total_acc += this.checkNumber(changedValued.february);
    total_acc += this.checkNumber(changedValued.march);
    total_acc += this.checkNumber(changedValued.april);
    total_acc += this.checkNumber(changedValued.may);
    total_acc += this.checkNumber(changedValued.june);
    total_acc += this.checkNumber(changedValued.july);
    total_acc += this.checkNumber(changedValued.august);
    total_acc += this.checkNumber(changedValued.september);
    total_acc += this.checkNumber(changedValued.october);
    total_acc += this.checkNumber(changedValued.november);
    total_acc += this.checkNumber(changedValued.december);

    typeConcept[value.index].total_amount = total_acc;
    let body = '';

    body = `id_fixed_concept=${value.data.id}`;
    body += `&id_month=${value.column.field}`;
    body += `&amount=${this.checkNumber(value.data[value.column.field])}`;
    body += `&type=${idx}`;

    this._api.updateFixedCost(body).subscribe((response) => {
      if (response.status === 'ok') {
        this._notification.success('Exito', 'Se ha modificado el concepto fijo ' + value.data.name);
      }
    });
    this.mergeDifferences();
  }

  accumulateParent(parent, typeConcept) {
    let childrens = _.filter(typeConcept, (element) => {
      return element.id_parent === parent.id;
    });
    let valuesMonths: any[] = [],
      newValue: any = {},
      acc = 0;

    newValue = {
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
      december: 0
    };

    _.forEach(childrens, (value) => {
      newValue.january += this.checkNumber(value.january);
      newValue.february += this.checkNumber(value.february);
      newValue.march += this.checkNumber(value.march);
      newValue.april += this.checkNumber(value.april);
      newValue.may += this.checkNumber(value.may);
      newValue.june += this.checkNumber(value.june);
      newValue.july += this.checkNumber(value.july);
      newValue.august += this.checkNumber(value.august);
      newValue.september += this.checkNumber(value.september);
      newValue.october += this.checkNumber(value.october);
      newValue.november += this.checkNumber(value.november);
      newValue.december += this.checkNumber(value.december);
    });
    parent.january = newValue.january;
    acc = newValue.january;
    parent.february = newValue.february;
    acc += newValue.february;
    parent.march = newValue.march;
    acc += newValue.march;
    parent.april = newValue.april;
    acc += newValue.april;
    parent.may = newValue.may;
    acc += newValue.may;
    parent.june = newValue.june;
    acc += newValue.june;
    parent.july = newValue.july;
    acc += newValue.july;
    parent.august = newValue.august;
    acc += newValue.august;
    parent.september = newValue.september;
    acc += newValue.september;
    parent.october = newValue.october;
    acc += newValue.october;
    parent.november = newValue.november;
    acc += newValue.november;
    parent.december = newValue.december;
    acc += newValue.december;
    parent.total_amount = acc;
  }

  accumulateTotal(typeConcept, idx) {
    let total_acc = 0,
      total_global = 0;
    typeConcept.forEach(element => {
      total_acc = 0;
      total_acc = this.sumTotal(element);
      element.total_amount = total_acc;
    });

    let parents = _.filter(typeConcept, (value) => {
      return value.id_parent === '0';
    });
    _.forEach(parents, (element) => {

      this.accumulateParent(element, typeConcept);
      total_acc = 0;
      total_acc = this.sumTotal(element);
      element.total_amount = total_acc;
      this.setTotalByMonth(element, idx);
    });
  }

  sumTotal(element) {
    let total_acc = 0;
    total_acc = this.checkNumber(element.january);
    total_acc += this.checkNumber(element.february);
    total_acc += this.checkNumber(element.march);
    total_acc += this.checkNumber(element.april);
    total_acc += this.checkNumber(element.may);
    total_acc += this.checkNumber(element.june);
    total_acc += this.checkNumber(element.july);
    total_acc += this.checkNumber(element.august);
    total_acc += this.checkNumber(element.september);
    total_acc += this.checkNumber(element.october);
    total_acc += this.checkNumber(element.november);
    total_acc += this.checkNumber(element.december);
    return total_acc;
  }

  setTotalByMonth(element, idx) {
    let total = 0;
    this.accumulateMonths[idx].january += this.checkNumber(element.january);
    total += this.checkNumber(element.january);
    this.accumulateMonths[idx].february += this.checkNumber(element.february);
    total += this.checkNumber(element.february);
    this.accumulateMonths[idx].march += this.checkNumber(element.march);
    total += this.checkNumber(element.march);
    this.accumulateMonths[idx].april += this.checkNumber(element.april);
    total += this.checkNumber(element.april);
    this.accumulateMonths[idx].may += this.checkNumber(element.may);
    total += this.checkNumber(element.may);
    this.accumulateMonths[idx].june += this.checkNumber(element.june);
    total += this.checkNumber(element.june);
    this.accumulateMonths[idx].july += this.checkNumber(element.july);
    total += this.checkNumber(element.july);
    this.accumulateMonths[idx].august += this.checkNumber(element.august);
    total += this.checkNumber(element.august);
    this.accumulateMonths[idx].september += this.checkNumber(element.september);
    total += this.checkNumber(element.september);
    this.accumulateMonths[idx].october += this.checkNumber(element.october);
    total += this.checkNumber(element.october);
    this.accumulateMonths[idx].november += this.checkNumber(element.november);
    total += this.checkNumber(element.november);
    this.accumulateMonths[idx].december += this.checkNumber(element.december);
    total += this.checkNumber(element.december);
    this.accumulateMonths[idx].total += total;
  }

  lookupRowStyleClass(rowData) {
    return rowData.id_parent === '0' ? 'parent-row' : 'children-row';
  }

  collectFixedConcept() {
    this.concepts = new Observable(observer => {
      this._api.getFixedConcept().subscribe((response) => {
        if (response != null) {

          let childrens = _.filter(response.items, function (o) { return o.id_parent !== '0' }),
            id_parsed: any[] = [];

          this.numConceptFixed = childrens.length;
          childrens.forEach(element => {
            id_parsed.push({ id: element.id_parent });
            id_parsed.push({ id: element.id });
          });
          id_parsed = _.uniqBy(id_parsed, 'id');
          if (!response.items) {
            this._notification.info('Aviso', 'Debe añadir desde Configuración los costes fijos.');
          }
          response.items && response.items.forEach((element, idx) => {
            let isInside = false;
            isInside = _.some(id_parsed, { 'id': element.id });

            if (isInside) {
              _.extend(element, { 'total_amount': 0 });
              _.extend(element, { 'january': 0 });
              _.extend(element, { 'february': 0 });
              _.extend(element, { 'march': 0 });
              _.extend(element, { 'april': 0 });
              _.extend(element, { 'may': 0 });
              _.extend(element, { 'june': 0 });
              _.extend(element, { 'july': 0 });
              _.extend(element, { 'august': 0 });
              _.extend(element, { 'september': 0 });
              _.extend(element, { 'october': 0 });
              _.extend(element, { 'november': 0 });
              _.extend(element, { 'december': 0 });

              this.conceptFixed.push(element);
            }
          });
          this.conceptFixedDifferences = _.cloneDeep(this.conceptFixed);

          this._api.getExpensesFixed('0').subscribe((response) => {
            if (response.status === 'error') {
              this._notification.success('Info', response.msg);
              observer.next(true);
            } else {
              let idxFiltered = null;
              response.items && response.items.forEach(element => {
                idxFiltered = _.findIndex(this.conceptFixed, { 'id': element.id_fixed_concept });
                if (idxFiltered !== -1) {
                  this.conceptFixed[idxFiltered][element.id_month] = element.amount;
                }
              });
              this.accumulateTotal(this.conceptFixed, 0);
              observer.next(true);
            }
          });


        } else {
          this._notification.error("Error!", "Algo ha ido mal obteniendo los costes fijos.");
          observer.next(false);
        }
      });
    });
  }

  collectFixedConceptReal() {
    this._api.getFixedConcept().subscribe((response) => {
      if (response != null) {

        let childrens = _.filter(response.items, function (o) { return o.id_parent !== '0' }),
          id_parsed: any[] = [];

        this.numConceptFixed = childrens.length;
        childrens.forEach(element => {
          id_parsed.push({ id: element.id_parent });
          id_parsed.push({ id: element.id });
        });
        id_parsed = _.uniqBy(id_parsed, 'id');
        response.items && response.items.forEach((element, idx) => {
          let isInside = false;
          isInside = _.some(id_parsed, { 'id': element.id });

          if (isInside) {
            _.extend(element, { 'total_amount': 0 });
            _.extend(element, { 'january': 0 });
            _.extend(element, { 'february': 0 });
            _.extend(element, { 'march': 0 });
            _.extend(element, { 'april': 0 });
            _.extend(element, { 'may': 0 });
            _.extend(element, { 'june': 0 });
            _.extend(element, { 'july': 0 });
            _.extend(element, { 'august': 0 });
            _.extend(element, { 'september': 0 });
            _.extend(element, { 'october': 0 });
            _.extend(element, { 'november': 0 });
            _.extend(element, { 'december': 0 });

            this.conceptFixedReal.push(element);
          }
        });

        this._api.getExpensesFixed('1').subscribe((response) => {

          let idxFiltered = null;
          response.items && response.items.forEach(element => {
            idxFiltered = _.findIndex(this.conceptFixedReal, { 'id': element.id_fixed_concept });
            if (idxFiltered !== -1) {
              this.conceptFixedReal[idxFiltered][element.id_month] = this._common.currencyFormatES(element.amount, false);
            }
          });
          this.accumulateTotal(this.conceptFixedReal, 1);
          this.mergeDifferences();
          this.allConcepts = true;

        });


      } else {
        this._notification.error("Error!", "Algo ha ido mal obteniendo los costes fijos.");
      }
    });
  }

  mergeDifferences() {
    _.forEach(this.conceptFixedDifferences, (element, key) => {
      this.conceptFixedDifferences[key].january = this._common.toFloat(this.conceptFixedReal[key].january) - this._common.toFloat(this.conceptFixed[key].january);
      this.conceptFixedDifferences[key].february = this._common.toFloat(this.conceptFixedReal[key].february) - this._common.toFloat(this.conceptFixed[key].february);
      this.conceptFixedDifferences[key].march = this._common.toFloat(this.conceptFixedReal[key].march) - this._common.toFloat(this.conceptFixed[key].march);
      this.conceptFixedDifferences[key].april = this._common.toFloat(this.conceptFixedReal[key].april) - this._common.toFloat(this.conceptFixed[key].april);
      this.conceptFixedDifferences[key].may = this._common.toFloat(this.conceptFixedReal[key].may) - this._common.toFloat(this.conceptFixed[key].may);
      this.conceptFixedDifferences[key].june = this._common.toFloat(this.conceptFixedReal[key].june) - this._common.toFloat(this.conceptFixed[key].june);
      this.conceptFixedDifferences[key].july = this._common.toFloat(this.conceptFixedReal[key].july) - this._common.toFloat(this.conceptFixed[key].july);
      this.conceptFixedDifferences[key].august = this._common.toFloat(this.conceptFixedReal[key].august) - this._common.toFloat(this.conceptFixed[key].august);
      this.conceptFixedDifferences[key].september = this._common.toFloat(this.conceptFixedReal[key].september) - this._common.toFloat(this.conceptFixed[key].september);
      this.conceptFixedDifferences[key].october = this._common.toFloat(this.conceptFixedReal[key].october) - this._common.toFloat(this.conceptFixed[key].october);
      this.conceptFixedDifferences[key].november = this._common.toFloat(this.conceptFixedReal[key].november) - this._common.toFloat(this.conceptFixed[key].november);
      this.conceptFixedDifferences[key].december = this._common.toFloat(this.conceptFixedReal[key].december) - this._common.toFloat(this.conceptFixed[key].december);
      this.conceptFixedDifferences[key].total_amount = this._common.toFloat(this.conceptFixedReal[key].total_amount) - this._common.toFloat(this.conceptFixed[key].total_amount);
    });

    let parents = _.filter(this.conceptFixedDifferences, (value) => {
      return value.id_parent === '0';
    });
    this.resetTotalMonths(2);
    _.forEach(parents, (element) => {

      this.accumulateParent(element, this.conceptFixedDifferences);
      let total_acc = 0;
      total_acc = this.sumTotal(element);
      element.total_amount = total_acc;
      this.setTotalByMonth(element, 2);
    });

  }

  analize(accountNumber, name) {
    this.analysisMonths = [];
    if (accountNumber) {
      let estimatedVal = _.filter(this.conceptFixed, { 'account_number': accountNumber }),
        realVal = _.filter(this.conceptFixedReal, { 'account_number': accountNumber }),
        differencesVal = _.filter(this.conceptFixedDifferences, { 'account_number': accountNumber });

      this.convertCurrency(estimatedVal[0]);
      this.analysisMonths.push(Object.assign({}, estimatedVal[0]));
      this.analysisMonths[0].name_concept = 'Presupuestados';

      this.convertCurrency(realVal[0]);
      this.analysisMonths.push(Object.assign({}, realVal[0]));
      this.analysisMonths[1].name_concept = 'Reales';

      this.convertCurrency(differencesVal[0]);
      this.analysisMonths.push(Object.assign({}, differencesVal[0]));
      this.analysisMonths[2].name_concept = 'Desviación';

      this.nameToAnalysis = name;
      this.displayAnalize = true;
      this.sendValuesChart();
    }
  }

  convertCurrency(type) {
    type.total_amount = this._common.currencyFormatES(type.total_amount);
    type.january = this._common.currencyFormatES(type.january);
    type.february = this._common.currencyFormatES(type.february);
    type.march = this._common.currencyFormatES(type.march);
    type.april = this._common.currencyFormatES(type.april);
    type.may = this._common.currencyFormatES(type.may);
    type.june = this._common.currencyFormatES(type.june);
    type.july = this._common.currencyFormatES(type.july);
    type.august = this._common.currencyFormatES(type.august);
    type.september = this._common.currencyFormatES(type.september);
    type.october = this._common.currencyFormatES(type.october);
    type.november = this._common.currencyFormatES(type.november);
    type.december = this._common.currencyFormatES(type.december);
  }

  sendValuesChart() {
    this.lineChartData = [{ data: [], label: 'Presupuestados' }, { data: [], label: 'Reales' }, { data: [], label: 'Diferencias' }];
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].january, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].february, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].march, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].april, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].may, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].june, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].july, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].august, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].september, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].october, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].november, true));
    this.lineChartData[0].data.push(this._common.toFloat(this.analysisMonths[0].december, true));

    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].january, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].february, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].march, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].april, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].may, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].june, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].july, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].august, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].september, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].october, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].november, true));
    this.lineChartData[1].data.push(this._common.toFloat(this.analysisMonths[1].december, true));

    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].january, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].february, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].march, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].april, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].may, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].june, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].july, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].august, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].september, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].october, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].november, true));
    this.lineChartData[2].data.push(this._common.toFloat(this.analysisMonths[2].december, true));
  }

  closeChart() {
    this.lineChartData = [{ data: [], label: 'Presupuestados' }, { data: [], label: 'Reales' }, { data: [], label: 'Diferencias' }];
    this.showChart = false;
  }

  replaceComma(type, month) {
    type[month] = type[month].replace('.', ',');
  }

  resetClass(value) {
    if (value.which === 13 || value.which === 9) {
      value.target.className = '';
    } else {
      value.target.className = 'dirty';
    }
  }
  log($event, col, valcode, idx) {
    console.log($event, col, valcode, idx);
  }

  blurred(value, previous, type, month, onTable: Boolean = false) {
    if (value.target.className.indexOf('dirty') > -1) {
      type[month] = previous;
      this._notification.success('Información', 'Pulsa Enter o Tabulador para almacenar el valor');
    }
    if (onTable) {
      type[month] = this._common.currencyFormatES(value.currentTarget.value, false);
    }
  }

  dataTableOnBlur(event, col, rowData, rowIndex, dt) {
    if (event.which === 13 || event.which === 9) {
      dt.onEditComplete.emit({ column: col, data: rowData, index: rowIndex });
      dt.switchCellToViewMode(event.target);
    }
  }
}
