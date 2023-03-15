import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { NotificationsService } from "angular2-notifications";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";

import { environment } from "environments/environment";
import base64Img from "base64-img";

declare var jsPDF: any; // Important

import { ApiService } from "../../../services/api.service";
import { TokenService } from "../../../services/token.service";
import { Configuration } from "../../../api/configuration";

import { Common } from "../../../api/common";
import * as _ from "lodash";
import { timeout } from "q";
import { UpperCasePipe } from "@angular/common";

const URL_UPLOAD_LOGO = environment.urlLogoUpload;
@Component({
  selector: "budget-project",
  templateUrl: "./budget-project.component.html",
  styleUrls: ["./budget-project.component.scss"],
})
export class BudgetProjectComponent implements OnInit, OnDestroy {
  @Input() idProject;
  @Input() idBudget;
  @Input() infoCustomer;
  @Input() noCheckDates;
  @Input() typeTable;

  old = null;
  originalSubconceptsStandard = [];
  subconcepts_standard: string[] = [];
  originalCodesStandard = [];
  codes_standard: string[] = [];
  contact_field = null;
  phone_field = null;
  solicitant_field = null;
  delivery_date = null;
  project_field = null;
  readonlytotal = false;
  isModalOpen = false;

  exceso = {
    solicitadas: 0,
    pedidasaqui: 0,
    disponibles: 0,
    description: "",
  };

  addresses: any;
  bHayDirecciones: boolean = false;

  selectedSource = null;
  source = null;
  tmpDate = null;
  tmpField = null;
  id_company;

