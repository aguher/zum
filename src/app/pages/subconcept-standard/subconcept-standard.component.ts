import { Component, OnInit, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";

import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";
import { AuthenticationService } from "../../services/authentication.service";
import { Configuration } from "../../api/configuration";

import { environment } from "environments/environment";
/* import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader'; */
import {
  UploadOutput,
  UploadInput,
  UploadFile,
  humanizeBytes,
  UploadStatus,
} from "ngx-uploader";

import * as _ from "lodash";
import { TokenService } from "../../services/token.service";
const URL_LOGO = environment.urlUploadLogo;

@Component({
  selector: "app-subconcept-standard",
  templateUrl: "./subconcept-standard.component.html",
  styleUrls: ["./subconcept-standard.component.scss"],
})
export class SubconceptStandardComponent implements OnInit {
  idSelected: number = null;
  subconcepts = [];
  articulosfiltrados = [];
  preciosporCliente = [];
  pagination: number;
  numPage: number;
  arrpages = [];
  modoPreciosCliente = false;
  selectedSubconcept = null;
  cachedSubconcept: any = {};
  dataCombos: any = {
    envelopes: [],
    families: [],
    perishable: [],
    customer: [],
  };
  showReservationLogic = false;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;

  orden = "kk";
  ordsentido = true;

  urlUpload;
  /*  files: UploadFile[];
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
  }; */
  enableBtnImport: boolean = false;

  filtrocodigo: any;
  filtrodescripcion: any;
  filtropreciounitario: any;
  filtroudsporitem: any;
  filtroembalaje: any;
  filtrofamilia: any;
  filtromarca: any;
  filtroperecedero: any;
  filtrostockable: any;
  filtrocliente: any;
  filtrocontacto: any;
  roleUser = -1;
  id_company;
  nombresColumnas = [];

  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string =
    "No hay subconceptos añadidos. Añade tu primer subconcepto en el formulario anterior";
  model: any = {
    subconceptName: "",
    id_customer: "",
    unit_price: "",
  };
  customers: any[] = [];
  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common,
    private _token: TokenService
  ) {
    this.urlUpload = environment.urlLogoUpload;
    /*    this.files = []; // local uploading files array
    this.uploadInputLogo = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputERP = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.uploadInputBackup = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes; */
    this.files = [];
    this.uploadInput = new EventEmitter<UploadInput>();
    this.humanizeBytes = humanizeBytes;
    this.numPage = 1;
    this.id_company = this._common.getIdCompanySelected();
    if (this.id_company == 416) {
      this.showReservationLogic = true;
    }
    if (this.id_company == 414) {
      this.nombresColumnas = [
        "parte",
        "set",
        "descripc. set",
        "unids.por torno",
        "proveedor",
        "descripc. rem",
        "perec.",
      ];
    } else {
      this.nombresColumnas = [
        "familia",
        "perecedero",
        "almacenable",
        "unids.por item",
        "cliente",
        "descripc.",
        "set",
      ];
    }
  }

  id_user: any;

  ngOnInit() {
    let infoUser: any = this._token.getInfo();

    this.id_user = parseInt(infoUser.id_user);
    this.roleUser = parseInt(infoUser.role);

    this.pagination = 10;
    this._api.getCustomers().subscribe((response) => {
      if (response != null) {
        response.items &&
          response.items.forEach((element) => {
            this.customers.push({
              label: element.customer_name,
              value: element.id,
            });
          });
      } else {
        this._notification.error(
          "Error!",
          "Algo ha ido mal obteniendo los clientes."
        );
      }
    });
    this._api.getSubconceptStandard().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.subconcepts = response.items ? response.items : null;
          this.displayPagination = false;
          if (this.subconcepts) {
            this.filtrar();
          }
        }
      }
    });

    this._api.getDataCombosStorage().subscribe((response) => {
      if (response.status !== "error") {
        response.envelopes.forEach((element) => {
          this.dataCombos.envelopes.push({
            label: element.name,
            value: element.id,
            bdefault: element.bdefault,
          });
        });
        response.families.forEach((element) => {
          this.dataCombos.families.push({
            label: element.familyname,
            value: element.id,
          });
        });

        response.customer.forEach((element) => {
          this.dataCombos.customer.push({
            label: element.customer_name,
            value: element.id,
          });
        });
        this.dataCombos.perishable.push({
          label: "Sí",
          value: 1,
        });
        this.dataCombos.perishable.push({
          label: "No",
          value: 0,
        });
      }
    });
  }

  filtrar() {
    this.articulosfiltrados = [];

    let filtrocod: string =
      this.filtrocodigo == undefined ? "" : this.filtrocodigo;
    let filtrodes: string =
      this.filtrodescripcion == undefined ? "" : this.filtrodescripcion;
    let filtropun: string =
      this.filtropreciounitario == undefined ? "" : this.filtropreciounitario;
    let filtropit: string =
      this.filtroudsporitem == undefined ? "" : this.filtroudsporitem;
    let filtroemb: string =
      this.filtroembalaje == undefined ? "" : this.filtroembalaje;
    let filtrofam: string =
      this.filtrofamilia == undefined ? "" : this.filtrofamilia;
    let filtromar: string =
      this.filtromarca == undefined ? "" : this.filtromarca;
    let filtroper: string =
      this.filtroperecedero == undefined ? "" : this.filtroperecedero;
    let filtrostc: string =
      this.filtrostockable == undefined ? "" : this.filtrostockable;
    let filtrocli: string =
      this.filtrocliente == undefined ? "" : this.filtrocliente;
    let filtrocon: string =
      this.filtrocontacto == undefined ? "" : this.filtrocontacto;

    for (let i = 0; i < this.subconcepts.length; i++) {
      if (
        this._common
          .getCleanedString(this.subconcepts[i].code)
          .indexOf(this._common.getCleanedString(filtrocod)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].description)
          .indexOf(this._common.getCleanedString(filtrodes)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].unit_prices)
          .indexOf(this._common.getCleanedString(filtropun)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].unitsperitem)
          .indexOf(this._common.getCleanedString(filtropit)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].envelope)
          .indexOf(this._common.getCleanedString(filtroemb)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].familyname)
          .indexOf(this._common.getCleanedString(filtrofam)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].brand)
          .indexOf(this._common.getCleanedString(filtromar)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].perishable)
          .indexOf(this._common.getCleanedString(filtroper)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].stockable)
          .indexOf(this._common.getCleanedString(filtrostc)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].customer_name)
          .indexOf(this._common.getCleanedString(filtrocli)) >= 0 &&
        this._common
          .getCleanedString(this.subconcepts[i].contact)
          .indexOf(this._common.getCleanedString(filtrocon)) >= 0
      ) {
        this.articulosfiltrados.push(this.subconcepts[i]);
      }
    }

    this.paginarysumar();
  }

  paginarysumar() {
    this.arrpages = [];

    for (let i = 0; i < this.articulosfiltrados.length; i++) {
      if (i % this.pagination == 0) {
        this.arrpages.push(i / this.pagination + 1);
      }

      /*       if (isNull(this.articulosfiltrados[i].budget_expenses)) this.articulosfiltrados[i].budget_expenses = 0;
      if (isNull(this.articulosfiltrados[i].budget_income)) this.articulosfiltrados[i].budget_income = 0;      
      if (isNull(this.articulosfiltrados[i].real_expenses)) this.articulosfiltrados[i].real_expenses = 0;
      if (isNull(this.articulosfiltrados[i].real_income)) this.articulosfiltrados[i].real_income = 0;*/
    }

    /*     let eventosimulado:any= [];
    eventosimulado.srcElement = [];
    eventosimulado.srcElement.id = this.orden;
    this.ordsentido = !this.ordsentido;
    this.ordenar(eventosimulado); */
  }

  ordenar(ev) {
    if (ev.srcElement) {
      let campoord;

      if (ev.srcElement.id == "") {
        campoord = ev.srcElement.parentElement.id;
      } else {
        campoord = ev.srcElement.id;
      }

      if (campoord == this.orden) {
        this.ordsentido = !this.ordsentido;
      } else {
        this.orden = campoord;
        this.ordsentido = false;
      }

      if (campoord == "unit_price" || campoord == "unitsperitem") {
        this.articulosfiltrados = _.orderBy(
          this.articulosfiltrados,
          [(item) => parseFloat(item[this.orden])],
          [this.ordsentido ? "desc" : "asc"]
        );
      } else {
        this.articulosfiltrados = _.orderBy(
          this.articulosfiltrados,
          [
            (item) =>
              item[this.orden] == null ? "" : item[this.orden].toLowerCase(),
          ],
          [this.ordsentido ? "desc" : "asc"]
        );
      }
      this.numPage = 1;
    }
  }

  validateArticle(idfamilia, idembalaje, idcliente) {
    if (
      isNaN(parseInt(this.selectedSubconcept.unit_price)) ||
      isNaN(parseInt(this.selectedSubconcept.unitsperitem))
    ) {
      this._notification.info(
        "¡Aviso!",
        "Debe rellenar todos los datos correctamente"
      );
      return false;
    } else if (this.selectedSubconcept.code == "") {
      this._notification.info("¡Aviso!", "Rellene el código del artículo");
      return false;
    } else if (this.selectedSubconcept.description == "") {
      this._notification.info("¡Aviso!", "Rellene la descripción del artículo");
      return false;
    } else if (idfamilia < 0) {
      this._notification.info(
        "¡Aviso!",
        "Debe seleccionar el campo " + this.nombresColumnas[0]
      );
      return false;
    } else if (idembalaje < 0) {
      this._notification.info("¡Aviso!", "Debe seleccionar el embalaje");
      return false;
    } else if (idcliente < 0) {
      this._notification.info("¡Aviso!", "Debe seleccionar el cliente");
      return false;
    } else {
      return true;
    }
  }

  addSubconcept() {
    if (!this.id_company) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      let idfamilia = _.findIndex(this.dataCombos.families, (o) => {
        return o.label == this.selectedSubconcept.familyname;
      });

      let idembalaje = _.findIndex(this.dataCombos.envelopes, (o) => {
        return o.label == this.selectedSubconcept.envelope;
      });
      this.selectedSubconcept.customer_name = this.dataCombos.customer[0].label;

      let idcliente = _.findIndex(this.dataCombos.customer, (o) => {
        return o.label == this.selectedSubconcept.customer_name;
      });

      //if (this.selectedSubconcept.code && this.selectedSubconcept.description) {

      if (this.validateArticle(idfamilia, idembalaje, idcliente)) {
        let body;
        body = "code=" + this.selectedSubconcept.code;
        body += "&description=" + this.selectedSubconcept.description;
        body += "&unit_price=" + this.selectedSubconcept.unit_price;
        body += "&unitsperitem=" + this.selectedSubconcept.unitsperitem;
        body +=
          "&id_family=" +
          (idfamilia == -1 ? -1 : this.dataCombos.families[idfamilia].value);
        body +=
          "&envelope_type=" +
          (idembalaje == -1 ? -1 : this.dataCombos.envelopes[idembalaje].value);
        body += "&brand=" + this.selectedSubconcept.brand;
        body += "&bperishable=" + this.selectedSubconcept.bperishable;
        body += "&bstockable=" + this.selectedSubconcept.bstockable;
        body +=
          "&customer=" +
          (idcliente == -1 ? -1 : this.dataCombos.customer[idcliente].value);
        body += "&contact=" + this.selectedSubconcept.contact;
        body += "&id_company=" + this.id_company;
        if (this.id_company == 414) {
          body += "&ref_provider=" + this.selectedSubconcept.ref_provider;
          body +=
            "&descrip_provider=" + this.selectedSubconcept.descrip_provider;
          body += "&tipo_torno=" + this.selectedSubconcept.tipo_torno;
        }
        if (this.selectedSubconcept.image != null) {
          body += "&image=" + this.selectedSubconcept.image;
        } else {
          body += "&image=";
        }

        this._api.addSubconceptStandard(body).subscribe((response) => {
          if (response.status === "ok") {
            this._notification.success(
              "¡Éxito!",
              "Se ha añadido el subconcepto"
            );
            this.subconcepts.unshift(response.items[0]);
            this.subconcepts = [...this.subconcepts];
            this.filtrar();
          } else {
            this._notification.error("¡Error!", response.msg);
          }
        });
      } else {
        this._notification.error(
          "¡Aviso!",
          "Debes rellenar los datos correctamente"
        );
      }
    }
  }

  cargarPreciosCliente(subconcept: any) {
    this._api.getcustomerPrices(subconcept.id).subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.preciosporCliente = response.items ? response.items : null;
          console.log(this.preciosporCliente);
        }
      }
    });
  }

  deletePrecioCliente(id) {
    this._api.deletecustomerPrice(id).subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(["/login"]);
        } else if (response.status === "error") {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.cargarPreciosCliente(this.selectedSubconcept);
        }
      }
    });
  }

  updatePrecioCliente(preciocliente) {
    this._api
      .updatecustomerPrice(
        `price=${preciocliente.unit_price}&id_customer=${preciocliente.id_customer}&id=${preciocliente.id}&id_article=${preciocliente.id_subconcept}`
      )
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
            this._auth.logout();
            this._router.navigate(["/login"]);
          } else if (response.status === "error") {
            this._notification.error("Aviso!", response.msg);
          } else {
            this.cargarPreciosCliente(this.selectedSubconcept);
          }
        }
      });
  }

  selectSubconcept(subconcept = null) {
    this.modoPreciosCliente = false;

    if (subconcept != null) {
      this.cargarPreciosCliente(subconcept);
    }

    if (this.roleUser != 10) {
      this.displayDialog = true;
      if (subconcept) {
        this.selectedSubconcept = _.cloneDeep(subconcept);
        this.cachedSubconcept = subconcept;
      } else {
        let idenvelopedefault = -1;
        idenvelopedefault = _.findIndex(this.dataCombos.envelopes, (o) => {
          return o.bdefault == 1;
        });

        this.selectedSubconcept = {
          id: -1,
          code: "",
          description: "",
          unit_price: 0,
          unitsperitem: 1,
          id_family: -1,
          envelope_type:
            idenvelopedefault >= 0
              ? this.dataCombos.envelopes[idenvelopedefault].value
              : idenvelopedefault,
          brand: "",
          bperishable: 0,
          bstockable: 1,
          customer: -1,
          contact: "",
        };
      }
    }
  }

  updateApi(id) {
    if (!this.id_company) {
      this._notification.error(
        "¡Aviso!",
        "Debes seleccionar una empresa desde el menu de selección."
      );
    } else {
      let body = "";
      this.idSelected = parseInt(this.selectedSubconcept.id, 10);

      let idfamilia = _.findIndex(this.dataCombos.families, (o) => {
        return o.label == this.selectedSubconcept.familyname;
      });

      let idembalaje = _.findIndex(this.dataCombos.envelopes, (o) => {
        return o.label == this.selectedSubconcept.envelope;
      });

      let idcliente = _.findIndex(this.dataCombos.customer, (o) => {
        return o.label == this.selectedSubconcept.customer_name;
      });

      if (this.validateArticle(idfamilia, idembalaje, idcliente)) {
        body = "id=" + this.selectedSubconcept.id;
        body += "&code=" + this.selectedSubconcept.code;
        body += "&description=" + this.selectedSubconcept.description;
        body += "&unit_price=" + this.selectedSubconcept.unit_price;
        body += "&unitsperitem=" + this.selectedSubconcept.unitsperitem;
        body +=
          "&id_family=" +
          (idfamilia == -1 ? -1 : this.dataCombos.families[idfamilia].value);
        body +=
          "&envelope_type=" +
          (idembalaje == -1 ? -1 : this.dataCombos.envelopes[idembalaje].value);
        body += "&brand=" + this.selectedSubconcept.brand;
        body += "&bperishable=" + this.selectedSubconcept.bperishable;
        body += "&bstockable=" + this.selectedSubconcept.bstockable;
        body +=
          "&customer=" +
          (idcliente == -1 ? -1 : this.dataCombos.customer[idcliente].value);
        body += "&contact=" + this.selectedSubconcept.contact;
        if (this.id_company == 414) {
          body += "&ref_provider=" + this.selectedSubconcept.ref_provider;
          body +=
            "&descrip_provider=" + this.selectedSubconcept.descrip_provider;
          body += "&tipo_torno=" + this.selectedSubconcept.tipo_torno;
        }
        if (this.selectedSubconcept.image != null) {
          body += "&image=" + this.selectedSubconcept.image;
        } else {
          body += "&image=";
        }
        this._api
          .updateSubconceptStandard(body)
          .subscribe((response) => this.parseUpdate(response));
      }
    }
  }

  exportExcel(): void {
    let exportData = [];
    let ws_name = "";

    exportData = this.fillExcelData();
    ws_name = "Listado de facturas";

    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(exportData);

    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;

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
      `listado_articulos.xlsx`
    );
  }

  fillExcelData() {
    let exportData = [];
    this.articulosfiltrados.forEach((line) => {
      exportData.push({
        Código: line.code,
        Descripción: line.description,
        "Precio unitario": parseFloat(line.unit_price),
        "Unid. por item": parseFloat(line.unitsperitem),
        Embalaje: line.envelope,
        Familia: line.familyname,
        Marca: line.brand,
        Perecedero: line.perishable,
        Almacenable: line.stockable,
        // Cliente: line.customer_name,
        // Contacto: line.contact,
      });
    });

    return exportData;
  }

  parseUpdate(response) {
    if (response.status === "ok") {
      this.displayDialog = false;

      this.cachedSubconcept.code = response.items[0].code;
      this.cachedSubconcept.description = response.items[0].description;
      this.cachedSubconcept.unit_price = response.items[0].unit_price;
      this.cachedSubconcept.unitsperitem = response.items[0].unitsperitem;
      this.cachedSubconcept.id_family = response.items[0].id_family;
      this.cachedSubconcept.envelope_type = response.items[0].envelope_type;
      this.cachedSubconcept.familyname = response.items[0].familyname;
      this.cachedSubconcept.envelope = response.items[0].envelope;
      this.cachedSubconcept.brand = response.items[0].brand;
      this.cachedSubconcept.bperishable = response.items[0].bperishable;
      this.cachedSubconcept.perishable = response.items[0].perishable;
      this.cachedSubconcept.bstockable = response.items[0].bstockable;
      this.cachedSubconcept.stockable = response.items[0].stockable;
      this.cachedSubconcept.id_customer = response.items[0].id_customer;
      this.cachedSubconcept.customer = response.items[0].customer_name;
      this.cachedSubconcept.contact = response.items[0].contact;
      this.cachedSubconcept.image = response.items[0].image;
      this.cachedSubconcept.ref_provider = response.items[0].ref_provider;
      this.cachedSubconcept.descrip_provider =
        response.items[0].descrip_provider;
      this.cachedSubconcept.tipo_torno = response.items[0].tipo_torno;

      this.filtrar();

      this._notification.success("¡Éxito!", "Se ha actualizado el subconcepto");
    } else {
      this.displayDialog = false;
      this._notification.error("¡Error!", response.msg);
    }
  }

  deleteSubconcept(subconcept) {
    this.displayDialogDelete = true;
    this.selectedSubconcept = subconcept;
  }

  checkAvailability(id) {
    this._router.navigate([`calendario/${id.code}`]);
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedSubconcept.id, 10);
    this._api
      .deleteSubconceptStandard(this.idSelected)
      .subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === "ok") {
      let idx = _.findIndex(this.subconcepts, (o) => {
        return o.id == this.idSelected;
      });
      this.subconcepts.splice(idx, 1);
      this.subconcepts = [...this.subconcepts];
      this.displayDialogDelete = false;
      this.filtrar();
      this._notification.success("¡Éxito!", "Se ha eliminado el subconcepto");
    } else {
      this.displayDialogDelete = false;
      this._notification.error("¡Error!", response.msg);
    }
  }

  /*   onUploadOutputLogo(output: UploadOutput): void {
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
            this.selectedSubconcept.image = this.uploadFileLogo.generatedName;
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
  } */

  onUploadOutput(output: UploadOutput, kk): void {
    if (output.type === "allAddedToQueue") {
      const event: UploadInput = {
        type: "uploadAll",
        url: URL_LOGO,
        method: "POST",
        data: { foo: "bar" },
      };

      this.uploadInput.emit(event);
    } else if (
      output.type === "addedToQueue" &&
      typeof output.file !== "undefined"
    ) {
      this.files.push(output.file);
    } else if (
      output.type === "uploading" &&
      typeof output.file !== "undefined"
    ) {
      const index = this.files.findIndex(
        (file) =>
          typeof output.file !== "undefined" && file.id === output.file.id
      );
      this.files[index] = output.file;
    } else if (output.type === "removed") {
      this.files = this.files.filter(
        (file: UploadFile) => file !== output.file
      );
    } else if (output.type === "dragOver") {
      //this.dragOver = true;
    } else if (output.type === "dragOut") {
      //this.dragOver = false;
    } else if (output.type === "drop") {
      //this.dragOver = false;
    } else if (output.type === "done") {
      // on drop event
      this.selectedSubconcept.image = output.file.response.generatedName;
    }

    this.files = this.files.filter(
      (file) => file.progress.status !== UploadStatus.Done
    );
  }

  startUpload(): void {
    const event: UploadInput = {
      type: "uploadAll",
      url: URL_LOGO,
      method: "POST",
      data: { foo: "bar" },
    };

    this.uploadInput.emit(event);
  }
}
