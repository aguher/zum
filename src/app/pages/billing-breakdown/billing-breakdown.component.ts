import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ActivatedRoute } from '@angular/router';

import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';

import { environment } from 'environments/environment';
import base64Img from 'base64-img';

declare var jsPDF: any; // Important

import { ApiService } from '../../services/api.service';
import { Configuration } from '../../api/configuration';

import { Common } from '../../api/common';
import * as _ from 'lodash';
import { timeout } from 'q';
import { forEach } from '@angular/router/src/utils/collection';

const URL_UPLOAD_LOGO = environment.urlLogoUpload;

var splitRegex = /\r\n|\r|\n/g;
jsPDF.API.textEx = function (text: any, x: number, y: number, hAlign?: string, vAlign?: string) {
    var fontSize = this.internal.getFontSize()
        / this.internal.scaleFactor;

    // As defined in jsPDF source code
    var lineHeightProportion = 1.15;

    var splittedText: string[];
    var lineCount: number = 1;
    if (vAlign === 'middle' || vAlign === 'bottom'
        || hAlign === 'center' || hAlign === 'right') {

        splittedText = typeof text === 'string'
        ? text.split(splitRegex)
        : text;

        lineCount = splittedText.length || 1;
    }

    // Align the top
    y += fontSize * (2 - lineHeightProportion);

    if (vAlign === 'middle') y -= (lineCount / 2) * fontSize;
    else if (vAlign === 'bottom') y -= lineCount * fontSize;


    if (hAlign === 'center'
        || hAlign === 'right') {

        var alignSize = fontSize;
        if (hAlign === 'center') alignSize *= 0.5;

        if (lineCount > 1) {
            for (var iLine = 0; iLine < splittedText.length; iLine++) {
                this.text(splittedText[iLine],
                    x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
                    y);
                y += fontSize;
            }
            return this;
        }
        x -= this.getStringUnitWidth(text) * alignSize;
    }

    this.text(text, x, y);
    return this;
};


@Component({ selector: 'billing-breakdown', templateUrl: './billing-breakdown.component.html', styleUrls: ['./billing-breakdown.component.scss'] })


export class BillingBreakdownComponent implements OnInit, OnDestroy {

  @Input() selectAddr;
  
  idBill = null;
  infoBilling = null;
  addresses = null;
  old = null;
  originalSubconceptsStandard = [];
  subconcepts_standard: string[] = [];
  isreadonly = false;

  taxes = [];
  selectedTax:string = '0%';

  selectedSource = null;
  source = null;
  tmpDate = null;
  tmpField = null;

  fieldDate = null;
  updateDate = null;
  itemsToRemove = [];
  info: any = {};
  myDatePickerOptions = null;
  issue_date_budget = null;
  issue_date = null;
  due_date_budget = null;
  due_date = null;
  po_field = null;
  contact_field = null;

  showDateWrong: boolean = false;
  lines = [];
  subtotal = {
    budget_total: 0
  };
  total = {
    budget_total: 0
  };
  fee = {
    id: null,
    budget: {
      amount: 0,
      units: 0,
      price: 0,
      total: 0
    }
  };
  serie = '';
  numberId = 0;
  tax_base = 0;

  listProjects = null;
  listBudgets = null;
  constructor(private _api: ApiService, private _common: Common, private _config: Configuration, private _notification: NotificationsService,private route: ActivatedRoute,) { }

