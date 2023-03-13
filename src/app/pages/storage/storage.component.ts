import { Component, OnInit, ViewChild, EventEmitter, Input, ComponentFactoryResolver } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";
import { SelectItem } from "primeng/primeng";

import { environment } from 'environments/environment';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';

import { TokenService } from "../../services/token.service";
import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";
import { AuthenticationService } from "../../services/authentication.service";
import { Configuration } from "../../api/configuration";

const URL_LOGO = environment.urlUploadLogo;

declare var jsPDF: any; // Important
const URL_UPLOAD_LOGO = environment.urlLogoUpload;
import base64Img from 'base64-img';

import * as _ from "lodash";

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  exportaciones: any=[];
  stock: any=[];
  stocknuevos: any=[];
//  @ViewChild("inputSearch") inputSearch;

orden='almacen';
ordsentido=true;
//pongo estas historietas
lines = [];
infoAlbaran :any;
//fin historietas

showDialogImprimirAlbaran = false;


sck_orden='creation_date';
sck_ordsentido=true;

cargandoalmacen=false;

  start_date:any;
  end_date:any;
  start_date_calendar:any;
  end_date_calendar:any;
  hoy:Date =  new Date();

  id_company: number;

  urlUpload;
  files: UploadFile[];
  uploadInputLogo: EventEmitter<UploadInput>;
  uploadInputERP: EventEmitter<UploadInput>;
  uploadInputBackup: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  uploadFileLogo: any = {};
  uploadFileERP: any = {};
  requestERP: any = {
    error: false,
    success: false
  };
  uploadFileBackup: any = {};
  requestBackup: any = {
    error: false,
    success: false
  };
  enableBtnImport: boolean = false;

  selectedStock;


  selectedStorage : any = {
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

  unidadessalida=0;
  observacionessalida='';
  exportation_date;
  tabSeleccionada:number = 1;
  showNewBill: boolean = false;
  showNewExport: boolean = false;
  showExitStorage: boolean = false;
  showTramitarPedido: boolean = false;
  noBilling: boolean = false;
  pagination: number;
  numPage: number= 1;
  arrpages= [];
  paginationExportation: number;
  numPageExportation: number= 1;
  sck_pagination: number;
  sck_numPage: number= 1;
  sck_arrpages= [];
  newsck_numPage: number= 1;
  newsck_arrpages= [];
  arrpagesExportation= [];
  idSelected: number = null;
  billings: any = [];
  facturasfiltradas: any = [];
  movimientosfiltrados: any = [];
  stockfiltrados: any = [];
  stockfiltradosnuevos: any = [];
  salidasfiltradas: any = [];
  nosacar:boolean = false;
  totalcantidades = 0;
  totalitems = 0;
  selectedBill: any = null;
  cachedStorage = null;
  selectedExportation: any = null;
  newBill: any = {
    bill_code: "",
    bill_name: ""
  };
  selectedProject = null;

  filtroalmacen:any;
  filtropasillo:any;
  filtroseccion:any;
  filtroaltura:any;
  filtroartcod:any;
  filtronombre:any;
  filtrofamilia:any;
  filtrocliente:any;
  filtromarca:any;
  filtrocaducidad:any;
  filtroembalaje:any;
  filtrocantidad:any;
  filtrounidadesxe:any;
  filtrototal:any;
  filtroestado:any;

  filtrosckfecha:any;
  filtrosckpedcode:any;
  filtrosckpedido:any;
  filtrosckcliente:any;
  filtrosckunidades:any;
  filtrosckcodigo :any;
  filtrosckarticulo:any;

  new_filtrosckfechaentrega:any;
  new_filtrosckfecha:any;
  new_filtrosckpedcode:any;
  new_filtrosckpedido:any;
  new_filtrosckcliente:any;
  new_filtrosckunidades:any;
  new_filtrosckdisponibles:any;
  new_filtrosckobservaciones:any;

filtromovfecha:any;
filtromovmovimiento:any;
filtromovalmacen:any;
filtromovpasillo:any;
filtromovseccion:any;
filtromovaltura:any;
filtromovidart:any;
filtromovarticulo:any;
filtromovcantidad:any;
filtromovpedido:any;
filtromovmotivo:any;
filtromovusuario:any;


  displayDialog: boolean = false;
  displayDialogNew: boolean = false;
  displayPagination: boolean = false;
  displayDialogAbono: boolean = false;
  displayDialogDelete: boolean = false;
  displayDialogDeleteExportation: boolean = false;

  id_user:number;
  
  msgDelete: string = "¿Estás seguro de eliminar la factura?";
  emptyMsg: string = "No hay facturas añadidas. Añade tu primera factura en el formulario anterior";
  model: any = {
    billingsName: "",
    accountNumber: "",
    parent_account: "",
    type: null
  };
  roleUser: number = 0;
  showInput: boolean = true;
  types: any[] = [];
  parentAccounts: any[] = [];
  dataCombos: any = {
    envelopes: [],
    families: [],
    articles: [],
    customers: [],
    teams: [],
    states: [],
    warehouses: [],
    articlesdesc: []
  };
  showCol: boolean = false;
  choosenCompany: boolean = false;
  valueInputSearch = "";

  dataSelects: any = [];
  nombresColumnas: any = [];

  myDatePickerOptions = this._config.myDatePickerOptions;

  // Initialized to specific date (09.10.2019).
  private modelDate: Object = {
    date: {
      year: this.hoy.getFullYear(),
      month: 10,
      day: 9
    }
  };

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
          beginAtZero: true,
          callback: function(value, index, values) {
              return value.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          }
        }
      }]
    },
    maintainAspectRatio: false,
    responsive: true,
    yLabels: {
      display: true
    },
    tooltips: {
      callbacks: {
          label: function(tooltipItem, data) {
              return tooltipItem.yLabel.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
          }
        }
      }

  };

  public chartOptions: any = {
    scales: {
      yAxes: [{
        ticks: {
          callback: function(value, index, values) {
              return value.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          },
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      callbacks: {
          label: function(tooltipItem, data) {
              return tooltipItem.yLabel.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
          }
        }
      }

  };

  public chartOptionsHorizontal: any = {
    scales: {
      xAxes: [{
        ticks: {
          callback: function(value, index, values) {
              return value.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          },
          beginAtZero: true
        }
      }]
    },
    tooltips: {
      callbacks: {
          label: function(tooltipItem, data) {
              return tooltipItem.xLabel.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
          }
        }
      }

  }; 

/*   Chart.defaults.global.multiTooltipTemplate = function(label){
    return label.datasetLabel + ': ' + label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");}
; // "<%= value %>"; */

  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(72,134,254,1)',
      pointBackgroundColor: '#777777',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#68A6ff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(234,47,74,1)',
      pointBackgroundColor: '#777777',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#FF4F6A',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  public lineChartData: Array<any> = [{ data: [], label: +this.hoy.getFullYear()-1 }, { data: [], label: +this.hoy.getFullYear() }];
  
// ADD CHART OPTIONS. 

labels =  [+this.hoy.getFullYear()-1, +this.hoy.getFullYear()];
labelsHor = ['','','','',''];

// STATIC DATA FOR THE CHART IN JSON FORMAT.
chartData = [
  { 
    label: 'Todo el año',
    data: []
  }
];

chartDataHorizontal = [
  { 
    label: '',
    data: []
  }
];

// CHART COLOR.
colors = [
  { // 2nd Year.
    backgroundColor: 'rgba(255, 215, 0, 0.8)'
  },
];

colorsHor = [
  { // 2nd Year.
    backgroundColor: 'rgba(77,183,196,0.5)'
  },

];

  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common,
    private _token: TokenService
  ) {
    let lsCompany = JSON.parse(localStorage.getItem("selectedCompany"));
    let lsYear = JSON.parse(localStorage.getItem("selectedFiscalYear"));

    this.id_company = lsCompany.value.id;

    this.urlUpload = environment.urlLogoUpload;
    this.files = []; // local uploading files array
    this.uploadInputLogo = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputERP = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputBackup = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;

    lsCompany = lsCompany ? lsCompany.label : "";
    lsYear = lsYear ? lsYear.label : "";

    if (lsCompany === "" || lsYear === "") {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    if (this.id_company == 414){
      this.nombresColumnas= ['parte','proveedor'];
    }else {
      this.nombresColumnas= ['familia','cliente'];
    }
  }

  refresh(mensaje:boolean=false){
    let hoy = new Date();

    this.getBillsandExportations(mensaje);

    this.exportation_date = {
      date: {
        year: hoy.getFullYear(),
        month: hoy.getMonth()+1,
        day: hoy.getDate()
      }
    };

    let infoUser: any = this._token.getInfo();

    this.roleUser = parseInt(infoUser.role);

    this.pagination = 10;
    this.paginationExportation = 10;
    this.sck_pagination = 10;



    this._api.getDataCombos().subscribe(response => {
      if (response.status !== "error") {
        this.dataSelects = response;
        response.customers.forEach(element => {
          this.dataCombos.customers.push({
            label: element.customer_name,
            value: element.id
          });
        });
        response.teams.forEach(element => {
          this.dataCombos.teams.push({
            label: element.team_name,
            value: element.id
          });
        });
      }
    });

  }

  ngOnInit() {

    let infoUser: any = this._token.getInfo();

    this.id_user = parseInt(infoUser.id_user);

    this.start_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: 1,
        day: 1
    }};

    this.end_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth()+1,
        day: this.hoy.getDate()
    }};

    this.start_date_calendar = this.start_date;
    this.end_date_calendar = this.end_date;

    this.refresh();

    this._api.getDataCombosStorage().subscribe(response => {
      if (response.status !== "error") {
        response.articles.forEach(element => {
          this.dataCombos.articles.push({
            label: element.code,
            value: element.id
          });
          this.dataCombos.articlesdesc.push({
            label: element.description,
            value: element.id
          });
        });
        response.envelopes.forEach(element => {
          this.dataCombos.envelopes.push({
            label: element.name,
            value: element.id
          });
        });
        response.families.forEach(element => {
          this.dataCombos.families.push({
            label: element.familyname,
            value: element.id
          });
        });
        response.states.forEach(element => {
          this.dataCombos.states.push({
            label: element.state,
            value: element.id,
            bdefault: element.bdefault
          });
        });
        response.warehouses.forEach(element => {
          this.dataCombos.warehouses.push({
            label: element.name,
            value: element.id,
            bdefault: element.bdefault
          });
        });
      }
    });

  }

  getBillsandExportations(mensaje:boolean= false){

    this._api.getArticlesLocation().subscribe(response => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this._notification.error("Aviso!", response.msg);
          this.noBilling = true;
        } else {
           response.items.forEach(element => {
            if (element.caducidad !== '0000-00-00') {
              element.caducidad = this._common.getFecha(
                new Date(element.caducidad)
              );
            } else {
              element.caducidad = this._common.parseDatefromDate('');
            }

          });
          
          this.billings = response.items;
          this.filtrar();
          if (mensaje){
            this
            ._notification
            .success('¡Éxito!', 'Se han recargado los valores');
          }
          this.displayPagination = this.billings.length > this.pagination;
          this.noBilling = false;
        }
      }
    });

    this.getMovements();
    this.getStock();

  }

  getMovements(){
    this._api.getArticlesMovement(this.start_date,this.end_date).subscribe(response => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this.exportaciones = [];
          //this._notification.error("Aviso!", response.msg);
        } else {
          this.exportaciones = response.items;
          this.filtrarmov();
        }       
      }    
    });
  }

  getStock(){
    this._api.getArticlesStock().subscribe(response => {
      this.stock = [];
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this.stock = [];
          //this._notification.error("Aviso!", response.msg);
        } else {
          _.forEach(response.items, (element, key) => {
            element.disponibles = +element.disponibles;
            element.units = +element.units;
          })
          this.stock = response.items;
        }   
        this.filtrarstock();    
      }    
    });

    this._api.getArticlesNewStock().subscribe(response => {
      this.stocknuevos = [];
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this.stocknuevos = [];
          //this._notification.error("Aviso!", response.msg);
        } else {
          _.forEach(response.items, (element, key) => {
            element.disponibles = +element.disponibles;
            element.units = +element.units;
          })
          this.stocknuevos = response.items;
        }   
        
        this.newfiltrarstock();    
      }    
    });
  }

  escribirObservaciones(obs){
    if (obs == null){
      return '';
    }
    obs= "- " + obs.replace(new RegExp('\n,', 'g'),'\n- ');
    return obs;
  }


  deleteStorage(item) {
    this.displayDialogDelete = true;
    this.selectedStorage = _.cloneDeep(item);
  }


  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);

    let body;

    body = `id=${this.idSelected}`;
    body += '&user_id=' + this.id_user;

    this._api
      .deleteStorage(body)
      .subscribe(response => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.billings, (o) => {
        return o.id == this.idSelected;
      });
      this
        .billings
        .splice(idx, 1);
      this.billings = [...this.billings];
      if(this.billings.length === 0) {
        this.noBilling = true;
      }
      this.filtrar();
      this.displayDialogDelete = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha eliminado la línea de almacén');
      this.getMovements();
      this.getStock();
    } else {
      this.displayDialogDelete = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
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
    } else {
      this.displayDialogDeleteExportation = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }

    this.getBillsandExportations();
  }

  parseCreatedExportation(response) {
    if (response.status === 'ok') {
      this
        ._notification
        .success('¡Éxito!', 'Se ha creado la exportación número ' + response.number);
        this.showNewExport = false;
    } else {
      this 
        ._notification
        .error('¡Error!', response.msg);
    }
    this.getBillsandExportations();
  }

  filtrar(){
 
    this.facturasfiltradas = [];
    let filtroalm:string = (this.filtroalmacen == undefined ? "" : this.filtroalmacen);
    let filtropas:string = (this.filtropasillo == undefined ? "" : this.filtropasillo);
    let filtrosec:string = (this.filtroseccion == undefined ? "" : this.filtroseccion);
    let filtroalt:string = (this.filtroaltura == undefined ? "" : this.filtroaltura);
    let filtroart:string = (this.filtroartcod == undefined ? "" : this.filtroartcod);
    let filtronom:string = (this.filtronombre == undefined ? "": this.filtronombre);
    let filtrofam:string = (this.filtrofamilia == undefined ? "": this.filtrofamilia);
    let filtrocli:string = (this.filtrocliente == undefined ? "": this.filtrocliente);
    let filtromar:string = (this.filtromarca == undefined ? "": this.filtromarca);
    let filtrocad:string = (this.filtrocaducidad == undefined ? "": this.filtrocaducidad);
    let filtroemb:string = (this.filtroembalaje == undefined ? "": this.filtroembalaje);
    let filtrocan:string = (this.filtrocantidad == undefined ? "": this.filtrocantidad);
    let filtrouxe:string = (this.filtrounidadesxe == undefined ? "": this.filtrounidadesxe);
    let filtrotot:string = (this.filtrototal == undefined ? "": this.filtrototal);
    let filtroest:string = (this.filtroestado == undefined ? "": this.filtroestado);


    for (let i= 0; i < this.billings.length; i++){  
      if (this._common.getCleanedString(this.billings[i].almacen).indexOf(this._common.getCleanedString(filtroalm)) >= 0 &&
      this._common.getCleanedString(this.billings[i].pasillo).indexOf(this._common.getCleanedString(filtropas)) >= 0 &&
      this._common.getCleanedString(this.billings[i].seccion).indexOf(this._common.getCleanedString(filtrosec)) >= 0 &&
      this._common.getCleanedString(this.billings[i].altura).indexOf(this._common.getCleanedString(filtroalt)) >= 0 &&
      this._common.getCleanedString(this.billings[i].codigo).indexOf(this._common.getCleanedString(filtroart)) >= 0 &&
      this._common.getCleanedString(this.billings[i].articulo).indexOf(this._common.getCleanedString(filtronom)) >= 0 &&
      this._common.getCleanedString(this.billings[i].familia).indexOf(this._common.getCleanedString(filtrofam)) >= 0 &&
      this._common.getCleanedString(this.billings[i].cliente).indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
      this._common.getCleanedString(this.billings[i].marca).indexOf(this._common.getCleanedString(filtromar)) >= 0 &&
      this._common.getCleanedString(this.billings[i].caducidad).indexOf(this._common.getCleanedString(filtrocad)) >= 0 &&
      this._common.getCleanedString(this.billings[i].embalaje).indexOf(this._common.getCleanedString(filtroemb)) >= 0 &&
      this._common.getCleanedString(this.billings[i].unidades).indexOf(this._common.getCleanedString(filtrocan)) >= 0 &&
      this._common.getCleanedString(this.billings[i].unidadesxitem).indexOf(this._common.getCleanedString(filtrouxe)) >= 0 &&
      this._common.getCleanedString(this.billings[i].total).indexOf(this._common.getCleanedString(filtrotot)) >= 0 &&
      this._common.getCleanedString(this.billings[i].state).indexOf(this._common.getCleanedString(filtroest)) >= 0 



        ){ 
         this.facturasfiltradas.push(this.billings[i]);
       }
    } 
    this.paginarysumar();
  }

  paginarysumar(){
    this.arrpages = [];
     this.totalcantidades = 0;
     this.totalitems = 0;
 /*   this.totaltotales = 0; */

    for (let i=0; i < this.facturasfiltradas.length;i++){
      if (i%this.pagination == 0){
        this.arrpages.push(i/this.pagination+1);
      }
  
      this.totalcantidades += parseFloat(this.facturasfiltradas[i].unidades);
      this.totalitems +=  parseFloat(this.facturasfiltradas[i].total);
 /*      this.totaltotales += parseFloat(this.facturasfiltradas[i].total.toString().replace('.','').replace('.','').replace(',','.'));              
 */    }

    this.numPage = 1;

  }


  paginarmovimientos(){
    this.arrpagesExportation = [];
    for (let i=0; i < this.movimientosfiltrados.length;i++){
      if (i%this.paginationExportation == 0){
        this.arrpagesExportation.push(i/this.paginationExportation+1);
      }
  
    }

    this.numPageExportation = 1;
    this.cargandoalmacen=false;

  }

  paginarstock(){
    this.sck_arrpages = [];
 /*   this.totaltotales = 0; */

    for (let i=0; i < this.stockfiltrados.length;i++){
      if (i%this.sck_pagination == 0){
        this.sck_arrpages.push(i/this.sck_pagination+1);
      }
  
 /*      this.totaltotales += parseFloat(this.facturasfiltradas[i].total.toString().replace('.','').replace('.','').replace(',','.'));              
 */    }

    this.sck_numPage = 1;

  }

  newpaginarstock(){
    this.newsck_arrpages = [];
 /*   this.totaltotales = 0; */

    for (let i=0; i < this.stockfiltradosnuevos.length;i++){
      if (i%this.sck_pagination == 0){
        this.newsck_arrpages.push(i/this.sck_pagination+1);
      }
  
 /*      this.totaltotales += parseFloat(this.facturasfiltradas[i].total.toString().replace('.','').replace('.','').replace(',','.'));              
 */    }

    this.newsck_numPage = 1;

  }

  filtrarmov(){

    this.movimientosfiltrados = [];
    let filtromovfec:string = (this.filtromovfecha == undefined ? "" : this.filtromovfecha);
    let filtromovmov:string = (this.filtromovmovimiento == undefined ? "" : this.filtromovmovimiento);
    let filtromovalm:string = (this.filtromovalmacen == undefined ? "" : this.filtromovalmacen);
    let filtromovpas:string = (this.filtromovpasillo == undefined ? "" : this.filtromovpasillo);
    let filtromovsec:string = (this.filtromovseccion == undefined ? "" : this.filtromovseccion);
    let filtromovalt:string = (this.filtromovaltura == undefined ? "" : this.filtromovaltura);
    let filtromovari:string = (this.filtromovidart == undefined ? "" : this.filtromovidart);
    let filtromovdes:string = (this.filtromovarticulo == undefined ? "" : this.filtromovarticulo);
    let filtromovuni:string = (this.filtromovcantidad == undefined ? "" : this.filtromovcantidad);
    let filtromovped:string = (this.filtromovpedido == undefined ? "" : this.filtromovpedido);
    let filtromovnic:string = (this.filtromovusuario == undefined ? "" : this.filtromovusuario);
    let filtromovobs:string = (this.filtromovmotivo == undefined ? "" : this.filtromovmotivo);

    for (let i= 0; i < this.exportaciones.length; i++){  
       if (this._common.getCleanedString(this.exportaciones[i].date).indexOf(this._common.getCleanedString(filtromovfec)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].name).indexOf(this._common.getCleanedString(filtromovmov)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].location_warehouse).indexOf(this._common.getCleanedString(filtromovalm)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].location_row).indexOf(this._common.getCleanedString(filtromovpas)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].location_section).indexOf(this._common.getCleanedString(filtromovsec)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].location_height).indexOf(this._common.getCleanedString(filtromovalt)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].article_id).indexOf(this._common.getCleanedString(filtromovari)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].description).indexOf(this._common.getCleanedString(filtromovdes)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].units).indexOf(this._common.getCleanedString(filtromovuni)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].ped_code).indexOf(this._common.getCleanedString(filtromovped)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].nickname).indexOf(this._common.getCleanedString(filtromovnic)) >= 0 &&
      this._common.getCleanedString(this.exportaciones[i].observations).indexOf(this._common.getCleanedString(filtromovobs)) >= 0
         ){ 
         this.movimientosfiltrados.push(this.exportaciones[i]);
       }
    } 
    this.paginarmovimientos();
  }

  filtrarstock(){
 
    this.stockfiltrados = [];
    let filtrofec:string = (this.filtrosckfecha == undefined ? "" : this.filtrosckfecha);
    let filtropcd:string = (this.filtrosckpedcode == undefined ? "" : this.filtrosckpedcode);
    let filtroped:string = (this.filtrosckpedido == undefined ? "" : this.filtrosckpedido);
    let filtrocli:string = (this.filtrosckcliente == undefined ? "" : this.filtrosckcliente);
    let filtrouni:string = (this.filtrosckunidades == undefined ? "" : this.filtrosckunidades);
    let filtrocod:string = (this.filtrosckcodigo == undefined ? "": this.filtrosckcodigo);
    let filtroart:string = (this.filtrosckarticulo == undefined ? "": this.filtrosckarticulo);



    for (let i= 0; i < this.stock.length; i++){  
      if (this._common.getCleanedString(this.stock[i].creation_date).indexOf(this._common.getCleanedString(filtrofec)) >= 0 &&
      this._common.getCleanedString(this.stock[i].ped_code).indexOf(this._common.getCleanedString(filtropcd)) >= 0 &&
      this._common.getCleanedString(this.stock[i].campaign_name).indexOf(this._common.getCleanedString(filtroped)) >= 0 &&
      this._common.getCleanedString(this.stock[i].customer_name).indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
      this.stock[i].units.toString().indexOf(this._common.getCleanedString(filtrouni)) >= 0 &&
      this._common.getCleanedString(this.stock[i].code).indexOf(this._common.getCleanedString(filtrocod)) >= 0 &&
      this._common.getCleanedString(this.stock[i].description).indexOf(this._common.getCleanedString(filtroart)) >= 0 
        ){ 
         this.stockfiltrados.push(this.stock[i]);
       }
    } 
    this.paginarstock();
  }

  newfiltrarstock(){
 
 
    this.stockfiltradosnuevos = [];


    let filtroent:string = (this.new_filtrosckfechaentrega == undefined ? "" : this.new_filtrosckfechaentrega);
    let filtrofec:string = (this.new_filtrosckfecha == undefined ? "" : this.new_filtrosckfecha);
    let filtropcd:string = (this.new_filtrosckpedcode == undefined ? "" : this.new_filtrosckpedcode);
    let filtroped:string = (this.new_filtrosckpedido == undefined ? "" : this.new_filtrosckpedido);
    let filtrocli:string = (this.new_filtrosckcliente == undefined ? "" : this.new_filtrosckcliente);
    let filtrouni:string = (this.new_filtrosckunidades == undefined ? "" : this.new_filtrosckunidades);
    let filtrodis:string = (this.new_filtrosckdisponibles == undefined ? "": this.new_filtrosckdisponibles);
    let filtroobs:string = (this.new_filtrosckobservaciones == undefined ? "": this.new_filtrosckobservaciones);

    for (let i= 0; i < this.stocknuevos.length; i++){  
      if (this.stocknuevos[i].delivery_date == null) this.stocknuevos[i].delivery_date = '';
      if (this._common.getCleanedString(this.stocknuevos[i].delivery_date).indexOf(this._common.getCleanedString(filtroent)) >= 0 &&
       this._common.getCleanedString(this.stocknuevos[i].creation_date).indexOf(this._common.getCleanedString(filtrofec)) >= 0 &&
      this._common.getCleanedString(this.stocknuevos[i].ped_code).indexOf(this._common.getCleanedString(filtropcd)) >= 0 &&
      this._common.getCleanedString(this.stocknuevos[i].campaign_name).indexOf(this._common.getCleanedString(filtroped)) >= 0 &&
      this._common.getCleanedString(this.stocknuevos[i].customer_name).indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
      this.stocknuevos[i].units.toString().indexOf(this._common.getCleanedString(filtrouni)) >= 0 //&&
  /*    this._common.getCleanedString(this.stocknuevos[i].disponibles).indexOf(this._common.getCleanedString(filtrodis)) >= 0 &&
      this._common.getCleanedString(this.stocknuevos[i].observaciones).indexOf(this._common.getCleanedString(filtroobs)) >= 0  */
        ){ 
         this.stockfiltradosnuevos.push(this.stocknuevos[i]);
       }
    } 
    this.newpaginarstock();
  }



  abonar(factura){
    this._api
    .abonoBill(`id_bill_origen=${factura.id}`)
    .subscribe(response => {
      const idBill = response.id_bill;
      this._router.navigate(["/factura", idBill]);
    });
  }

  onDateChanged(event: IMyDateModel, field) {
    this.cargandoalmacen=true;
    this[field].date = event.date;
    this.getMovements();
  }

  tramitarpedido(itemstock){
    this.selectedStock = itemstock;
  }

  tramitarsalida(itemstock){
    this.salidasfiltradas = [];
    //primero capturar el id_campaign
    let id_campaign = itemstock.id_campaign;
    //ahora ver qué artículos son necesarios en los pedidos
    let necesidadespedido = _.filter(this.stock, function(o) { return o.id_campaign == id_campaign; });
    this.selectedStock = itemstock;
    necesidadespedido.forEach (el => {

    let restantes = +el.units;
    let presalidas  = _.filter(this.billings, function(o) { return o.article_id == el.article_id; });
    presalidas.forEach(element => {
      element.code = el.code;
      element.sacar = Math.min(restantes, +element.total);
      element.peticion_id = el.id;
      element.subconcept_project_id = el.subconcept_project_id;
      restantes -= element.sacar;
      this.salidasfiltradas.push(element);
      });
    });
  }

  changevaluesalida(evento){
    let sumasacar = 0;
    this.salidasfiltradas.forEach(element => {
      sumasacar += parseInt(element.sacar);
    });

    if (sumasacar == +this.selectedStock.units){
      this.nosacar = false;
    }else{
      this.nosacar = true;
    }
  }

  tramitarsalidaapi(){
    this.salidasfiltradas.forEach(element => {
      if (element.sacar && element.sacar > 0){        
        //generar salida
        
          let body = "";
          //cambiar esto
          this.idSelected = parseInt(element.id, 10);
          
          body = `id=${element.id}`;
          body += '&units=' + element.sacar;
          body += '&unitsoriginal=' + element.total;
          body += '&user_id=' + this.id_user;
          body += '&observations=' + "Pedido " + this.selectedStock.ped_code;
          body += '&subconcept_project_id=' + element.subconcept_project_id;
          body += '&anularsalidaid=' + element.peticion_id;

          console.log(body);
   
          let that = this;
      
          this
          ._api
          .exitStorage(body)
          .subscribe( function (response) { 
            that.selectedStock = false;

            that.refresh(false);
            //deletear fila
            if (response.status == "ok"){
              that
              ._notification
              .success('¡Éxito!', 'Salida realizada correctamente');
            }else{
                that
              ._notification
              .error('Error', response.msg);
            }
          });
        }
      
    });    
  }

  tramitarpedidoapi(){
    this.showTramitarPedido = false;
    let tramitedeseado = -1;
    let id_campaign = this.selectedStock.id_campaign;
    if (this.selectedStock.btramite == 1){
      tramitedeseado = 0;
    }else{
      tramitedeseado = 1;
    }
    this._api
    .tramitarpedido(`tramite=${tramitedeseado}`,`id_campaign=${id_campaign}`)
    .subscribe(response => {

      this.selectedStock.btramite = tramitedeseado;

    });
  }
 
  addStorage() {

    let dataSelected = this
      ._common
      .getIdCompanyYearSelected();
    if (!dataSelected) {
      this
        ._notification
        .error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      //if (this.checkDates(this.selectedStorage.creation_date_model, this.selectedStorage.end_date_model)) {
      if (true ){//no hago esa validación que no funciona en los ipad
        let body;
        let fechacaducidad = '';

        if (this.selectedStorage.caducidad){
          fechacaducidad = `${this.selectedStorage.caducidad.date.year}-${this.selectedStorage.caducidad.date.month}-${this.selectedStorage.caducidad.date.day}`;
        }

        
      let idarticulo = _.findIndex(this.dataCombos.articles, (o) => {
        return  o.label == this.selectedStorage.codigo;
      });

      let idcliente = _.findIndex(this.dataCombos.customers, (o) => {
        return  o.label == this.selectedStorage.cliente;
      });

      if (this.validateStorage(idarticulo, idcliente) == true){       
        body = 'id_company=' + dataSelected.company;
        body += '&units=' + this.selectedStorage.unidades;
        body += '&warehouse=' + this.selectedStorage.idalmacen;
        body += '&row=' + this.selectedStorage.pasillo;
        body += '&section=' + this.selectedStorage.seccion;
        body += '&height=' + this.selectedStorage.altura;
        body += '&article_id=' + this.dataCombos.articles[idarticulo].value;
        body += '&dateexpiry=' + fechacaducidad;
        body += '&owner_id=' + this.dataCombos.customers[idcliente].value;
        body += '&state_id=' + this.selectedStorage.idestado;
        body += '&user_id=' + this.id_user;
        body += '&observations=' + this.selectedStorage.observaciones;
        if (this.selectedStorage.image != null) {
          body += '&image=' + this.selectedStorage.image;
        } else  {
          body += '&image=';
        }

        this
          ._api
          .insertStorage(body)
          .subscribe((response) => {
            if (response.status === 'ok') {

              this.billings = []
              this.billings = response.items;
              this.billings = [...this.billings];
              this.filtrar();
              this.billings.forEach(element => {
                if (element.caducidad !== '0000-00-00') {
                  element.caducidad = this._common.getFecha(
                    new Date(element.caducidad)
                  );
                } else {
                  element.caducidad = this._common.parseDatefromDate('');
                }
              });
              this
                ._notification
                .success('¡Éxito!', 'Se ha añadido la línea');
                this.getMovements();
                this.getStock();
            } else {
              this
                ._notification
                .error('¡Error!', response.msg);
            }

          });
        }
      } else {
      }
    }
  }

  validateStorage(idarticulo, idcliente){
    if (isNaN(parseInt(this.selectedStorage.seccion))  || isNaN(parseInt(this.selectedStorage.pasillo))  ||  
      isNaN(parseInt(this.selectedStorage.altura)) || isNaN(parseInt(this.selectedStorage.unidades)) ||
      this.selectedStorage.idalmacen < 0 || this.selectedStorage.idestado < 0 ) {
        this
        ._notification
        .info("¡Aviso!", "Debe rellenar todos los datos correctamente");
      return false;
    }
    else if (idarticulo < 0){
      this
      ._notification
      .info("¡Aviso!", "Debe seleccionar el artículo");
      return false;
    }
    else if (idcliente < 0){
      this
      ._notification
      .info("¡Aviso!", "Debe seleccionar el cliente");
      return false;
    }else {
      return true;
    }
  }

  updatearticle(event){
    if (event.which === 13 || event.which === 9 || event.which == undefined) {
      let idx = _.findIndex(this.dataCombos.articles, (o) => {
        return  o.label == this.selectedStorage.codigo;
      });

      if (idx>= 0){
        this.selectedStorage.articulo = this.dataCombos.articlesdesc[idx].label;
      }
    }
  }

  updatecod(event){
    if (event.which === 13 || event.which === 9 || event.which == undefined) {
      let idx = _.findIndex(this.dataCombos.articlesdesc, (o) => {
        return  o.label == this.selectedStorage.articulo;
      });

      if (idx>= 0){
        this.selectedStorage.codigo = this.dataCombos.articles[idx].label;
      }
    }
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

  createBill() {
    if (!this.selectedProject) {
      this._notification.error("Error", "Debe seleccionar un proyecto.");
    } else {
      this._api
        .createBill(`id_project=${this.selectedProject}`)
        .subscribe(response => {
          const idBill = response.id_bill;
          this._router.navigate(["/factura", idBill]);
        });
    }
  }

  isNegative(text){
    if (parseInt(text) < 0) return true;
    return false;
  }

  exitStorage(storage){
    this.showExitStorage = true;
    this.unidadessalida = storage.unidades;
    this.selectedStorage = storage;
  }

  selectStorage(storage=null) {
    if (this.roleUser != 10){
    this.showNewExport = true;
    if (storage){
      this.selectedStorage = _.cloneDeep(storage);

      if (this.selectedStorage.caducidad != ''){
        let caducidad =  this.selectedStorage.caducidad.split('/');
        this.selectedStorage.caducidad = {
          date: {
            year: parseInt(caducidad[2]),
            month: parseInt(caducidad[1]),
            day: parseInt(caducidad[0])
          }
      }
    }

    }else{

      let idestadodefault = -1;
      idestadodefault =  _.findIndex(this.dataCombos.states, (o) => {
        return o.bdefault == 1;
      });

      let idalmacendefault = -1;
      idalmacendefault =  _.findIndex(this.dataCombos.warehouses, (o) => {
        return o.bdefault == 1;
      });

      this.selectedStorage={
        id: -1,
        codigo: '',
        unidades: 1,
        cliente: '',
        idestado: (idestadodefault >= 0 ? this.dataCombos.states[idestadodefault].value :idestadodefault),
        idalmacen: (idalmacendefault >= 0 ? this.dataCombos.warehouses[idalmacendefault].value :idalmacendefault),
        art:'',
        seccion:'',
        altura:'',
        pasillo:''
      }
    }
    this.selectedStorage.observaciones = ''; //inicializo las observaciones para evitar undefined
  }
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

      if (campoord == "pasillo" || campoord== "altura" || campoord== "seccion" || campoord== "total" || campoord== "unidadesxitem" || campoord== "unidades"){
        this.facturasfiltradas =  _.orderBy(this.facturasfiltradas,[item => parseFloat(item[this.orden])],[(this.ordsentido ? 'desc' : 'asc')]);
      } else{
        this.facturasfiltradas =  _.orderBy(this.facturasfiltradas,[item => (item[this.orden] == null ? "" : item[this.orden].toLowerCase())],[(this.ordsentido ? 'desc' : 'asc')]);
      }
      this.numPage=1;
  }


}

