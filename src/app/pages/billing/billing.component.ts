import { Component, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";
import { SelectItem } from "primeng/primeng";

import { TokenService } from "../../services/token.service";
import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";
import { AuthenticationService } from "../../services/authentication.service";
import { Configuration } from "../../api/configuration";

import { UploadOutput, UploadInput, UploadFile, humanizeBytes,  UploadStatus } from 'ngx-uploader';

import * as _ from "lodash"; 
import { environment } from "environments/environment";

const URL_LOGO = environment.urlUploadLogo;

@Component({
  selector: "app-billing",
  templateUrl: "./billing.component.html",
  styleUrls: ["./billing.component.scss"]
})




export class BillingComponent implements OnInit {
  exportaciones: any;
  @ViewChild("inputSearch") inputSearch;

  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  id_company:number=-1;

  start_date:any;
  end_date:any;
  start_date_calendar:any;
  end_date_calendar:any;
  cobro_date:any;
  hoy:Date =  new Date();

  orden:string= "";//issue_date
  ordsentido:boolean=true;
  cargandofacturas:boolean =false;

  exportation_date;
  tabSeleccionada:number = 1;
  showNewBill: boolean = false;
  showNewExport: boolean = false;
  noBilling: boolean = false;
  pagination: number;
  numPage: number= 1;
  arrpages= [];
  paginationExportation: number;
  numPageExportation: number= 1;
  arrpagesExportation= [];
  idSelected: number = null;
  billings: any = [];
  allbillings: any = [];
  facturasfiltradas: any = [];
  totalbasesimponibles = 0;
  totalivas = 0;
  totaltotales = 0;
  totalcobrado = 0;
  selectedBill: any = null;
  selectedExportation: any = null;
  newBill: any = {
    bill_code: "",
    bill_name: ""
  };
  // listProjects = [];
  selectedProject = null;

  filtronumero:any;
  filtrodescripcion:any;
  filtrocliente:any;
  filtrofecha:any;
  filtrobaseimponible:any;
  filtroiva:any;
  filtrototal:any;
  filtrovencimiento:any;
  filtropedido:any;
  filtrocobrada: any;
  filtrofechacobrada: any;

  displayDialog: boolean = false;
  displayDialogNew: boolean = false;
  displayPagination: boolean = false;
  displayDialogAbono: boolean = false;
  displayDialogDelete: boolean = false;
  displayDialogCobrar: boolean = false;  
  displayDialogDeleteExportation: boolean = false;
  
  msgDelete: string = "¿Estás seguro de eliminar la factura?";
  emptyMsg: string = "No hay facturas añadidas. Añade tu primera factura en el formulario anterior";
  model: any = {
    projectsName: "",
    accountNumber: "",
    parent_account: "",
    type: null
  };
  roleUser: number = 0;
  id_user: number = 0;
  showInput: boolean = true;
  types: any[] = [];
  parentAccounts: any[] = [];
  dataCombos: any = {
    customers: [],
    teams: []
  };
  showCol: boolean = false;
  choosenCompany: boolean = false;
  valueInputSearch = "";

  dataSelects: any = [];

  myDatePickerOptions = this._config.myDatePickerOptions;

  // Initialized to specific date (09.10.2019).
  private modelDate: Object = {
    date: {
      year: 2019,
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
    },
    {
      backgroundColor: 'transparent',
      borderColor: 'rgba(0,255,0,1)',
      pointBackgroundColor: '#777777',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#00FF00',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  public fechahoy = new Date();

  public lineChartData: Array<any> = [{ data: [], label: +this.fechahoy.getFullYear()-2},{ data: [], label: +this.fechahoy.getFullYear()-1}, { data: [], label: +this.hoy.getFullYear() }];
  
// ADD CHART OPTIONS. 

labels =  [+this.hoy.getFullYear()-2,+this.hoy.getFullYear()-1,  +this.hoy.getFullYear()];
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
    this.files = [];
    this.uploadInput = new EventEmitter<UploadInput>();
    this.humanizeBytes = humanizeBytes;


    let lsCompany = JSON.parse(localStorage.getItem("selectedCompany"));
    let lsYear = JSON.parse(localStorage.getItem("selectedFiscalYear"));
    this.id_company= lsCompany.value.id;

    lsCompany = lsCompany ? lsCompany.label : "";
    lsYear = lsYear ? lsYear.label : "";

    if (lsCompany === "" || lsYear === "") {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadAll',
        url: URL_LOGO,
        method: 'POST',
        data: { foo: 'bar' }
      };

      this.uploadInput.emit(event);
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
    } 

    this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
  }

  startUpload(): void {
    const event: UploadInput = {
      type: 'uploadAll',
      url: URL_LOGO,
      method: 'POST',
      data: { foo: 'bar' }
    };

    this.uploadInput.emit(event);
  }

  cancelUpload(id: string): void {
    this.uploadInput.emit({ type: 'cancel', id: id });
  }

  removeFile(id: string): void {
    this.uploadInput.emit({ type: 'remove', id: id });
  }

  removeAllFiles(): void {
    this.uploadInput.emit({ type: 'removeAll' });
  }

  refresh(mensaje:boolean=false){
    this.cargandofacturas = true;
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
    this.id_user = infoUser.id;
    this.recuperarfiltrosstorage();

    this.pagination = 10;


/*     this._api.getProjectsBudgets().subscribe(response => {
      this.listProjects = [];
      response.projects.forEach(element => {
        this.listProjects.push({
          label: element.campaign_name,
          value: element.id
        });
      });
    }); */

    this._api.getStadisticsBilling().subscribe(response => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          //this._notification.error("Aviso!", response.msg);
        } else {
          this.sendValuesChart(response);
        }       
      }     
    });

    let super_start_date;

    super_start_date = {
      date: {
        year: 2010,
        month: 1,
        day: 1
    }};

    this._api.getBills4Exportation(super_start_date,this.end_date).subscribe(response => {
      if (response !== null) {
        if (response.error) {
        } else if (response.status === "error") {
        } else {
          response.items.forEach(element => {
            element.issue_date_no_parsed = element.issue_date;
            element.due_date_no_parsed = element.due_date;
            if (element.issue_date !== '0000-00-00') {
              element.issue_date = this._common.getFecha(
                new Date(element.issue_date)
              );
            } else {
              element.issue_date = this._common.parseDatefromDate('');
            }
            if(element.due_date !== '0000-00-00') {
              element.due_date = this._common.getFecha(
                new Date(element.due_date)
              );
            } else {
              element.due_date = this._common.parseDatefromDate('');
            }
           

          });
          this.allbillings = response.items.map(value => {
            value.tax_base = this._common.currencyFormatES(value.tax_base, false);
            value.taxes = this._common.currencyFormatES(value.taxes, false);
            value.total = this._common.currencyFormatES(value.total, false);
            return value;
          });
        }
      }
    });
  }

  getBgColor(facturaSeleccionada){
    if (facturaSeleccionada.charge_amount == "0"){
      return "black";
    }else if (this._common.getDecimals(facturaSeleccionada.charge_amount,2,true) == facturaSeleccionada.total) {
      return "green";
    }else{
      return "orange";
    }
  }


  onDateChanged(event: IMyDateModel, field) {
    this[field].date = event.date;
    this.refresh();
  }

  ngOnInit() {
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

    this.cobro_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth()+1,
        day: this.hoy.getDate()
    }};

    this.start_date_calendar = this.start_date;
    this.end_date_calendar = this.end_date;


    this.refresh();

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

  getBillsandExportations(mensaje:boolean= false){
 
    this._api.getBills(this.start_date,this.end_date).subscribe(response => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this._notification.error("Aviso!", response.msg);
          this.noBilling = true;
          this.billings = [];
          this.filtrar();
        } else {
          response.items.forEach(element => {
            element.issue_date_no_parsed = element.issue_date;
            element.due_date_no_parsed = element.due_date;
            if (element.issue_date !== '0000-00-00') {
              element.issue_date = this._common.getFecha(
                new Date(element.issue_date)
              );
            } else {
              element.issue_date = this._common.parseDatefromDate('');
            }
            if(element.due_date !== '0000-00-00') {
              element.due_date = this._common.getFecha(
                new Date(element.due_date)
              );
            } else {
              element.due_date = this._common.parseDatefromDate('');
            }
            if(element.charge_date !== '0000-00-00' && element.charge_date !== null) {
              element.charge_date = this._common.getFecha(
                new Date(element.charge_date)
              );
            } else {
              element.charge_date = "n/a";
            }
           

          });
          this.billings = response.items.map(value => {
            value.tax_base = this._common.currencyFormatES(value.tax_base, false);
            value.taxes = this._common.currencyFormatES(value.taxes, false);
            value.total = this._common.currencyFormatES(value.total, false);
            return value;
          });
          this.filtrar();
          if (mensaje){
            this
            ._notification
            .success('¡Éxito!', 'Se han recargado los valores');
          }
          this.displayPagination = this.billings.length > this.pagination;
          this.noBilling = false;
          this._api.getExportationsBilling().subscribe(response => {
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
      }
    });

  }


  deleteBill(item) {
    this.displayDialogDelete = true;
    this.selectedBill = _.cloneDeep(item);
  }

  cobrarBill(item) {
    this.displayDialogCobrar = true;
    this.selectedBill = _.cloneDeep(item);
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
      .deleteExportationBilling(this.idSelected)
      .subscribe((response) => this.parseDeletedExportacion(response));
  }

  createExportation(){
    let billingsDate = `${this.exportation_date.date.year}-${this.exportation_date.date.month}-${this.exportation_date.date.day}`;
      this
      ._api
      .createExportationBilling(billingsDate)
      .subscribe((response) => {
        this.parseCreatedExportation(response);
       } );    
  }



  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);
    this
      ._api
      .deleteBill(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  cobrarBillApi(item, numero) {
    this.displayDialogCobrar = false;

    this.idSelected = parseInt(item.id, 10); 
    this
      ._api
      .cobrarBill(this.idSelected,numero,this.cobro_date)
      .subscribe((response) => this.parseCobrada(response,numero)); 
  }

parseCobrada(response,numero) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.billings, (o) => {
        return o.id == this.idSelected;
      });
      if (numero == 1){
      this
        .billings[idx]["charge_amount"] = parseFloat(this.billings[idx]["total"] .toString().replace('.','').replace('.','').replace(',','.'));//this._common.getFecha(this.hoy);
        this.billings[idx]["charge_date"] = this.cobro_date.formatted;
      }else{
        this.billings[idx]["charge_amount"] = 0;//'n/a';
        this.billings[idx]["charge_date"] = 'n/a';
      }
      this.filtrar();
      this.displayDialogDelete = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha realizado la operación');
    } else {
      this.displayDialogDelete = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
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
        .success('¡Éxito!', 'Se ha eliminado la factura');
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
        this.allbillings.forEach((fact) => {
          if (fact.id_export == this.idSelected) fact.id_export = 0;
        })
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
        let fechafin = new Date(this.exportation_date.date.year,this.exportation_date.date.month-1,this.exportation_date.date.day);
        this.allbillings.forEach((fact) => {
          let fechaaux = fact.issue_date_no_parsed.split('-');
          let mifecha = new Date(fechaaux[0],parseInt(fechaaux[1])-1,fechaaux[2]);
          if (fact.id_export == 0 &&  mifecha <= fechafin) fact.id_export = response.number;
        })

    } else {
      this 
        ._notification
        .error('¡Error!', response.msg);
    }
    this.getBillsandExportations();
  }

  recuperarfiltrosstorage(){
    this.filtronumero = (localStorage.getItem(this.id_user + 'FACfiltronumero') ? localStorage.getItem(this.id_user + 'FACfiltronumero') : '');
    this.filtrodescripcion = (localStorage.getItem(this.id_user + 'FACfiltrodescripcion') ? localStorage.getItem(this.id_user + 'FACfiltrodescripcion') : '');
    this.filtrocliente = (localStorage.getItem(this.id_user + 'FACfiltrocliente') ? localStorage.getItem(this.id_user + 'FACfiltrocliente') : '');
    this.filtrofecha = (localStorage.getItem(this.id_user + 'FACfiltrofecha') ? localStorage.getItem(this.id_user + 'FACfiltrofecha') : '');
    this.filtrobaseimponible = (localStorage.getItem(this.id_user + 'FACfiltrobaseimponible') ? localStorage.getItem(this.id_user + 'FACfiltrobaseimponible') : '');
    this.filtroiva = (localStorage.getItem(this.id_user + 'FACfiltroiva') ? localStorage.getItem(this.id_user + 'FACfiltroiva') : '');
    this.filtrototal = (localStorage.getItem(this.id_user + 'FACfiltrototal') ? localStorage.getItem(this.id_user + 'FACfiltrototal') : '');
    this.filtrovencimiento = (localStorage.getItem(this.id_user + 'FACfiltrovencimiento') ? localStorage.getItem(this.id_user + 'FACfiltrovencimiento') : '');
    this.filtropedido = (localStorage.getItem(this.id_user + 'FACfiltropedido') ? localStorage.getItem(this.id_user + 'FACfiltropedido') : '');
    this.filtrocobrada = (localStorage.getItem(this.id_user + 'FACfiltrocobrada') ? localStorage.getItem(this.id_user + 'FACfiltrocobrada') : '');
    this.filtrofechacobrada = (localStorage.getItem(this.id_user + 'FACfiltrofechacobrada') ? localStorage.getItem(this.id_user + 'FACfiltrofechacobrada') : '');
    this.numPage = +(localStorage.getItem(this.id_user + 'FACpage') ? (localStorage.getItem(this.id_user + 'FACpage')): 1);
  }

  guardarfiltrosstorage(){
    localStorage.setItem(this.id_user + 'FACfiltronumero', this.filtronumero);
    localStorage.setItem(this.id_user + 'FACfiltrodescripcion',this.filtrodescripcion);
    localStorage.setItem(this.id_user + 'FACfiltrocliente',this.filtrocliente);
    localStorage.setItem(this.id_user + 'FACfiltrofecha',this.filtrofecha);
    localStorage.setItem(this.id_user + 'FACfiltrobaseimponible',this.filtrobaseimponible);
    localStorage.setItem(this.id_user + 'FACfiltroiva',this.filtroiva);
    localStorage.setItem(this.id_user + 'FACfiltrototal',this.filtrototal);
    localStorage.setItem(this.id_user + 'FACfiltrovencimiento',this.filtrovencimiento);
    localStorage.setItem(this.id_user + 'FACfiltropedido',this.filtropedido);
    localStorage.setItem(this.id_user + 'FACfiltrocobrada',this.filtrocobrada);
    localStorage.setItem(this.id_user + 'FACfiltrofechacobrada',this.filtrofechacobrada);
  }

  filtrar(){
    this.guardarfiltrosstorage();

    this.facturasfiltradas = [];
    let filtronum:string = (this.filtronumero == undefined ? "" : this.filtronumero);
    let filtrodesc:string = (this.filtrodescripcion == undefined ? "" : this.filtrodescripcion);
    let filtrocli:string = (this.filtrocliente == undefined ? "" : this.filtrocliente);
    let filtrofech:string = (this.filtrofecha == undefined ? "" : this.filtrofecha);
    let filtrobi:string = (this.filtrobaseimponible == undefined ? "": this.filtrobaseimponible);
    let filtroiv:string = (this.filtroiva == undefined ? "": this.filtroiva);
    let filtrott:string = (this.filtrototal == undefined ? "": this.filtrototal);
    let filtrovto:string = (this.filtrovencimiento == undefined ? "": this.filtrovencimiento);
    let filtroped:string = (this.filtropedido == undefined ? "": this.filtropedido);
    let filtrocob: string = (this.filtrocobrada == undefined ? "": this.filtrocobrada);
    let filtrofcb: string = (this.filtrofechacobrada == undefined ? "": this.filtrofechacobrada);

    filtrocob = filtrocob.replace(".","").replace(".","").replace(",",".");
    

    for (let i= 0; i < this.billings.length; i++){
      if (this._common.getCleanedString(this.billings[i].numbertext).indexOf(this._common.getCleanedString(filtronum)) >= 0  &&
       this._common.getCleanedString(this.billings[i].issue_date).indexOf(this._common.getCleanedString(filtrofech)) >= 0 &&
      this._common.getCleanedString(this.billings[i].description).indexOf(this._common.getCleanedString(filtrodesc)) >= 0 &&
      this._common.getCleanedString(this.billings[i].customer).indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
      this._common.getCleanedString(this.billings[i].due_date).indexOf(this._common.getCleanedString(filtrovto)) >= 0 &&
      this._common.getCleanedString(this.billings[i].ped_code).indexOf(this._common.getCleanedString(filtroped)) >= 0  &&
      this._common.getCleanedString(this.billings[i].charge_date).indexOf(this._common.getCleanedString(filtrofcb)) >= 0 &&                 
      this.billings[i].charge_amount.indexOf(this._common.getCleanedString(filtrocob)) >= 0 // &&       
/*      this.billings[i].tax_base.indexOf(this._common.getCleanedString(filtrobi)) >= 0 &&
      this.billings[i].taxes.indexOf(this._common.getCleanedString(filtroiv)) >= 0 &&
      this.billings[i].total.indexOf(this._common.getCleanedString(filtrott)) >= 0  */
        ){ 
         this.facturasfiltradas.push(this.billings[i]);
       }
    } 
    this.paginarysumar();
  }

  irPagina(numpagina){
    this.numPage = numpagina;
    localStorage.setItem(this.id_user + 'FACpage',numpagina);
  }

  paginarysumar(){
    this.arrpages = [];
    this.totalbasesimponibles = 0;
    this.totalivas = 0;
    this.totaltotales = 0;
    this.totalcobrado = 0;

    for (let i=0; i < this.facturasfiltradas.length;i++){
      if (i%this.pagination == 0){
        this.arrpages.push(i/this.pagination+1);
      }

/*       if (isNull(this.facturasfiltradas[i].budget_expenses)) this.facturasfiltradas[i].budget_expenses = 0;
      if (isNull(this.facturasfiltradas[i].budget_income)) this.facturasfiltradas[i].budget_income = 0;      
      if (isNull(this.facturasfiltradas[i].real_expenses)) this.facturasfiltradas[i].real_expenses = 0;
      if (isNull(this.facturasfiltradas[i].real_income)) this.facturasfiltradas[i].real_income = 0;*/
      
      this.totalbasesimponibles += parseFloat(this.facturasfiltradas[i].tax_base.toString().replace('.','').replace('.','').replace(',','.'));
      this.totalivas += parseFloat(this.facturasfiltradas[i].taxes.toString().replace('.','').replace('.','').replace(',','.')); 
      this.totaltotales += parseFloat(this.facturasfiltradas[i].total.toString().replace('.','').replace('.','').replace(',','.'));  
      this.totalcobrado += parseFloat(this.facturasfiltradas[i].charge_amount);           
    }

    this.cargandofacturas=false;
/*     let eventosimulado:any= [];
    eventosimulado.srcElement = [];
    eventosimulado.srcElement.id = this.orden;
    this.ordsentido = !this.ordsentido;
    this.ordenar(eventosimulado); */

  }

  abonar(factura){
    this._api
    .abonoBill(`id_bill_origen=${factura.id}`)
    .subscribe(response => {
      const idBill = response.id_bill;
      this._router.navigate(["/factura", idBill]);
    });
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

  isVencida(fecha){
    let hoy = new Date();
    let fechaspl = fecha.split("-");
    let fch = new Date(fechaspl[0],fechaspl[1],fechaspl[2]);

    if (fch < hoy) return true;
    return false;
  }

  breakdownBill(bill) {
    this._router.navigate(["/factura", bill.id]);
  }

  abonarBill(bill){
    this.displayDialogAbono = true;
    this.selectedBill = _.cloneDeep(bill);

    this.selectedBill.bill_name = bill.description;
  }

  selectBill(item, index) {
    let issueDate = this.getDateParsed(item.issue_date_no_parsed),
      dueDate = this.getDateParsed(item.due_date_no_parsed);
    this.displayDialog = true;
    this.selectedBill = _.cloneDeep(item);

    this.selectedBill.idx = index;
    this.selectedBill.bill_name = item.description;

    this.selectedBill.issue_date_model = {
      date: {
        year: issueDate[0],
        month: issueDate[1],
        day: issueDate[2]
      }
    };
    this.selectedBill.due_date_model = {
      date: {
        year: dueDate[0],
        month: dueDate[1],
        day: dueDate[2]
      }
    };
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
    if (!this.selectedBill.due_date_model){
      this._notification.error('Error', 'La fecha de vencimiento es incorrecta');
      return null;
    }
    
    this.idSelected = parseInt(this.selectedBill.id, 10);

    body = `id=${this.idSelected}`;
    body += `&idx=${this.selectedBill.idx}`;
    body += `&description=${this.selectedBill.bill_name}`;
    body += `&po=${this.selectedBill.PO}`;
    body += `&id_customer=${this.selectedBill.id_customer}`;
    body += `&id_team=${this.selectedBill.id_team}`;
    body += `&due_date=${
      this.selectedBill.due_date_model.date.year
    }-${this.selectedBill.due_date_model.date.month}-${
      this.selectedBill.due_date_model.date.day
    }`;
    this._api
      .updateBill(body)
      .subscribe(response => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this
        ._notification
        .success('¡Éxito!', 'Se ha actualizado la factura');
      //this.updateRows(response);
      this.refresh();
    } else {
      this.displayDialog = false;
      this
        ._notification
        .error('¡Error!', response.msg);
    }
  }

  updateRows(response) {
    this.billings[parseInt(response.idx)].description = response.item[0].description;
    this.billings[parseInt(response.idx)].po = response.item[0].PO;
    this.billings[parseInt(response.idx)].customer = response.item[0].customer;
    this.billings[parseInt(response.idx)].team = response.item[0].team;
    this.billings[parseInt(response.idx)].due_date_no_parsed = response.item[0].due_date;
    this.billings[parseInt(response.idx)].due_date = this
      ._common
      .getFecha(new Date(response.item[0].due_date));

  }


  exportExcel(): void {
    let exportData = [];
    let ws_name = '';

    exportData = this.fillExcelData();
    ws_name = 'Listado de facturas';

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
    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `listado_facturas.xlsx`);
  }

  fillExcelData() {
    let exportData = [];
    this.facturasfiltradas.forEach((line) => {
      if (this.id_company == 412){
        exportData.push({
          'Número': line.numbertext,
          'Nº Pedido': line.ped_code,
          'Campaña': line.numcampana,
          'Emisión': line.issue_date,
          'Descripción': line.description,
          'Equipo': line.team,
          'Cliente': line.customer,
          'PO': line.PO,
          'Vencimiento': line.due_date,
          'Base Imponible': this._common.getNumber(line.tax_base),
          'IVA': this._common.getNumber(line.taxes),
          'Total': this._common.getNumber(line.total),
          'Cobrado': this._common.getNumber(this._common.getDecimals(line.charge_amount,2,true)),
          'Fecha Cobro': line.charge_date, 
          'CIF': (line.customer_cif == null ?'': line.customer_cif.toString().trim())
        }); 
      }else{
        exportData.push({
          'Número': line.numbertext,
          'Nº Pedido': line.ped_code,
          'Emisión': line.issue_date,
          'Descripción': line.description,
          'Equipo': line.team,
          'Cliente': line.customer,
          'PO': line.PO,
          'Vencimiento': line.due_date,
          'Base Imponible': this._common.getNumber(line.tax_base),
          'IVA': this._common.getNumber(line.taxes),
          'Total': this._common.getNumber(line.total),
          'Cobrado': this._common.getNumber(this._common.getDecimals(line.charge_amount,2,true)),
          'Fecha Cobro': line.charge_date, 
          'CIF': (line.customer_cif == null ?'': line.customer_cif.toString().trim())
        }); 

      }     
    });


    return exportData;
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
    let facturastodas = [];
    this.allbillings.forEach((fact) => facturastodas.push(fact));

    let dataCompany = JSON.parse(localStorage.getItem('selectedCompany')).value;

    if (dataCompany.id != 411){
      exportData.push({
        'Num': 'Factura',
        'Fecha': 'Factura',
        'Cuenta': 'Cliente',
        'Nombre': 'Cliente',
        'N.I.F.':  'Cliente',
        'Iva al 4 %': 'CUENTA BASE',
        '4base':'BASE',
        '4cuota':'CUOTA',
        'Iva al 10 %': 'CUENTA BASE',
        '10base':'BASE',
        '10cuota':'CUOTA',
        'Iva al 21%': 'CUENTA BASE',
        '21base':'BASE',
        '21cuota': 'CUOTA',
        'RECARGO DE EQUIVALENCIA': 'TIPO 0,5 %',	
        'TIPO14': 'TIPO 1,4 %',	
        'TIPO52': 'TIPO 5,2 %',	
        'IVA NO DEDUCIBLE':'CUENTA',
        'C':'IMPORTE',
        'RETENCIÓN':'PERCEPCIÓN',
        'IRPF': 'RETENCIÓN',
        'Total': 'Factura',
        'IVA EXENTO': 'CUENTA BASE',
        'exbase': 'BASE',
        'excuota': 'CUOTA',
        'COBRO/PAGO':'CUENTA',
        'VENCIMIENTO': '',
        'DESDE TIQUE': '',
        'HASTA TIQUE': '',
        'REFERENCIA': '',
        'CÓDIGO POSTAL': '(TERCERO)',
        'FORMA PAGO': '',
        'PAIS': '',
        'Intracomunitaria Bienes 21%': 'CUENTA BASE',
        '21BASE':'BASE',
        '21CUOTA':'CUOTA',
        'Intracomunitaria Bienes 10%': 'CUENTA BASE',
        '10BASE':'BASE',
        '10CUOTA':'CUOTA',
        'Intracomunitaria Bienes 4%': 'CUENTA BASE',
        '4BASE':'BASE',
        '4CUOTA':'CUOTA',         
        'Intracomunitaria Servicios 21%': 'CUENTA BASE',
        '21SBASE':'BASE',
        '21SCUOTA':'CUOTA',
        'Intracomunitaria Servicios 10%': 'CUENTA BASE',
        '10SBASE':'BASE',
        '10SCUOTA':'CUOTA',
        'Intracomunitaria Servicios 4%': 'CUENTA BASE',
        '4SBASE':'BASE',
        '4SCUOTA':'CUOTA',    
        'Ventas Intracomunitaria Bienes': 'CUENTA BASE',
        '21VIBBASE':'BASE',
        '21VIBCUOTA':'CUOTA', 
        'Ventas Intracomunitaria Servicios': 'CUENTA BASE',
        '21VISBASE':'BASE',
        '21VISCUOTA':'CUOTA', 
        'Documento': '',
        'CODIGO':'CODIGO',
        'TITULO':'TITULO'
      });
      exportData.push({
        'Num': 'Codigos cuentas de VENTAS, IVA, IRPF genéricas',
        'Fecha': '',
        'Cuenta': '',
        'Nombre': '',
        'N.I.F.':  '',
        'Iva al 4 %': '',
        '4base':'',
        '4cuota':'477000',
        'Iva al 10 %': '',
        '10base':'',
        '10cuota':'477000',
        'Iva al 21%': '',
        '21base':'',
        '21cuota': '47700016',
        'RECARGO DE EQUIVALENCIA': '477000',	
        'TIPO14': '477000',	
        'TIPO52': '477000',	
        'IVA NO DEDUCIBLE':'',
        'C':'',
        'RETENCIÓN':'G',
        'IRPF': '473001',
        'Total': '',
        'IVA EXENTO': '',
        'exbase': '',
        'excuota': '477000',
        'COBRO/PAGO':'',
        'VENCIMIENTO': '',
        'DESDE TIQUE': '',
        'HASTA TIQUE': '',
        'REFERENCIA': '',
        'CÓDIGO POSTAL': '',
        'FORMA PAGO': '',
        'PAIS': '',
        'Intracomunitaria Bienes 21%': '',
        '21BASE':'',
        '21CUOTA':'477001',
        'Intracomunitaria Bienes 10%': '',
        '10BASE':'',
        '10CUOTA':'477001',
        'Intracomunitaria Bienes 4%': '',
        '4BASE':'',
        '4CUOTA':'477001',         
        'Intracomunitaria Servicios 21%': '',
        '21SBASE':'',
        '21SCUOTA':'477001',
        'Intracomunitaria Servicios 10%': '',
        '10SBASE':'',
        '10SCUOTA':'477001',
        'Intracomunitaria Servicios 4%': '',
        '4SBASE':'',
        '4SCUOTA':'477001',    
        'Ventas Intracomunitaria Bienes': '',
        '21VIBBASE':'',
        '21VIBCUOTA':'477001', 
        'Ventas Intracomunitaria Servicios': '',
        '21VISBASE':'',
        '21VISCUOTA':'477001', 
        'Documento': '',
        'CODIGO':'',
        'TITULO':''
      });
      exportData.push({
        'Num': 'Codigos cuentas de COMPRAS, IVA, IRPF genéricas',
        'Fecha': '',
        'Cuenta': '',
        'Nombre': '',
        'N.I.F.':  '',
        'Iva al 4 %': '',
        '4base':'',
        '4cuota':'472000',
        'Iva al 10 %': '',
        '10base':'',
        '10cuota':'472000',
        'Iva al 21%': '',
        '21base':'',
        '21cuota': '47200016',
        'RECARGO DE EQUIVALENCIA': '472000',	
        'TIPO14': '472000',	
        'TIPO52': '472000',	
        'IVA NO DEDUCIBLE':'',
        'C':'',
        'RETENCIÓN':'3',
        'IRPF': '475001',
        'Total': '',
        'IVA EXENTO': '',
        'exbase': '',
        'excuota': '472000',
        'COBRO/PAGO':'',
        'VENCIMIENTO': '',
        'DESDE TIQUE': '',
        'HASTA TIQUE': '',
        'REFERENCIA': '',
        'CÓDIGO POSTAL': '',
        'FORMA PAGO': '',
        'PAIS': '',
        'Intracomunitaria Bienes 21%': '',
        '21BASE':'',
        '21CUOTA':'472001',
        'Intracomunitaria Bienes 10%': '',
        '10BASE':'',
        '10CUOTA':'472001',
        'Intracomunitaria Bienes 4%': '',
        '4BASE':'',
        '4CUOTA':'472001',         
        'Intracomunitaria Servicios 21%': '',
        '21SBASE':'',
        '21SCUOTA':'472001',
        'Intracomunitaria Servicios 10%': '',
        '10SBASE':'',
        '10SCUOTA':'472001',
        'Intracomunitaria Servicios 4%': '',
        '4SBASE':'',
        '4SCUOTA':'472001',    
        'Ventas Intracomunitaria Bienes': '',
        '21VIBBASE':'',
        '21VIBCUOTA':'472001', 
        'Ventas Intracomunitaria Servicios': '',
        '21VISBASE':'',
        '21VISCUOTA':'472001', 
        'Documento': '',
        'CODIGO':'',
        'TITULO':''
      });
    }

    facturastodas.reverse().forEach((line) => {
      if (line.id_export == exportacion ){
        //indiceasiento++;
        //indiceasiento++;
        let fechatemp = line.issue_date_no_parsed.split("-")
        let fecha = new Date(fechatemp[0],parseInt(fechatemp[1])-1,fechatemp[2]);
        let bAbono = (line.numbertext.toString().indexOf('AB') >= 0? true:false);
        let fecha_rect = null;
        if (line.issue_date_rect != 0) fecha_rect = line.issue_date_rect.split("-")
        let fechavenc =  new Date(fechatemp[0],parseInt(fechatemp[1])-1,fechatemp[2]);

        if (dataCompany.id != 411){
          exportData.push({
            'Num': line.numbertext.toString(),
            'Fecha': this._common.getFecha(fecha),
            'Cuenta': line.customer_account,
            'Nombre': line.customer,
            'N.I.F.':  (line.customer_cif == null ?'': line.customer_cif.toString().trim()),
            'Iva al 4 %': '',
            '4base':0,
            '4cuota':0,
            'Iva al 10 %': '',
            '10base':0,
            '10cuota':0,
            'Iva al 21%': (line.percent_tax == 21 ? line.account_subconcept: ''),
            '21base': (line.percent_tax == 21 ? line.tax_base.replace(/\./g,'') : 0),
            '21cuota': (line.percent_tax == 21 ? ((Math.round(2100*parseFloat(line.tax_base.toString().replace('.','').replace('.','').replace(',','.'))))/10000).toString().replace('.',","):0) ,
            'RECARGO DE EQUIVALENCIA': '',	
            'TIPO14': '',	
            'TIPO52': '',	
            'IVA NO DEDUCIBLE':'',
            'C':'', 
            'RETENCIÓN':'',
            'IRPF': '',
            'Total': ((Math.round((line.percent_tax == 21 ? 12100: 10000)*parseFloat(line.tax_base.toString().replace('.','').replace('.','').replace(',','.'))))/10000).toString().replace('.',","),
            'IVA EXENTO': (line.percent_tax == 0 ? line.account_subconcept: ''),
            'exbase': (line.percent_tax == 0 ? line.tax_base.replace(/\./g,'') : 0),
            'excuota': (line.percent_tax == 0 ? 0:0) ,
            'COBRO/PAGO':'',
            'VENCIMIENTO': this._common.getFecha(fechavenc),
            'DESDE TIQUE': '',
            'HASTA TIQUE': '',
            'REFERENCIA': 'Zum',
            'CÓDIGO POSTAL': '',
            'FORMA PAGO': '',
            'PAIS': '',
            'Intracomunitaria Bienes 21%': '',
            '21BASE':0,
            '21CUOTA':0,
            'Intracomunitaria Bienes 10%': '',
            '10BASE':0,
            '10CUOTA':0,
            'Intracomunitaria Bienes 4%': '',
            '4BASE':0,
            '4CUOTA':0,         
            'Intracomunitaria Servicios 21%': '',
            '21SBASE':0,
            '21SCUOTA':0,
            'Intracomunitaria Servicios 10%': '',
            '10SBASE':0,
            '10SCUOTA':0,
            'Intracomunitaria Servicios 4%': '',
            '4SBASE':0,
            '4SCUOTA':0,    
            'Ventas Intracomunitaria Bienes': '',
            '21VIBBASE':0,
            '21VIBCUOTA':0,
            'Ventas Intracomunitaria Servicios': '',
            '21VISBASE':0,
            '21VISCUOTA':0,
            'Documento': '',
            'CODIGO':'',
            'TITULO':''
          })
        }else{
    
       exportData.push({
        'Serie': line.numbertext.toString().substring(0,2),
        'Factura': line.number,
        'Fecha': this._common.getFecha(fecha),
        'FechaOperacion': this._common.getFecha(fecha),
        'CodigoCuenta':  line.customer_account ,
        'CIFEUROPEO': (line.customer_cif == null ?'': line.customer_cif.toString().trim()),
        'Cliente': line.customer,
        'Comentario SII': line.description,
        'Contrapartida': (bAbono ? '70800000' : '70500000'),
        'CodigoTransaccion':'',
        'ClaveOperaciónFact':1,
        'Importe Factura': this._common.getDecimals(parseFloat(line.total.toString().replace('.','').replace('.','').replace(',','.')),2,true) + ' €',
        'Base Imponible1': this._common.getDecimals(parseFloat(line.tax_base.toString().replace('.','').replace('.','').replace(',','.')),2,true) + ' €',
        '%Iva1': line.percent_tax,
        'Cuota Iva1': this._common.getDecimals(parseFloat(line.taxes.toString().replace('.','').replace('.','').replace(',','.')),2,true) + ' €',
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
        'SerieFacturaRectificada': (bAbono ? 'FR': ''),
        'NumeroFacturaRectificada':	(bAbono ? line.number_rect: ''),
        'FechaFacturaRectificada': (fecha_rect ? fecha_rect[2] + '/' + fecha_rect[1] + '/' + fecha_rect[0]: ''),
        'BaseImponibleRectificada': (bAbono ? this._common.getDecimals(line.tax_base_rect,2,true): ''),
        'CuotaIvaRectificada': (bAbono ? this._common.getDecimals(line.taxes_rect,2,true): ''),
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
        'Fecha Vencimiento': (this._common.getFecha(fechavenc).indexOf("1899") >= 0 ? '':this._common.getFecha(fechavenc))
      })
 
    }      
  }
    });
  

    return exportData;
  }  

  sendValuesChart(vec) {
    this.lineChartData = [{ data: [], label: +this.hoy.getFullYear()-2 },{ data: [], label: +this.hoy.getFullYear()-1 }, { data: [], label: +this.hoy.getFullYear() }];
    let datoanyo1 = 0;
    let datoanyo2 = 0;
    let datoanyo3 = 0;
    let mes = 1;
    let anyo = 0;

    vec.mensual.forEach(element => {
      if (anyo != element.anyo){
        mes = 1;
      }
      anyo = element.anyo;
      if (mes >= 13) mes = 1;

      while (mes != element.mes || anyo != element.anyo){
        this.lineChartData[parseInt(element.anyo)-this.hoy.getFullYear()+2].data.push(0); 
        mes++; 
      }

      if (mes == element.mes && anyo == element.anyo){
        this.lineChartData[parseInt(element.anyo)-this.hoy.getFullYear()+2].data.push(this._common.toFloat(element.importe, true));    
        mes++;
      }

      if (parseInt(element.anyo) == (this.hoy.getFullYear()-2)){
        datoanyo1 += this._common.toFloat(element.importe);
      } else if (parseInt(element.anyo) == (this.hoy.getFullYear()-1)){
        datoanyo2 += this._common.toFloat(element.importe);
      }else{
        datoanyo3 += this._common.toFloat(element.importe);
      }

    });

    this.chartData = [
      { 
        label: 'Todo el año',
        data: [datoanyo1,datoanyo2, datoanyo3]
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

        if (campoord == "tax_base" || campoord== "taxes" || campoord== "total" || campoord== "charge_amount"){
          this.facturasfiltradas =  _.orderBy(this.facturasfiltradas,[item => parseFloat(item[this.orden])],[(this.ordsentido ? 'desc' : 'asc')]);
        } else{
          this.facturasfiltradas =  _.orderBy(this.facturasfiltradas,[item => (item[this.orden] == null ? "" : item[this.orden].toLowerCase())],[(this.ordsentido ? 'desc' : 'asc')]);
        }
        this.numPage = 1;
    }


  }

}