  onScroll() {
    var nav = document.getElementById('header-cloned');
    if (nav) {
      if (window.pageYOffset > 365) {
        nav
          .classList
          .add("show");
      } else {
        nav
          .classList
          .remove("show");
      }
    }
  }
  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }
  ngOnInit() {

    window.addEventListener('scroll', this.onScroll);
    this._api.getTaxesValue().subscribe(response => {
         response.data.forEach(element => {
        this.taxes.push({label: `${element.value} %`, value: element.value});
      });
    })
    this.myDatePickerOptions = this._config.myDatePickerOptions;
    this.route.params.subscribe(params => {
      this.idBill= +params['id'];
      this._api.getInfoBilling(`${this.idBill}`).subscribe(response=>{
        this.serie = response.serie.serie;
        this.selectedTax = response.bill.percent_tax;
        this.infoBilling = response.bill;
        if (response.bill.id_export != 0){
          this.isreadonly = true;
        }
        this.getSubconceptsStandard();
        this.getLinesSubconcept();
        this.addresses = response.address;
        if (this.addresses.length > 0){
          //pongo como primera opción la dirección de la empresa
          let direccion = {
            id: -1,
            city: (this.infoBilling.address_bis ? this.infoBilling.address_bis : this.infoBilling.city),
            postal_code: (this.infoBilling.address_bis ? '' : this.infoBilling.postal_code),
            address: this.infoBilling.address,
            Nombre: this.infoBilling.customer_name
          }
          this.addresses.splice(0,0,direccion);
          if (this.infoBilling.id_address != -1) this.changeAddress(this.infoBilling.id_address, false);
        }
      });
    });

  }

  changeAddress(valor, bSelect){
    this.addresses.forEach((item) => {
      if (valor == item.id){
        this.infoBilling.address = item.address;
        this.infoBilling.city = item.city;
        this.infoBilling.postal_code = item.postal_code; 
      }
    }
    );

    this.infoBilling.id_address = valor;

    if (bSelect){

      this
      ._api
      .updateInfoBill("id_Address", valor, this.idBill).subscribe(response => {
        if(response.status === 'ok') {
          this._notification.success('Factura', 'Se ha modificado la dirección.');
        } else {
          this._notification.error('Error', 'No se ha podido actualizar la direccion');
        }
      });

    }
  }

  getSubconceptsStandard() {
    let id_customer = this.infoBilling.id_customer;
    let body = `id_customer=${id_customer}`;

    this._api.getSubconceptsStandards(body).subscribe(response => {
      this.originalSubconceptsStandard = response.data;
    })
  }

  searchSubconceptsStandards(event) {
    let text = event.query;
    let id_customer = this.infoBilling.id_customer;
    let body = `id_customer=${id_customer}&text=${text}`;

    this._api.getSubconceptsStandards(body).subscribe(response => {
      let array_values = [];
      response.data.forEach(element => {
        array_values.push(element.name);
      });

      this.subconcepts_standard = array_values;
    })

  }

  getLinesSubconcept() {
    this.lines = [];
    this
      ._api
      .getSubconceptsBillings(this.idBill)
      .subscribe((response) => {
        this.info = response.info_billing && response.info_billing.length && response.info_billing[0];

        this.issue_date = response.info_billing[0].issue_date;
        this.due_date = response.info_billing[0].due_date;
        let issueDate = this
          ._common
          .getDateParsed(response.info_billing[0].issue_date),
          dueDate = this
            ._common
            .getDateParsed(response.info_billing[0].due_date);

        this.issue_date = {
          date: {
            year: issueDate[0],
            month: issueDate[1],
            day: issueDate[2]
          }
        };
        this.due_date = {
          date: {
            year: dueDate[0],
            month: dueDate[1],
            day: dueDate[2]
          }
        };

        this.po_field = response.info_billing[0].PO;
        this.contact_field = response.info_billing[0].contact;
        this.infoBilling.contact = response.info_billing[0].contact;

        _.forEach(response.items, (element, key) => {
          this
            .lines
            .push({
              id: element.id,
              name: element.name,
              account: element.account_number,
              subconcepts: [],
              budget: {
                amount: 0,
                units: 0,
                price: 0,
                total: 0
              }
            });
        });
        if (response.subconcepts) {
          response
            .subconcepts
            .forEach((element) => {
              let varConcept = _.find(this.lines, (inner) => {
                return inner.id === element.id_variable_concept;
              });
              let total_budget = element.amount * element.unit_budget * element.price;

              varConcept.budget.amount += this
                ._common
                .toFloat(element.amount);
              varConcept.budget.units += this
                ._common
                .toFloat(element.unit_budget);
              varConcept.budget.price += this
                ._common
                .toFloat(element.price);
              varConcept.budget.total += this
                ._common
                .toFloat(element.amount) * this
                  ._common
                  .toFloat(element.unit_budget) * this
                    ._common
                    .toFloat(element.price);

              varConcept
                .subconcepts
                .push({
                  id: element.id,
                  name: element.name,
                  budget: {
                    amount: this
                      ._common
                      .currencyFormatES(element.amount, false),
                    units: this
                      ._common
                      .currencyFormatES(element.unit_budget, false),
                    price: this
                      ._common
                      .currencyFormatES(element.price, false),
                    total: this
                      ._common
                      .currencyFormatES(total_budget, false)
                  }
                });
            });
        }
        let tmp = {
          budget: {
            amount: 0,
            units: 0,
            price: 0,
            total: 0
          }
        };

        if (response.fee && response.fee.length) {
          tmp.budget.amount = response.fee[0].amount;
          tmp.budget.units = response.fee[0].unit_budget;
          tmp.budget.price = response.fee[0].price;
          tmp.budget.total = tmp.budget.amount * tmp.budget.units * tmp.budget.price;

          this.fee.id = response.fee[0].id;
        }

        this.fee.budget.amount = this
          ._common
          .currencyFormatES(tmp.budget.amount, false);
        this.fee.budget.units = this
          ._common
          .currencyFormatES(tmp.budget.units, false);
        this.fee.budget.price = this
          ._common
          .currencyFormatES(tmp.budget.price, false);
        this.fee.budget.total = this
          ._common
          .currencyFormatES(tmp.budget.total);

        this.calculateTotals();
      });
  }


  updateSubconcept(subconcept, event, field, blurDescription = false) {

    let value = '';
    let price = null;
    let parsed = null;
    let parsedPrice = null;

    if ((blurDescription && event.target) || (event && event.target && field !== 'name') || (!event.target && field === 'name')) {
      value = (event.target) ? event.target.value : event;
      if (field !== 'name') {
        parsed = this
          ._common
          .toFloat(event.target.value);
      } else {
        parsed = value;
      }

      price = this.originalSubconceptsStandard.filter(element => {
        return element.name === value;
      });
      // significa que hemos encontrado un subconcepto standard y hay que cambiar dos
      // valores en la BBDD, el precio y el nombre
      if (price.length) {
        parsedPrice = price[0].unit_price;
        subconcept.budget.price = (price[0]) ? this
          ._common
          .currencyFormatES(price[0].unit_price, false) : '0,00';
      }


      return new Promise((resolve) => {
        let parsed = null;
        if (field !== 'name') {
          parsed = this
            ._common
            .toFloat(event.target.value);
        } else {
          parsed = value;
        }
        this
          ._api
          .updateSubconceptBilling(subconcept.id, field, parsed, parsedPrice, this.idBill)
          .subscribe((response) => {
            if (response.status == 'ok') {
              subconcept[field] = value;
              this
                ._notification
                .success('Actualizado', response.msg);
              this.calculateTotalLine(subconcept, field, value);
              resolve(response.status);
            }
          });

      });
    }
    else {
      return new Promise((reject) => { reject(null); });
    }
  }

  updateFee(fee, event, field, type_table, id) {
    return new Promise((resolve) => {
      let parsed = this
        ._common
        .toFloat(event.target.value);

      this
        ._api
        .updateFee(fee.id, field, parsed, type_table, id)
        .subscribe((response) => {
          if (response.status == 'ok') {
            this
              ._notification
              .success('Actualizado', response.msg);
            this.calculateTotalLine(fee, field, parsed, true);
            resolve(response);
          }
        });
    });
  }

  addSubconcept(index) {
    let idVariableConcept = this.lines[index].id;
    this
      ._api
      .addSubconceptBilling(this.idBill, idVariableConcept)
      .subscribe((response) => {
        this
          .lines[index]
          .subconcepts
          .push({
            id: response.items.id,
            name: '',
            budget: {
              amount: 1,
              units: 1,
              price: 0,
              total: 0
            }
          });
      })
  }

  removeSubconcept(id, idx, id_inner) {
    this
      ._api
      .removeSubconceptBilling(id)
      .subscribe((response) => {
        this
          .lines[idx]
          .subconcepts
          .splice(id_inner, 1);
        if (response.status === 'ok') {
          this
            ._notification
            .success('Eliminado', response.msg);
          this.calculateTotals();
          this.calculateHeadersLine();
        } else {
          this
            ._notification
            .error('Error', response.msg);
        }
      });
  }

  calculateHeadersLine() {
    this
      .lines
      .forEach(line => {
        line.budget.amount = 0;
        line.budget.units = 0;
        line.budget.price = 0;
        line.budget.total = 0;


        line
          .subconcepts
          .forEach(subconcept => {
            line.budget.amount += this
              ._common
              .toFloat(subconcept.budget.amount);
            line.budget.units += this
              ._common
              .toFloat(subconcept.budget.units);
            line.budget.price += this
              ._common
              .toFloat(subconcept.budget.price);
            line.budget.total += this
              ._common
              .toFloat(subconcept.budget.total);
          });

      });

  }

  calculateTotalLine(subconcept, field, value, isFee: boolean = false) {
    let total_budget = this
      ._common
      .toFloat(subconcept.budget.amount) * this
        ._common
        .toFloat(subconcept.budget.units) * this
          ._common
          .toFloat(subconcept.budget.price);


    subconcept.budget.total = total_budget;
    this.tax_base = this.fee.budget.total + this.subtotal.budget_total;
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = {
      budget_total: 0,
    };
    this
      .lines
      .forEach((items) => {
        items
          .subconcepts
          .forEach((inner) => {
            subtotal.budget_total += this
              ._common
              .toFloat(inner.budget.total);

          });
      });

    this.subtotal.budget_total = subtotal.budget_total;

    this.total.budget_total = (subtotal.budget_total + this
      ._common
      .toFloat(this.fee.budget.total)) * ((parseFloat(this.selectedTax)/100) +1);

    this.tax_base = this._common.checkNumber(this.fee.budget.total) + this.subtotal.budget_total;
  }

  resetClass(value) {
    if (value.which === 13 || value.which === 9) {
      value.target.className = '';
    } else {
      value.target.className = 'dirty';
    }
  }
  blurred(event, previous, value, type, field) {
    if (event.target.className.indexOf('dirty') > -1) {
      value[type][field] = this
        ._common
        .currencyFormatES(previous, false);
      this
        ._notification
        .info('Información', 'Pulsa Enter o Tabulador para almacenar el valor');
    }
  }

  changeInput(subconcept, event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = 'entertabeado';
      this
        .updateSubconcept(subconcept, event, field)
        .then((response) => {
          this.calculateHeadersLine();
          if (event.which === 13) {
            event
              .target
              .blur();
          }
        });
    }
  }
  changeInputFee(fee, event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = 'entertabeado';

      this
        .updateFee(fee, event, field, 'bill', this.idBill)
        .then((response) => {
          if(response['value_id']) {
            this.fee.id = response['value_id'];
          }
          if (event.which === 13) {
            event
              .target
              .blur();
          }
        });
    }
  }
  changeTaxes(e) {
    this._api.updateTaxBilling(e.value, this.idBill).subscribe(response => {
      if(response.status === 'ok') {
        this._notification.success('Impuestos', 'Se ha modificado el porcentaje.');
        this.calculateTotals();
      } else {
        this._notification.error('Error', 'No se ha podido actualizar el porcentaje');
      }
    })
  }

  onDateChanged(event: IMyDateModel, field) {
    let updateDate = `${event.date.year}-${event.date.month}-${event.date.day}`;
    let cmpStart = null,
      cmpEnd = null;

    this.tmpDate = { date: this[field]['date'] };
    this.tmpField = field;
    let yearSelected = JSON.parse(localStorage.getItem('selectedFiscalYear')).label;
    if (event.date.year !== parseInt(yearSelected)) {
      this._notification.error('Error', `La fecha seleccionada debe estar dentro del año ${yearSelected}`);
      event.date = this[field].date;
      setTimeout(() => {
        this[field] = { date: this[field]['date'] };
      }, 100);

      return false;
    }

    if (field === 'issue_date') {
      cmpStart = new Date(updateDate);
      cmpEnd = new Date(`${this.due_date.date.year}-${this.due_date.date.month}-${this.due_date.date.day}`);
    } else {
      cmpStart = new Date(`${this.issue_date.date.year}-${this.issue_date.date.month}-${this.issue_date.date.day}`);
      cmpEnd = new Date(updateDate);
    }
    if (cmpStart > cmpEnd) {
      this
        ._notification
        .error('Fechas', 'La fecha de inicio no puede ser mayor que la de fin.');
      event.date = this[field].date;
      setTimeout(() => {
        this[field] = { date: this[field]['date'] };
      }, 100);
    } else {
      this
        ._api
        .updateInfoBill(field, updateDate, this.idBill)
        .subscribe((response) => {
          if (response.status === 'ok') {
            let dateUpdated = new Date(this[field].jsdate);
            let dd:any = dateUpdated.getDate();
            let mm:any = dateUpdated.getMonth()+1; //January is 0!
            let yyyy = dateUpdated.getFullYear();
            if(dd<10){
                dd = `0${dd}`;
            }
            if(mm<10){
                mm = `0${mm}`;
            }
            let parseUpdate = `${yyyy}-${mm}-${dd}`;

            this.infoBilling[field] = parseUpdate;
            this
              ._notification
              .success('Fecha de factura', 'Se ha guardado satisfactoriamente.');
          }
        });
    }

  }

  cancelChangeDates() {
    this[this.tmpField] = this.tmpDate;
    this.showDateWrong = false;
  }

  changeDates() {
    let ids = '';
    this.itemsToRemove.forEach((element) => {
      ids += `${element.id},`;
    })
    ids = ids.replace(/,$/, '');
    this._api.deleteDatesLines(ids).subscribe((response) => {
      if (response.status === 'ok') {
        this
          ._api
          .updateInfoBudget(this.fieldDate, this.updateDate, this.idBill)
          .subscribe((response) => {
            if (response.status === 'ok') {
              this
                ._notification
                .success('Fecha de presupuesto', 'Se ha guardado satisfactoriamente.');
            }
            this.showDateWrong = false;
          });
      }
    });

  }
  changeInfoBill(event, field) {
   if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = 'entertabeado';
      
      this.infoBilling[field] = event.target.value;
      this
        ._api
        .updateInfoBill(field, event.target.value, this.idBill)
        .subscribe((response) => {
          if (response.status === 'ok') {
            this
              ._notification
              .success('Campo PO', 'Se ha guardado satisfactoriamente.');
            event.target.blur();
          }
        });

    }
  }

  blurValidity(event,campo) {
    if (event.currentTarget.className !== 'entertabeado') {
      this._notification.error('Aviso', 'Para guardar el ' + campo + ' utiliza Tab o Intro.');
    }
  }
  drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, infoBilling, po_field) {
    // HEADER
    doc.setFontSize(23);
    doc.addImage(imgData, 'JPEG', 1, 1, 1.5, 1.5);
    doc.setTextColor(65, 142, 229);
    doc.text(12, 1.5, 'Factura');
    doc.setTextColor(121, 118, 119);
    doc.setTextColor(121, 118, 119);
    doc.setFontSize(9);
    doc.setFontType("bold");

    doc.text(12, 2.2, `Num. factura: ${this.serie}-${this._common.completeNumber(infoBilling.number)}`);
    let issueDate = new Date(infoBilling.issue_date);
    let dueDate = new Date(infoBilling.due_date);
    if (infoBilling.issue_date !== '0000-00-00') {
      doc.text(12, 2.7, 'Fecha de emisión: ' + this._common.parseDatefromDate(`${issueDate.getMonth() + 1}-${issueDate.getDate()}-${issueDate.getFullYear()}`));
    }
    doc.text(12, 3.2, `P.O.: ${po_field}`);
    if (infoBilling.due_date !== '0000-00-00') {
        doc.text(12, 3.7, 'Fecha de vencimiento: ' + this._common.parseDatefromDate(`${dueDate.getMonth() + 1}-${dueDate.getDate()}-${dueDate.getFullYear()}`));
    }


    doc.setFontType("normal");
    let cname = (infoBilling.customer_name) ? infoBilling.customer_name : '';
    doc.text(1, 3, cname);
    let ccif = infoBilling.cif ? infoBilling.cif : '';
    doc.text(1, 3.5, ccif);
    let caddress = infoBilling.address ? infoBilling.address : '';
    doc.text(1, 4, caddress);
    let caddressBis = infoBilling.address_bis ? infoBilling.address_bis : '';
    doc.text(1, 4.5, caddressBis);
    // FOOTER
    doc.setFontSize(30);
    doc.setFillColor(231, 232, 234);
    doc.rect(0, 27, 21, 2.7, 'F');
    doc.setTextColor(83, 83, 83);
    doc.setFontSize(13);
    doc.text(3.5, 27.8, dataCompany.name);
    doc.setFontSize(10);
    doc.text(3.5, 28.3, dataCompany.cif);
    doc.text(3.5, 28.8, dataCompany.address);
    doc.text(3.5, 29.3, dataCompany.address_bis);
    doc.setFillColor(205, 205, 205);
    doc.rect(17, 27, 4, 2.7, 'F');
    doc.triangle(17, 27, 17, 29.7, 12.5, 29.7, 'F');
    doc.addImage(imgDataCompany, 'JPEG', 1, 27.35, 2, 2);

  }