ordenar_sck(ev){

  if (ev.srcElement){
    let campoord;

    if (ev.srcElement.id == ""){
      campoord = ev.srcElement.parentElement.id;
    }else{
      campoord = ev.srcElement.id;      
    }

    if (campoord == this.sck_orden){
      this.sck_ordsentido = !this.sck_ordsentido;
    }else {
      this.sck_orden = campoord;
      this.sck_ordsentido = false;
    }

    if (campoord == "units" || campoord== "disponibles"){
      this.stockfiltrados =  _.orderBy(this.stockfiltrados,[item => parseFloat(item[this.sck_orden])],[(this.sck_ordsentido ? 'desc' : 'asc')]);
    } else{
      this.stockfiltrados =  _.orderBy(this.stockfiltrados,[item => (item[this.sck_orden] == null ? "" : item[this.sck_orden].toLowerCase())],[(this.sck_ordsentido ? 'desc' : 'asc')]);
    }
    this.sck_numPage=1;
}


}

ordenar_scknew(ev){

  if (ev.srcElement){
    let campoord;

    if (ev.srcElement.id == ""){
      campoord = ev.srcElement.parentElement.id;
    }else{
      campoord = ev.srcElement.id;      
    }

    if (campoord == this.sck_orden){
      this.sck_ordsentido = !this.sck_ordsentido;
    }else {
      this.sck_orden = campoord;
      this.sck_ordsentido = false;
    }

    if (campoord == "units" || campoord== "disponibles"){
      this.stockfiltrados =  _.orderBy(this.stockfiltrados,[item => parseFloat(item[this.sck_orden])],[(this.sck_ordsentido ? 'desc' : 'asc')]);
    } else{
      this.stockfiltrados =  _.orderBy(this.stockfiltrados,[item => (item[this.sck_orden] == null ? "" : item[this.sck_orden].toLowerCase())],[(this.sck_ordsentido ? 'desc' : 'asc')]);
    }
    this.sck_numPage=1;
}


}

  getDateParsed(date) {
    let arrayDate = date.split("-");
    arrayDate = _.map(arrayDate, function(element) {
      return parseInt(element);
    });

    return arrayDate;
  }

  updateApi() {
    let body = "";
    this.idSelected = parseInt(this.selectedStorage.id, 10);

  let fechacaducidad = '';

    if (this.selectedStorage.caducidad){
      fechacaducidad = `${this.selectedStorage.caducidad.date.year}-${this.selectedStorage.caducidad.date.month}-${this.selectedStorage.caducidad.date.day}`;
    }

    let idarticulo = _.findIndex(this.dataCombos.articles, (o) => {
      return  o.label == this.selectedStorage.codigo;
    });

    let idcliente = _.findIndex(this.dataCombos.customers, (o) => {
      return  o.label == this.selectedStorage.cliente;
    });

    if (this.validateStorage(idarticulo,idcliente)){

    body = `id=${this.idSelected}`;
    body += '&units=' + this.selectedStorage.unidades;
    body += '&warehouse=' + this.selectedStorage.idalmacen;
    body += '&row=' + this.selectedStorage.pasillo;
    body += '&section=' + this.selectedStorage.seccion;
    body += '&height=' + this.selectedStorage.altura;
    body += '&article_id=' + this.dataCombos.articles[idarticulo].value;
    body += '&dateexpiry=' + fechacaducidad;
    body += '&owner_id=' + this.dataCombos.customers[idcliente].value;
    body += '&state_id=' + this.selectedStorage.idestado;
    body += '&user_id=' + this.id_user;
    body += '&observations=' + this.selectedStorage.observaciones;
    if (this.selectedStorage.image != null) {
      body += '&image=' + this.selectedStorage.image;
    } else  {
      body += '&image=';
    }

    this._api
      .updateStorage(body)
      .subscribe(response => this.parseUpdate(response));
  }
  }

  salida() {

    let body = "";
    this.idSelected = parseInt(this.selectedStorage.id, 10);

    if (isNaN(this.unidadessalida)) {
    this
      ._notification
      .info('¡Aviso!', 'Debe introducir un número correcto de unidades');
    return false;
  }

    body = `id=${this.idSelected}`;
    body += '&units=' + this.unidadessalida;
    body += '&unitsoriginal=' + this.selectedStorage.unidades;
    body += '&user_id=' + this.id_user;
    body += '&observations=' + this.observacionessalida;

    let that = this;

    this
    ._api
    .exitStorage(body)
    .subscribe( function (response) { 
      that.showExitStorage = false;
      if (that.unidadessalida == that.selectedStorage.unidades){
        that.parseDeleted(response);
      }else{
        that.parseUpdate(response);
      }
    });
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha actualizado la línea');
      this.getBillsandExportations();
    } else {
      this.displayDialog = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  exportExcel(): void {
    let exportData = [];
    let ws_name = '';

    if (this.tabSeleccionada == 1){
      exportData = this.fillExcelData();
      ws_name = 'Listado de existencias';
    }else if (this.tabSeleccionada == 2){
      exportData = this.fillExcelDataExportation();
      ws_name = 'Listado de movimientos';
    }else if (this.tabSeleccionada == 3){
      exportData = this.fillExcelDataSalidas();
      ws_name = 'Listado de salidas';
    }

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
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `listado_existencias.xlsx`);
  }

  fillExcelData() {
    let exportData = [];
    this.facturasfiltradas.forEach((line) => {
      exportData.push({ 
        'Almacén': line.almacen,
        'Pasillo': parseInt(line.pasillo),
        'Sección': parseInt(line.seccion),
        'Altura': parseInt(line.altura),
        'Cód.Artículo': line.codigo,
        'Nombre Art.': line.articulo,
        'Familia': line.familia,
        'Cliente': line.cliente, 
        'Marca': line.marca,
        'Caducidad': line.caducidad,
        'Embalaje': line.embalaje,
        'Cantidad': parseInt(line.unidades),
        'Uds. por Embalaje':parseInt(line.unidadesxitem),
        'Total': parseInt(line.total),
        'Estado':line.state
      });      
    });

    return exportData;
  }


  fillExcelDataExportation() {
    let exportData = [];
    this.movimientosfiltrados.forEach((line) => {
      exportData.push({ 
        'Fecha': line.date,
        'Movimiento': line.name,
        'Almacén': line.location_warehouse,
        'Pasillo':parseInt(line.location_row),
        'Sección':parseInt(line.location_section),
        'Altura': parseInt(line.location_height),
        'Cód.Artículo': line.article_id,
        'Nombre Art.': line.description,
        'Cantidad': parseInt(line.units),
        'Pedido': line.ped_code, 
        'Usuario': line.nickname,
        'Motivo': line.observations
      });      
    });

    return exportData;
  }

  fillExcelDataSalidas() {
    let exportData = [];
    this.stockfiltrados.forEach((line) => {
      exportData.push({ 
        'Fecha Pedido': this._common.getFecha(new Date(line.creation_date)),
        'Nº Pedido': line.ped_code,
        'Pedido': line.campaign_name,
        'Cliente': line.customer_name,
        'Uds.':parseInt(line.units),
        'Cód.Artículo': line.code,
        'Nombre Art.': line.description,
        'Disponibles': (line.disponibles == null ? 0: parseInt(line.disponibles))
      });      
    });

    return exportData;
  }

  sendValuesChart(vec) {
    this.lineChartData = [{ data: [], label: +this.hoy.getFullYear()-1 }, { data: [], label: +this.hoy.getFullYear() }];
    let datoanyo1 = 0;
    let datoanyo2 = 0;
    let mes = 1;
    let anyo;

    vec.mensual.forEach(element => {
      if (anyo != element.anyo){
        mes = 1;
      }
      anyo = element.anyo;
      if (mes >= 13) mes = 1;

      while (mes != element.mes || anyo != element.anyo){
        this.lineChartData[parseInt(element.anyo)-this.hoy.getFullYear()+1].data.push(0); 
        mes++; 
      }

      if (mes == element.mes && anyo == element.anyo){
        this.lineChartData[parseInt(element.anyo)-this.hoy.getFullYear()+1].data.push(this._common.toFloat(element.importe, true));    
        mes++;
      }
      if (parseInt(element.anyo) == (this.hoy.getFullYear()-1)){
        datoanyo1 += this._common.toFloat(element.importe);
      }else{
        datoanyo2 += this._common.toFloat(element.importe);
      }

    });

    this.chartData = [
      { 
        label: 'Todo el año',
        data: [datoanyo1,datoanyo2]
      }
    ];

    let labels:any= [];
    let datos:any=[];

    for (let i = 0; i < Math.min(5,vec.clientes.length); i++){
      this.labelsHor[i] = vec.clientes[i]["customer_name"].substring(0,20);
      datos.push(vec.clientes[i]["importe"]);

    }

    let lsYear = JSON.parse(localStorage.getItem("selectedFiscalYear"));

    this.chartDataHorizontal = [
      { 
        label: 'Top 5 clientes (' + lsYear.label + ')',
        data: datos
      }
    ];

  }

  onUploadOutputLogo(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      // uncomment this if you want to auto upload files when added
      this.startUploadLogo();
    } else if (output.type === 'addedToQueue') {
      this
        .files
        .push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
      // update current data in files array for uploading file
      const index = this
        .files
        .findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this
        .files
        .filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'done') { // on drop event
      this.handleUpload(output, 'logo');
    }
  }

  startUploadLogo(): void { // manually start uploading
    const event: UploadInput = {
      type: 'uploadAll',
      url: URL_LOGO,
      method: 'POST',
      data: {
        foo: 'bar'
      },
      concurrency: 1 // set sequential uploading of files with concurrency 1
    }

    this.uploadInputLogo.emit(event);
  }

  handleUpload(data, type: string): void {
    this.uploadFileERP = {};
    this.uploadFileLogo = {};
    this.uploadFileBackup = {};
    if (data && data.file && data.file.response) {
      switch (type) {
        case 'logo':
          if (data.file.type === 'image/jpeg') {
            this.uploadFileLogo = data.file.response;
            this.enableBtnImport = true;
            this.selectedStorage.image = this.uploadFileLogo.generatedName;
          } else {
            this._notification.error('Error', 'Solo están permitidos archivos JPG de imagen');
          }
          break;
        case 'erp':
          if(data.file.name.split('.')[1] ==='xlsx') {
          //if (data.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.uploadFileERP = data.file.response;
            this.enableBtnImport = true;
          } else {
            this._notification.error('Error', 'Solo están permitidos archivos Excel');
          }
          break;
        case 'backup':
          this.uploadFileBackup = data.file.response;
          break;
      }
    }
  }

  getAlbaran(bImprimirTodo){
    
    this._api.getInfoAlbaran(this.selectedStock.id_campaign).subscribe(response => {
      if (response !== null) {
        this.showDialogImprimirAlbaran = false;
        this.infoAlbaran = response.info;
        this.lines = response.lines;
        this.exportAlbaran(bImprimirTodo);

      }    
    }); 
  

  }

  exportAlbaran2(stock){
    this.selectedStock = stock;
    if (this.id_company == 412){
      this.showDialogImprimirAlbaran = true;
    }else {
     // this.getAlbaran(true);
    }
  }


  exportAlbaran(bImprimirTodo : boolean){
    let doc = new jsPDF('p', 'cm');
    let margen_izq= 2;
    let margen_dch = 2;
    let inicio_cuadro = 10;
    let maximo_linea = 80;
    let altura_cuadro = 16;
    let borde_lineas = 0.05;
    let ancho_importes = 3;
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;
    let urlCompany = (dataCompany.logo != 'undefined') ? URL_UPLOAD_LOGO + dataCompany.logo : URL_UPLOAD_LOGO + 'placeholder.jpg';
    var imgDataCompany = null;
    var izqUnidades= 2.7;
    let anchoimagen = 4.64;
    let pintarObservaciones = false;
    let textoEnunciadoBlanco = false;
    let altura_texto_obs = 3;
    let bPintarCodigo = false;
    let bPintarNuevaPagina = false;
    let bPintarCuadroPrincipal = true;

    switch (dataCompany.id){
      case "411": 
        izqUnidades = 0;
        anchoimagen = 1.8;
        textoEnunciadoBlanco = true;
        break;
      case "412": 
        //textoEnunciadoBlanco = true;
        izqUnidades = 3.5;
        anchoimagen = 3.36;
        pintarObservaciones = true;
        altura_cuadro = 14;
        textoEnunciadoBlanco = true;
        bPintarCodigo = true;
        break;
      case "410":
        textoEnunciadoBlanco = true;
        break;
      case "408": default:   
    } 

    
     base64Img.requestBase64(urlCompany, (err, res, body) => {

      imgDataCompany = body; 
      doc.addImage(imgDataCompany, 'JPEG',2.3, 1, anchoimagen ,3.36); 

    doc.setLineWidth(borde_lineas);

    let altura_texto;

    if (pintarObservaciones) {
      //this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,3.5);
      //doc.setTextColor(255);
      //doc.text(margen_izq+0.2,inicio_cuadro+altura_cuadro+0.7,"Observaciones");    
      doc.setTextColor(0);
      altura_texto = 0; 
   
      let texto;

      if (bImprimirTodo){
        texto = "Observaciones cliente \n" +  this.selectedStock.observ_cli + "\n Observaciones internas \n " + this.selectedStock.observ_int;
        texto = texto.split('\n'); 
      }else{
        texto = this.selectedStock.observ_cli.split('\n');
      }
      
      let texto_lineas = [];
      let linea = "";
      texto.forEach((txt,j) => {
       let frase = txt.split(' ');
       let cuentaletras = 0;
       frase.forEach((palabra:string,i) => {
         cuentaletras += palabra.length+1;
         if (cuentaletras > 87){
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
   
      texto_lineas.forEach((line) => {
     //   doc.text(margen_izq+0.2,inicio_cuadro+altura_cuadro+1.4+altura_texto,line);   
        altura_texto +=0.4;
      });

      if (altura_texto > 3){
        altura_texto_obs = altura_texto;
        altura_cuadro = altura_cuadro - altura_texto + 3.5;
      }
   
     }

    //this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);      

    doc.setFontType("normal");
    doc.setFontSize(9); 

    altura_texto = inicio_cuadro+1.6;
    let altura_numero = altura_texto;
    let pintaunidades = true;
    //escribo las líneas

    this
    .lines
    .forEach((line, idx) => {
      if (line.bstockable == 1 || bImprimirTodo) {
         let texto = line.name.split('\n');
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
          
          pintaunidades = true
          texto_lineas.forEach((subline) => {
            if (altura_texto > (24-altura_texto_obs+3)) {

              bPintarNuevaPagina = true;

              if (altura_texto > 27){

                bPintarNuevaPagina = false;

                doc.setFontType("italic");
                this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, 19,ancho_importes,borde_lineas,true);      
                doc.setFontSize(9); 

                doc.textEx("Sigue en página siguiente >>",21-margen_dch-0.2,28,'right','bottom'); 
                
                doc.addPage();
    
                altura_texto = inicio_cuadro+1.6;
                doc.textEx("<< Viene de página anterior",21-margen_dch-0.2,altura_texto,'right','bottom');  
    
                doc.setFontType("normal");
    
                altura_texto = altura_texto+1;
                
                doc.addImage(imgDataCompany, 'JPEG',2.3, 1, anchoimagen ,3.36);
                //this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);
                doc.setFontType("normal");
                doc.setFontSize(9);
              }
            } 

            if (izqUnidades > 0 && pintaunidades) {
              if (bPintarCodigo) {//si debo pintar código me tengo que ajustar
                doc.text(margen_izq+izqUnidades-1.5,altura_texto,line.code); 
                doc.textEx(this._common.getDecimals(line.amount,2,true),3.8,altura_texto+0.06,'right','bottom');                    
              }else{
                doc.textEx(this._common.getDecimals(line.amount,2,true),4.3,altura_texto+0.06,'right','bottom');                    
              }
            }
            pintaunidades = false;
            doc.text(margen_izq+izqUnidades,altura_texto,subline); 
            altura_texto +=0.4;
          });
          altura_texto += 0.2;
        }
//      }    
  });

  if (bPintarNuevaPagina){
    //ya he escrito todo pero no me caben líneas y observaciones
    this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_texto-9,ancho_importes,borde_lineas,true);      
    doc.addPage();
    doc.addImage(imgDataCompany, 'JPEG',2.3, 1, anchoimagen ,3.36);
    doc.setFontSize(9); 
    bPintarCuadroPrincipal = false;
  }

  this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas,bPintarCuadroPrincipal);      
  doc.setFontSize(9); 


  if (pintarObservaciones) {
   this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,altura_texto_obs + 1);
   doc.setTextColor(255);
   doc.text(margen_izq+0.2,inicio_cuadro+altura_cuadro+0.7,"Observaciones");    
   doc.setTextColor(0);
   altura_texto = 0; 

   let texto;

   if (bImprimirTodo){
     texto = "Observaciones cliente \n" +  this.selectedStock.observ_cli + "\n Observaciones internas \n " + this.selectedStock.observ_int;
     texto = texto.split('\n'); 
   }else{
     texto = this.selectedStock.observ_cli.split('\n');
   }

   let texto_lineas = [];
   let linea = "";
   texto.forEach((txt,j) => {
    let frase = txt.split(' ');
    let cuentaletras = 0;
    frase.forEach((palabra:string,i) => {
      cuentaletras += palabra.length+1;
      if (cuentaletras > 87){
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

   texto_lineas.forEach((line) => {
     doc.text(margen_izq+0.2,inicio_cuadro+altura_cuadro+1.4+altura_texto,line);   
     altura_texto +=0.4;
   });

  }
    
    doc.save(`Albaran-${String((this.selectedStock.ped_code)).trim()}.pdf`);
    this
      ._notification
      .success('Exportación', 'Se ha creado el archivo PDF.');

    }); //fin de la imagen
  }

  pintarRectanguloFactura(doc, altopagina, margenizq,margendch,altocabecera,altototal){

    //el color del fondo varía según cual sea la empresa
    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

    switch (dataCompany.id){
      case "408": doc.setFillColor(205, 205, 205); break;
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

  pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas,bPintarCuadroPrincipal){

    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

    let bPintarlineas = true;
    let bMostrarTelefono = true;
    let bMostrarCif = false;
    let alto_cabecera = 1;
    let complemento_cuadroppal = 0;
    let linea_unidades = 4.5;
    let bMostrarFechaEntrega = false;


    switch (dataCompany.id){
      case "410": 
        bMostrarCif = true;     
       break;
      case "411": 
        bPintarlineas = false;
        bMostrarTelefono = false;
        bMostrarCif = true;
        alto_cabecera = 0.6;
        complemento_cuadroppal = 0.2;
       break;
      case "412" : 
        bMostrarFechaEntrega = true; 
        bPintarlineas = false;
       break;
      case "408": default: 
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

    //textos informativos de la factura
    doc.setFontType("bold");
    doc.text(2.2,7.8,"Albarán " + 'Pedido nº ' + this.selectedStock.ped_code);

    if (bMostrarFechaEntrega && this.selectedStock.delivery_date){
      let fechaentrega = this.selectedStock.delivery_date.split("-");
      //this.selectedStock.delivery_date = this._common.getFecha(new Date(this.selectedStock.delivery_date));
      doc.text(2.2,8.5,"Fecha de Entrega: " + fechaentrega [2] + "/"+ fechaentrega [1] + "/"+ fechaentrega [0]);
      
    }

    doc.text(2.2,9.2, this.selectedStock.campaign_name);


    let cliente=[];

    cliente.push(this.infoAlbaran.customer);
    this.infoAlbaran.customer_address.split('\n').forEach(element => {
      if (element != "")
      cliente.push(element);
    });

    if (this.infoAlbaran.customer_city){
      cliente.push((this.infoAlbaran.customer_postal_code  ? this.infoAlbaran.customer_postal_code + ' ' :' ') + (this.infoAlbaran.customer_city ? this.infoAlbaran.customer_city : ''));
    }else {
      cliente.push(this.infoAlbaran.customer_address_bis);
    }

    if (this.infoAlbaran.customer_cif && this.infoAlbaran.customer_cif != "undefined") cliente.push('CIF: ' + this.infoAlbaran.customer_cif);
    if (this.infoAlbaran.contact != '') cliente.push('Contacto: ' + this.infoAlbaran.contact);   
    if (this.infoAlbaran.phone != '' && this.infoAlbaran.phone!=null ) cliente.push('Teléfono: ' + this.infoAlbaran.phone);          
    if (this.infoAlbaran.project != '' && this.infoAlbaran.project!=null) cliente.push('Campaña: ' + this.infoAlbaran.project);   
    if (this.infoAlbaran.phone2 != '' && this.infoAlbaran.phone2!=null) cliente.push('Teléfono: ' + this.infoAlbaran.phone2);   
    if (this.infoAlbaran.email != '' && this.infoAlbaran.email!=null) cliente.push('E-Mail: ' + this.infoAlbaran.email);   
    if (this.infoAlbaran.solicitant_data != '' && this.infoAlbaran.solicitant_data !=null) cliente.push('Datos del solicitante: ' + this.infoAlbaran.solicitant_data);   


    sumalinea = 0
    cliente.forEach(element => {
      doc.textEx(element,21-margen_dch,4.5+sumalinea,'right','top');    
      sumalinea+=0.6;
    });


    if (bPintarCuadroPrincipal){
    //rectángulo principal y su línea vertical de los totales
    this.pintarRectanguloFactura(doc,inicio_cuadro+complemento_cuadroppal,margen_izq,margen_dch,alto_cabecera,altura_cuadro);
    if (bPintarlineas){
      doc.line(linea_unidades,inicio_cuadro,linea_unidades,inicio_cuadro+altura_cuadro);              
    }

    //cuadro principal
    //esto es demasiado diferente, pongo los casos uno a uno
    switch (dataCompany.id){
      case "410": 
        doc.setTextColor(255);      
        doc.text(2.5,inicio_cuadro+0.6,"UNIDADES");     
        doc.text(8.5,inicio_cuadro+0.6,"CONCEPTOS");
        doc.setTextColor(0);              
        break;
      case "411":
        doc.setTextColor(255);
        doc.text(8.5,inicio_cuadro+0.6,"CONCEPTOS");
        doc.setTextColor(0);
        break;
      case "408":
        doc.text(2.5,inicio_cuadro+0.6,"Un.");     
        doc.text(8.5,inicio_cuadro+0.6,"Conceptos");
        break;
      case "412":
        doc.setTextColor(255);
        doc.text(2.5,inicio_cuadro+0.6,"Un."); 
        doc.text(4.2,inicio_cuadro+0.6,"Código");     
        doc.text(7.5,inicio_cuadro+0.6,"Conceptos");
        doc.setTextColor(0);
        break;
      default:
        doc.setTextColor(255);
        doc.text(2.5,inicio_cuadro+0.6,"Un.");     
        doc.text(8.5,inicio_cuadro+0.6,"Conceptos");
        doc.setTextColor(0);
        break;
    }
  }
    
    //última línea al final de la factura
    doc.setFontSize(7);
    doc.setFontType("normal");
    doc.text(4, 28, dataCompany.credits);
  }

  getSinExistencias(itemstock){

    if (+itemstock.disponibles < +itemstock.units){
        return "red";
      }else{
        return "black";
      }
  }


}