  fieldDate = null;
  updateDate = null;
  itemsToRemove = [];
  info: any = {};
  myDatePickerOptions = null;
  start_date_budget = null;
  start_date = null;
  end_date_budget = null;
  end_date = null;
  budget_validity = null;
  typeSource = "budget";
  showClone: boolean = false;
  showDateWrong: boolean = false;
  showDialogImprimirAlbaran: boolean = false;
  lines = [];
  subtotal = {
    budget_total: 0,
    real_total: 0,
    benefit_total: 0,
    margin_total: 0,
  };
  total = {
    budget_total: 0,
    real_total: 0,
    benefit_total: 0,
    margin_total: 0,
  };
  fee = {
    id: null,
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
    },
  };

  valueId = "";
  numberId = 0;
  status_project = "0";
  isEditable = false;

  listProjects = null;
  listBudgets = null;
  constructor(
    private _token: TokenService,
    private _api: ApiService,
    private _common: Common,
    private _config: Configuration,
    private _notification: NotificationsService
  ) {
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;
    this.id_company = dataCompany.id;
  }

  onScroll() {
    var nav = document.getElementById("header-cloned");

    if (window.pageYOffset > 365) {
      nav.classList.add("show");
    } else {
      nav.classList.remove("show");
    }
  }
  ngOnDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  }
  ngOnInit() {
    this.contact_field = this.infoCustomer.contact;
    this.phone_field = this.infoCustomer.phone;
    this.solicitant_field = this.infoCustomer.solicitant_data;
    this.delivery_date = this.infoCustomer.delivery_date;
    this.project_field = this.infoCustomer.project;

    if (
      this.infoCustomer.customer.btramite != 0 ||
      this.infoCustomer.customer.salidas != 0 ||
      this.infoCustomer.customer.numfacturas != 0
    ) {
      this.readonlytotal = true;
    }

    if (this.delivery_date) {
      let issueDate = this._common.getDateParsed(
        this.infoCustomer.delivery_date
      );

      this.delivery_date = {
        date: {
          year: issueDate[0],
          month: issueDate[1],
          day: issueDate[2],
        },
      };
    }

    window.addEventListener("scroll", this.onScroll);

    this.myDatePickerOptions = this._config.myDatePickerOptions;

    this.getSubconceptsStandard();
    this.getCodesStandard();
    if (this.idProject) {
      this.valueId = `id_project=${this.idProject}`;
      this.numberId = this.idProject;
      this.isEditable = true;
    } else if (this.idBudget) {
      this.valueId = `id_budget=${this.idBudget}`;
      this.numberId = this.idBudget;
      // si es un presupuesto, es editable
      this.isEditable = true;
    }

    this._api.getProjectsBudgets().subscribe((response) => {
      this.listBudgets = [];

      response.budgets.forEach((element) => {
        // evitamos introducir el presupuesto actual
        if (parseInt(this.idBudget) !== parseInt(element.id)) {
          this.listBudgets.push({ label: element.name, value: element.id });
        }
      });
      this.listProjects = [];
      response.projects.forEach((element) => {
        //evitamos introducir el proyecto actual
        if (parseInt(this.idProject) !== parseInt(element.id)) {
          this.listProjects.push({
            label: element.campaign_name,
            value: element.id,
          });
        } else {
          this.status_project = element.id_status;
          this.checkEditable();
        }
      });
      this.typeSource = "budget";
      this.source = this.listBudgets;
    });
    this.getLinesSubconcept();

    this._api
      .getCustomerAddresses(this.infoCustomer.customer.id_customer)
      .subscribe((response) => {
        if (response !== null) {
          if (response.error) {
          } else if (response.status === "error") {
            this._notification.error("Aviso!", response.msg);
          } else {
            this.addresses = response.items;
            if (this.addresses != undefined) this.bHayDirecciones = true;
            if (this.bHayDirecciones) {
              //pongo como primera opción la dirección de la empresa
              let direccion = {
                id: -1,
                city: this.infoCustomer.customer.address_bis
                  ? this.infoCustomer.customer.address_bis
                  : this.infoCustomer.customer.city,
                postal_code: this.infoCustomer.customer.address_bis
                  ? ""
                  : this.infoCustomer.customer.postal_code,
                address: this.infoCustomer.customer.address,
                Nombre: this.infoCustomer.customer.name,
              };
              this.addresses.splice(0, 0, direccion);
              if (this.infoCustomer.id_address != -1)
                this.changeAddress(this.infoCustomer.id_address, false);
            }
          }
        }
      });
  }

  changeAddress(valor, bSelect) {
    this.addresses.forEach((item) => {
      if (valor == item.id) {
        this.infoCustomer.customer.address = item.address;
        this.infoCustomer.customer.city = item.city;
        this.infoCustomer.customer.postal_code = item.postal_code;
      }
    });

    this.infoCustomer.id_address = valor;

    if (bSelect) {
      this.valueId = `id_project=${this.idProject}`;
      this._api
        .updateInfoBudget("id_Address", valor, this.valueId)
        .subscribe((response) => {
          if (response.status === "ok") {
            this._notification.success(
              this.infoCustomer.status,
              "Se ha modificado la dirección."
            );
          } else {
            this._notification.error(
              "Error",
              "No se ha podido actualizar la direccion"
            );
          }
        });
    }
  }

  onDateChanged(event: IMyDateModel, field) {
    let updateDate = `${event.date.year}-${event.date.month}-${event.date.day}`;
    this.valueId = `id_project=${this.idProject}`;
    this._api
      .updateInfoPersonalFieldBudget(2, 2, updateDate, this.valueId)
      .subscribe((response) => {
        if (response.status === "ok") {
          this._notification.success(
            "Fecha de entrega",
            "Se ha guardado satisfactoriamente."
          );
        }
      });
  }

  changeInfoContact(event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = "entertabeado";
      this.valueId = `id_project=${this.idProject}`;

      if (field == "contact") {
        this.infoCustomer.contact = event.target.value;
        this._api
          .updateInfoBudget(field, event.target.value, this.valueId)
          .subscribe((response) => {
            if (response.status === "ok") {
              this._notification.success(
                "A la att.",
                "Se ha guardado satisfactoriamente."
              );
              event.target.blur();
            }
          });
      } else {
        let cod;
        switch (field) {
          case "project":
            cod = 1;
            break;
          case "phone":
            cod = 3;
            break;
          case "solicitant_data":
            cod = 4;
            break;
        }
        this._api
          .updateInfoPersonalFieldBudget(
            cod,
            1,
            event.target.value,
            this.valueId
          )
          .subscribe((response) => {
            if (response.status === "ok") {
              this._notification.success(
                field,
                "Se ha guardado satisfactoriamente."
              );
              event.target.blur();
            }
          });
      }
    }
  }

  checkEditable() {
    this.isEditable = false;
    // If status is budget
    /*     if ((this.status_project === '1' || this.status_project === '2') && this._token.getInfo().role !== '4') {
      this.isEditable = true;
    } */
    this.isEditable = true;
  }

  getSubconceptsStandard() {
    let id_customer = this.infoCustomer.customer.id_customer;
    let body = `id_customer=${id_customer}`;

    this._api.getSubconceptsStandards(body).subscribe((response) => {
      this.originalSubconceptsStandard = response.data;
    });
  }

  getCodesStandard() {
    let id_customer = this.infoCustomer.customer.id_customer;
    let body = `id_customer=${id_customer}`;

    this._api.getCodesStandards(body).subscribe((response) => {
      this.originalCodesStandard = response.data;
    });
  }

  searchSubconceptsStandards(event) {
    let text = event.query;
    let id_customer = this.infoCustomer.customer.id_customer;
    let body = `id_customer=${id_customer}&text=${text}`;

    this._api.getSubconceptsStandards(body).subscribe((response) => {
      let array_values = [];
      response.data.forEach((element) => {
        array_values.push(element.family + "-" + element.name);
      });

      this.subconcepts_standard = array_values;
    });
  }

  searchCodesStandards(event) {
    let text = event.query;
    let id_customer = this.infoCustomer.customer.id_customer;
    let body = `id_customer=${id_customer}&text=${text}`;

    this._api.getCodesStandards(body).subscribe((response) => {
      let array_values = [];
      response.data.forEach((element) => {
        array_values.push(element.name);
      });

      this.codes_standard = array_values;
    });
  }

  getLinesSubconcept() {
    this.lines = [];
    this._api.getSubconcept(this.valueId).subscribe((response) => {
      this.info =
        response.info_project &&
        response.info_project.length &&
        response.info_project[0];

      this.start_date = response.info_project[0].start_date_budget;
      this.end_date = response.info_project[0].end_date_budget;
      let creationDate = this._common.getDateParsed(
          response.info_project[0].start_date_budget
        ),
        endDate = this._common.getDateParsed(
          response.info_project[0].end_date_budget
        );

      this.start_date_budget = {
        date: {
          year: creationDate[0],
          month: creationDate[1],
          day: creationDate[2],
        },
      };
      this.end_date_budget = {
        date: {
          year: endDate[0],
          month: endDate[1],
          day: endDate[2],
        },
      };

      this.budget_validity = response.info_project[0].budget_validity;
      _.forEach(response.items, (element, key) => {
        this.lines.push({
          id: element.id,
          name: element.name,
          code: element.code,
          account: element.account_number,
          subconcepts: [],
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
          },
        });
      });
      if (response.subconcepts) {
        response.subconcepts.forEach((element) => {
          let varConcept = _.find(this.lines, (inner) => {
            return inner.id === element.id_variable_concept;
          });
          let total_budget =
            element.amount * element.unit_budget * element.price;
          let total_real =
            element.amount * element.unit_budget * element.unit_real;
          let benefit = total_budget - total_real;
          let margin = total_budget === 0 ? 0 : (benefit / total_budget) * 100;
          varConcept.budget.amount += this._common.toFloat(element.amount);
          varConcept.budget.units += this._common.toFloat(element.unit_budget);
          varConcept.budget.price += this._common.toFloat(element.price);
          varConcept.budget.total +=
            this._common.toFloat(element.amount) *
            this._common.toFloat(element.unit_budget) *
            this._common.toFloat(element.price);

          varConcept.real.units += this._common.toFloat(element.unit_real);
          varConcept.real.total +=
            this._common.toFloat(element.amount) *
            this._common.toFloat(element.unit_budget) *
            this._common.toFloat(element.unit_real);

          varConcept.others.benefits += benefit;
          varConcept.others.margin =
            varConcept.budget.total === 0
              ? 0
              : this._common.toFloat(
                  (varConcept.others.benefits / varConcept.budget.total) * 100
                );
          varConcept.subconcepts.push({
            bstockable: this.id_company == 412 ? element.bstockable : 1,
            id: element.id,
            name: element.name,
            code: element.code,
            readonly: false,
            budget: {
              amount: this._common.currencyFormatES(element.amount, false),
              units: this._common.currencyFormatES(element.unit_budget, false),
              price: this._common.currencyFormatES(element.price, false),
              total: this._common.currencyFormatES(total_budget, false),
            },
            real: {
              units: this._common.currencyFormatES(element.unit_real, false),
              total: this._common.currencyFormatES(total_real, false),
            },
            others: {
              benefits: benefit,
              margin: margin,
            },
          });
        });
      }
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
        },
      };
      if (response.fee && response.fee.length) {
        tmp.budget.amount = response.fee[0].amount;
        tmp.budget.units = response.fee[0].unit_budget;
        tmp.budget.price = response.fee[0].price;
        tmp.budget.total =
          tmp.budget.amount * tmp.budget.units * tmp.budget.price;
        tmp.real.total =
          response.fee[0].unit_real * tmp.budget.amount * tmp.budget.units;
        tmp.real.units = response.fee[0].unit_real;

        this.fee.id = response.fee[0].id;
      }

      this.fee.budget.amount = this._common.currencyFormatES(
        tmp.budget.amount,
        false
      );
      this.fee.budget.units = this._common.currencyFormatES(
        tmp.budget.units,
        false
      );
      this.fee.budget.price = this._common.currencyFormatES(
        tmp.budget.price,
        false
      );
      this.fee.budget.total = this._common.currencyFormatES(tmp.budget.total);

      this.fee.real.units = this._common.currencyFormatES(
        tmp.real.units,
        false
      );
      this.fee.real.total = 0;

      this.fee.others.benefits = this._common.currencyFormatES(
        tmp.budget.total
      );
      this.fee.others.margin = 100;

      this.calculateTotals();
    });
  }

  changeSource(type) {
    switch (type) {
      case "budget":
        this.typeSource = "budget";
        this.source = this.listBudgets;
        break;
      case "project":
        this.typeSource = "project";
        this.source = this.listProjects;
        break;
    }
  }

  updateSubconcept(subconcept, event, field, blurDescription = false) {
    let value = "";
    let price = null;
    let description = null;
    let code = null;
    let parsed = null;
    let parsedPrice = null;
    let parsedCode = null;
    let parsedDescription = null;

    //console.log((blurDescription && event.target), (event && event.target && field !== 'name'), (!event.target && field === 'name'));
    if (
      (blurDescription && event.target) ||
      (event && event.target && field !== "name" && field !== "code") ||
      (!event.target && (field === "name" || field === "code"))
    ) {
      value = event.target ? event.target.value : event;
      if (field !== "name" && field !== "code") {
        parsed = this._common.toFloat(event.target.value);
      } else {
        parsed = value;
      }

      if (!event.target && this.id_company == 412) {
        subconcept.readonly = true;
      }

      if (field == "code" && value.length >= 3) {
        price = this.originalSubconceptsStandard.filter((element) => {
          return element.name === value;
        });

        description = this.originalCodesStandard.filter((element) => {
          return element.name === value;
        });
        code = "";
      } else if (field == "name") {
        price = "";
        description = "";
        code = this.originalCodesStandard.filter((element) => {
          const parsedItem =
            value.split("-").length > 1 ? value.split("-")[1].trim() : value;
          return element.description === parsedItem;
        });
      } else {
        price = "";
        description = "";
        code = "";
      }

      // significa que hemos encontrado un subconcepto standard y hay que cambiar dos
      // valores en la BBDD, el precio y el nombre
      if (price.length) {
        parsedPrice = price[0].unit_price;
        subconcept.budget.price = price[0]
          ? this._common.currencyFormatES(price[0].unit_price, false)
          : "0,00";
      }

      if (description.length) {
        //console.log('price3',description[0]);
        parsedPrice = description[0].unit_price;
        subconcept.budget.price = description[0]
          ? this._common.currencyFormatES(description[0].unit_price, false)
          : "0,00";
        parsedDescription = description[0].description;
      }

      if (code.length) {
        //ojo: si tenemos un código ya puesto y tiene la misma descripción no lo machacamos
        let index = code.findIndex((element) => {
          return element.name === subconcept.code;
        });

        if (index == -1) index = 0;
        //console.log('price4',code[index]);

        parsedPrice = code[index].unit_price;
        subconcept.budget.price = code[index]
          ? this._common.currencyFormatES(code[index].unit_price, false)
          : "0,00";
        parsedCode = code[index].name;
      }

      return new Promise((resolve) => {
        let parsed = null;
        if (field !== "name" && field !== "code") {
          parsed = this._common.toFloat(event.target.value);
        } else {
          parsed = value;
        }

        this._api
          .updateSubconcept(
            subconcept.id,
            field,
            parsed,
            parsedPrice,
            parsedDescription,
            parsedCode
          )
          .subscribe((response) => {
            if (response.status == "ok") {
              if (field === "name") {
                subconcept[field] = response["descripcion"];
              } else {
                subconcept[field] = value;
              }
              console.log(subconcept[field]);
              subconcept["name"] = parsedDescription
                ? parsedDescription
                : subconcept["name"];
              subconcept["code"] = parsedCode ? parsedCode : subconcept["code"];
              this._notification.success("Actualizado", response.msg);
              this.calculateTotalLine(subconcept, field, value);
              this.calculateTotals();
              this.calculateHeadersLine();
              resolve(response.status);
              if (this.id_company == 412 || this.id_company == 385) {
                response.disponibles =
                  response.disponibles == null ? 0 : response.disponibles;
                response.solicitadas =
                  response.solicitadas == null ? 0 : response.solicitadas;

                if (
                  response.bstockable == 1 &&
                  +response.solicitadas + parseInt(response.pedidasaqui) >
                    +response.disponibles
                ) {
                  this.exceso = response;
                  let str = 'Del artículo "' + response.descripcion + '"\n';
                  str +=
                    "Hay " +
                    response.disponibles +
                    " unidades en el almacén \n";
                  str +=
                    "Están comprometidas " +
                    response.solicitadas +
                    " en otros pedidos \n";
                  str +=
                    "Con lo cual tendríamos disponibles " +
                    Math.max(
                      +response.disponibles - parseInt(response.solicitadas),
                      0
                    ) +
                    " unidades \n\n";
                  str +=
                    "Como usted pide " +
                    response.pedidasaqui +
                    " unidades, no se podría cumplir con las existencias actuales. Considere si debe cambiar las unidades.";

                  alert(str);
                  //this.isModalOpen = true;
                }
              }
            }
          });
      });
    } else {
      return new Promise((reject) => {
        reject();
      });
    }
  }

  updateFee(fee, event, field, type_table, id) {
    return new Promise((resolve) => {
      let parsed = this._common.toFloat(event.target.value);

      this._api
        .updateFee(fee.id, field, parsed, type_table, id)
        .subscribe((response) => {
          if (response.status == "ok") {
            this._notification.success("Actualizado", response.msg);
            this.calculateTotalLine(fee, field, parsed, true);
            resolve(response);
          }
        });
    });
  }

  addSubconcept(index) {
    let textoerror = "";
    if (this.contact_field == null || this.contact_field == "") {
      textoerror += "Primero debe rellenar el campo del contacto \n";
    }

    if (this.project_field == null || this.project_field == "") {
      textoerror += "Primero debe rellenar el dato de campaña \n";
    }

    if (this.delivery_date == null || this.delivery_date == "") {
      textoerror += "Primero debe rellenar la fecha de entrega \n";
    }

    if (this.phone_field == null || this.phone_field == "") {
      textoerror += "Primero debe rellenar el teléfono \n";
    }

    if (this.solicitant_field == null || this.solicitant_field == "") {
      textoerror += "Primero debe rellenar los datos del solicitante \n";
    }

    if (textoerror != "" && this.id_company == 412) {
      alert(textoerror);
      return;
    }

    let idVariableConcept = this.lines[index].id;
    this._api
      .addSubconcept(this.valueId, idVariableConcept)
      .subscribe((response) => {
        this.lines[index].subconcepts.push({
          id: response.items.id,
          name: "",
          code: "",
          budget: {
            amount: 1,
            units: 1,
            price: 0,
            total: 0,
          },
          readonly: false,
          real: {
            units: 0,
            total: 0,
          },
          others: {
            benefits: 0,
            margin: 0,
          },
        });
      });
  }

  removeSubconcept(id, idx, id_inner) {
    this._api.removeSubconcept(id).subscribe((response) => {
      this.lines[idx].subconcepts.splice(id_inner, 1);
      if (response.status === "ok") {
        this._notification.success("Eliminado", response.msg);
        this.calculateTotals();
        this.calculateHeadersLine();
      } else {
        this._notification.error("Error", response.msg);
      }
    });
  }

  calculateHeadersLine() {
    this.lines.forEach((line) => {
      line.budget.amount = 0;
      line.budget.units = 0;
      line.budget.price = 0;
      line.budget.total = 0;
      line.real.units = 0;
      line.real.total = 0;
      line.others.benefits = 0;
      line.others.margin = 0;

      line.subconcepts.forEach((subconcept) => {
        line.budget.amount += this._common.toFloat(subconcept.budget.amount);
        line.budget.units += this._common.toFloat(subconcept.budget.units);
        line.budget.price += this._common.toFloat(subconcept.budget.price);
        line.budget.total += this._common.toFloat(subconcept.budget.total);

        line.real.units += this._common.toFloat(subconcept.real.units);
        line.real.total += this._common.toFloat(subconcept.real.total);

        line.others.benefits += this._common.toFloat(
          subconcept.others.benefits
        );
        line.others.margin = 0;
        if (line.budget.total > 0) {
          line.others.margin = this._common.toFloat(
            (line.others.benefits / line.budget.total) * 100
          );
        }
      });
    });
  }

  calculateTotalLine(subconcept, field, value, isFee: boolean = false) {
    let total_budget =
      this._common.toFloat(subconcept.budget.amount) *
      this._common.toFloat(subconcept.budget.units) *
      this._common.toFloat(subconcept.budget.price);
    let total_real =
      this._common.toFloat(subconcept.budget.amount) *
      this._common.toFloat(subconcept.budget.units) *
      this._common.toFloat(subconcept.real.units);
    let benefit = 0;
    subconcept.budget.total = total_budget;
    if (isFee) {
      subconcept.real.total = 0;
      benefit = total_budget;
    } else {
      subconcept.real.total = total_real;
      benefit = total_budget - total_real;
    }

    let margin = total_budget === 0 ? 0 : (benefit / total_budget) * 100;

    subconcept.others.benefits = benefit;
    subconcept.others.margin = margin;
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = {
      budget_total: 0,
      real_total: 0,
      benefit_total: 0,
      margin_total: 0,
    };
    this.lines.forEach((items) => {
      items.subconcepts.forEach((inner) => {
        subtotal.budget_total += this._common.toFloat(inner.budget.total);
        subtotal.real_total += this._common.toFloat(inner.real.total);
        subtotal.benefit_total += this._common.toFloat(inner.others.benefits);
      });
    });
    this.subtotal.margin_total =
      subtotal.budget_total === 0
        ? 0
        : (subtotal.benefit_total / subtotal.budget_total) * 100;
    this.subtotal.budget_total = subtotal.budget_total;
    this.subtotal.real_total = subtotal.real_total;
    this.subtotal.benefit_total = subtotal.benefit_total;

    this.total.budget_total =
      subtotal.budget_total + this._common.toFloat(this.fee.budget.total);
    this.total.real_total =
      subtotal.real_total + this._common.toFloat(this.fee.real.total);
    this.total.benefit_total =
      subtotal.benefit_total + this._common.toFloat(this.fee.others.benefits);
    this.total.margin_total =
      this.total.budget_total === 0
        ? 0
        : (this.total.benefit_total / this.total.budget_total) * 100;
  }

  resetClass(value) {
    if (value.which === 13 || value.which === 9) {
      value.target.className = "";
    } else {
      value.target.className = "dirty";
    }
  }
  blurred(event, previous, value, type, field) {
    if (event.target.className.indexOf("dirty") > -1) {
      value[type][field] = this._common.currencyFormatES(previous, false);
      this._notification.info(
        "Información",
        "Pulsa Enter o Tabulador para almacenar el valor"
      );
    }
  }

  changeInput(subconcept, event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = "entertabeado";
      this.updateSubconcept(subconcept, event, field).then((response) => {
        this.calculateHeadersLine();
        if (event.which === 13) {
          event.target.blur();
        }
      });
    }
  }
  changeInputFee(fee, event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = "entertabeado";
      this.updateFee(fee, event, field, this.typeTable, this.numberId).then(
        (response) => {
          if (response["value_id"]) {
            this.fee.id = response["value_id"];
          }
          if (event.which === 13) {
            event.target.blur();
          }
        }
      );
    }
  }

  cancelChangeDates() {
    this[this.tmpField] = this.tmpDate;
    this.showDateWrong = false;
  }

  changeDates() {
    let ids = "";
    this.itemsToRemove.forEach((element) => {
      ids += `${element.id},`;
    });
    ids = ids.replace(/,$/, "");
    this._api.deleteDatesLines(ids).subscribe((response) => {
      if (response.status === "ok") {
        this._api
          .updateInfoBudget(this.fieldDate, this.updateDate, this.idProject)
          .subscribe((response) => {
            if (response.status === "ok") {
              this._notification.success(
                "Fecha de presupuesto",
                "Se ha guardado satisfactoriamente."
              );
            }
            this.showDateWrong = false;
          });
      }
    });
  }
  changeInfoBudget(event, field) {
    if (event.which === 13 || event.which === 9) {
      event.currentTarget.className = "entertabeado";
      this._api
        .updateInfoBudget(field, event.target.value, this.valueId)
        .subscribe((response) => {
          if (response.status === "ok") {
            this._notification.success(
              "Validez de presupuesto",
              "Se ha guardado satisfactoriamente."
            );
            event.target.blur();
          }
        });
    }
  }

  blurValidity(event) {
    if (event.currentTarget.className !== "entertabeado") {
      this._notification.error(
        "Aviso",
        "Para guardar el campo utiliza Tab o Intro."
      );
    }
  }
  drawHeaderFooterPDF(
    doc,
    imgData,
    imgDataCompany,
    dataCompany,
    infoCustomer,
    budget_validity,
    isBudget = true
  ) {
    // HEADER
    doc.setFontSize(23);
    doc.addImage(imgData, "JPEG", 1, 1, 1.5, 1.5);
    doc.setTextColor(65, 142, 229);
    if (isBudget) {
      doc.text(12, 1.5, "Presupuesto");
    } else {
      doc.text(12, 1.5, "Albarán");
    }

    doc.setTextColor(121, 118, 119);
    doc.setTextColor(121, 118, 119);
    doc.setFontSize(9);
    doc.setFontType("bold");
    let cc = infoCustomer.campaign_code ? `${infoCustomer.campaign_name}` : "";
    doc.text(12, 2.2, cc);
    let row = 2.7;
    if (isBudget) {
      doc.text(12, 2.7, `Validez de presupuesto: ${budget_validity} días`);
      row = 3.2;
    }

    let actualDate = new Date();
    doc.text(
      12,
      row,
      "Fecha: " +
        this._common.parseDatefromDate(
          `${
            actualDate.getMonth() + 1
          }-${actualDate.getDate()}-${actualDate.getFullYear()}`
        )
    );
    doc.setFontType("normal");
    let cname = infoCustomer.customer.name ? infoCustomer.customer.name : "";
    doc.text(1, 3, cname);
    let ccif = infoCustomer.customer.cif ? infoCustomer.customer.cif : "";
    doc.text(1, 3.5, ccif);
    let caddress = infoCustomer.customer.address
      ? infoCustomer.customer.address
      : "";
    doc.text(1, 4, caddress);
    let caddressBis = infoCustomer.customer.address_bis
      ? infoCustomer.customer.address_bis
      : "";
    doc.text(1, 4.5, caddressBis);
    // FOOTER
    doc.setFontSize(30);
    doc.setFillColor(231, 232, 234);
    doc.rect(0, 27, 21, 2.7, "F");
    doc.setTextColor(83, 83, 83);
    doc.setFontSize(13);
    doc.text(3.5, 27.8, dataCompany.name);
    doc.setFontSize(10);
    doc.text(3.5, 28.3, dataCompany.cif);
    doc.text(3.5, 28.8, dataCompany.address);
    doc.text(3.5, 29.3, dataCompany.address_bis);
    doc.setFillColor(205, 205, 205);
    doc.rect(17, 27, 4, 2.7, "F");
    doc.triangle(17, 27, 17, 29.7, 12.5, 29.7, "F");
    doc.addImage(imgDataCompany, "JPEG", 1, 27.35, 2, 2);
    if (isBudget) {
      doc.text(16.5, 28.8, "Impuestos no incluidos");
    }
  }

  exportPDF() {
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;

    let doc = new jsPDF("p", "cm");
    let margen_izq = 2;
    let margen_dch = 2;
    let inicio_cuadro = 10;
    let maximo_linea = 75;
    let altura_cuadro = 10.5;
    let borde_lineas = 0.05;
    let ancho_importes = 2.5;
    let urlCompany =
      dataCompany.logo != "undefined"
        ? URL_UPLOAD_LOGO + dataCompany.logo
        : URL_UPLOAD_LOGO + "placeholder.jpg";
    let imgDataCompany = null;
    let anchoimagen = 4.64;
    let bPintarlineas = true;
    let bCapitalizar = false;
    let textoEnunciadoBlanco = false;
    let sumaysiguederecha = 21 - margen_dch - ancho_importes - 0.2;

    switch (dataCompany.id) {
      case "410":
        textoEnunciadoBlanco = true;
        bCapitalizar = true;
        sumaysiguederecha = 14;
        break;
      case "411":
        textoEnunciadoBlanco = true;
        anchoimagen = 1.8;
        bPintarlineas = false;
        bCapitalizar = true;
        break;
      case "412":
        textoEnunciadoBlanco = true;
        anchoimagen = 3.36;
        break;
      case "408":
      default:
    }

    base64Img.requestBase64(urlCompany, (err, res, body) => {
      imgDataCompany = body;
      doc.addImage(imgDataCompany, "JPEG", 2.3, 1, anchoimagen, 3.36);
      doc.setLineWidth(borde_lineas);

      this.pintarComunesPaginas(
        doc,
        margen_izq,
        margen_dch,
        inicio_cuadro,
        altura_cuadro,
        ancho_importes,
        borde_lineas
      );

      doc.setFontType("normal");
      doc.setFontSize(9);

      let altura_texto = inicio_cuadro + 1.6;
      let altura_numero = altura_texto;
      let importeparcial = 0;
      //escribo las líneas

      this.lines.forEach((line, idx) => {
        line.subconcepts.forEach((sub, otroidx) => {
          let texto = sub.name.split("\n");
          let texto_lineas = [];
          let linea = "";
          texto.forEach((txt, j) => {
            let frase = txt.split(" ");
            let cuentaletras = 0;
            frase.forEach((palabra: string, i) => {
              cuentaletras += palabra.length + 1;
              if (cuentaletras > maximo_linea) {
                texto_lineas.push(linea);
                cuentaletras = palabra.length + 1;
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
            if (altura_texto > 19.5) {
              doc.setFontType("italic");
              doc.textEx(
                "Suma y sigue en página siguiente >>",
                sumaysiguederecha,
                20,
                "right",
                "bottom"
              );
              doc.textEx(
                this._common.currencyFormatES(importeparcial, false),
                18.8,
                20,
                "right",
                "bottom"
              );

              doc.addPage();

              altura_texto = inicio_cuadro + 1.6;
              doc.textEx(
                "<< Suma y sigue de página anterior",
                sumaysiguederecha,
                altura_texto,
                "right",
                "bottom"
              );
              doc.textEx(
                this._common.currencyFormatES(importeparcial, false),
                18.8,
                altura_texto,
                "right",
                "bottom"
              );

              doc.setFontType("normal");

              altura_texto = altura_texto + 1;

              doc.addImage(imgDataCompany, "JPEG", 2.3, 1, anchoimagen, 3.36);
              this.pintarComunesPaginas(
                doc,
                margen_izq,
                margen_dch,
                inicio_cuadro,
                altura_cuadro,
                ancho_importes,
                borde_lineas
              );
              doc.setFontType("normal");
              doc.setFontSize(9);
            }

            switch (dataCompany.id) {
              case "410":
                if (pintaunidades)
                  doc.textEx(
                    this._common.currencyFormatES(sub.budget.amount, false),
                    16.3,
                    altura_texto + 0.06,
                    "right",
                    "bottom"
                  );
                doc.text(margen_izq + 0.2, altura_texto, line);
                if (pintaunidades)
                  doc.textEx(
                    this._common.currencyFormatES(sub.budget.total, false),
                    18.8,
                    altura_texto + 0.06,
                    "right",
                    "bottom"
                  );
                break;
              case "411":
                doc.text(margen_izq + 0.2, altura_texto, line);
                if (pintaunidades)
                  doc.textEx(
                    this._common.currencyFormatES(sub.budget.total, false),
                    18.8,
                    altura_texto + 0.06,
                    "right",
                    "bottom"
                  );
                break;
              case "408":
              default:
                if (pintaunidades)
                  doc.textEx(
                    this._common.currencyFormatES(sub.budget.amount, false),
                    3.45,
                    altura_texto + 0.06,
                    "right",
                    "bottom"
                  );
                doc.text(margen_izq + 1.7, altura_texto, line);
                if (pintaunidades)
                  doc.textEx(
                    this._common.currencyFormatES(sub.budget.total, false),
                    18.8,
                    altura_texto + 0.06,
                    "right",
                    "bottom"
                  );
            }
            altura_texto += 0.4;
            if (pintaunidades) {
              //quitar cuando tenga tiempo
              if (typeof sub.budget.total == "number") {
                importeparcial += sub.budget.total;
              } else {
                importeparcial += parseFloat(
                  sub.budget.total.toString().replace(".", "").replace(",", ".")
                );
              }
              pintaunidades = false;
            }
          });
          //      }
          altura_texto += 0.7;
        });
      });

      //resumen factura y sus líneas verticales
      if (this.infoCustomer.id_status == "1") {
        this.pintarRectanguloFactura(
          doc,
          inicio_cuadro + altura_cuadro + 0.3,
          21 - margen_dch - ancho_importes,
          margen_dch,
          0.6,
          2
        );
      } else {
        this.pintarRectanguloFactura(
          doc,
          inicio_cuadro + altura_cuadro + 0.3,
          margen_izq,
          margen_dch,
          0.6,
          2
        );
        if (bPintarlineas) {
          doc.line(
            21 - margen_dch - ancho_importes,
            inicio_cuadro + altura_cuadro + 0.3,
            21 - margen_dch - ancho_importes,
            inicio_cuadro + altura_cuadro + 2.3
          );
          doc.line(
            8.5,
            inicio_cuadro + altura_cuadro + 0.3,
            8.5,
            inicio_cuadro + altura_cuadro + 2.3
          );
          doc.line(
            10.6,
            inicio_cuadro + altura_cuadro + 0.3,
            10.6,
            inicio_cuadro + altura_cuadro + 2.3
          );
        }
      }

      //observaciones
      this.pintarRectanguloFactura(
        doc,
        inicio_cuadro + altura_cuadro + 0.3 + 3,
        margen_izq,
        margen_dch,
        0.6,
        3.5
      );

      doc.setFontType("normal");

      //resumen factura
      if (this.infoCustomer.id_status == "1") {
        if (textoEnunciadoBlanco) doc.setTextColor(255);
        doc.text(17, inicio_cuadro + altura_cuadro + 0.7, "TOTAL");
        doc.setTextColor(0);
        doc.text(
          10,
          inicio_cuadro + altura_cuadro + 1.3,
          "(Impuestos no incluídos)"
        );
        doc.text(10, inicio_cuadro + altura_cuadro + 2.3, "No incluye Portes");
        doc.textEx(
          this._common.currencyFormatES(this.total.budget_total),
          18.8,
          inicio_cuadro + altura_cuadro + 1.3,
          "right",
          "middle"
        );
      } else {
        if (textoEnunciadoBlanco) doc.setTextColor(255);
        doc.text(3.5, inicio_cuadro + altura_cuadro + 0.7, "BASE IMPONIBLE");
        doc.text(9, inicio_cuadro + altura_cuadro + 0.7, "% I.V.A.");
        doc.text(12, inicio_cuadro + altura_cuadro + 0.7, "CUOTA I.V.A.");
        doc.text(17, inicio_cuadro + altura_cuadro + 0.7, "TOTAL");

        let base = this.total.budget_total;
        let tax = (base * 21) / 100;

        doc.setTextColor(0);
        doc.text(
          4,
          inicio_cuadro + altura_cuadro + 1.5,
          this._common.currencyFormatES(base)
        );
        doc.text(
          9.1,
          inicio_cuadro + altura_cuadro + 1.5,
          this._common.currencyFormatES(21, false) + "%"
        );
        doc.text(
          12.5,
          inicio_cuadro + altura_cuadro + 1.5,
          this._common.currencyFormatES(tax)
        );
        doc.textEx(
          this._common.currencyFormatES(this.total.budget_total * 1.21),
          18.8,
          inicio_cuadro + altura_cuadro + 1.3,
          "right",
          "middle"
        );
      }

      //observaciones
      if (textoEnunciadoBlanco) doc.setTextColor(255);
      doc.text(
        margen_izq + 0.2,
        inicio_cuadro + altura_cuadro + 3.7,
        "Observaciones"
      );
      doc.setTextColor(0);
      altura_texto = 0;

      let texto = this.infoCustomer.observ_cli.split("\n");
      let texto_lineas = [];
      let linea = "";
      texto.forEach((txt, j) => {
        let frase = txt.split(" ");
        let cuentaletras = 0;
        frase.forEach((palabra: string, i) => {
          cuentaletras += palabra.length + 1;
          if (cuentaletras > 90) {
            texto_lineas.push(linea);
            cuentaletras = palabra.length + 1;
            linea = "";
          }
          linea += palabra + " ";
        });
        if (linea != "") texto_lineas.push(linea);
        linea = "";
        cuentaletras = 0;
      });

      texto_lineas.forEach((line) => {
        doc.text(
          margen_izq + 0.2,
          inicio_cuadro + altura_cuadro + 4.4 + altura_texto,
          line
        );
        altura_texto += 0.4;
      });

      if (dataCompany.rgpd) {
        doc.setFontSize(7);
        doc.text(2, 27.7, dataCompany.rgpd);
      }

      doc.save(
        `${String(this.infoCustomer.status).trim()}-${String(
          this.infoCustomer.id_status == "1"
            ? this.infoCustomer.campaign_code
            : this.infoCustomer.ped_code
        ).trim()}.pdf`
      );
      this._notification.success("Exportación", "Se ha creado el archivo PDF.");
    }); //fin de la imagen
  }

  pintarComunesPaginas(
    doc,
    margen_izq,
    margen_dch,
    inicio_cuadro,
    altura_cuadro,
    ancho_importes,
    borde_lineas
  ) {
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;
    let frasepedidocliente;
    let bPintarlineas = true;
    let bMostrarTelefono = true;
    let bMostrarCif = false;
    let alto_cabecera = 1;
    let complemento_cuadroppal = 0;
    let linea_unidades = 3.5;
    let bVerFechaPresupuesto = false;

    switch (dataCompany.id) {
      case "410":
        frasepedidocliente = "FACTURA PROFORMA";
        bMostrarCif = true;
        linea_unidades = 14.5;
        bVerFechaPresupuesto = true;
        break;
      case "411":
        frasepedidocliente = "";
        bPintarlineas = false;
        bMostrarTelefono = false;
        bMostrarCif = true;
        alto_cabecera = 0.6;
        complemento_cuadroppal = 0.2;
        break;
      case "408":
      default:
        frasepedidocliente = "Pedido Cliente";
    }

    doc.setFontSize(9);
    doc.setLineWidth(borde_lineas);

    let datos_compania = [];

    datos_compania.push(dataCompany.name);
    if (bMostrarCif) {
      datos_compania.push(dataCompany.cif);
    }
    datos_compania.push(dataCompany.address);
    datos_compania.push(dataCompany.address_bis);
    if (bMostrarTelefono) {
      datos_compania.push("Tel.: " + dataCompany.phone);
    }

    let sumalinea = 0;
    datos_compania.forEach((element) => {
      doc.text(2.2, 5 + sumalinea, element);
      sumalinea += 0.5;
    });

    //textos informativos de la factura
    doc.setFontType("bold");
    if (this.infoCustomer.id_status == "1") {
      doc.text(2.2, 8, "Presupuesto");
      if (bVerFechaPresupuesto) {
        doc.text(2.2, 8.5, this.infoCustomer.creation_date);
      }
    } else {
      doc.text(2.2, 8, frasepedidocliente);
      doc.text(2.2, 8.5, "Nº Pedido: ");
      doc.text(2.2, 9, "Fecha: ");
      doc.text(2.2, 9.5, "Nº Cliente: ");
      doc.text(5.2, 8.5, this.infoCustomer.ped_code);
      doc.text(5.2, 9, this.infoCustomer.creation_date);
      doc.text(5.2, 9.5, this.infoCustomer.customer.id_customer);
    }

    let cliente = [];

    cliente.push(this.infoCustomer.customer.name);
    this.infoCustomer.customer.address.split("\n").forEach((element) => {
      if (element != "") cliente.push(element);
    });

    if (this.infoCustomer.customer.city) {
      cliente.push(
        (this.infoCustomer.customer.postal_code
          ? this.infoCustomer.customer.postal_code + " "
          : " ") +
          (this.infoCustomer.customer.city
            ? this.infoCustomer.customer.city
            : "")
      );
    } else {
      cliente.push(this.infoCustomer.customer.address_bis);
    }

    if (
      this.infoCustomer.customer.cif &&
      this.infoCustomer.customer.cif != "undefined"
    )
      cliente.push("CIF: " + this.infoCustomer.customer.cif);
    if (this.infoCustomer.contact != "")
      cliente.push("Contacto: " + this.infoCustomer.contact);
    if (this.infoCustomer.phone != "" && this.infoCustomer.phone != null)
      cliente.push("Teléfono: " + this.infoCustomer.phone);
    if (
      this.infoCustomer.delivery_date != "" &&
      this.infoCustomer.delivery_date != null
    )
      cliente.push(
        "Fecha Entrega: " +
          this.delivery_date.date.day +
          "/" +
          this.delivery_date.date.month +
          "/" +
          this.delivery_date.date.year
      );
    if (this.infoCustomer.project != "" && this.infoCustomer.project != null)
      cliente.push("Campaña: " + this.infoCustomer.project);
    if (
      this.infoCustomer.customer.phone != "" &&
      this.infoCustomer.customer.phone != null
    )
      cliente.push("Teléfono: " + this.infoCustomer.customer.phone);
    if (
      this.infoCustomer.customer.email != "" &&
      this.infoCustomer.customer.email != null
    )
      cliente.push("E-Mail: " + this.infoCustomer.customer.email);
    if (
      this.infoCustomer.solicitant_data != "" &&
      this.infoCustomer.solicitant_data != null
    )
      cliente.push(
        "Datos del solicitante: " + this.infoCustomer.solicitant_data
      );

    sumalinea = 0;
    cliente.forEach((element) => {
      doc.textEx(element, 21 - margen_dch, 4.5 + sumalinea, "right", "top");
      sumalinea += 0.6;
    });

    //rectángulo principal y su línea vertical de los totales
    this.pintarRectanguloFactura(
      doc,
      inicio_cuadro + complemento_cuadroppal,
      margen_izq,
      margen_dch,
      alto_cabecera,
      altura_cuadro
    );
    if (bPintarlineas) {
      doc.line(
        linea_unidades,
        inicio_cuadro,
        linea_unidades,
        inicio_cuadro + altura_cuadro
      );
      doc.line(
        21 - margen_dch - ancho_importes,
        inicio_cuadro,
        21 - margen_dch - ancho_importes,
        inicio_cuadro + altura_cuadro
      );
    }

    //cuadro principal
    //esto es demasiado diferente, pongo los casos uno a uno
    switch (dataCompany.id) {
      case "410":
        doc.setTextColor(255);
        doc.text(7, inicio_cuadro + 0.6, "CONCEPTO");
        doc.text(14.7, inicio_cuadro + 0.6, "UNIDADES");
        doc.text(17, inicio_cuadro + 0.6, "IMPORTE");
        doc.setTextColor(0);
        break;
      case "411":
        doc.setTextColor(255);
        doc.text(7, inicio_cuadro + 0.65, "CONCEPTO");
        doc.text(17, inicio_cuadro + 0.65, "IMPORTE");
        doc.setTextColor(0);
        break;
      case "408":
      case "413":
        doc.text(2.5, inicio_cuadro + 0.6, "Un.");
        doc.text(6.5, inicio_cuadro + 0.6, "Concepto");
        doc.text(17.2, inicio_cuadro + 0.6, "Importe");
        break;
      default:
        doc.setTextColor(255);
        doc.text(2.5, inicio_cuadro + 0.6, "Un.");
        doc.text(6.5, inicio_cuadro + 0.6, "Concepto");
        doc.text(17.2, inicio_cuadro + 0.6, "Importe");
        doc.setTextColor(0);
        break;
    }

    //última línea al final del presupuesto/pedido
    doc.setFontSize(7);
    doc.setFontType("normal");
    if (dataCompany.rgpd) {
      doc.text(1.5, 25, dataCompany.credits, null, 90);
    } else {
      doc.text(4, 28, dataCompany.credits);
    }
  }

  pintarComunesAlbaran(
    doc,
    margen_izq,
    margen_dch,
    inicio_cuadro,
    altura_cuadro,
    ancho_importes,
    borde_lineas,
    bPintarCuadroPrincipal
  ) {
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;

    let bPintarlineas = true;
    let bMostrarTelefono = true;
    let bMostrarCif = false;
    let alto_cabecera = 1;
    let complemento_cuadroppal = 0;
    let linea_unidades = 4.5;
    let bMostrarFechaEntrega = false;

    switch (dataCompany.id) {
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
      case "412":
        bMostrarFechaEntrega = true;
        bPintarlineas = false;
        break;
      case "408":
      default:
    }

    doc.setFontSize(9);
    doc.setLineWidth(borde_lineas);

    let datos_compania = [];

    datos_compania.push(dataCompany.name);
    if (bMostrarCif) {
      datos_compania.push(dataCompany.cif);
    }
    datos_compania.push(dataCompany.address);
    datos_compania.push(dataCompany.address_bis);
    if (bMostrarTelefono) {
      datos_compania.push("Tel.: " + dataCompany.phone);
    }

    let sumalinea = 0;
    datos_compania.forEach((element) => {
      doc.text(2.2, 5 + sumalinea, element);
      sumalinea += 0.5;
    });

    //textos informativos de la factura
    doc.setFontType("bold");
    doc.text(
      2.2,
      7.8,
      "Albarán " +
        (this.infoCustomer.id_status == "1"
          ? " Presupuesto nº " + this.infoCustomer.campaign_code
          : "Pedido nº " + this.infoCustomer.ped_code)
    );

    if (bMostrarFechaEntrega && this.delivery_date) {
      if (parseFloat(this.delivery_date.date.year) > 2000) {
        doc.text(
          2.2,
          8.5,
          "Fecha de Entrega: " +
            this._common.getFecha(
              new Date(
                this.delivery_date.date.year,
                this.delivery_date.date.month - 1,
                this.delivery_date.date.day
              )
            )
        );
      }
    }

    doc.text(2.2, 9.2, this.infoCustomer.campaign_name);

    let cliente = [];

    cliente.push(this.infoCustomer.customer.name);
    this.infoCustomer.customer.address.split("\n").forEach((element) => {
      if (element != "") cliente.push(element);
    });

    if (this.infoCustomer.customer.city) {
      cliente.push(
        (this.infoCustomer.customer.postal_code
          ? this.infoCustomer.customer.postal_code + " "
          : " ") +
          (this.infoCustomer.customer.city
            ? this.infoCustomer.customer.city
            : "")
      );
    } else {
      cliente.push(this.infoCustomer.customer.address_bis);
    }

    if (
      this.infoCustomer.customer.cif &&
      this.infoCustomer.customer.cif != "undefined"
    )
      cliente.push("CIF: " + this.infoCustomer.customer.cif);
    if (this.infoCustomer.contact != "")
      cliente.push("Contacto: " + this.infoCustomer.contact);
    if (this.infoCustomer.phone != "" && this.infoCustomer.phone != null)
      cliente.push("Teléfono: " + this.infoCustomer.phone);
    if (this.infoCustomer.project != "" && this.infoCustomer.project != null)
      cliente.push("Campaña: " + this.infoCustomer.project);
    if (
      this.infoCustomer.customer.phone != "" &&
      this.infoCustomer.customer.phone != null
    )
      cliente.push("Teléfono: " + this.infoCustomer.customer.phone);
    if (
      this.infoCustomer.customer.email != "" &&
      this.infoCustomer.customer.email != null
    )
      cliente.push("E-Mail: " + this.infoCustomer.customer.email);
    if (
      this.infoCustomer.solicitant_data != "" &&
      this.infoCustomer.solicitant_data != null
    )
      cliente.push(
        "Datos del solicitante: " + this.infoCustomer.solicitant_data
      );

    sumalinea = 0;
    cliente.forEach((element) => {
      doc.textEx(element, 21 - margen_dch, 4.5 + sumalinea, "right", "top");
      sumalinea += 0.6;
    });

    if (bPintarCuadroPrincipal) {
      //rectángulo principal y su línea vertical de los totales
      this.pintarRectanguloFactura(
        doc,
        inicio_cuadro + complemento_cuadroppal,
        margen_izq,
        margen_dch,
        alto_cabecera,
        altura_cuadro
      );
      if (bPintarlineas) {
        doc.line(
          linea_unidades,
          inicio_cuadro,
          linea_unidades,
          inicio_cuadro + altura_cuadro
        );
      }

      //cuadro principal
      //esto es demasiado diferente, pongo los casos uno a uno
      switch (dataCompany.id) {
        case "410":
          doc.setTextColor(255);
          doc.text(2.5, inicio_cuadro + 0.6, "UNIDADES");
          doc.text(8.5, inicio_cuadro + 0.6, "CONCEPTOS");
          doc.setTextColor(0);
          break;
        case "411":
          doc.setTextColor(255);
          doc.text(8.5, inicio_cuadro + 0.6, "CONCEPTOS");
          doc.setTextColor(0);
          break;
        case "408":
        case "413":
          doc.text(2.5, inicio_cuadro + 0.6, "Un.");
          doc.text(8.5, inicio_cuadro + 0.6, "Conceptos");
          break;
        case "412":
          doc.setTextColor(255);
          doc.text(2.5, inicio_cuadro + 0.6, "Un.");
          doc.text(4.2, inicio_cuadro + 0.6, "Código");
          doc.text(7.5, inicio_cuadro + 0.6, "Conceptos");
          doc.setTextColor(0);
          break;
        default:
          doc.setTextColor(255);
          doc.text(2.5, inicio_cuadro + 0.6, "Un.");
          doc.text(8.5, inicio_cuadro + 0.6, "Conceptos");
          doc.setTextColor(0);
          break;
      }
    }

    //última línea al final del albarán
    doc.setFontSize(7);
    doc.setFontType("normal");
    if (dataCompany.rgpd) {
      doc.text(1.5, 25, dataCompany.credits, null, 90);
    } else {
      doc.text(4, 28, dataCompany.credits);
    }
  }

  exportAlbaran2() {
    if (this.id_company == 412) {
      this.showDialogImprimirAlbaran = true;
    } else {
      this.exportAlbaran(true);
    }
  }

  exportAlbaran(bImprimirTodo: boolean) {
    this.showDialogImprimirAlbaran = false;

    let doc = new jsPDF("p", "cm");
    let margen_izq = 2;
    let margen_dch = 2;
    let inicio_cuadro = 10;
    let maximo_linea = 80;
    let altura_cuadro = 16;
    let borde_lineas = 0.05;
    let ancho_importes = 3;
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;
    let urlCompany =
      dataCompany.logo != "undefined"
        ? URL_UPLOAD_LOGO + dataCompany.logo
        : URL_UPLOAD_LOGO + "placeholder.jpg";
    var imgDataCompany = null;
    var izqUnidades = 2.7;
    let anchoimagen = 4.64;
    let pintarObservaciones = false;
    let textoEnunciadoBlanco = false;
    let altura_texto_obs = 3;
    let bPintarCodigo = false;
    let bPintarNuevaPagina = false;
    let bPintarCuadroPrincipal = true;

    switch (dataCompany.id) {
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
        altura_cuadro = 14; // porque hay observaciones
        textoEnunciadoBlanco = true;
        bPintarCodigo = true;
        break;
      case "410":
        textoEnunciadoBlanco = true;
        break;
      case "408":
      default:
    }

    base64Img.requestBase64(urlCompany, (err, res, body) => {
      imgDataCompany = body;
      doc.addImage(imgDataCompany, "JPEG", 2.3, 1, anchoimagen, 3.36);

      doc.setLineWidth(borde_lineas);

      let altura_texto;

      if (pintarObservaciones) {
        //this.pintarRectanguloFactura(doc,inicio_cuadro+altura_cuadro+0.3,margen_izq,margen_dch,0.6,3.5);
        doc.setTextColor(255);
        doc.text(
          margen_izq + 0.2,
          inicio_cuadro + altura_cuadro + 0.7,
          "Observaciones"
        );
        doc.setTextColor(0);
        altura_texto = 0;

        let texto;

        if (bImprimirTodo) {
          texto =
            "Observaciones cliente \n" +
            this.infoCustomer.observ_cli +
            "\n Observaciones internas \n " +
            this.infoCustomer.observ_int;
          texto = texto.split("\n");
        } else {
          texto = this.infoCustomer.observ_cli.split("\n");
        }

        let texto_lineas = [];
        let linea = "";
        texto.forEach((txt, j) => {
          let frase = txt.split(" ");
          let cuentaletras = 0;
          frase.forEach((palabra: string, i) => {
            cuentaletras += palabra.length + 1;
            if (cuentaletras > 87) {
              texto_lineas.push(linea);
              cuentaletras = palabra.length + 1;
              linea = "";
            }
            linea += palabra + " ";
          });
          if (linea != "") texto_lineas.push(linea);
          linea = "";
          cuentaletras = 0;
        });

        texto_lineas.forEach((line) => {
          //doc.text(margen_izq+0.2,inicio_cuadro+altura_cuadro+1.4+altura_texto,line);
          altura_texto += 0.4;
        });

        if (altura_texto > 3) {
          altura_texto_obs = altura_texto;
          altura_cuadro = altura_cuadro - altura_texto + 3.5;
        }
      }

      //this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);

      doc.setFontType("normal");
      doc.setFontSize(9);

      altura_texto = inicio_cuadro + 1.6;
      let altura_numero = altura_texto;
      let pintaunidades = true;
      //escribo las líneas

      this.lines.forEach((line, idx) => {
        line.subconcepts.forEach(
          (sub, otroidx) => {
            if (sub.bstockable == 1 || bImprimirTodo) {
              let texto = sub.name.split("\n");
              let texto_lineas = [];
              let linea = "";
              texto.forEach((txt, j) => {
                let frase = txt.split(" ");
                let cuentaletras = 0;
                frase.forEach((palabra: string, i) => {
                  cuentaletras += palabra.length + 1;
                  if (cuentaletras > maximo_linea) {
                    texto_lineas.push(linea);
                    cuentaletras = palabra.length + 1;
                    linea = "";
                  }
                  linea += palabra + " ";
                });
                if (linea != "") texto_lineas.push(linea);
                linea = "";
                cuentaletras = 0;
              });

              //        if (parseInt(sub.budget.total) != 0){

              pintaunidades = true;
              texto_lineas.forEach((line) => {
                if (altura_texto > 24 - altura_texto_obs + 3) {
                  bPintarNuevaPagina = true;

                  if (altura_texto > 27) {
                    bPintarNuevaPagina = false;

                    doc.setFontType("italic");
                    this.pintarComunesAlbaran(
                      doc,
                      margen_izq,
                      margen_dch,
                      inicio_cuadro,
                      19,
                      ancho_importes,
                      borde_lineas,
                      true
                    );
                    doc.setFontSize(9);

                    doc.textEx(
                      "Sigue en página siguiente >>",
                      21 - margen_dch - 0.2,
                      28,
                      "right",
                      "bottom"
                    );

                    doc.addPage();

                    altura_texto = inicio_cuadro + 1.6;
                    doc.textEx(
                      "<< Viene de página anterior",
                      21 - margen_dch - 0.2,
                      altura_texto,
                      "right",
                      "bottom"
                    );

                    doc.setFontType("normal");

                    altura_texto = altura_texto + 1;

                    doc.addImage(
                      imgDataCompany,
                      "JPEG",
                      2.3,
                      1,
                      anchoimagen,
                      3.36
                    );
                    //this.pintarComunesAlbaran(doc,margen_izq, margen_dch, inicio_cuadro, altura_cuadro,ancho_importes,borde_lineas);
                    doc.setFontType("normal");
                    doc.setFontSize(9);
                  }
                }

                if (izqUnidades > 0 && pintaunidades) {
                  if (bPintarCodigo) {
                    //si debo pintar código me tengo que ajustar
                    doc.text(
                      margen_izq + izqUnidades - 1.5,
                      altura_texto,
                      sub.code
                    );
                    doc.textEx(
                      sub.budget.amount,
                      3.8,
                      altura_texto + 0.06,
                      "right",
                      "bottom"
                    );
                  } else {
                    doc.textEx(
                      sub.budget.amount,
                      4.3,
                      altura_texto + 0.06,
                      "right",
                      "bottom"
                    );
                  }
                }
                pintaunidades = false;
                doc.text(margen_izq + izqUnidades, altura_texto, line);
                altura_texto += 0.4;
              });
              altura_texto += 0.2;
            } //pintar solo si stockable
          }
          //      }
        );
      });

      if (bPintarNuevaPagina) {
        //ya he escrito todo pero no me caben líneas y observaciones
        this.pintarComunesAlbaran(
          doc,
          margen_izq,
          margen_dch,
          inicio_cuadro,
          altura_texto - 9,
          ancho_importes,
          borde_lineas,
          true
        );
        doc.addPage();
        doc.setFontSize(9);
        doc.addImage(imgDataCompany, "JPEG", 2.3, 1, anchoimagen, 3.36);

        bPintarCuadroPrincipal = false;
      }

      this.pintarComunesAlbaran(
        doc,
        margen_izq,
        margen_dch,
        inicio_cuadro,
        altura_cuadro,
        ancho_importes,
        borde_lineas,
        bPintarCuadroPrincipal
      );
      doc.setFontSize(9);

      if (pintarObservaciones) {
        this.pintarRectanguloFactura(
          doc,
          inicio_cuadro + altura_cuadro + 0.3,
          margen_izq,
          margen_dch,
          0.6,
          altura_texto_obs + 1
        );
        doc.setTextColor(255);
        doc.text(
          margen_izq + 0.2,
          inicio_cuadro + altura_cuadro + 0.7,
          "Observaciones"
        );
        doc.setTextColor(0);
        altura_texto = 0;

        let texto;

        if (bImprimirTodo) {
          texto =
            "Observaciones cliente \n" +
            this.infoCustomer.observ_cli +
            "\n Observaciones internas \n " +
            this.infoCustomer.observ_int;
          texto = texto.split("\n");
        } else {
          texto = this.infoCustomer.observ_cli.split("\n");
        }

        let texto_lineas = [];
        let linea = "";
        texto.forEach((txt, j) => {
          let frase = txt.split(" ");
          let cuentaletras = 0;
          frase.forEach((palabra: string, i) => {
            cuentaletras += palabra.length + 1;
            if (cuentaletras > 87) {
              texto_lineas.push(linea);
              cuentaletras = palabra.length + 1;
              linea = "";
            }
            linea += palabra + " ";
          });
          if (linea != "") texto_lineas.push(linea);
          linea = "";
          cuentaletras = 0;
        });

        texto_lineas.forEach((line) => {
          doc.text(
            margen_izq + 0.2,
            inicio_cuadro + altura_cuadro + 1.4 + altura_texto,
            line
          );
          altura_texto += 0.4;
        });
      }

      if (dataCompany.rgpd) {
        doc.setFontSize(7);
        doc.text(2, 27.7, dataCompany.rgpd);
      }

      doc.save(
        `Albaran-${String(
          this.infoCustomer.id_status == "1"
            ? this.infoCustomer.campaign_code
            : this.infoCustomer.ped_code
        ).trim()}.pdf`
      );
      this._notification.success("Exportación", "Se ha creado el archivo PDF.");
    }); //fin de la imagen
  }

  pintarRectanguloFactura(
    doc,
    altopagina,
    margenizq,
    margendch,
    altocabecera,
    altototal
  ) {
    //el color del fondo varía según cual sea la empresa
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;

    switch (dataCompany.id) {
      case "408":
      case "413":
        doc.setFillColor(205, 205, 205);
        break;
      case "410":
        doc.setFillColor(73, 43, 7);
        break;
      case "411":
        doc.setFillColor(0, 153, 153);
        break;
      default:
        doc.setFillColor(73, 43, 7);
    }

    doc.rect(
      margenizq,
      altopagina,
      21 - margendch - margenizq,
      altocabecera,
      "F"
    );

    if (dataCompany.id != 411) {
      //líneas horizontales
      doc.line(margenizq, altopagina, 21 - margendch, altopagina);
      doc.line(
        margenizq,
        altopagina + altocabecera,
        21 - margendch,
        altopagina + altocabecera
      );
      doc.line(
        margenizq,
        altopagina + altototal,
        21 - margendch,
        altopagina + altototal
      );

      //líneas verticales
      doc.line(margenizq, altopagina, margenizq, altopagina + altototal);
      doc.line(
        21 - margendch,
        altopagina,
        21 - margendch,
        altopagina + altototal
      );
    }
  }

  exportExcel(): void {
    let exportData = [];
    let ws_name = "";

    exportData = this.fillExcelData();
    ws_name = "Presupuesto Cliente";

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
    if (this.idProject) {
      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        `presupuesto-cliente-${this.info.campaign_code}-${this.info.campaign_name}.xlsx`
      );
    } else if (this.idBudget) {
      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        `presupuesto-cliente-${this.info.id}.xlsx`
      );
    }
  }

  fillExcelData() {
    let exportData = [];
    this.lines.forEach((line) => {
      exportData.push({
        Concepto: line.name,
        Subconcepto: "",
        Cantidad: this._common.currencyFormatES(line.budget.amount, false),
        "Precio Unitario": this._common.currencyFormatES(
          line.budget.price,
          false
        ),
        Total: this._common.currencyFormatES(line.budget.total, false),
        "": "",
        "Coste Unitario Real": this._common.currencyFormatES(
          line.real.units,
          false
        ),
        "Total Real": this._common.currencyFormatES(line.real.total, false),
        "  ": "",
        Beneficio: this._common.currencyFormatES(line.others.benefits, false),
        Margen: `${this._common.currencyFormatES(
          line.others.margin,
          false
        )}  %`,
      });
      if (line.subconcepts.length) {
        line.subconcepts.forEach((subconcept) => {
          exportData.push({
            Concepto: "",
            Código: subconcept.code,
            Subconcepto: subconcept.name,
            Cantidad: this._common.currencyFormatES(
              subconcept.budget.amount,
              false
            ),
            "Precio Unitario": this._common.currencyFormatES(
              subconcept.budget.price,
              false
            ),
            Total: this._common.currencyFormatES(
              subconcept.budget.total,
              false
            ),
            "": "",
            "Coste Unitario Real": this._common.currencyFormatES(
              subconcept.real.units,
              false
            ),
            "Total Real": this._common.currencyFormatES(
              subconcept.real.total,
              false
            ),
            "  ": "",
            Beneficio: this._common.currencyFormatES(
              subconcept.others.benefits,
              false
            ),
            Margen: `${this._common.currencyFormatES(
              subconcept.others.margin,
              false
            )} %`,
          });
        });
      }
    });
    /*   // subtotal
    exportData.push({
      'Concepto': '',
      'Subconcepto': '',
      'Cantidad': '',
      'Unidades': '',
      'Precio Unitario': 'Subtotal',
      'Total': this._common.currencyFormatES(this.subtotal.budget_total, false),
      '': '',
      'Coste Unitario Real': '',
      'Total Real': this._common.currencyFormatES(this.subtotal.real_total, false),
      '  ': '',
      'Beneficio': this._common.currencyFormatES(this.subtotal.benefit_total, false),
      'Margen': `${this._common.currencyFormatES(this.subtotal.margin_total, false)} %`,
    });
    exportData.push({
      'Concepto': '',
      'Subconcepto': '',
      'Cantidad': '',
      'Unidades': '',
      'Precio Unitario': '',
      'Total': '',
      '': '',
      'Coste Unitario Real': '',
      'Total Real': '',
      '  ': '',
      'Beneficio': '',
      'Margen': '',
    });
    // fee de empresa
    exportData.push({
      'Concepto': 'Fee de empresa',
      'Subconcepto': '',
      'Cantidad': this._common.currencyFormatES(this.fee.budget.amount, false),
      'Unidades': this._common.currencyFormatES(this.fee.budget.units, false),
      'Precio Unitario': this._common.currencyFormatES(this.fee.budget.price, false),
      'Total': this._common.currencyFormatES(this.fee.budget.total, false),
      '': '',
      'Coste Unitario Real': this._common.currencyFormatES(this.fee.real.units, false),
      'Total Real': this._common.currencyFormatES(this.fee.real.total, false),
      '  ': '',
      'Beneficio': this._common.currencyFormatES(this.fee.others.benefits, false),
      'Margen': `${this._common.currencyFormatES(this.fee.others.margin, false)} %`,
    });
    exportData.push({
      'Concepto': '',
      'Subconcepto': '',
      'Cantidad': '',
      'Unidades': '',
      'Precio Unitario': '',
      'Total': '',
      '': '',
      'Coste Unitario Real': '',
      'Total Real': '',
      '  ': '',
      'Beneficio': '',
      'Margen': '',
    }); */
    // total
    exportData.push({
      Concepto: "",
      Subconcepto: "",
      Cantidad: "",
      "Precio Unitario": "Total",
      Total: this._common.currencyFormatES(this.total.budget_total, false),
      "": "",
      "Coste Unitario Real": "",
      "Total Real": this._common.currencyFormatES(this.total.real_total, false),
      "  ": "",
      Beneficio: this._common.currencyFormatES(this.total.benefit_total, false),
      Margen: `${this._common.currencyFormatES(
        this.total.margin_total,
        false
      )} %`,
    });
    exportData.push({
      Concepto: "",
      Subconcepto: "",
      Cantidad: "",
      "Precio Unitario": "",
      Total: "",
      "": "",
      "Coste Unitario Real": "",
      "Total Real": "",
      "  ": "",
      Beneficio: "",
      Margen: "",
    });
    let actualDate = new Date();

    exportData.push({
      Concepto: "",
      Subconcepto: "",
      Cantidad: "",
      "Precio Unitario": "",
      Total: "",
      "": "",
      "Coste Unitario Real": "",
      "Total Real": "Fecha impresión",
      "  ": `${actualDate.getDate()}-${
        actualDate.getMonth() + 1
      }-${actualDate.getFullYear()}`,
      Beneficio: "Válidez",
      Margen: `${this.budget_validity} días`,
    });

    return exportData;
  }

  cloneBudget() {
    if (this.selectedSource) {
      this._api
        .cloneData(
          this.selectedSource,
          this.typeTable,
          this.numberId,
          this.typeSource
        )
        .subscribe((response) => {
          if (response.status === "ok") {
            this.showClone = false;
            this.getLinesSubconcept();
            this._notification.success(
              "Clonado",
              "Se ha clonado satisfactoriamente el presupuesto"
            );
            this.selectedSource = "";
          }
        });
    } else {
      this._notification.error("Error", "Debes seleccionar un origen a clonar");
    }
  }
}