/*    exportPDF() {
    let base_imponible = 0;
    let maxLines = 27;
    let doc = new jsPDF('p', 'cm');
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;
    let urlCompany = (dataCompany.logo != 'undefined') ? URL_UPLOAD_LOGO + dataCompany.logo : URL_UPLOAD_LOGO + 'placeholder.jpg';
    var imgDataCompany = null;
    var url = (this.infoBilling.logo != 'undefined') ?
      URL_UPLOAD_LOGO + this.infoBilling.logo : URL_UPLOAD_LOGO + 'placeholder.jpg';

    base64Img.requestBase64(urlCompany, (err, res, body) => {
      imgDataCompany = body;
      base64Img.requestBase64(url, (err, res, body) => {
        var imgData = body;
        let printedLines = 1;

        this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
        doc.setFontSize(10);
        let first: any = 6.5;
        let stripped = 0;
        doc.setTextColor(121, 118, 119);
        doc.text(0.6, 5.5, 'Concepto');
        doc.text(12, 5.5, 'Cantidad');
        doc.text(14, 5.5, 'Unidad');
        doc.text(16, 5.5, 'Precio Unit.');
        doc.text(18, 5.5, 'Total');
        this
          .lines
          .forEach((line, idx) => {
            stripped = 0;
            if (line.subconcepts.length) {
              if (printedLines > maxLines) {
                printedLines = 1;
                doc.addPage();
                first = 6.5;
                this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
              }
              doc.setFillColor(65, 142, 229);
              doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
              doc.setTextColor(255, 255, 255);
              let lengthOfPage = 11;
              //looping thru each text item

              let splitTitle = doc.splitTextToSize(line.name, lengthOfPage);

              //loop thru each line and output while increasing the vertical space
              if (splitTitle.length === 1) {
                doc.text(0.6, first, splitTitle[0]);
              } else {
                printedLines += splitTitle.length - 1;
                if (printedLines > maxLines) {
                  printedLines = 1;
                  doc.addPage();
                  first = 6.5;
                  this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
                }
                for (let i = 0, stlength = splitTitle.length; i < stlength; i++) {
                  doc.setFillColor(65, 142, 229);
                  doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                  doc.setTextColor(255, 255, 255);
                  doc.text(0.6, first, splitTitle[i]);
                  first += 0.7;
                }
                first -= 0.7;
              }

              doc.text(12, first, this._common.currencyFormatES(line.budget.amount, false));
              doc.text(14, first, this._common.currencyFormatES(line.budget.units, false));
              doc.text(16, first, this._common.currencyFormatES(line.budget.price));
              doc.text(18, first, this._common.currencyFormatES(line.budget.total));
              base_imponible += parseFloat(line.budget.total);
              first += 0.7;
              printedLines += 1;
              line
                .subconcepts
                .forEach((subconcept, id_inner) => {
                  printedLines += 1;
                  if (printedLines > maxLines) {
                    printedLines = 1;
                    doc.addPage();
                    doc.setFillColor(65, 142, 229);
                    first = 6.5;
                    doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                    doc.setTextColor(255, 255, 255);

                    //looping thru each text item
                    let splitTitle = doc.splitTextToSize(line.name, lengthOfPage);

                    //loop thru each line and output while increasing the vertical space
                    if (splitTitle.length === 1) {
                      doc.text(0.6, first, splitTitle[0]);
                    } else {
                      printedLines += splitTitle.length - 1;
                      if (printedLines > maxLines) {
                        printedLines = 1;
                        doc.addPage();
                        first = 6.5;
                        this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
                      }
                      for (let i = 0, stlength = splitTitle.length; i < stlength; i++) {
                        printedLines += 1;
                        if (printedLines > maxLines) {
                          printedLines = 1;
                          doc.addPage();
                        }
                        doc.setFillColor(65, 142, 229);
                        doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.text(0.6, first, splitTitle[i]);
                        first += 0.7;
                      }
                      first -= 0.7;
                    }

                    first += 0.7;
                    printedLines += 1;
                    this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
                  }

                  if (stripped % 2) {
                    doc.setFillColor(245, 245, 245);
                  } else {
                    doc.setFillColor(255, 255, 255);
                  }
                  stripped += 1;

                  doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                  doc.setTextColor(80, 80, 80);

                  let splitTitle = doc.splitTextToSize(subconcept.name, lengthOfPage);

                  // Loop sobre los SUBCONCEPTOS
                  if (splitTitle.length === 1) {
                    doc.text(0.6, first, splitTitle[0]);
                  } else {
                    printedLines += splitTitle.length - 1;
                    if (printedLines > maxLines) {
                      printedLines = 1;
                      doc.addPage();
                      first = 6.5;
                      this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
                      // VOLVEMOS A PINTAR EL CONCEPTO VARIABLE PADRE
                      doc.setFillColor(65, 142, 229);
                      doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                      doc.setTextColor(255, 255, 255);

                      let splitTitle = doc.splitTextToSize(line.name, lengthOfPage);

                      //loop thru each line and output while increasing the vertical space
                      if (splitTitle.length === 1) {
                        doc.text(0.6, first, splitTitle[0]);
                      } else {
                        printedLines += splitTitle.length - 1;
                        if (printedLines > maxLines) {
                          printedLines = 1;
                          doc.addPage();
                          first = 6.5;
                          this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
                        }
                        for (let i = 0, stlength = splitTitle.length; i < stlength; i++) {
                          printedLines += 1;
                          if (printedLines > maxLines) {
                            printedLines = 1;
                            doc.addPage();
                          }
                          doc.setFillColor(65, 142, 229);
                          doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                          doc.setTextColor(255, 255, 255);
                          doc.text(0.6, first, splitTitle[i]);
                          first += 0.7;
                        }
                        first -= 0.7;
                      }
                      // FIN : pintar concepto variable padre
                    }
                    for (let i = 0, stlength = splitTitle.length; i < stlength; i++) {
                      if (stripped % 2) {
                        doc.setFillColor(245, 245, 245);
                      } else {
                        doc.setFillColor(255, 255, 255);
                      }
                      doc.rect(0.5, first - 0.5, 20, 0.7, 'F');
                      doc.setTextColor(80, 80, 80);
                      doc.text(0.6, first, splitTitle[i]);
                      first += 0.7;
                    }
                    first -= 0.7;
                  }

                  doc.text(12, first, this._common.currencyFormatES(subconcept.budget.amount, false));
                  doc.text(14, first, this._common.currencyFormatES(subconcept.budget.units, false));
                  doc.text(16, first, this._common.currencyFormatES(subconcept.budget.price));
                  doc.text(18, first, this._common.currencyFormatES(subconcept.budget.total));
                  first += 0.7;
                });
              if (printedLines > maxLines) {
                printedLines = 1;
                doc.addPage();
                first = 6.5;
                this.drawHeaderFooterPDF(doc, imgData, imgDataCompany, dataCompany, this.infoBilling, this.po_field);
              }
            }

          });
        first += 0.7;
        doc.setTextColor(121, 118, 119);
        doc.setLineWidth(0.015);
        doc.setDrawColor(163, 163, 163);



        first += 1;
        doc.setTextColor(121, 118, 119);
        doc.setLineWidth(0.015);
        doc.setDrawColor(163, 163, 163);

        let base = base_imponible + this._common.checkNumber(this.fee.budget.total);
        let tax = base  * ((parseFloat(this.selectedTax)/100));
        doc.text(14, first, 'Base imponible:');
        doc.text(18, first, this._common.currencyFormatES(base));

        first += 1;

        doc.text(14, first, `IVA (${this.selectedTax} %):`);
        doc.text(18, first, this._common.currencyFormatES(tax));


        first += 1;
        doc.text(14, first, 'Total:');
        doc.text(18, first, this._common.currencyFormatES(this.total.budget_total));
        first += 0.7;

        doc.save(`factura-${String(this.infoBilling.number).trim()}.pdf`);
        this
          ._notification
          .success('Exportación', 'Se ha creado el archivo PDF.');
     });
   });
  }  */

  
  pintarComunesPaginas(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas){

    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;
    let frasepedidocliente;
    let bPintarlineas = true;
    let bMostrarTelefono = true;
    let bMostrarCif = false;
    let alto_cabecera = 1;
    let complemento_cuadroppal = 0;
    let linea_unidades = 3.5;


    switch (dataCompany.id){
      case "410": 
        frasepedidocliente = "FACTURA PROFORMA";
        bMostrarCif = true;
        linea_unidades = 14.5;        
       break;
      case "411": 
        frasepedidocliente = "";
        bPintarlineas = false;
        bMostrarTelefono = false;
        bMostrarCif = true;
        alto_cabecera = 0.6;
        complemento_cuadroppal = 0.2;
       break;
      case "408": default: 
        frasepedidocliente = "Pedido Cliente";
    }
  
    doc.setFontSize(9);
    doc.setLineWidth(borde_lineas);

    let datos_compania=[];

    datos_compania.push(dataCompany.name);
    if (bMostrarCif){
        datos_compania.push(dataCompany.cif); 
    }
    datos_compania.push(dataCompany.address);
    datos_compania.push( dataCompany.address_bis);
    if (bMostrarTelefono){
      datos_compania.push("Tel.: " + dataCompany.phone); 
    }

    let sumalinea = 0
    datos_compania.forEach(element => {   
      doc.text(2.2,5+sumalinea, element);
      sumalinea+=0.5;
    });

    let fecha = this.infoBilling.issue_date.split("-");
    let fechavto;

    if (this.infoBilling.due_date == "0000-00-00"){
      let fechavencimiento = new Date(fecha[0],fecha[1],fecha[2]);
      fechavencimiento.setDate(fechavencimiento.getDate()+60);
      fechavto = fechavencimiento.toLocaleDateString("es-ES");
    }else {
      fechavto = this.infoBilling.due_date.split("-")[2] + "/" + this.infoBilling.due_date.split("-")[1] + "/" + this.infoBilling.due_date.split("-")[0]
    }

    //textos informativos de la factura
    doc.setFontType("bold");
    doc.text(2.2,8,"Nº Factura:");
    doc.text(5.2,8,this.infoBilling.numbertext + (this.infoBilling.id_rect != 0 ? ' (abona Fra. ' + this.infoBilling.numbertext_rect + ')' : ''));  
    doc.text(2.2,8.5,"Fecha Factura:");
    doc.text(2.2,9,"Vencimiento:");    
    doc.text(2.2,9.5,"Nº Cliente:");        
    doc.setFontType("normal");  
    doc.text(5.2,8.5,fecha[2]+"/"+fecha[1]+"/"+fecha[0]);
    doc.text(5.2,9,fechavto);    
    doc.text(5.2,9.5,this.infoBilling.id_customer);  

    //textos sobre el cliente

    let cliente=[];
  
    cliente.push(this.infoBilling.customer_name);
    this.infoBilling.address.split('\n').forEach(element => {
      if (element != "")
      cliente.push(element);
    });
    
    if (this.infoBilling.city){
      cliente.push((this.infoBilling.postal_code  ? this.infoBilling.postal_code + ' ' :' ') + (this.infoBilling.city ? this.infoBilling.city : ''));       
    }else {
      cliente.push(this.infoBilling.address_bis);
    }
  
    cliente.push('CIF: ' +  this.infoBilling.cif);
 
    if (this.infoBilling.contact != ''){
      cliente.push('Contacto: ' + this.infoBilling.contact);
      //doc.textEx('Contacto: ' + this.infoBilling.contact,21-margen_dch,6.9,'right','bottom');      
    }


    doc.setFontType("bold");
    sumalinea = 0
    cliente.forEach(element => {
      doc.textEx(element,21-margen_dch,4.5+sumalinea,'right','top');    
      sumalinea+=0.6;
    });


    //rectángulo principal y su línea vertical de los totales
    this.pintarRectanguloFactura(doc,inicio_cuadro+complemento_cuadroppal,margen_izq,margen_dch,alto_cabecera,altura_cuadro);
    if (bPintarlineas){
      doc.line(linea_unidades,inicio_cuadro,linea_unidades,inicio_cuadro+altura_cuadro);              
      doc.line(21-margen_dch-ancho_importes,inicio_cuadro,21-margen_dch-ancho_importes,inicio_cuadro+altura_cuadro);          
    }

    //cuadro principal
    //esto es demasiado diferente, pongo los casos uno a uno
    switch (dataCompany.id){
      case "410": 
        doc.setTextColor(255);      
        doc.text(7,inicio_cuadro+0.6,"CONCEPTO");
        doc.text(14.7,inicio_cuadro+0.6,"UNIDADES");   
        doc.text(17,inicio_cuadro+0.6,"IMPORTE");
        doc.setTextColor(0);              
        break;
      case "411":
        doc.setTextColor(255);
        doc.text(2.5,inicio_cuadro+0.6,"Concepto");
        doc.text(17,inicio_cuadro+0.6,"Importe");
        doc.setTextColor(0);
        break;
      case "408": default:
        doc.text(2.5,inicio_cuadro+0.6,"Un."); 
        doc.text(8.5,inicio_cuadro+0.6,"Concepto");
        doc.text(17,inicio_cuadro+0.6,"Importe");
        break;
    }

    doc.setFontType("normal"); 
    if (this.infoBilling.PO){
      doc.textEx(`Su Referencia: ${this.infoBilling.PO}`, 19,8.9,'right','bottom');
    }
    doc.textEx(`Ntra. Ref.: Pedido ${this.infoBilling.ped_code}`,19,9.5,'right','bottom');

    if (this.infoBilling.numcampana){
      doc.textEx(`Nº Campaña: ${this.infoBilling.numcampana}`,13,9.5,'right','bottom');
    }
   
    //última línea al final de la factura
    doc.setFontSize(7);
    doc.setFontType("normal");
    if (dataCompany.rgpd){
      doc.text(1.5, 25, dataCompany.credits, null, 90);      
    }else{
      doc.text(4, 28, dataCompany.credits);
    }
  }

  pintarRectanguloFactura(doc, altopagina, margenizq,margendch,altocabecera,altototal){

    //el color del fondo varía según cual sea la empresa
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

    switch (dataCompany.id){
      case "408": case "413": doc.setFillColor(205, 205, 205); break;
      case "410": doc.setFillColor(73, 43, 7); break;
      case "411": doc.setFillColor(0, 153, 153); break;      
      default: doc.setFillColor(73, 43, 7)
    }
    

    doc.rect(margenizq, altopagina, 21-margendch-margenizq, altocabecera,'F');

    if (dataCompany.id != 411){
      //líneas horizontales
      doc.line(margenizq,altopagina,21-margendch,altopagina);
      doc.line(margenizq,altopagina+altocabecera,21-margendch,altopagina+altocabecera);
      doc.line(margenizq,altopagina+altototal,21-margendch,altopagina+altototal);

      //líneas verticales
      doc.line(margenizq,altopagina,margenizq,altopagina+altototal);
      doc.line(21-margendch,altopagina,21-margendch,altopagina+altototal);
    }  
  }

