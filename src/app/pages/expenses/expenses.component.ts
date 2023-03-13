import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationsService} from 'angular2-notifications';


import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
import {SelectItem} from 'primeng/primeng';

import {TokenService} from '../../services/token.service';
import {ApiService} from '../../services/api.service';
import {Common} from '../../api/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Configuration} from '../../api/configuration';

import * as _ from "lodash";
import { isNull, isDate } from 'util';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {

  @ViewChild('inputSearch')inputSearch;
  exportaciones:any;

  orden='id';
  ordsentido=true;

  displayDialogDeleteExportation: boolean = false;
  showNewExport:boolean = false;
  selectedExportation : any = null;
  exportation_date;
  agregarexp = false;

  noExpenses:boolean = false;
  arrpages= [];
  totalbaseimponible :number;
  totaliva :number;
  totaltotal :number;
  totalretenciones: number;
  hoy:Date =  new Date();
  nuevoClienteOculto = true;
  taxes=[];

  filtrocodigo:any;
  filtrodescripcion:any;
  filtrofecha:any;
  filtrovencimiento:any;
  filtroproveedor:any;
  filtronumpedido:any;
  filtropedido:any;
  filtroccoste:any;
  filtrobaseimponible: any;
  filtroiva: any;
  filtrototal: any;
  filtroretencion: any;
  filtronumfactura: any;  
  cabeceraNuevoGasto;
  tabSeleccionada = 1;

  status : SelectItem[];
  pagination : number;
  numPage: number= 1;
  idSelected : number = null;
  compraorigen = null;
  expenses : any = [];
  expensesfiltrados: any = [];
  gastosexportacion: any = [];

  selectedExpense : any = null;
  cachedExpense: any = {};
  newCampaign : any = {
    campaign_code: '',
    campaign_name: '',
    create_date_model: {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth()+1,
        day: this.hoy.getDate()
      }
    },
    end_date_model: {
      date: {
/*         year: endDate[0],
        month: endDate[1],
        day: endDate[2] */
        year: 2099,
        month: 12,
        day: 31
      }
    }
  };
  displayDialog : boolean = false;
  displayDialogNew : boolean = false;
  displayDialogCliente: boolean = false;
  titulodialog:string;
  selectedCustomer: any;
  displayPagination : boolean = false;
  displayDialogDelete : boolean = false;
  msgDelete : string = '¿Estás seguro de eliminar el gasto?';
  emptyMsg : string = "No hay gastos añadidas. Añade tu primer gasto en el formulario anterior";
  model : any = {
    expensesName: '',
    accountNumber: '',
    parent_account: '',
    type: null
  };
  autoNumbered = true;
  roleUser: number = 0;
  showInput: boolean = true;
  types : any[] = [];
  parentAccounts : any[] = [];
  dataCombos : any = {
    customers: [],
    all_concepts: [],
    pedidos: [],
    customerscif: [],
    pedidosnum: []
  };
  showCol : boolean = false;
  choosenCompany: boolean = false;
  valueInputSearch = '';
  focus = '';

  dataSelects : any = [];

  myDatePickerOptions = this._config.myDatePickerOptions;

  // Initialized to specific date (09.10.2019).
  private modelDate : Object = {
    date: {
      year: this.hoy.getFullYear(),
      month: 10,
      day: 9
    }
  };

  constructor(private _notification : NotificationsService, private _api : ApiService, private _auth : AuthenticationService, private _router : Router, private _config : Configuration, private _common : Common, private _token : TokenService) {
    let lsCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    let lsYear = JSON.parse(localStorage.getItem('selectedFiscalYear'));

    lsCompany = (lsCompany) ? lsCompany.label: '';
    lsYear = (lsYear) ? lsYear.label: '';

    if (lsCompany === '' || lsYear === '') {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    _common
    .searchChanged$
    .subscribe((value) => {
      this.changeSearchInput(value);
    });
  }


  setFocus( fieldToFocus: string ) : void {

    this.focus = fieldToFocus;

}

  ngOnInit() {

    this.exportation_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth()+1,
        day: this.hoy.getDate()
      }
    };

    this.selectedExpense={
      id:-1
    }
    this.showInput = (parseInt(this._token.getInfo().role) >= 6) ? false : true;
    this._api.getTaxesValue().subscribe(response => {
          response.data.forEach(element => {
        this.taxes.push({label: `${element.value} %`, value: element.id, valor: element.value});
      });
    });
    let infoUser : any = this
      ._token
      .getInfo();

    this.roleUser = parseInt(infoUser.role);
    this.status = [];
    this
      .status
      .push({label: 'Presupuesto', value: 'Presupuesto'});
    this
      .status
      .push({label: 'Pedido', value: 'Pedido'});
    this
      .status
      .push({label: 'Finalizado', value: 'Finalizado'});
    this.pagination = 10;
    this._api.isAutoNumbered().subscribe(response => {
      this.autoNumbered = parseInt(response.autoNumbered) === 1 ? true: false;
    });

    this.getExpensesandExportations();

    this
    .dataCombos
    .pedidosnum
    .push({ label: '' , value: -2 });

      this
      .dataCombos
      .pedidos
      .push({ label: 'Gastos Generales' , value: -2 });

    this
      ._api
      .getDataCombos()
      .subscribe((response) => {
        if (response.status !== 'error') {
          this.dataSelects = response;
          response
            .providers
            .forEach((element) => {
              this
                .dataCombos
                .customers
                .push({ label: element.customer_name, value: element.id, description: element.DescriptionProvider, default_variable_concept: element.default_variable_concept, default_fixed_concept: element.default_fixed_concept });
                this
                .dataCombos
                .customerscif
                .push({ label: element.CIF, value: element.id });
            });
            response
            .pedidos
            .forEach((element) => {
              this
                .dataCombos
                .pedidos
                .push({ label:  element.campaign_name , value: element.id });//ement.ped_code + ' - ' +
                this
                .dataCombos
                .pedidosnum
                .push({ label:  element.ped_code , value: element.id });//ement.ped_code + ' - ' +
            });
          response 
            .all_concepts
            .forEach((element) => {
              this
                .dataCombos
                .all_concepts
                .push({ label: element.name, value: element.id });
            });
        }

      });

    this.setPermissions(infoUser.role);

  }

  getExpensesandExportations(){
    this
      ._api
      .getExpenses()
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
            this
              ._auth
              .logout();
            this
              ._router
              .navigate(['/login']);
          } else if (response.status === 'error') {
            this
              ._notification
              .error("Aviso!", response.msg);
            this.noExpenses = true;
          } else {
            this.expenses = response.items;
            this.filtrar();
            this.displayPagination = (this.expenses.length > this.pagination);
            this.noExpenses = false;
          }
        }
      });
      
    this._api.getExportationsExpenses().subscribe(response => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          //this._notification.error("Aviso!", response.msg);
        } else {
          this.exportaciones = response.items;
        }       
      }     
    });
  }

  exportExportation(exportacion):void {
    let exportData = [];
    let ws_name = '';

    exportData = this.fillExcelDataExportation(exportacion.id);
    ws_name = 'Hoja 1';

    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(exportData);

    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;


    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      };
      return buf;
    }
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `${exportacion.file}`);

    
  }  

  fillExcelDataExportation(exportacion) {
    let exportData = [];
    //let indiceasiento = 0;
    this.gastosexportacion.forEach((line) => {
      if (line.id_export == exportacion ){


    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

        if (dataCompany.id != 411){
          exportData.push({
            'Num Factura': line.number.toString(),
            'Fecha Factura': this._common.getFecha(new Date(line.date)),
            'Cuenta Cliente': line.customer_account,
            'Nombre Cliente': line.customer_name,
            'Cif Cliente':  line.customer_cif,
            'iva4cuentabase': '',
            'base4': 0,
            'cuota4': 0,
            'iva10cuentabase': '',
            'base10': 0,
            'cuota10': 0,
            'iva21cuentabase': '',
            'base21':this._common.getDecimals(line.amount,2,true),
            'cuota21': this._common.getDecimals(line.iva,2,true) ,
            'TIPO05': '',	
            'TIPO14': '',	
            'TIPO52': '',	
            'CUENTAivanodeducible':'',
            'IMPORTEivanodeducible':'',
            'PERCEPCION':'',
            'RETENCION': '',
            'Total factura': this._common.getDecimals(line.total,2,true),
            'ivaexcuentabase': '',
            'baseex': 0,
            'cuotaex': 0,
            'cobro cuenta':'',
            'Vencimiento': this._common.getFecha(new Date(line.due_date))
          })
        }else{
    
       exportData.push({
        'Serie': '',
        'Factura': line.number,
        'Fecha': this._common.getFecha(new Date(line.date)),
        'FechaOperacion': this._common.getFecha(new Date(line.date)),
        'CodigoCuenta':  line.customer_account ,
        'CIFEUROPEO': line.customer_cif, //(line.customer_cif == null ?'': line.customer_cif.toString().trim().replace(/./g, '').replace(/,/g, '')),
        'Cliente': line.customer_name,
        'Comentario SII': line.description,
        'Contrapartida': line.concept_account,
        'CodigoTransaccion':'',
        'ClaveOperaciónFact':1,
        'Importe Factura': this._common.getDecimals(line.total,2,true) + ' €',
        'Base Imponible1': this._common.getDecimals(line.amount,2,true) + ' €',
        '%Iva1': 21,
        'Cuota Iva1': this._common.getDecimals(line.iva,2,true) + ' €',
        '%RecEq1': '',
        'Cuota Rec1': '',
        'CodigoRetencion': '',
        'Base Ret': '',
        '%Retención': '',
        'Cuota Retención': '',
        'Base Imponible2': '',
        '%Iva2': '',
        'Cuota Iva2': '',
        '%RecEq2': '',
        'Cuota Rec2': '',
        'Base Imponible3': '',
        '%Iva3':'',
        'Cuota Iva3':'',
        '%RecEq3':'',
        'Cuota Rec3':'',          
        'TipoRectificativa': '',
        'ClaseAbonoRectificativas': '',
        'EjercicioFacturaRectificada':'',
        'SerieFacturaRectificada': '',
        'NumeroFacturaRectificada':	'',
        'FechaFacturaRectificada': '',
        'BaseImponibleRectificada': '',
        'CuotaIvaRectificada': '',
        'RecargoEquiRectificada': '',
        'NumeroFacturaInicial': '',
        'NumeroFacturaFinal': '',
        'IdFacturaExterno': '',
        'Codigo Postal': (line.postal_code == 0 ? '': line.postal_code), 
        'Cod. Provincia': (line.postal_code == 0 ? '': line.postal_code.substring(0,2)),
        'Provincia': line.city,
        'CodigoCanal'	:'',
        'CodigoDelegación': '',
        'CodDepartamento': '',
        'CodProy': line.ped_code,
        'Fecha Vencimiento': this._common.getFecha(new Date(line.due_date))
      })
 
    }      
  }
    });
  

    return exportData;
  }  

  parseDeletedExportacion(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.exportaciones, (o) => {
        return o.id == this.idSelected;
      });
      this
        .exportaciones
        .splice(idx, 1);
      this.exportaciones = [...this.exportaciones];
      this.displayDialogDeleteExportation = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha eliminado la exportación');
        this.gastosexportacion.forEach((fact) => {
          if (fact.id_export == this.idSelected) fact.id_export = 0;
        })
    } else {
      this.displayDialogDeleteExportation = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }

    this.getExpensesandExportations();
  }

  parseCreatedExportation(response) {
    if (response.status === 'ok') {
      this
        ._notification
        .success('¡Éxito!', 'Se ha creado la exportación número ' + response.number);
        this.showNewExport = false;
        this.gastosexportacion.forEach((fact) => {
          if (fact.id_export == 0) fact.id_export = response.number;
        })

    } else {
      this 
        ._notification
        .error('¡Error!', response.msg);
    }
    this.getExpensesandExportations();
  }

  updateBI() {
    let valor =  _.findIndex(this.taxes, (o) => {
      return o.value == this.selectedExpense.id_tax;
    });
    this.selectedExpense.total = this.selectedExpense.total.replace(",",".");
    this.selectedExpense.amount = this._common.getDecimals(this.selectedExpense.total/(100+parseFloat(this.taxes[valor].valor))*100,2,false);
    this.selectedExpense.iva = this._common.getDecimals(this.selectedExpense.total-this.selectedExpense.total/(100+parseFloat(this.taxes[valor].valor))*100,2,false);
    this.updateRetencion();
  }

  updateTotal() {
    let valor =  _.findIndex(this.taxes, (o) => {
      return o.value == this.selectedExpense.id_tax;
    });
    this.selectedExpense.amount = this.selectedExpense.amount.replace(",",".");
    this.selectedExpense.total = this._common.getDecimals(this.selectedExpense.amount*(100+parseFloat(this.taxes[valor].valor))/100,2,false);
    this.selectedExpense.iva = this._common.getDecimals(this.selectedExpense.amount*(parseFloat(this.taxes[valor].valor))/100,2,false);
    this.updateRetencion();
  }

  
  updateIva() {
    this.selectedExpense.amount = this.selectedExpense.amount.replace(",",".");
    this.selectedExpense.iva = this.selectedExpense.iva.replace(",",".");
    this.selectedExpense.total = this._common.getDecimals(parseFloat(this.selectedExpense.amount)+parseFloat(this.selectedExpense.iva),2,false);
  }

  
  updateRetencion() {
    this.selectedExpense.retention = this._common.getDecimals(this.selectedExpense.amount*(parseFloat(this.selectedExpense.percent_retention))/100,2,false);
  }

  deleteExportation(item){
    this.displayDialogDeleteExportation = true;
    this.selectedExportation = item;
  }

  openExportation(exportacion){
    this.exportExportation(exportacion);
  }

  deleteExp(item){
    this.idSelected = parseInt(item.id, 10);
    this
      ._api
      .deleteExportationExpenses(this.idSelected)
      .subscribe((response) => this.parseDeletedExportacion(response));
  }


  createExportation(){
    let billingsDate = `${this.exportation_date.date.year}-${this.exportation_date.date.month}-${this.exportation_date.date.day}`;
      this
      ._api
      .createExportationExpenses(billingsDate)
      .subscribe((response) => {
        this.parseCreatedExportation(response);
       } );    
  }


