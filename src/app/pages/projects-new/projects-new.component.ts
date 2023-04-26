import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";
import { SelectItem } from "primeng/primeng";

import { TokenService } from "../../services/token.service";
import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";
import { AuthenticationService } from "../../services/authentication.service";
import { Configuration } from "../../api/configuration";

import * as _ from "lodash";
import { isNull } from "util";
import { IMyDateModel } from "mydatepicker";

@Component({
  selector: "app-projects-new",
  templateUrl: "./projects-new.component.html",
  styleUrls: ["./projects-new.component.scss"],
})
export class ProjectsNewComponent implements OnInit {
  @ViewChild("inputSearch") inputSearch;

  noProjects: boolean = false;
  arrpages = [];
  totalingresosprevistos: number;
  totalingresosreales: number;
  totalgastosprevistos: number;
  totalgastosreales: number;
  hoy: Date = new Date();
  nuevoClienteOculto = true;
  cargandolistado: any = false;
  bPermisoAnyadir: boolean = true;
  customerSelected = null;
  ordersCustomer = [];
  ordersSelectedToFacture = [];
  filtronumero: any;
  filtroproyecto: any;
  filtrocliente: any;
  filtrofechainicio: any;
  filtropedido: any;
  filtroestado: any = "-1";
  filtroestadoanterior: any = "-1";
  filtrodesestimado: any = "-1";
  filtroingresosprevistos: any;
  filtroingresosreales: any;
  filtrogastosprevistos: any;
  filtrogastosreales: any;
  filtromargenprevistos: any;
  filtromargenreales: any;
  filtroPtesFacturar: boolean = false;
  filtroSinFactura: boolean = false;
  cabeceraNuevoProyecto = "Facturar pedidos";
  tabSeleccionada = 2;

  start_date: any;
  end_date: any;
  start_date_calendar: any;
  end_date_calendar: any;