/*    getImgFromUrl(logo_url, callback) {
    var img = new Image();
    img.src = logo_url;
    img.onload = function () {
        callback(img);
    };
} 

 generatePDF(img){
  var options = {orientation: 'p', unit: 'mm'};
  var doc = new jsPDF(options);
  doc.addImage(img, 'JPEG', 0, 0, 100, 50);
  doc.save(`factura-cuculete.pdf`);
  this
    ._notification
    .success('Exportación', 'Se ha creado el archivo PDF.');
  
}

  exportPDF(){
    var logo_url = "/assets/6bcb8547a629cc099c48f7dd50093db1.jpg";
    this.getImgFromUrl(logo_url, function (img) {
        this.generatePDF(img);
    });

  } */


  exportPDFDurbanity(){

    let doc = new jsPDF('p', 'cm');

    //empezamos con la cabecera de la factura
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.setTextColor(227, 15, 95);
    doc.text(12, 1.2, "DURBANITY EVENTOS S.L.");

    doc.setFontType("normal");
    doc.setTextColor(0);
    doc.setFontSize(9);

    doc.text(12,2,"C/ Amado Nervo, 5, local ext.");
    doc.text(12,2.5,"28007 Madrid");
    doc.text(12,3,"Cif: B-87698767");

    doc.text(17,2,"T/Fax. 910561973");
    doc.text(17,2.5,"info@durbanity.com");
    doc.text(17,3,"www.durbanity.com");
    //fin de la cabecera

    //cabecera de número de factura 
    doc.setFontSize(18);
    doc.setFontType("bold");
    doc.setTextColor(227, 15, 95);
    doc.text(2, 6, "FACTURA");

    // establecer el color de relleno en verde
    doc.setDrawColor(227, 15, 95);
    doc.setLineWidth(0.01);

    doc.rect(1.5,7.5,3,0.7,"S");
    doc.rect(1.5,8.5,11.2,1,"S");
    doc.rect(5,7.3,7.2,2.8,"S");
    doc.rect(8.5,7,3.5,2.7,"S");




    //fin de cabecera de número de factura

    doc.save(`factura-${String(this.infoBilling.number).trim()}.pdf`);
    this
      ._notification
      .success('Exportación', 'Se ha creado el archivo PDF.');
  }

  exportPDF() {
    debugger;
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;
    if (dataCompany.id === "416") {
      this.exportPDFDurbanity();
    }else{
      this.exportPDFCommon();
    }
  }

  exportPDFCommon(){
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

    let doc = new jsPDF('p', 'cm');
    let margen_izq= 2;
    let margen_dch = 2;
    let inicio_cuadro = 10;
    let maximo_linea = 80;
    let altura_cuadro = 9.5;
    let borde_lineas = 0.05;
    let ancho_importes = 2.5;
    let urlCompany = (dataCompany.logo != 'undefined') ? URL_UPLOAD_LOGO + dataCompany.logo : URL_UPLOAD_LOGO + 'placeholder.jpg';
    let imgDataCompany = null;
    let anchoimagen = 4.64;
    let bPintarlineas = true;
    let bCapitalizar = false;
    let textoEnunciadoBlanco = false;
    let sumaysiguederecha = 21-margen_dch-ancho_importes-0.2;


    switch (dataCompany.id){
      case "410": 
        textoEnunciadoBlanco = true;      
        bCapitalizar = true;
        sumaysiguederecha = 14;
        altura_cuadro = 12;
        break;
      case "411": 
        textoEnunciadoBlanco = true;
        anchoimagen =1.8; 
        altura_cuadro = 11.2;        
        bPintarlineas = false;
        bCapitalizar = true;
        break;
      case "408": default:   
    } 


    base64Img.requestBase64(urlCompany, (err, res, body) => {

      imgDataCompany = body; 
      doc.addImage(imgDataCompany, 'JPEG',2.3, 1, anchoimagen ,3.36);
      doc.setLineWidth(borde_lineas);

    this.pintarComunesPaginas(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);   

 
    doc.setFontType("normal");
    doc.setFontSize(9);
   
    let altura_texto = inicio_cuadro+1.6;
    let importeparcial = 0;
    //escribo las líneas


    this
    .lines
    .forEach((line, idx) => {
      line.subconcepts.forEach((sub, otroidx) => {
         let texto = sub.name.split('\n');
         let texto_lineas = [];
         let linea = "";
         texto.forEach((txt,j) => {
          let frase = txt.split(' ');
          let cuentaletras = 0;
          frase.forEach((palabra:string,i) => {
            cuentaletras += palabra.length+1;
            if (cuentaletras > maximo_linea){
              texto_lineas.push(linea);
              cuentaletras = palabra.length+1;
              linea = "";
            }
            linea += palabra + " ";

          });
          if (linea != "") texto_lineas.push(linea);  
          linea = "";   
          cuentaletras = 0;     
         });


//        if (parseInt(sub.budget.total) != 0){
          let pintaunidades = true;
          texto_lineas.forEach((line) => { 

            if (altura_texto > (inicio_cuadro+altura_cuadro-2)) {

              doc.setFontType("italic");
              doc.textEx("Suma y sigue en página siguiente >>",sumaysiguederecha,inicio_cuadro+altura_cuadro-0.5,'right','bottom');    
              doc.textEx(this._common.currencyFormatES(importeparcial,false), 18.8,inicio_cuadro+altura_cuadro-0.5,'right','bottom');               
             
              doc.addPage();
  
              altura_texto = inicio_cuadro+1.6;
              doc.textEx("<< Suma y sigue de página anterior",sumaysiguederecha,altura_texto,'right','bottom');  
              doc.textEx(this._common.currencyFormatES(importeparcial,false), 18.8, altura_texto, 'right','bottom');                                       
  
              doc.setFontType("normal");
  
              altura_texto = altura_texto+1;
              
              doc.addImage(imgDataCompany, 'JPEG',2.3, 1, anchoimagen ,3.36);
              this.pintarComunesPaginas(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);
              doc.setFontType("normal");
              doc.setFontSize(9);
             
            }


            switch (dataCompany.id){
              case "410": 
                if (pintaunidades) doc.textEx(sub.budget.amount,16.3,altura_texto+0.06,'right','bottom');                    
                doc.text(margen_izq+0.2,altura_texto,line);
                if (pintaunidades) doc.textEx(this._common.currencyFormatES(sub.budget.total,false),18.8,altura_texto+0.06,'right','bottom');           
                break;
              case "411": 
                doc.text(margen_izq+0.2,altura_texto,line);
                if (pintaunidades) doc.textEx(this._common.currencyFormatES(sub.budget.total,false),18.8,altura_texto+0.06,'right','bottom');  
                break;
              case "408": default:  
                if (pintaunidades) doc.textEx(sub.budget.amount,3.45,altura_texto+0.06,'right','bottom');                    
                doc.text(margen_izq+1.7,altura_texto,line);
                if (pintaunidades) doc.textEx(this._common.currencyFormatES(sub.budget.total,false),18.8,altura_texto+0.06,'right','bottom');            
            } 
            altura_texto += 0.4;
            if (pintaunidades){
                //quitar cuando tenga tiempo
                if (typeof(sub.budget.total) == "number"){
                  importeparcial += sub.budget.total;
                }else{
                  importeparcial += parseFloat(sub.budget.total.toString().replace(".","").replace(",",".")); 
                }
              //importeparcial += parseFloat(sub.budget.total.replace(".","").replace(",",".")); 
              pintaunidades = false;
            }
          }); 
//        }
        altura_texto += 0.7; 
      }
    )
  });


    //parte no homogeneizada: por cada empresa un if

    if (dataCompany.id == 410){
        //cuadro principal 


      //resumen factura y sus líneas verticales
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,2);
      doc.line(14.3,inicio_cuadro+altura_cuadro+0.3,14.3,inicio_cuadro+altura_cuadro+2.3);
      doc.line(7.3,inicio_cuadro+altura_cuadro+0.3,7.3,inicio_cuadro+altura_cuadro+2.3);          
      doc.line(9.7,inicio_cuadro+altura_cuadro+0.3,9.7,inicio_cuadro+altura_cuadro+2.3);   
      
      //forma de pago
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3+2.5,margen_izq,margen_dch,0.6,2.6);
        
      doc.setFontType("normal");   
        
    
        //resumen factura       
        doc.setTextColor(255);   
        doc.text(3.6,inicio_cuadro+altura_cuadro+0.7,"TOTAL BASE");
        doc.text(7.6,inicio_cuadro+altura_cuadro+0.7,"% I.V.A.");
        doc.text(11,inicio_cuadro+altura_cuadro+0.7,"CUOTA I.V.A.");
        doc.text(15.4,inicio_cuadro+altura_cuadro+0.7,"TOTAL FACTURA");    
        doc.setTextColor(0);   
        
    
  
        let base = this.tax_base;
        let tax = base  * ((parseFloat(this.selectedTax)/100));
    
        doc.text(4,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(base));
        doc.text(7.8,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(this.selectedTax,false) + '%' );
        doc.text(11.5,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(tax));
         doc.textEx(this._common.currencyFormatES(this.total.budget_total),17.8,inicio_cuadro+altura_cuadro+1.3,'right','middle');
            
        
      //texto de la forma de pago
      doc.setTextColor(255);            
      doc.setFontType("bold");
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+3.2, "FORMA DE PAGO: Contado, Talón Bancario o Transferencia");
      doc.setFontType("normal");
      //doc.setFontType("italic");
  
      doc.setTextColor(0);      
      
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+4.2, "Banco Popular:");
      doc.text(margen_izq+2.8, inicio_cuadro+altura_cuadro+4.2, "0075-0125-49-0601693526");
      doc.text(margen_izq+9.2, inicio_cuadro+altura_cuadro+4.2, "IBAN: ES38-0075-0125-4906-0169-3526");
      
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+5.0, "Caixabank:");
      doc.text(margen_izq+2.8, inicio_cuadro+altura_cuadro+5.0, "2100-1663-72-0200311635");
      doc.text(margen_izq+9.2, inicio_cuadro+altura_cuadro+5.0, "IBAN: ES83-2100-1663-7202-0031-1635");
  
    }else if (dataCompany.id == 411){
            //resumen factura y sus líneas verticales
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,2);
      
      //resumen factura  
      doc.setTextColor(255);      
      doc.text(3.6,inicio_cuadro+altura_cuadro+0.7,"TOTAL BASE");
      doc.text(7.6,inicio_cuadro+altura_cuadro+0.7,"% I.V.A.");
      doc.text(11,inicio_cuadro+altura_cuadro+0.7,"CUOTA I.V.A.");
      doc.text(15.4,inicio_cuadro+altura_cuadro+0.7,"TOTAL FACTURA");
      doc.setTextColor(0);
      

      let base = this.tax_base;
      let tax = base  * ((parseFloat(this.selectedTax)/100));

      doc.text(4,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(base));
      doc.text(7.8,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(this.selectedTax,false) + '%' );
      doc.text(11.5,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(tax));
      doc.textEx(this._common.currencyFormatES(this.total.budget_total),17.8,inicio_cuadro+altura_cuadro+1.3,'right','middle');
      
      doc.setFontType("bold");   

      //forma de pago
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3+3.5,margen_izq,margen_dch,0.6,4.1);

      doc.setTextColor(255);
      //texto de la forma de pago
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+4.2, "Forma de pago:");
      doc.setFontType("normal");
      doc.text(margen_izq+3.2, inicio_cuadro+altura_cuadro+4.2, "Pago por transferencia");
      doc.setFontType("italic");
      doc.setTextColor(0);
      
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+5.2, "Cheque o Transferencia:");
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+6.0, "BANKINTER - IBAN ES47 0128 0064 3101 0005 7637");


    }else{
      //resumen factura y sus líneas verticales
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,2);
      doc.line(14.3,inicio_cuadro+altura_cuadro+0.3,14.3,inicio_cuadro+altura_cuadro+2.3);
      doc.line(7.3,inicio_cuadro+altura_cuadro+0.3,7.3,inicio_cuadro+altura_cuadro+2.3);          
      doc.line(9.7,inicio_cuadro+altura_cuadro+0.3,9.7,inicio_cuadro+altura_cuadro+2.3);   
      
      //rectángulos inferiores de resumen factura
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+2.32,4.7,13.7,0,0.5);
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+2.31,11.2,6.7,0,0.5);
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+2.3,16,margen_dch,0,0.5);

      
      //resumen factura    
      doc.text(3.6,inicio_cuadro+altura_cuadro+0.8,"TOTAL BASE");
      doc.text(7.6,inicio_cuadro+altura_cuadro+0.8,"% I.V.A.");
      doc.text(11,inicio_cuadro+altura_cuadro+0.8,"CUOTA I.V.A.");
      doc.text(15.4,inicio_cuadro+altura_cuadro+0.8,"TOTAL FACTURA");
  
      let base = this.tax_base;
      let tax = base  * ((parseFloat(this.selectedTax)/100));
  
      doc.text(4,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(base));
      doc.text(7.8,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(this.selectedTax,false) + '%' );
      doc.text(11.5,inicio_cuadro+altura_cuadro+1.5,this._common.currencyFormatES(tax));
      doc.textEx(this._common.currencyFormatES(this.total.budget_total),17.8,inicio_cuadro+altura_cuadro+1.3,'right','middle');
      
      doc.setFontType("bold");   
      doc.text(2.2,inicio_cuadro+altura_cuadro+2.7,"TOTAL BASE");
      doc.text(9.1,inicio_cuadro+altura_cuadro+2.7,"TOTAL IVA");
      doc.text(14.5,inicio_cuadro+altura_cuadro+2.7,"TOTAL");
  
      //inferior resumen factura
      doc.textEx(this._common.currencyFormatES(base),7,inicio_cuadro+altura_cuadro+2.56,'right','middle');    
      doc.textEx(this._common.currencyFormatES(tax),14,inicio_cuadro+altura_cuadro+2.56,'right','middle');
      doc.textEx(this._common.currencyFormatES(this.total.budget_total),18.7,inicio_cuadro+altura_cuadro+2.56,'right','middle');
  
      //forma de pago
      this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3+3.5,margen_izq,margen_dch,0.6,4.1);

  
      //texto de la forma de pago
      doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+4.2, "Forma de pago:");
      doc.setFontType("normal");
      doc.text(margen_izq+3.2, inicio_cuadro+altura_cuadro+4.2, "Pago por transferencia");
      doc.setFontType("italic");
  
      if (dataCompany.id == 408){
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+5.2, "Cheque o Transferencia:");
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+6.0, "CAIXABANK - IBAN ES12 2100 3780 5122 0004 3857");
/*         doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+6.8, "OPEN BANK - IBAN ES06 0073 0100 5104 3611 1140");
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+7.6, "BANKINTER - IBAN ES79 0128 0064 33 0500005423"); */
      } else if (dataCompany.id == 413){
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+5.2, "Términos de pago: Pago por transferencia 30 días fecha factura");
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+6.0, "Cuenta Banco de Santander GOBERCOMPLIANCE S.L.");
        doc.text(margen_izq+0.2, inicio_cuadro+altura_cuadro+6.8, "IBAN ES24 0049 6208 5829 1605 7470");
      }
    }

      if (dataCompany.rgpd){
        doc.setFontSize(7); 
        doc.text(2, 27.7, dataCompany.rgpd);     
      }
                       
      doc.save(`factura-${String(this.infoBilling.number).trim()}.pdf`);
      this
        ._notification
        .success('Exportación', 'Se ha creado el archivo PDF.');

     }); // fin de la imagen
    
  }



}