/*   togglefiltroPtesFacturar(){
    this.filtroPtesFacturar = !this.filtroPtesFacturar;
    if(this.filtroPtesFacturar){
      this.filtronumero="";
      this.filtrogasto ="";
      this.filtrocliente="";
      this.filtrofechainicio="";
      this.tabSeleccionada=2;
    }
    this.filtrar();
  } */

  filtrar(){
    this.expensesfiltrados = [];
    let filtrocod:string = (this.filtrocodigo == undefined ? "" : this.filtrocodigo);
    let filtrofech:string = (this.filtrofecha == undefined ? "" : this.filtrofecha);
    let filtroven:string = (this.filtrovencimiento == undefined ? "" : this.filtrovencimiento);
    let filtrodesc:string = (this.filtrodescripcion == undefined ? "" : this.filtrodescripcion);
    let filtroprov:string = (this.filtroproveedor == undefined ? "" : this.filtroproveedor);
    let filtroped:string = (this.filtropedido == undefined ? "" : this.filtropedido);
    let filtrocco:string = (this.filtroccoste == undefined ? "" : this.filtroccoste);
    let filtrobi:string = (this.filtrobaseimponible == undefined ? "" : this.filtrobaseimponible);
    let filtroiv:string = (this.filtroiva == undefined ? "" : this.filtroiva);
    let filtrott:string = (this.filtrototal == undefined ? "" : this.filtrototal);
    let filtronpd:string = (this.filtronumpedido == undefined ? "" : this.filtronumpedido);
    let filtroret:string = (this.filtroretencion == undefined ? "" : this.filtroretencion);
    let filtronfc:string = (this.filtronumfactura == undefined ? "" : this.filtronumfactura);    


    for (let i= 0; i < this.expenses.length; i++){
       if (this._common.getCleanedString(this.expenses[i].id).indexOf(this._common.getCleanedString(filtrocod)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].date).indexOf(this._common.getCleanedString(filtrofech)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].due_date).indexOf(this._common.getCleanedString(filtroven)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].description).indexOf(this._common.getCleanedString(filtrodesc)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].customer_name).indexOf(this._common.getCleanedString(filtroprov)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].campaign_name).indexOf(this._common.getCleanedString(filtroped)) >= 0 &&    
        this._common.getCleanedString(this.expenses[i].concept_name).indexOf(this._common.getCleanedString(filtrocco)) >= 0 &&       
        this._common.getDecimals(this.expenses[i].amount,2,true).indexOf(this._common.getCleanedString(filtrobi)) >= 0 &&
        this._common.getDecimals(this.expenses[i].iva,2,true).indexOf(this._common.getCleanedString(filtroiv)) >= 0 &&
        this._common.getDecimals(this.expenses[i].total,2,true).indexOf(this._common.getCleanedString(filtrott)) >= 0 &&
        this._common.getCleanedString(this.expenses[i].ped_code).indexOf(this._common.getCleanedString(filtronpd)) >= 0 &&    
        this._common.getCleanedString(this.expenses[i].number).indexOf(this._common.getCleanedString(filtronfc)) >= 0 &&       
        this._common.getDecimals(this.expenses[i].retention,2,true).indexOf(this._common.getCleanedString(filtroret)) >= 0 
        ){
            this.expensesfiltrados.push(this.expenses[i]);
       }
    }
    this.paginarysumar();
  }

  paginarysumar(){
    this.arrpages = [];
    this.totalbaseimponible = 0;
    this.totaliva = 0;
    this.totaltotal = 0;
    this.totalretenciones = 0;


    for (let i=0; i < this.expensesfiltrados.length;i++){
      if (i%this.pagination == 0){
        this.arrpages.push(i/this.pagination+1);
      }
      
      this.totalbaseimponible += parseFloat(this.expensesfiltrados[i].amount);
      this.totaliva += parseFloat(this.expensesfiltrados[i].iva); 
      this.totaltotal += parseFloat(this.expensesfiltrados[i].total);
      this.totalretenciones += parseFloat(this.expensesfiltrados[i].retention);              

    }

    let eventosimulado:any= [];
    eventosimulado.srcElement = [];
    eventosimulado.srcElement.id = this.orden;
    this.ordsentido = !this.ordsentido;
    this.ordenar(eventosimulado);

  }

  changeSearchInput(value : string) {
    this.inputSearch.nativeElement.value = value;
    this
      .inputSearch
      .nativeElement
      .dispatchEvent(new Event('keyup'));
  }

  setPermissions(role) {
    switch (role) {
      case '4':
      case '6':
      case '7':
      case '8':
        this.showCol = false;
        break;
      case '3':
      case '5':
        this.showCol = true;
        break;
    }
  }

  lookupRowStyleClass(rowData) {
    return rowData.security_level === 'Alto'
      ? 'high-security'
      : 'low-security';
  }

  changeCustomer(e) {
    let groups = _.filter(this.dataSelects.groups, (element) => {
      return element.id_customer === e.value
    });
    this.dataCombos.groups = [];
    this.dataCombos.subgroups = [];
    groups.forEach((element) => {
      this
        .dataCombos
        .groups
        .push({label: element.name, value: element.id});
    });
  }

  changeGroup(e) {
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === e.value
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this
        .dataCombos
        .subgroups
        .push({label: element.name, value: element.id});
    });
  }

  changeTeam(e) {
    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === e.value
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this
        .dataCombos
        .users
        .push({label: element.nickname, value: element.id});
    });
  }

  selectExpense(expense=null,bClonar= false) {
    this.displayDialog = true;
    if (expense){
      this.selectedExpense= _.cloneDeep(expense);
      this.cachedExpense = expense;
      let fecha =  this.selectedExpense.date.split('-');
      this.selectedExpense.date = {
        date: {
          year: parseInt(fecha[0]),
          month: parseInt(fecha[1]),
          day: parseInt(fecha[2])
          }
      }
      if (this.selectedExpense.due_date){
      fecha = this.selectedExpense.due_date.split('-');
        this.selectedExpense.due_date = {
          date: {
            year: parseInt(fecha[0]),
            month: parseInt(fecha[1]),
            day: parseInt(fecha[2])
            }
        }
      }
      if (bClonar){
        this.titulodialog = "Clonar compra";
        this.selectedExpense.id = -1;
      }else{
        this.titulodialog = "Detalle de la compra";
      }
    }else{
      this.titulodialog = "Insertar nueva compra";
      this.selectedExpense = {
        id:-1,
        id_tax:1,
        concept_name: '',
        ped_code: '',
        campaign_name: 'Gastos Generales'
      }
      let fecha =  new Date();
      this.selectedExpense.date = {
        date: {
          year: fecha.getFullYear(),
          month: fecha.getMonth()+1,
          day: fecha.getDate()
        }
      }
      fecha.setDate(fecha.getDate()+60);
      this.selectedExpense.due_date = {
        date: {
          year: fecha.getFullYear(),
          month: fecha.getMonth()+1,
          day: fecha.getDate()
        }
      }

    } 
     this.setFocus("one");
  }

  closeDialog(){
    this.setFocus("mil");
    this.displayDialog = false;
  }

  getDateParsed(date) {
    let arrayDate = date.split('-');
    arrayDate = _.map(arrayDate, function (element) {
      return parseInt(element);
    });

    return arrayDate;
  }

  deleteExpense(item) {
    this.displayDialogDelete = true;
    this.selectedExpense = item;
  }

  updateRows(response) {
    let indice = parseInt(response.idx)+((this.numPage-1)*this.pagination);

    this.expensesfiltrados[indice].campaign_code = response.item[0].campaign_code;
    this.expensesfiltrados[indice].ped_code = response.item[0].ped_code;    
    this.expensesfiltrados[indice].campaign_name = response.item[0].campaign_name;
    this.expensesfiltrados[indice].user = response.item[0].user;
    this.expensesfiltrados[indice].id_user = response.item[0].id_user;
    this.expensesfiltrados[indice].customer = response.item[0].customer;
    this.expensesfiltrados[indice].team = response.item[0].team;
    this.expensesfiltrados[indice].grupo = response.item[0].grupo;
    this.expensesfiltrados[indice].subgroup = response.item[0].subgroup;
    this.expensesfiltrados[indice].status = response.item[0].status;
    this.expensesfiltrados[indice].id_status = response.item[0].id_status;    
    this.expensesfiltrados[indice].security_level = response.item[0].security_level;
    this.expensesfiltrados[indice].creation_date_no_parsed = response.item[0].creation_date;
    this.expensesfiltrados[indice].end_date_no_parsed = response.item[0].end_date;
    this.expensesfiltrados[indice].creation_date = this
      ._common
      .parseDatefromDate(new Date(response.item[0].creation_date));
    this.expensesfiltrados[indice].end_date = this
      ._common
      .parseDatefromDate(new Date(response.item[0].end_date));

      this.filtrar();
  }

  cambioCliente(nombrecli:string="",id:number=-1){
     if (id <0){
      for (let cliente of this.dataCombos.customers){
        if (cliente.label.indexOf(nombrecli) >= 0){
          return cliente.value;
        }
      }
     }else {

     }
  }

  summaryExpense(expense) {
    this
      ._router
      .navigate(['/resumen', expense.id]);
  }
  breakdownCampaign(campaign) {
    this
      ._router
      .navigate(['/desglose', campaign.id]);
  }

  addCampaign() {
    if(!this.autoNumbered && this.newCampaign.campaign_code === '') {
      this
        ._notification
        .info('¡Aviso!', 'Debes rellenar el código de gasto');
      return false;
    }
    if (this.newCampaign.campaign_name === '' ||
      this.newCampaign.customer === '' ||  
      this.newCampaign.creation_date_model === '' || this.newCampaign.end_date_model === '') {
      this
        ._notification
        .info('¡Aviso!', 'Debes rellenar los datos correctamente');
      return false;
    }
    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.checkDates(this.newCampaign.date)) {
        let body;
        body = 'campaign_code=' + this.newCampaign.campaign_code;
        body += '&campaign_name=' + this.newCampaign.campaign_name;
        body += '&id_company=' + dataSelected.company;
        body += '&id_fiscal_year=' + dataSelected.year;
        body += '&id_user=' + this.newCampaign.id_user;
        body += '&id_customer=' + this.cambioCliente(this.newCampaign.customer);
        body += '&id_team=' + this.newCampaign.id_team;
        body += '&id_group=' + this.newCampaign.id_group;
        body += '&id_subgroup=' + this.newCampaign.id_subgroup;
        body += '&id_status=' + this.newCampaign.id_status;
        body += '&id_security=' + this.newCampaign.security;
        body += `&creation_date=${this.newCampaign.creation_date_model.date.year}-${this.newCampaign.creation_date_model.date.month}-${this.newCampaign.creation_date_model.date.day}`;
        body += `&end_date=${this.newCampaign.end_date_model.date.year}-${this.newCampaign.end_date_model.date.month}-${this.newCampaign.end_date_model.date.day}`;
        body += `&auto_number=${this.autoNumbered}`;
        this
          ._api
          .insertCampaign(body)
          .subscribe((response) => {
            if (response.status === 'ok') {
              if (this.compraorigen){
                body = 'origen=' + this.compraorigen.id;
                body += '&destino=' + response.items[0].id;
                this._api.clonarPresupuesto(body).subscribe(response => {
                   if (response.status === 'ok') {
                    this.expenses[0].budget_income = this.compraorigen.budget_income;
                    this.expenses[0].budget_expenses = this.compraorigen.budget_expenses;
                    this.filtrar();
                  }
                }) 
              }
              this.displayDialogNew = false;
              this.expenses = []
              this.expenses = response.items;
              this.expenses = [...this.expenses];
              if (!this.compraorigen)  this.filtrar();
              this.expenses.forEach(element => {
                element.creation_date_no_parsed = element.creation_date;
                element.end_date_no_parsed = element.end_date;
                element.creation_date = this
                  ._common
                  .parseDatefromDate(new Date(element.creation_date));
                element.end_date = this
                  ._common
                  .parseDatefromDate(new Date(element.end_date));
              });
              this
                ._notification
                .success('¡Éxito!', 'Se ha añadido el gasto');
            } else {
              this
                ._notification
                .error('¡Error!', response.msg);
            }

          });
      } else {
        this
          ._notification
          .error('Error!', 'La fecha de inicio deber ser menor o igual a la de fin.');
      }
    }
  }


  updateApi() {
    let idcliente = _.findIndex(this.dataCombos.customers, (o) => {
      return  o.label.indexOf(this.selectedExpense.customer_name) >= 0;
    });

    let indiceconcepto =  _.findIndex(this.dataCombos.all_concepts, (o) => {
      return  o.label == this.selectedExpense.concept_name;
    }); 

    let idpedido = _.findIndex(this.dataCombos.pedidosnum, (o) => {
      return  o.label == this.selectedExpense.ped_code;
    });

    if (this.checkDates(this.selectedExpense.date) && idcliente >= 0 && indiceconcepto >= 0 && idpedido >= 0){
      let idconceptofijo = -1;
      let idconceptovble = -1;

      if (this.dataCombos.all_concepts[indiceconcepto].value < 0){
        //si es negativo, en realidad es un concepto fijo
        idconceptofijo = -this.dataCombos.all_concepts[indiceconcepto].value;
      }else{
        idconceptovble = this.dataCombos.all_concepts[indiceconcepto].value;
      }


      if (this.dataCombos.customers[idcliente].default_variable_concept == null && this.dataCombos.customers[idcliente].default_fixed_concept == null ){
        this.dataCombos.customers[idcliente].default_variable_concept = idconceptovble;
        this.dataCombos.customers[idcliente].default_fixed_concept = idconceptofijo;
      }

      let fechavencimiento= '';
      if(this.selectedExpense.due_date) {
        fechavencimiento = `${this.selectedExpense.due_date.date.year
                            }-${this.selectedExpense.due_date.date.month}-${
                            this.selectedExpense.due_date.date.day}`;
      }

    let body = '';
    this.idSelected = parseInt(this.selectedExpense.id, 10);
      body = `id=${this.idSelected}
              &amount=${this.selectedExpense.amount.replace(",",".")}
              &id_variable_concept=${idconceptovble}
              &id_fixed_concept=${idconceptofijo}              
              &date=${this.selectedExpense.date.date.year
                      }-${this.selectedExpense.date.date.month}-${
                      this.selectedExpense.date.date.day}
              &due_date=${fechavencimiento}
              &id_tax=${this.selectedExpense.id_tax}
              &description=${this.selectedExpense.description}
              &id_provider=${this.dataCombos.customers[idcliente].value}
              &id_campaign=${this.dataCombos.pedidosnum[idpedido].value}
              &percent_retention=${this.selectedExpense.percent_retention}
              &number=${this.selectedExpense.number}
              &iva=${this.selectedExpense.iva.replace(",",".")}
              &total=${this.selectedExpense.total.replace(",",".")}
              &retention=${this.selectedExpense.retention.replace(",",".")}
      `
      this
        ._api
        .updateExpense(body)
        .subscribe((response) => this.parseUpdate(response));
     } else {
      this._notification.error('Error', 'Debe rellenar los campos correctamente');
    }  
  }

  cifkey(event){
    if (event.which === 13 || event.which === 9 || event.which == undefined ) {
      let idx = _.findIndex(this.dataCombos.customerscif, (o) => {
        this.setFocus("two")        
        return  o.label.indexOf(this.selectedExpense.CIF) >= 0;
      });

      if (idx>= 0){
        this.selectedExpense.customer_name = this.dataCombos.customers[idx].label;
        this.selectedExpense.description = this.dataCombos.customers[idx].description;
        if (this.dataCombos.customers[idx].default_fixed_concept > 0){
          let idx2 = _.findIndex(this.dataCombos.all_concepts, (o) => {     
            return  o.value == -this.dataCombos.customers[idx].default_fixed_concept ;
          });
          this.selectedExpense.concept_name = this.dataCombos.all_concepts[idx2].label;
        }else if (this.dataCombos.customers[idx].default_variable_concept > 0){
          let idx2 = _.findIndex(this.dataCombos.all_concepts, (o) => {     
            return  o.value == this.dataCombos.customers[idx].default_variable_concept ;
          });
          this.selectedExpense.concept_name = this.dataCombos.all_concepts[idx2].label;
        } 
      }
    }
  }

  proveedorkey(event){
    if (event.which === 13 || event.which === 9 || event.which == undefined ) {
      let idx = _.findIndex(this.dataCombos.customers, (o) => {
        this.setFocus("two")        
        return  o.label.indexOf(this.selectedExpense.customer_name) >= 0;
      });

      if (idx>= 0){
        this.selectedExpense.CIF = this.dataCombos.customerscif[idx].label;
        this.selectedExpense.description = this.dataCombos.customers[idx].description;
        if (this.dataCombos.customers[idx].default_fixed_concept > 0){
          let idx2 = _.findIndex(this.dataCombos.all_concepts, (o) => {     
            return  o.value == -this.dataCombos.customers[idx].default_fixed_concept ;
          });
          this.selectedExpense.concept_name = this.dataCombos.all_concepts[idx2].label;
        }else if (this.dataCombos.customers[idx].default_variable_concept > 0){
          let idx2 = _.findIndex(this.dataCombos.all_concepts, (o) => {     
            return  o.value == this.dataCombos.customers[idx].default_variable_concept ;
          });
          this.selectedExpense.concept_name = this.dataCombos.all_concepts[idx2].label;
        } 
      }
    }
  }

  pedidokey(event){
      if (event.which === 13 || event.which === 9 || event.which == undefined) {
        let idx = _.findIndex(this.dataCombos.pedidosnum, (o) => {
          return  o.label.indexOf(this.selectedExpense.ped_code) >= 0;
        });
  
        if (idx>= 0){
          this.selectedExpense.campaign_name = this.dataCombos.pedidos[idx].label;
        }
      }
    
  }

  addApi() {

    let idcliente = _.findIndex(this.dataCombos.customers, (o) => {
      return  o.label.indexOf(this.selectedExpense.customer_name) >= 0;
    });

    let indiceconcepto =  _.findIndex(this.dataCombos.all_concepts, (o) => {
      return  o.label == this.selectedExpense.concept_name;
    }); 

    let idpedido = _.findIndex(this.dataCombos.pedidosnum, (o) => {
      return  o.label == this.selectedExpense.ped_code;
    });


    let idconceptofijo = -1;
    let idconceptovble = -1;

    if (this.dataCombos.all_concepts[indiceconcepto].value < 0){
      //si es negativo, en realidad es un concepto fijo
      idconceptofijo = -this.dataCombos.all_concepts[indiceconcepto].value;
    }else{
      idconceptovble = this.dataCombos.all_concepts[indiceconcepto].value;
    }

    if (this.dataCombos.customers[idcliente].default_variable_concept == null && this.dataCombos.customers[idcliente].default_fixed_concept == null ){
      this.dataCombos.customers[idcliente].default_variable_concept = idconceptovble;
      this.dataCombos.customers[idcliente].default_fixed_concept = idconceptofijo;
    }

    let fechavencimiento= '';
    if(this.selectedExpense.due_date) {
      fechavencimiento = `${this.selectedExpense.due_date.date.year
                          }-${this.selectedExpense.due_date.date.month}-${
                          this.selectedExpense.due_date.date.day}`;
    }


    let body = '';
    this.idSelected = parseInt(this.selectedExpense.id, 10);
      body = `amount=${this.selectedExpense.amount.replace(",",".")}
              &id_variable_concept=${idconceptovble}
              &id_fixed_concept=${idconceptofijo}
              &date=${this.selectedExpense.date.date.year
                      }-${this.selectedExpense.date.date.month}-${
                      this.selectedExpense.date.date.day}
              &due_date=${fechavencimiento}
              &id_tax=${this.selectedExpense.id_tax}
              &description=${this.selectedExpense.description}
              &id_provider=${this.dataCombos.customers[idcliente].value}
              &id_campaign=${this.dataCombos.pedidosnum[idpedido].value}
              &percent_retention=${this.selectedExpense.percent_retention}
              &number=${this.selectedExpense.number}
              &iva=${this.selectedExpense.iva.replace(",",".")}
              &total=${this.selectedExpense.total.replace(",",".")}
              &retention=${this.selectedExpense.retention.replace(",",".")}
      `
      this
        ._api
        .insertExpense(body)
        .subscribe((response) => this.parseUpdate(response));//voy a parseUpdate porque hago lo mismo
/*     } else {
      this._notification.error('Error', 'Debe introducir una fecha correcta');
    }  */
  }

  dialogoCliente(){
    this.displayDialogCliente = true;
      this.selectedCustomer={
        id:-1,
        customer_name:''
      }
  }

  cancelarCliente(){
    this.displayDialogCliente = false;
  }

  recargarClientes(clientenuevo:string){
    console.log(this.dataCombos.customers);
    this.displayDialogCliente = false;
    this.dataCombos.customers= [];
    this
    ._api
    .getDataCombos()
    .subscribe((response) => {
      if (response.status !== 'error') {
        this.dataSelects = response;
        response
          .customers
          .forEach((element) => {
            this
              .dataCombos
              .customers
              .push({ label: element.customer_name, value: element.id });
              if (this.newCampaign) this.newCampaign.customer = clientenuevo;
              if (this.selectedExpense) this.selectedExpense.customer = clientenuevo;              
          });
      }

    });
  }

  checkDates(date) {
    let start= new Date(`${date.date.year}-${date.date.month}-${date.date.day}`);

      return isDate(start);

  }

  getExpensesExp(){
    this
    ._api
    .getExpenses4Exportation()
    .subscribe((response) => {
        this.gastosexportacion = response.items;
        this.agregarexp= true;
    });
  }
  

  parseUpdate(response) { 
    if (response.status === 'ok') {
      if (this.selectedExpense.id == -1){
        this
        ._notification
        .success('¡Éxito!', 'Se ha insertado la compra');
        this.setFocus("mil");
        this.selectExpense();
      }else{
        this
        ._notification
        .success('¡Éxito!', 'Se ha actualizado la compra');
        this.displayDialog = false;
      }

      this.expenses = response.items;
      this.filtrar();
    } else {
      this.displayDialog = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);
    this
      ._api
      .deleteExpense(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.expenses, (o) => {
        return o.id == this.idSelected;
      });
      this
        .expenses
        .splice(idx, 1);
      this.expenses = [...this.expenses];
      this.filtrar();
      if(this.expenses.length === 0) {
        this.noExpenses = true;
      }
      this.displayDialogDelete = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha eliminado la compra');
    } else {
      this.displayDialogDelete = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  exportExcel():void {
    let exportExpenses = null;

    this.fillExcelData().then((response) => {
      exportExpenses = response;
      const ws_name_1 = 'Compras';
      const wb: WorkBook = { SheetNames: [], Sheets: {} };
      const ws_1: any = utils.json_to_sheet(exportExpenses);
      
      wb.SheetNames.push(ws_name_1);
      wb.Sheets[ws_name_1] = ws_1;
  
      const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
  
      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }
  
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `presupuestos-pedidos.xlsx`);
    });
    
  }  

  fillExcelData() {
    return new Promise((resolve, reject) => {
      let exportData = [];

        this.expensesfiltrados.forEach((gasto, key) => {

          exportData.push(
            {
              'Código': gasto.id,
              'Fecha': this._common.getFecha(new Date(gasto.date)),   
              'Fecha Vto.': this._common.getFecha(new Date(gasto.due_date)),                  
              'Descripción': gasto.description,
              'Proveedor': gasto.customer_name,
              'Núm.Pedido': gasto.ped_code,
              'Pedido': gasto.campaign_name,
              'C.Coste': gasto.concept_name,
              'B.Imponible': parseFloat(gasto.amount),
              'Iva': parseFloat(gasto.iva),
              'Total': parseFloat(gasto.total),
              'Retención': parseFloat(gasto.retention),
              'Núm.Factura': gasto.number
            }
          );
        });
        resolve(exportData);
      });
  }  

  ordenar(ev){

      if (ev.srcElement){
        let campoord;

        if (ev.srcElement.id == ""){
          campoord = ev.srcElement.parentElement.id;
        }else{
          campoord = ev.srcElement.id;      
        }

        if (campoord == this.orden){
          this.ordsentido = !this.ordsentido;
        }else {
          this.orden = campoord;
          this.ordsentido = false;
        }

        if (campoord == "id" || campoord== "amount" || campoord== "iva" || campoord== "total" || campoord== "retention"){
          this.expensesfiltrados =  _.orderBy(this.expensesfiltrados,[item => parseFloat(item[this.orden])],[(this.ordsentido ? 'desc' : 'asc')]);
        } else{
          this.expensesfiltrados =  _.orderBy(this.expensesfiltrados,[item => (item[this.orden] == null ? "" : item[this.orden].toLowerCase())],[(this.ordsentido ? 'desc' : 'asc')]);
        }
        this.numPage=1;
    }


  }

}