  id_company: any;
  motivodesestimar = "";
  status: SelectItem[];
  pagination: number;
  numPage: number = 1;
  idSelected: number = null;
  proyectoorigen = null;
  projects: any = [];
  projectsfiltrados: any = [];
  selectedCampaign: any = null;
  showTramitarPedido: boolean = false;
  newCampaign: any = {
    campaign_code: "",
    campaign_name: "",
    create_date_model: {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth() + 1,
        day: this.hoy.getDate(),
      },
    },
    end_date_model: {
      date: {
        /*         year: endDate[0],
        month: endDate[1],
        day: endDate[2] */
        year: 2099,
        month: 12,
        day: 31,
      },
    },
    start_date_event: {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth() + 1,
        day: this.hoy.getDate(),
      },
    },
    end_date_event: {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth() + 1,
        day: this.hoy.getDate(),
      },
    },
  };
  displayDialog: boolean = false;
  billDate = null;
  displayDialogMultiplePedidos: boolean = false;
  displayDialogNew: boolean = false;
  displayDialogCliente: boolean = false;
  selectedCustomer: any;
  displayPagination: boolean = false;
  displayDialogDelete: boolean = false;
  displayDialogDesestimar: boolean = false;
  displayDialogAnular: boolean = false;
  msgDelete: string = "¿Estás seguro de eliminar el proyecto?";
  emptyMsg: string =
    "No hay proyectos añadidas. Añade tu primer proyecto en el formulario anterior";
  model: any = {
    projectsName: "",
    accountNumber: "",
    parent_account: "",
    type: null,
  };
  showReservationLogic = false;
  autoNumbered = true;
  roleUser: number = 0;
  user_id: number = -1;
  showInput: boolean = true;
  types: any[] = [];
  parentAccounts: any[] = [];
  dataCombos: any = {
    users: [],
    customers: [],
    teams: [],
    groups: [],
    subgroups: [],
    status: [],
    security: [
      {
        label: "Alto",
        value: "Alto",
      },
      {
        label: "Bajo",
        value: "Bajo",
      },
    ],
  };
  showCol: boolean = false;
  choosenCompany: boolean = false;
  valueInputSearch = "";

  dataSelects: any = [];

  myDatePickerOptions = this._config.myDatePickerOptions;

  // Initialized to specific date (09.10.2019).
  private modelDate: Object = {
    date: {
      year: this.hoy.getFullYear(),
      month: 10,
      day: 9,
    },
  };

  onDateBillChanged(event: IMyDateModel) {
    this.billDate = event.date;
  }

  public lineChartLabels: Array<any> = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  public lineChartOptions: any = {
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            fontColor: "#80A9DD",
            fontSize: 12,
            beginAtZero: true,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: true,
            color: "#4087D1",
          },
          ticks: {
            fontColor: "#80A9DD",
            fontSize: 12,
            beginAtZero: true,
            callback: function (value, index, values) {
              return value
                .toString()
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            },
          },
        },
      ],
    },
    maintainAspectRatio: false,
    responsive: true,
    yLabels: {
      display: true,
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return tooltipItem.yLabel
            .toString()
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
      },
    },
  };

  public chartOptions: any = {
    scales: {
      yAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return value
                .toString()
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            },
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return tooltipItem.yLabel
            .toString()
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
      },
    },
  };

  public chartOptionsHorizontal: any = {
    scales: {
      xAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return value
                .toString()
                .replace(".", ",")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            },
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return tooltipItem.xLabel
            .toString()
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
      },
    },
  };

  /*   Chart.defaults.global.multiTooltipTemplate = function(label){
    return label.datasetLabel + ': ' + label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");}
; // "<%= value %>"; */

  public lineChartColors: Array<any> = [
    {
      backgroundColor: "transparent",
      borderColor: "rgba(72,134,254,1)",
      pointBackgroundColor: "#777777",
      pointBorderColor: "#FFFFFF",
      pointHoverBackgroundColor: "#68A6ff",
      pointHoverBorderColor: "rgba(148,159,177,0.8)",
    },
    {
      backgroundColor: "transparent",
      borderColor: "rgba(234,47,74,1)",
      pointBackgroundColor: "#777777",
      pointBorderColor: "#FFFFFF",
      pointHoverBackgroundColor: "#FF4F6A",
      pointHoverBorderColor: "rgba(77,83,96,1)",
    },
    {
      backgroundColor: "transparent",
      borderColor: "rgba(0,255,0,1)",
      pointBackgroundColor: "#777777",
      pointBorderColor: "#FFFFFF",
      pointHoverBackgroundColor: "#00FF00",
      pointHoverBorderColor: "rgba(77,83,96,1)",
    },
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = "line";

  public lineChartData: Array<any> = [
    { data: [], label: +this.hoy.getFullYear() - 2 },
    { data: [], label: +this.hoy.getFullYear() - 1 },
    { data: [], label: +this.hoy.getFullYear() },
  ];

  // ADD CHART OPTIONS.

  labels = [
    +this.hoy.getFullYear() - 2,
    +this.hoy.getFullYear() - 1,
    +this.hoy.getFullYear(),
  ];
  labelsHor = ["", "", "", "", ""];

  // STATIC DATA FOR THE CHART IN JSON FORMAT.
  chartData = [
    {
      label: "Todo el año",
      data: [],
    },
  ];

  chartDataHorizontal = [
    {
      label: "",
      data: [],
    },
  ];

  // CHART COLOR.
  colors = [
    {
      // 2nd Year.
      backgroundColor: "rgba(255, 215, 0, 0.8)",
    },
  ];

  colorsHor = [
    {
      // 2nd Year.
      backgroundColor: "rgba(77,183,196,0.5)",
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

    lsCompany = lsCompany ? lsCompany.label : "";
    lsYear = lsYear ? lsYear.label : "";

    if (lsCompany === "" || lsYear === "") {
      this.choosenCompany = false;
    } else {
      this.choosenCompany = true;
    }

    _common.searchChanged$.subscribe((value) => {
      this.changeSearchInput(value);
    });
  }
  updateCustomerSelected(value) {
    this.ordersCustomer = this.projects.filter(
      (project) => project.customer == this.customerSelected
    );
    this.ordersCustomer = this.ordersCustomer.map((order) => ({
      ...order,
      checked: false,
    }));
  }
  onUpdateCheckbox(value, id) {
    if (value.checked) {
      this.ordersSelectedToFacture.push(id);
      this.ordersSelectedToFacture = Array.from(
        new Set(this.ordersSelectedToFacture)
      );
    } else {
      const index = this.ordersSelectedToFacture.indexOf(id);
      this.ordersSelectedToFacture.splice(index, 1);
    }
    this.ordersCustomer = this.ordersCustomer.map((order) => ({
      ...order,
      checked: order.id === id ? value.checked : order.checked,
    }));
  }

  createMultipleOrders() {
    console.log(JSON.parse(localStorage.getItem("selectedCompany")).value.id);
    console.log(
      JSON.parse(localStorage.getItem("selectedFiscalYear")).value.id
    );
    console.log(localStorage.getItem("token"));
    console.log(this.ordersSelectedToFacture.join(","));
    console.log(
      `${this.billDate.date.year}-${this.billDate.date.month}-${this.billDate.date.day}`
    );

    this.displayDialogMultiplePedidos = false;
    const token = localStorage.getItem("token");
    const id_fiscal_year = JSON.parse(
      localStorage.getItem("selectedFiscalYear")
    ).value.id;
    const id_company = JSON.parse(localStorage.getItem("selectedCompany")).value
      .id;
    const fechafactura = `${this.billDate.date.year}-${this.billDate.date.month}-${this.billDate.date.day}`;
    this._api
      .createBillFromMultipleOrders(
        `id_fiscal_year=${id_fiscal_year}&id_company=${id_company}&token=${token}&orders=${this.ordersSelectedToFacture.join(
          ","
        )}&date_bill=${fechafactura}`
      )
      .subscribe((response) => {
        const idBill = response.id_bill;
        this._router.navigate(["/factura", idBill]);
      });
  }
  refresh(mensaje: boolean = false) {
    this.cargandolistado = true;
    this.showInput = parseInt(this._token.getInfo().role) >= 6 ? false : true;
    let infoUser: any = this._token.getInfo();

    this.roleUser = parseInt(infoUser.role);
    this.user_id = parseInt(infoUser.id);
    this.recuperarfiltrosstorage();
    this.status = [];
    this.status.push({ label: "Presupuesto", value: "Presupuesto" });
    this.status.push({ label: "Pedido", value: "Pedido" });
    this.status.push({ label: "Finalizado", value: "Finalizado" });
    this.pagination = 10;
    this._api.isAutoNumbered().subscribe((response) => {
      this.autoNumbered = parseInt(response.autoNumbered) === 1 ? true : false;
    });
    this._api
      .getCampaigns(this.start_date, this.end_date)
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
            this._auth.logout();
            this._router.navigate(["/login"]);
          } else if (response.status === "error") {
            this._notification.error("Aviso!", response.msg);
            this.noProjects = true;
            this.projects = [];
            this.filtrar();
          } else {
            response.items.forEach((element) => {
              element.creation_date_no_parsed = element.creation_date;
              element.end_date_no_parsed = element.end_date;
              element.creation_date = this._common.getFecha(
                new Date(element.creation_date)
              );
              element.end_date = this._common.getFecha(
                new Date(element.end_date)
              );
            });
            this.projects = response.items;
            this.filtrar();
            this.displayPagination = this.projects.length > this.pagination;
            this.noProjects = false;
          }
        }
      });

    this._api.getDataCombos().subscribe((response) => {
      if (response.status !== "error") {
        this.dataSelects = response;
        response.users.forEach((element) => {
          this.dataCombos.users.push({
            label: element.nickname,
            value: element.id,
          });
        });
        response.customers.forEach((element) => {
          this.dataCombos.customers.push({
            label: element.customer_name,
            value: element.id,
          });
        });
        response.teams.forEach((element) => {
          this.dataCombos.teams.push({
            label: element.team_name,
            value: element.id,
          });
        });
        response.groups.forEach((element) => {
          this.dataCombos.groups.push({
            label: element.name,
            value: element.id,
          });
        });
        response.status.forEach((element) => {
          if (this.id_company === "408" || element.id <= 2) {
            this.dataCombos.status.push({
              label: element.status,
              value: element.id,
            });
          }
        });
      }
    });

    this.setPermissions(infoUser.role);

    this.calcularestadisticas(mensaje);
  }

  calcularestadisticas(mensaje) {
    this._api
      .getStadisticsCampaigns(this.filtroestado >= 3 ? 2 : this.filtroestado)
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
            this._auth.logout();
            this._router.navigate(["/login"]);
          } else if (response.status === "error") {
            //this._notification.error("Aviso!", response.msg);
          } else {
            this.sendValuesChart(response);
            if (mensaje) {
              this._notification.success(
                "¡Éxito!",
                "Se han recargado los valores"
              );
            }
          }
        }
      });
  }

  ngOnInit() {
    this.hoy = new Date();

    this.start_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: 1,
        day: 1,
      },
    };

    this.end_date = {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth() + 1,
        day: this.hoy.getDate(),
      },
    };

    this.start_date_calendar = this.start_date;
    this.end_date_calendar = this.end_date;

    let dataSelected = this._common.getIdCompanyYearSelected();
    if (dataSelected && dataSelected.company === "416") {
      this.showReservationLogic = true;
    }

    if (!dataSelected) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      this.id_company = dataSelected.company;
    }

    this.refresh();
  }

  togglefiltroPtesFacturar() {
    this.filtroPtesFacturar = !this.filtroPtesFacturar;
    this.filtroSinFactura = false;
    if (this.filtroPtesFacturar) {
      this.filtronumero = "";
      this.filtroproyecto = "";
      this.filtrocliente = "";
      this.filtrofechainicio = "";
      this.tabSeleccionada = 2;
    }
    this.filtrar();
  }

  togglefiltroSinFactura() {
    this.filtroSinFactura = !this.filtroSinFactura;
    this.filtroPtesFacturar = false;
    if (this.filtroSinFactura) {
      this.filtronumero = "";
      this.filtroproyecto = "";
      this.filtrocliente = "";
      this.filtrofechainicio = "";
      this.tabSeleccionada = 2;
    }
    this.filtrar();
  }

  isNegative(text) {
    if (parseInt(text) < 0) return true;
    return false;
  }

  onDateChanged(event: IMyDateModel, field) {
    this[field].date = event.date;
    this.refresh();
  }

  recuperarfiltrosstorage() {
    this.filtronumero = localStorage.getItem(this.user_id + "PRYfiltronumero")
      ? localStorage.getItem(this.user_id + "PRYfiltronumero")
      : "";
    this.filtroproyecto = localStorage.getItem(
      this.user_id + "PRYfiltroproyecto"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltroproyecto")
      : "";
    this.filtrocliente = localStorage.getItem(this.user_id + "PRYfiltrocliente")
      ? localStorage.getItem(this.user_id + "PRYfiltrocliente")
      : "";
    this.filtrofechainicio = localStorage.getItem(
      this.user_id + "PRYfiltrofechainicio"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltrofechainicio")
      : "";
    this.filtropedido = localStorage.getItem(this.user_id + "PRYfiltropedido")
      ? localStorage.getItem(this.user_id + "PRYfiltropedido")
      : "";
    this.filtroestado = localStorage.getItem(this.user_id + "PRYfiltroestado")
      ? localStorage.getItem(this.user_id + "PRYfiltroestado")
      : "-1";
    this.filtroestadoanterior = localStorage.getItem(
      this.user_id + "PRYfiltroestadoanterior"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltroestadoanterior")
      : "";
    this.filtrodesestimado = localStorage.getItem(
      this.user_id + "PRYfiltrodesestimado"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltrodesestimado")
      : "-1";
    this.filtroingresosprevistos = localStorage.getItem(
      this.user_id + "PRYfiltroingresosprevistos"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltroingresosprevistos")
      : "";
    this.filtroingresosreales = localStorage.getItem(
      this.user_id + "PRYfiltroingresosreales"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltroingresosreales")
      : "";
    this.filtrogastosprevistos = localStorage.getItem(
      this.user_id + "PRYfiltrogastosprevistos"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltrogastosprevistos")
      : "";
    this.filtrogastosreales = localStorage.getItem(
      this.user_id + "PRYfiltrogastosreales"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltrogastosreales")
      : "";
    this.filtromargenprevistos = localStorage.getItem(
      this.user_id + "PRYfiltromargenprevistos"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltromargenprevistos")
      : "";
    this.filtromargenreales = localStorage.getItem(
      this.user_id + "PRYfiltromargenreales"
    )
      ? localStorage.getItem(this.user_id + "PRYfiltromargenreales")
      : "";
    //this.filtroPtesFacturar = (Boolean)localStorage.getItem(this.user_id + 'PRYfiltroPtesFacturar');
  }

  guardarfiltrosstorage() {
    localStorage.setItem(this.user_id + "PRYfiltronumero", this.filtronumero);
    localStorage.setItem(
      this.user_id + "PRYfiltroproyecto",
      this.filtroproyecto
    );
    localStorage.setItem(this.user_id + "PRYfiltrocliente", this.filtrocliente);
    localStorage.setItem(
      this.user_id + "PRYfiltrofechainicio",
      this.filtrofechainicio
    );
    localStorage.setItem(this.user_id + "PRYfiltropedido", this.filtropedido);
    localStorage.setItem(this.user_id + "PRYfiltroestado", this.filtroestado);
    localStorage.setItem(
      this.user_id + "PRYfiltroestadoanterior",
      this.filtroestadoanterior
    );
    localStorage.setItem(
      this.user_id + "PRYfiltrodesestimado",
      this.filtrodesestimado
    );
    localStorage.setItem(
      this.user_id + "PRYfiltroingresosprevistos",
      this.filtroingresosprevistos
    );
    localStorage.setItem(
      this.user_id + "PRYfiltroingresosreales",
      this.filtroingresosreales
    );
    localStorage.setItem(
      this.user_id + "PRYfiltrogastosprevistos",
      this.filtrogastosprevistos
    );
    localStorage.setItem(
      this.user_id + "PRYfiltrogastosreales",
      this.filtrogastosreales
    );
    localStorage.setItem(
      this.user_id + "PRYfiltromargenprevistos",
      this.filtromargenprevistos
    );
    localStorage.setItem(
      this.user_id + "PRYfiltromargenreales",
      this.filtromargenreales
    );
    localStorage.setItem(
      this.user_id + "PRYfiltroPtesFacturar",
      this.filtroPtesFacturar.toString()
    );
    localStorage.setItem(
      this.user_id + "PRYfiltroSinFactura",
      this.filtroSinFactura.toString()
    );
  }

  filtrar() {
    this.guardarfiltrosstorage();

    if (this.filtroestado != this.filtroestadoanterior) {
      this.calcularestadisticas(false);
      this.filtroestadoanterior = this.filtroestado;
    }

    this.projectsfiltrados = [];
    let filtronum: string =
      this.filtronumero == undefined ? "" : this.filtronumero;
    let filtroproy: string =
      this.filtroproyecto == undefined ? "" : this.filtroproyecto;
    let filtrocli: string =
      this.filtrocliente == undefined ? "" : this.filtrocliente;
    let filtrofini: string =
      this.filtrofechainicio == undefined ? "" : this.filtrofechainicio;
    let filtroped: string =
      this.filtropedido == undefined ? "" : this.filtropedido;
    let filtroest: string =
      this.filtroestado == undefined ? "" : this.filtroestado;
    let filtrodes: string =
      this.filtrodesestimado == undefined ? "" : this.filtrodesestimado;
    let filtroip: string =
      this.filtroingresosprevistos == undefined
        ? ""
        : this.filtroingresosprevistos;
    let filtroir: string =
      this.filtroingresosreales == undefined ? "" : this.filtroingresosreales;
    let filtrogp: string =
      this.filtrogastosprevistos == undefined ? "" : this.filtrogastosprevistos;
    let filtrogr: string =
      this.filtrogastosreales == undefined ? "" : this.filtrogastosreales;
    let filtromp: string =
      this.filtromargenprevistos == undefined ? "" : this.filtromargenprevistos;
    let filtromr: string =
      this.filtromargenreales == undefined ? "" : this.filtromargenreales;

    for (let i = 0; i < this.projects.length; i++) {
      if (
        this._common
          .getCleanedString(this.projects[i].campaign_code)
          .indexOf(this._common.getCleanedString(filtronum)) >= 0 &&
        this._common
          .getCleanedString(this.projects[i].campaign_name)
          .indexOf(this._common.getCleanedString(filtroproy)) >= 0 &&
        this._common
          .getCleanedString(this.projects[i].customer)
          .indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
        this._common
          .getCleanedString(this.projects[i].creation_date)
          .indexOf(this._common.getCleanedString(filtrofini)) >= 0 &&
        this._common
          .getCleanedString(this.projects[i].ped_code)
          .indexOf(this._common.getCleanedString(filtroped)) >= 0 &&
        this._common
          .getDecimals(this.projects[i].budget_income, 2)
          .indexOf(this._common.getCleanedString(filtroip)) >= 0 &&
        this._common
          .getDecimals(this.projects[i].real_income, 2)
          .indexOf(this._common.getCleanedString(filtroir)) >= 0 &&
        this._common
          .getDecimals(this.projects[i].budget_expenses, 2)
          .indexOf(this._common.getCleanedString(filtrogp)) >= 0 &&
        this._common
          .getDecimals(this.projects[i].real_expenses, 2)
          .indexOf(this._common.getCleanedString(filtrogr)) >= 0 &&
        this._common
          .getDecimals(
            this.projects[i].budget_income - this.projects[i].budget_expenses,
            2
          )
          .indexOf(this._common.getCleanedString(filtromp)) >= 0 &&
        this._common
          .getDecimals(
            this.projects[i].real_income - this.projects[i].real_expenses,
            2
          )
          .indexOf(this._common.getCleanedString(filtromr)) >= 0 &&
        (this._common
          .getCleanedString(this.projects[i].desestimado)
          .indexOf(this._common.getCleanedString(filtrodes)) >= 0 ||
          filtrodes == "-1") &&
        (this._common
          .getCleanedString(this.projects[i].id_status)
          .indexOf(this._common.getCleanedString(filtroest)) >= 0 ||
          filtroest == "-1")
      ) {
        let pasafiltroptesfacturar = false;
        let pasafiltrosinfactura = false;

        if (
          !this.filtroPtesFacturar ||
          isNull(this.projects[i].real_income) ||
          Math.round(parseFloat(this.projects[i].real_income)) <
            Math.round(parseFloat(this.projects[i].budget_income))
        ) {
          pasafiltroptesfacturar = true;
        }

        if (
          !this.filtroSinFactura ||
          (this.projects[i].numfacturas == 0 &&
            this.projects[i].id_status >= 2 &&
            this.projects[i].budget_income != 0)
        ) {
          pasafiltrosinfactura = true;
        }
        //debo pasar los filtro de pedidos ptes de facturar y no facturados si están activos
        if (pasafiltroptesfacturar && pasafiltrosinfactura) {
          this.projectsfiltrados.push(this.projects[i]);
        }
      }
    }
    this.paginarysumar();
  }

  irPagina(numpagina) {
    this.numPage = numpagina;
    localStorage.setItem(this.user_id + "PRYpage", numpagina);
  }

  paginarysumar() {
    this.arrpages = [];
    this.totalingresosprevistos = 0;
    this.totalingresosreales = 0;
    this.totalgastosprevistos = 0;
    this.totalgastosreales = 0;

    for (let i = 0; i < this.projectsfiltrados.length; i++) {
      if (i % this.pagination == 0) {
        this.arrpages.push(i / this.pagination + 1);
      }

      if (isNull(this.projectsfiltrados[i].budget_expenses))
        this.projectsfiltrados[i].budget_expenses = 0;
      if (isNull(this.projectsfiltrados[i].budget_income))
        this.projectsfiltrados[i].budget_income = 0;
      if (isNull(this.projectsfiltrados[i].real_expenses))
        this.projectsfiltrados[i].real_expenses = 0;
      if (isNull(this.projectsfiltrados[i].real_income))
        this.projectsfiltrados[i].real_income = 0;

      this.totalingresosprevistos += parseFloat(
        this.projectsfiltrados[i].budget_income
      );
      this.totalingresosreales += parseFloat(
        this.projectsfiltrados[i].real_income
      );
      this.totalgastosprevistos += parseFloat(
        this.projectsfiltrados[i].budget_expenses
      );
      this.totalgastosreales += parseFloat(
        this.projectsfiltrados[i].real_expenses
      );
    }

    this.numPage = +(localStorage.getItem(this.user_id + "PRYpage")
      ? localStorage.getItem(this.user_id + "PRYpage")
      : 1);
    this.cargandolistado = false;
  }

  changeSearchInput(value: string) {
    this.inputSearch.nativeElement.value = value;
    this.inputSearch.nativeElement.dispatchEvent(new Event("keyup"));
  }

  setPermissions(role) {
    switch (role) {
      case "4":
      case "6":
      case "7":
      case "8":
        this.showCol = false;
        break;
      case "3":
      case "5":
      case "9":
      case "10":
        this.showCol = true;
        break;
    }
  }

  lookupRowStyleClass(rowData) {
    return rowData.security_level === "Alto" ? "high-security" : "low-security";
  }

  changeCustomer(e) {
    let groups = _.filter(this.dataSelects.groups, (element) => {
      return element.id_customer === e.value;
    });
    this.dataCombos.groups = [];
    this.dataCombos.subgroups = [];
    groups.forEach((element) => {
      this.dataCombos.groups.push({ label: element.name, value: element.id });
    });
  }

  changeGroup(e) {
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === e.value;
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this.dataCombos.subgroups.push({
        label: element.name,
        value: element.id,
      });
    });
  }

  changeTeam(e) {
    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === e.value;
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this.dataCombos.users.push({
        label: element.nickname,
        value: element.id,
      });
    });
  }

  selectCampaign(item, index) {
    let creationDate = this.getDateParsed(item.creation_date_no_parsed),
      endDate = this.getDateParsed(item.end_date_no_parsed);
    this.displayDialog = true;
    this.selectedCampaign = _.cloneDeep(item);
    this.selectedCampaign.idx = index;
    this.selectedCampaign.security_level = item.security_level;
    this.selectedCampaign.creation_date_model = {
      date: {
        year: creationDate[0],
        month: creationDate[1],
        day: creationDate[2],
      },
    };
    this.selectedCampaign.end_date_model = {
      date: {
        /*         year: endDate[0],
        month: endDate[1],
        day: endDate[2] */
        year: 2099,
        month: 12,
        day: 31,
      },
    };
    let users = _.filter(this.dataSelects.users, (element) => {
      return element.id_team === this.selectedCampaign.id_team;
    });
    this.dataCombos.users = [];
    users.forEach((element) => {
      this.dataCombos.users.push({
        label: element.nickname,
        value: element.id,
      });
    });
    let subgroups = _.filter(this.dataSelects.subgroups, (element) => {
      return element.id_group === this.selectedCampaign.id_group;
    });
    this.dataCombos.subgroups = [];
    subgroups.forEach((element) => {
      this.dataCombos.subgroups.push({
        label: element.name,
        value: element.id,
      });
    });
  }

  getDateParsed(date) {
    let arrayDate = date.split("-");
    arrayDate = _.map(arrayDate, function (element) {
      return parseInt(element);
    });

    return arrayDate;
  }

  deleteCampaign(item) {
    this.displayDialogDelete = true;
    this.selectedCampaign = item;
  }

  desestimarCampaign(item) {
    this.motivodesestimar = "";
    this.displayDialogDesestimar = true;
    this.selectedCampaign = item;
  }

  anularCampaign(item) {
    this.motivodesestimar = "";
    this.displayDialogAnular = true;
    this.selectedCampaign = item;
  }

  updateRows(response) {
    let indice = parseInt(response.idx) + (this.numPage - 1) * this.pagination;

    this.projectsfiltrados[indice].campaign_code =
      response.item[0].campaign_code;
    this.projectsfiltrados[indice].ped_code = response.item[0].ped_code;
    this.projectsfiltrados[indice].campaign_name =
      response.item[0].campaign_name;
    this.projectsfiltrados[indice].user = response.item[0].user;
    this.projectsfiltrados[indice].id_user = response.item[0].id_user;
    this.projectsfiltrados[indice].customer = response.item[0].customer;
    this.projectsfiltrados[indice].team = response.item[0].team;
    this.projectsfiltrados[indice].grupo = response.item[0].grupo;
    this.projectsfiltrados[indice].subgroup = response.item[0].subgroup;
    this.projectsfiltrados[indice].status = response.item[0].status;
    this.projectsfiltrados[indice].id_status = response.item[0].id_status;
    this.projectsfiltrados[indice].security_level =
      response.item[0].security_level;
    this.projectsfiltrados[indice].creation_date_no_parsed =
      response.item[0].creation_date;
    this.projectsfiltrados[indice].end_date_no_parsed =
      response.item[0].end_date;
    this.projectsfiltrados[indice].creation_date = this._common.getFecha(
      new Date(response.item[0].creation_date)
    );
    this.projectsfiltrados[indice].end_date = this._common.getFecha(
      new Date(response.item[0].end_date)
    );

    this.filtrar();
  }

  cambioCliente(nombrecli: string = "", id: number = -1) {
    if (id < 0) {
      for (let cliente of this.dataCombos.customers) {
        if (cliente.label.indexOf(nombrecli) >= 0) {
          return cliente.value;
        }
      }
    } else {
    }
  }

  factureMultiplePedidos() {
    this.displayDialogMultiplePedidos = true;
  }

  createCampaign(proy = null) {
    //siempre al crear o al duplicar pedido o presupuesto pondré presupuesto
    this.displayDialogNew = true;
    this.newCampaign.campaign_code = "";
    if (proy == null) {
      this.newCampaign.campaign_name = "";
      this.newCampaign.customer = "";
      this.newCampaign.id_status = 1; // this.tabSeleccionada;
      this.cabeceraNuevoProyecto = "NUEVO PRESUPUESTO/PEDIDO";
      this.proyectoorigen = null;
    } else {
      this.newCampaign.campaign_name = "Copia de " + proy.campaign_name;
      this.newCampaign.customer = proy.customer;
      this.newCampaign.id_status = 1; // (proy.id_status > 2 ? 2: proy.id_status);
      this.cabeceraNuevoProyecto =
        "CLONAR " + (proy.id_status == 1 ? "PRESUPUESTO" : "PEDIDO");
      this.proyectoorigen = proy;
    }

    this.newCampaign.creation_date_model = {
      date: {
        year: this.hoy.getFullYear(),
        month: this.hoy.getMonth() + 1,
        day: this.hoy.getDate(),
      },
    };
    this.newCampaign.end_date_model = {
      date: {
        year: 2099,
        month: 12,
        day: 31,
      },
    };
    this.newCampaign.security = "";
    this.newCampaign.totalgastosprevistos = 0;
    this.newCampaign.totalingresosprevistos = 0;
    this.newCampaign.totalgastosreales = 0;
    this.newCampaign.totalingresosreales = 0;
  }

  resumeCampaign(campaign) {
    this._router.navigate(["/proyecto", campaign.id]);
  }

  summaryProject(project) {
    this._router.navigate(["/resumen", project.id]);
  }
  breakdownCampaign(campaign) {
    this._router.navigate(["/desglose", campaign.id]);
  }

  addCampaign() {
    const isBudget = this.newCampaign.id_status === "1";
    if (this.id_company === "416" && this.newCampaign.id_status === "2") {
      // Check if start_date and end_date is OK
      const endDateEvent = `${this.newCampaign.end_date_event.date.year}-${this.newCampaign.end_date_event.date.month}-${this.newCampaign.end_date_event.date.day}`;
      const startDateEvent = `${this.newCampaign.start_date_event.date.year}-${this.newCampaign.start_date_event.date.month}-${this.newCampaign.start_date_event.date.day}`;

      if (new Date(startDateEvent) > new Date(endDateEvent)) {
        this._notification.error(
          "¡Aviso!",
          "La fecha de inicio de evento debe ser menos a la de fin de evento"
        );
        return false;
      }
    }

    if (!this.autoNumbered && this.newCampaign.campaign_code === "") {
      this._notification.info(
        "¡Aviso!",
        "Debes rellenar el código de proyecto"
      );
      return false;
    }
    if (
      this.newCampaign.campaign_name === "" ||
      this.newCampaign.customer === "" ||
      this.newCampaign.creation_date_model === "" ||
      this.newCampaign.end_date_model === ""
    ) {
      this._notification.info(
        "¡Aviso!",
        "Debes rellenar los datos correctamente"
      );
      return false;
    }

    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      if (!this.newCampaign.creation_date_model) {
        this._notification.error("Error", "La fecha es incorrecta");
        return null;
      }
      //if (this.checkDates(this.newCampaign.creation_date_model, this.newCampaign.end_date_model)) {
      if (this.bPermisoAnyadir) {
        //no hago esa validación que no funciona en los ipad
        this.bPermisoAnyadir = false;
        let body;
        body = "campaign_code=" + this.newCampaign.campaign_code;
        body += "&campaign_name=" + this.newCampaign.campaign_name;
        body += "&id_company=" + dataSelected.company;
        body += "&id_fiscal_year=" + dataSelected.year;
        body += "&id_user=" + this.newCampaign.id_user;
        body += "&id_customer=" + this.cambioCliente(this.newCampaign.customer);
        body += "&id_team=" + this.newCampaign.id_team;
        body += "&id_group=" + this.newCampaign.id_group;
        body += "&id_subgroup=" + this.newCampaign.id_subgroup;
        body += "&id_status=" + this.newCampaign.id_status;
        body += "&id_security=" + this.newCampaign.security;
        body += `&creation_date=${this.newCampaign.creation_date_model.date.year}-${this.newCampaign.creation_date_model.date.month}-${this.newCampaign.creation_date_model.date.day}`;
        body += `&end_date=${this.newCampaign.end_date_model.date.year}-${this.newCampaign.end_date_model.date.month}-${this.newCampaign.end_date_model.date.day}`;
        body += `&auto_number=${this.autoNumbered}`;
        body += `&filters_start_date=${this.start_date.date.year}-${this.start_date.date.month}-${this.start_date.date.day}`;
        body += `&filters_end_date=${this.end_date.date.year}-${this.end_date.date.month}-${this.end_date.date.day}`;
        if (!isBudget) {
          body += `&start_date_event=${this.newCampaign.start_date_event.date.year}-${this.newCampaign.start_date_event.date.month}-${this.newCampaign.start_date_event.date.day}`;
          body += `&end_date_event=${this.newCampaign.end_date_event.date.year}-${this.newCampaign.end_date_event.date.month}-${this.newCampaign.end_date_event.date.day}`;
        } else {
          body += `&start_date_event=`;
          body += `&end_date_event=`;
        }

        this._api.insertCampaign(body).subscribe((response) => {
          if (response.status === "ok") {
            if (this.proyectoorigen) {
              body = "origen=" + this.proyectoorigen.id;
              body += "&destino=" + response.items[0].id;
              this._api.clonarPresupuesto(body).subscribe((response) => {
                if (response.status === "ok") {
                  this.projects[0].budget_income =
                    this.proyectoorigen.budget_income;
                  this.projects[0].budget_expenses =
                    this.proyectoorigen.budget_expenses;
                  this.filtrar();
                }
              });
            }
            this.displayDialogNew = false;
            this.projects = [];
            this.projects = response.items;
            this.projects = [...this.projects];
            if (!this.proyectoorigen) this.filtrar();
            this.projects.forEach((element) => {
              element.creation_date_no_parsed = element.creation_date;
              element.end_date_no_parsed = element.end_date;
              element.creation_date = this._common.getFecha(
                new Date(element.creation_date)
              );
              element.end_date = this._common.getFecha(
                new Date(element.end_date)
              );
            });
            this.bPermisoAnyadir = true;
            this._notification.success(
              "¡Éxito!",
              `Se ha añadido el ${isBudget ? "presupuesto" : "pedido"}`
            );
          } else {
            this._notification.error("¡Error!", response.msg);
          }
        });
      } else {
        /*         this
          ._notification
          .error('Error!', 'La fecha de inicio deber ser menor o igual a la de fin.'); */
      }
    }
  }

  desestimarApi() {
    let body = "";
    this.idSelected = parseInt(this.selectedCampaign.id, 10);
    body = "id=" + this.idSelected;
    if (this.selectedCampaign.desestimado == "No") {
      body += `&bdesestimado=1`;
      body += `&motivodesestimado=${this.motivodesestimar}`;
    } else {
      body += `&bdesestimado=-1`;
    }

    this._api
      .updatePresupuestoDesestimado(body)
      .subscribe((response) => this.parseDesestimado(response, "presupuesto"));
  }

  anularApi() {
    let body = "";
    this.idSelected = parseInt(this.selectedCampaign.id, 10);
    body = "id=" + this.idSelected;
    if (this.selectedCampaign.desestimado == "No") {
      body += `&bdesestimado=2`;
    } else {
      body += `&bdesestimado=-1`;
    }

    this._api
      .updatePresupuestoDesestimado(body)
      .subscribe((response) => this.parseDesestimado(response, "pedido"));
  }

  updateApi() {
    if (!this.selectedCampaign.creation_date_model) {
      this._notification.error("Error", "La fecha es incorrecta");
      return null;
    }
    let body = "";
    this.idSelected = parseInt(this.selectedCampaign.id, 10);

    //if (this.checkDates(this.selectedCampaign.creation_date_model, this.selectedCampaign.end_date_model)) {
    body =
      "id=" +
      this.idSelected +
      "&campaign_code=" +
      this.selectedCampaign.campaign_code;
    body += `&idx=${this.selectedCampaign.idx}`;
    body += `&campaign_name=${this.selectedCampaign.campaign_name}`;
    body += `&id_user=${this.selectedCampaign.id_user}`;
    body += `&id_customer=${this.cambioCliente(
      this.selectedCampaign.customer
    )}`;
    body += `&id_team=${this.selectedCampaign.id_team}`;
    body += `&id_group=${this.selectedCampaign.id_group}`;
    body += `&id_subgroup=${this.selectedCampaign.id_subgroup}`;
    body += `&id_status=${this.selectedCampaign.id_status}`;
    body += `&id_security=${this.selectedCampaign.security_level}`;
    body += `&creation_date=${this.selectedCampaign.creation_date_model.date.year}-${this.selectedCampaign.creation_date_model.date.month}-${this.selectedCampaign.creation_date_model.date.day}`;
    body += `&end_date=${this.selectedCampaign.end_date_model.date.year}-${this.selectedCampaign.end_date_model.date.month}-${this.selectedCampaign.end_date_model.date.day}`;
    body += `&auto_number=${this.autoNumbered}`;
    this._api
      .updateCampaign(body)
      .subscribe((response) => this.parseUpdate(response));
    /*     } else {
      this._notification.error('Error', 'La fecha de inicio no puede ser mayor que la de fin');
    } */
  }

  dialogoCliente() {
    this.displayDialogCliente = true;
    this.selectedCustomer = {
      id: -1,
      customer_name: "",
    };
  }

  cancelarCliente() {
    this.displayDialogCliente = false;
  }

  recargarClientes(clientenuevo: string) {
    this.displayDialogCliente = false;
    this.dataCombos.customers = [];
    this._api.getDataCombos().subscribe((response) => {
      if (response.status !== "error") {
        this.dataSelects = response;
        response.customers.forEach((element) => {
          this.dataCombos.customers.push({
            label: element.customer_name,
            value: element.id,
          });
          if (this.newCampaign) this.newCampaign.customer = clientenuevo;
          if (this.selectedCampaign)
            this.selectedCampaign.customer = clientenuevo;
        });
      }
    });
  }

  checkDates(start_date, end_date) {
    let start = new Date(
      `${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`
    );
    let end = new Date(
      `${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`
    );

    return start <= end;
  }

  parseUpdate(response) {
    if (response.status === "ok") {
      console.log(response);
      this.displayDialog = false;
      this._notification.success("¡Éxito!", "Se ha actualizado el proyecto");
      this.updateRows(response);
    } else {
      this.displayDialog = false;
      this._notification.error("¡Error!", response.msg);
    }
  }

  parseDesestimado(response, tipo) {
    if (response.status === "ok") {
      this.displayDialogDesestimar = false;
      this.displayDialogAnular = false;
      this._notification.success("¡Éxito!", "Se ha actualizado el " + tipo);
      this.refresh();
    } else {
      this.displayDialogDesestimar = false;
      this._notification.error("¡Error!", response.msg);
    }
  }

  deleteApi(item) {
    this.idSelected = parseInt(item.id, 10);
    this._api
      .deleteCampaigns(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === "ok") {
      let idx = _.findIndex(this.projects, (o) => {
        return o.id == this.idSelected;
      });
      this.projects.splice(idx, 1);
      this.projects = [...this.projects];
      if (this.projects.length === 0) {
        this.noProjects = true;
      }
      this.filtrar();
      this.displayDialogDelete = false;
      this._notification.success("¡Éxito!", "Se ha eliminado el proyecto");
    } else {
      this.displayDialogDelete = false;
      this._notification.error("¡Error!", response.msg);
    }
  }

  exportExcel(): void {
    let exportProjects = null;

    this.fillExcelData().then((response) => {
      exportProjects = response;
      const ws_name_1 = "Presupuestos y Pedidos";
      const wb: WorkBook = { SheetNames: [], Sheets: {} };
      const ws_1: any = utils.json_to_sheet(exportProjects);

      wb.SheetNames.push(ws_name_1);
      wb.Sheets[ws_name_1] = ws_1;

      const wbout = write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "binary",
      });

      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
      }

      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        `presupuestos-pedidos.xlsx`
      );
    });
  }

  fillExcelData() {
    return new Promise((resolve, reject) => {
      let exportData = [];
      this._api.getExcelData().subscribe((response) => {
        let values = response;
        this.projectsfiltrados.forEach((element, key) => {
          if (this.id_company == 412) {
            exportData.push({
              Código: element.campaign_code,
              Descripción: element.campaign_name,
              /*               Equipo: element.team,
              Usuario: element.user, */
              Cliente: element.customer,
              /*               Grupo: element.grupo,
              Subgrupo: element.subgroup, */
              Creado: element.creation_date,
              /*               Finalizado: element.end_date, */
              Estado: element.status,
              "Núm. Campaña": element.project,
              "Ingresos Presupuesto": this._common.getNumber(
                this._common.getDecimals(
                  values[element.id].estimated.incomes,
                  2
                )
              ),
              Facturado: this._common.getNumber(
                this._common.getDecimals(values[element.id].real.incomes, 2)
              ),
              "Coste Presupuesto": this._common.getNumber(
                this._common.getDecimals(
                  values[element.id].estimated.expenses,
                  2
                )
              ),
              "Coste Real": this._common.getNumber(
                this._common.getDecimals(values[element.id].real.expenses, 2)
              ),
              "Beneficio Presupuesto": this._common.getNumber(
                this._common.getDecimals(values[element.id].estimated.profit, 2)
              ),
              "Beneficio Real": this._common.getNumber(
                this._common.getDecimals(values[element.id].real.profit, 2)
              ),
            });
          } else {
            exportData.push({
              Código: element.campaign_code,
              Descripción: element.campaign_name,
              /*               Equipo: element.team,
                Usuario: element.user, */
              Cliente: element.customer,
              /*               Grupo: element.grupo,
                Subgrupo: element.subgroup, */
              Creado: element.creation_date,
              /*               Finalizado: element.end_date, */
              Estado: element.status,
              "Ingresos Presupuesto": this._common.getNumber(
                this._common.getDecimals(
                  values[element.id].estimated.incomes,
                  2
                )
              ),
              Facturado: this._common.getNumber(
                this._common.getDecimals(values[element.id].real.incomes, 2)
              ),
              "Coste Presupuesto": this._common.getNumber(
                this._common.getDecimals(
                  values[element.id].estimated.expenses,
                  2
                )
              ),
              "Coste Real": this._common.getNumber(
                this._common.getDecimals(values[element.id].real.expenses, 2)
              ),
              "Beneficio Presupuesto": this._common.getNumber(
                this._common.getDecimals(values[element.id].estimated.profit, 2)
              ),
              "Beneficio Real": this._common.getNumber(
                this._common.getDecimals(values[element.id].real.profit, 2)
              ),
            });
          }
        });
        resolve(exportData);
      });
    });
  }

  sendValuesChart(vec) {
    this.lineChartData = [
      { data: [], label: +this.hoy.getFullYear() - 2 },
      { data: [], label: +this.hoy.getFullYear() - 1 },
      { data: [], label: +this.hoy.getFullYear() },
    ];
    let datoanyo1 = 0;
    let datoanyo2 = 0;
    let datoanyo3 = 0;
    let mes = 1;
    let anyo;

    vec.mensual.forEach((element) => {
      if (anyo != element.anyo) {
        mes = 1;
      }
      anyo = element.anyo;
      if (mes >= 13) mes = 1;

      while (mes != element.mes || anyo != element.anyo) {
        this.lineChartData[
          parseInt(element.anyo) - this.hoy.getFullYear() + 2
        ].data.push(0);
        mes++;
      }

      if (mes == element.mes && anyo == element.anyo) {
        this.lineChartData[
          parseInt(element.anyo) - this.hoy.getFullYear() + 2
        ].data.push(this._common.toFloat(element.importe, true));
        mes++;
      }

      if (parseInt(element.anyo) == this.hoy.getFullYear() - 2) {
        datoanyo1 += this._common.toFloat(element.importe);
      } else if (parseInt(element.anyo) == this.hoy.getFullYear() - 1) {
        datoanyo2 += this._common.toFloat(element.importe);
      } else {
        datoanyo3 += this._common.toFloat(element.importe);
      }
    });

    this.chartData = [
      {
        label: "Todo el año",
        data: [datoanyo1, datoanyo2, datoanyo3],
      },
    ];

    let labels: any = [];
    let datos: any = [];

    for (let i = 0; i < Math.min(5, vec.clientes.length); i++) {
      this.labelsHor[i] = vec.clientes[i]["customer_name"].substring(0, 20);
      datos.push(vec.clientes[i]["importe"]);
    }

    let lsYear = JSON.parse(localStorage.getItem("selectedFiscalYear"));

    this.chartDataHorizontal = [
      {
        label: "Top 5 clientes (" + lsYear.label + ")",
        data: datos,
      },
    ];
  }

  tramitarpedido(itemstock) {
    this.selectedCampaign = itemstock;
  }

  tramitarpedidoapi() {
    this.showTramitarPedido = false;
    let tramitedeseado = -1;
    let id_campaign = this.selectedCampaign.id;
    if (this.selectedCampaign.btramite == 1) {
      tramitedeseado = 0;
    } else {
      tramitedeseado = 1;
    }
    this._api
      .tramitarpedido(`tramite=${tramitedeseado}`, `id_campaign=${id_campaign}`)
      .subscribe((response) => {
        this.selectedCampaign.btramite = tramitedeseado;
      });
  }
}
