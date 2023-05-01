import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { utils, write, WorkBook } from "xlsx";
import { saveAs } from "file-saver";

import { NotificationsService } from "angular2-notifications";
import { ApiService } from "../../services/api.service";
import { Common } from "../../api/common";

import { dateMonthStr } from "../../models/dateMonthStr";
import { dateMonth } from "../../models/dateMonth";
import { TokenService } from "../../services/token.service";
import { Configuration } from "../../api/configuration";

import * as _ from "lodash";

@Component({
  selector: "app-breakdown",
  templateUrl: "./breakdown.component.html",
  styleUrls: ["./breakdown.component.scss"],
})
export class BreakdownComponent implements OnInit, OnDestroy {
  id: number;
  private sub: any;
  activeTab: number = 0;
  info: any = {};
  expenses: any[] = [];
  employeesCostEstimated = new dateMonth();
  employeesCostReal = new dateMonth();
  totalExpensesEstimated = new dateMonth();
  totalExpensesReal = new dateMonth();
  incomesEstimated = new dateMonth();
  incomesReal = new dateMonth();
  showDialogCrearFactura = false;
  showDialogCrearPedido = false;

  fechahoy = new Date();

  hoy =
    this.fechahoy.getDate() +
    "/" +
    (this.fechahoy.getMonth() + 1) +
    "/" +
    this.fechahoy.getFullYear();
  fechafactura = this.hoy;
  id_company;

  benefitsReal = new dateMonth();
  marginReal = new dateMonth();
  role: number = 0;
  isEditable: boolean = true;
  isEditableReal: boolean = false;

  readonly_obs: boolean = false;

  accumulateMonths: any[] = [new dateMonth(), new dateMonth()];
  myDatePickerOptions = null;
  reloadTab: boolean = true;

  linesIncomesConcepts = [];
  totalIncome = new dateMonthStr();
  wrong_income = false;
  incomes = null;
  idFee = 0;
  feeIncome = new dateMonthStr();

  constructor(
    private route: ActivatedRoute,
    private _api: ApiService,
    private _common: Common,
    private _notification: NotificationsService,
    private _token: TokenService,
    private _config: Configuration,
    private _router: Router
  ) {
    let dataCompany = JSON.parse(localStorage.getItem("selectedCompany")).value;
    this.id_company = dataCompany.id;
  }

  onScroll() {
    var nav = document.getElementById("header-cloned-real");
    if (nav) {
      if (window.pageYOffset > 490) {
        nav.classList.add("show");
      } else {
        nav.classList.remove("show");
      }
    }
  }
  ngOnDestroy() {
    window.removeEventListener("scroll", this.onScroll);
    this.sub.unsubscribe();
  }
  ngOnInit() {
    this.role = parseInt(this._token.getInfo().role);
    if (this.role < 7) {
      window.addEventListener("scroll", this.onScroll);
    }

    this.myDatePickerOptions = this._config.myDatePickerOptions;

    this.sub = this.route.params.subscribe((params) => {
      this.id = +params["id"]; // (+) converts string 'id' to a number
      let body = `id=${this.id}&type=1`;
      let type = 1;

      this._api.getInfoCampaign(body).subscribe((response) => {
        if (response !== null) {
          this.info.already_invoiced = response.info.already_invoiced;
          this.info.raw_start_date_event = response.info.start_date_event;
          this.info.raw_end_date_event = response.info.end_date_event;
          this.info.start_date_event =
            response.info.start_date_event !== "0000-00-00"
              ? this._common.parseDatefromDate(response.info.start_date_event)
              : undefined;
          this.info.end_date_event =
            response.info.end_date_event !== "0000-00-00"
              ? this._common.parseDatefromDate(response.info.end_date_event)
              : undefined;
          this.info.shipping_method = response.info.shipping_method;
          this.info.shipping_method_return =
            response.info.shipping_method_return;
          this.info.campaign_code = response.info.campaign_code;
          this.info.campaign_name = response.info.campaign_name;
          this.info.project = response.info.project;
          this.info.delivery_date = response.info.delivery_date;
          this.info.phone = response.info.phone;
          this.info.solicitant_data = response.info.solicitant_data;

          if (response.info.btramite == 1) {
            this.readonly_obs = true;
          }

          this.info.creation_date = this._common.parseDatefromDate(
            response.info.creation_date
          );
          this.info.end_date = this._common.parseDatefromDate(
            response.info.end_date
          );

          this.info.customer = {
            id_customer: response.customer.id_customer,
            name: response.customer.customer,
            logo: response.customer.customer_logo,
            address: response.customer.customer_address,
            address_bis: response.customer.customer_address_bis,
            cif: response.customer.customer_cif,
            postal_code: response.customer.customer_postal_code,
            city: response.customer.customer_city,
            email: response.customer.email,
            phone: response.customer.phone2,
            btramite: response.customer.btramite,
            salidas: response.customer.salidas,
            numfacturas: response.customer.numfacturas,
          };
          this.info.team = response.info.team;
          this.info.user = response.info.user;
          this.info.group = response.info.grupo;
          this.info.subgroup = response.info.subgroup;
          this.info.status = response.info.status;
          this.info.id_status = response.info.id_status;
          this.info.ped_code = response.info.ped_code;
          this.info.observ_cli = response.info.observ_cli;
          this.info.observ_int = response.info.observ_int;
          this.info.id_address = response.info.id_address;
          this.info.contact = response.info.contact;
          this.checkEditableRows(response.info.id_status);

          this.idFee = response.idFee;
          this.fillFeeIncome(response.feeIncomes, response.totalFeeIncome);
          /*           this.fillIncomes(response.variable_concepts); */
          this.fillEmployeeCost(
            response.employees_cost_no_filtered,
            response.employees_cost_estimated,
            response.employees_cost_real
          );
          /*           this.fillExpenses(response.variable_concepts); */
        }
      });
    });
  }
  updateFeeIncome(value, previous, fee_company, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = "entertabeado";
      if (value.currentTarget.value === "") {
        value.currentTarget.value = 0;
      }

      let body = `&id_project=${this.id}`;
      body += `&id_month=${month}`;
      body += `&id_fee_company=${this.idFee}`;
      body += `&type=1`;
      body += `&amount=${value.currentTarget.value.replace(",", ".")}`;

      let newValue = parseFloat(value.currentTarget.value.replace(",", "."));

      if (this._common.toFloat(previous) !== newValue) {
        this._api.updateFeeIncome(body).subscribe((response) => {
          if (response && response.status === "ok") {
            let total = 0;

            this._notification.success(
              "Correcto",
              "Se ha almacenado el ingreso de " + newValue + "€"
            );
            this.checkTotalIncome();
            this.calculateSubtotalExpenses();
            this.calculateBenefitsMargin();
          } else {
            this._notification.error(
              "Error",
              "No se ha podido almacenar el ingreso"
            );
            fee_company[month] = previous;
          }
        });
      }
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }
  updateIncome(value, previous, variable_concept, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = "entertabeado";
      if (value.currentTarget.value === "") {
        value.currentTarget.value = 0;
      }
      let body = `&id_project=${this.id}`;
      body += `&id_month=${month}`;
      body += `&id_variable_concept=${variable_concept.id_variable_concept}`;
      body += `&type=1`;
      body += `&amount=${value.currentTarget.value.replace(",", ".")}`;

      let newValue = parseFloat(value.currentTarget.value.replace(",", "."));

      if (this._common.toFloat(previous) !== newValue) {
        this._api.updateIncomeVariableConcept(body).subscribe((response) => {
          if (response && response.status === "ok") {
            let total = 0;
            _.forOwn(variable_concept.incomes_real, (element, key) => {
              if (key !== "total") {
                total += this._common.checkNumber(element);
              }
            });
            variable_concept.incomes_real.total = this._common.currencyFormatES(
              total,
              false
            );

            this._notification.success(
              "Correcto",
              "Se ha almacenado el ingreso de " + newValue + "€"
            );
            this.checkTotalIncome();
            this.calculateSubtotalExpenses();
            this.calculateBenefitsMargin();
          } else {
            this._notification.error(
              "Error",
              "No se ha podido almacenar el ingreso"
            );
            variable_concept.filtered_real[month] = previous;
          }
        });
      }
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }

  checkTotalIncome() {
    let total = 0;
    let totalFee = 0;
    // reseteamos la linea que muestra el total de ingresos desglosados por concepto variable
    this.totalIncome = new dateMonthStr();
    // recorremos el objeto de incomes, que contiene para cada concepto variable
    // un objeto con los incomes 'presupuestados'
    this.incomes.forEach((element) => {
      _.forOwn(element.incomes_real, (element, key) => {
        if (key !== "total") {
          total += this._common.checkNumber(element);
          this.totalIncome[key] =
            this._common.checkNumber(this.totalIncome[key]) +
            this._common.checkNumber(element);
        }
      });
    });
    if (this.feeIncome) {
      _.forOwn(this.feeIncome, (element, key) => {
        if (key !== "total") {
          totalFee += this._common.checkNumber(element);
          this.totalIncome[key] =
            this._common.checkNumber(this.totalIncome[key]) +
            this._common.checkNumber(element);
        }
      });
      this.feeIncome.total = totalFee;
    }

    this.totalIncome.total = total + totalFee;
    this.wrong_income = false;
    if (total !== this.totalIncome.total) {
      this.wrong_income = true;
    }
    return true;
  }

  createBill() {
    this.showDialogCrearFactura = false;
    if (!this.id) {
      this._notification.error("Error", "Debe seleccionar un pedido.");
    } else if (
      !this.info.customer.cif ||
      this.info.customer.cif.toString().length < 4 ||
      this.info.customer.cif == "undefined"
    ) {
      this._notification.error("Error", "El cliente no tiene el CIF correcto");
    } else {
      //body += `&creation_date=${this.newCampaign.creation_date_model.date.year}-${this.newCampaign.creation_date_model.date.month}-${this.newCampaign.creation_date_model.date.day}`;
      let splfechafac = this.fechafactura.split("/");
      let fechafactura =
        splfechafac[2] + "-" + splfechafac[1] + "-" + splfechafac[0];
      this._api
        .createBill(`id_project=${this.id}&date_bill=${fechafactura}`)
        .subscribe((response) => {
          const idBill = response.id_bill;
          this._router.navigate(["/factura", idBill]);
        });
    }
  }

  createPedido() {
    this.showDialogCrearPedido = false;

    let body = "id=" + this.id;

    this._api
      .updatePresupuesto2Pedido(body)
      .subscribe(() => this.parseupdatePresupuesto2Pedido());
  }

  parseupdatePresupuesto2Pedido() {
    //lo mismo que al principio, se podía resumir
    let body = `id=${this.id}&type=1`;

    this._api.getInfoCampaign(body).subscribe((response) => {
      if (response !== null) {
        this.info.already_invoiced = response.info.already_invoiced;
        this.info.campaign_code = response.info.campaign_code;
        this.info.campaign_name = response.info.campaign_name;
        this.info.project = response.info.project;
        this.info.delivery_date = response.info.delivery_date;
        this.info.phone = response.info.phone;
        this.info.solicitant_data = response.info.solicitant_data;

        if (response.info.btramite == 1) {
          this.readonly_obs = true;
        }

        this.info.creation_date = this._common.parseDatefromDate(
          response.info.creation_date
        );
        this.info.end_date = this._common.parseDatefromDate(
          response.info.end_date
        );

        this.info.customer = {
          id_customer: response.customer.id_customer,
          name: response.customer.customer,
          logo: response.customer.customer_logo,
          address: response.customer.customer_address,
          address_bis: response.customer.customer_address_bis,
          cif: response.customer.customer_cif,
          postal_code: response.customer.customer_postal_code,
          city: response.customer.customer_city,
          email: response.customer.email,
          phone: response.customer.phone2,
          btramite: response.customer.btramite,
          salidas: response.customer.salidas,
          numfacturas: response.customer.numfacturas,
        };
        this.info.team = response.info.team;
        this.info.user = response.info.user;
        this.info.group = response.info.grupo;
        this.info.subgroup = response.info.subgroup;
        this.info.status = response.info.status;
        this.info.id_status = response.info.id_status;
        this.info.ped_code = response.info.ped_code;
        this.info.shipping_method = response.info.shipping_method;
        this.info.shipping_method_return = response.info.shipping_method_return;
        this.info.observ_cli = response.info.observ_cli;
        this.info.observ_int = response.info.observ_int;
        this.info.id_address = response.info.id_address;
        this.info.contact = response.info.contact;
        this.checkEditableRows(response.info.id_status);

        this.idFee = response.idFee;
        this.fillFeeIncome(response.feeIncomes, response.totalFeeIncome);
        /*           this.fillIncomes(response.variable_concepts); */
        this.fillEmployeeCost(
          response.employees_cost_no_filtered,
          response.employees_cost_estimated,
          response.employees_cost_real
        );
        /*           this.fillExpenses(response.variable_concepts); */
      }
    });
  }

  handleChange(e) {
    var index = e.index;
    this.activeTab = index;
    // Si nos dirigimos a la pestaña de presupuesto mensual, la recargamos de nuevo por si se han cambiado datos en Presupuesto cliente
    if (index === 1) {
      this.reloadTab = false;
      setTimeout((_) => {
        this.reloadTab = true;
      }, 100);
    }
  }

  checkEditableRows(status) {
    this.isEditable = false;
    this.isEditableReal = false;

    if ((status === "1" || status === "2") && this.role === 3) {
      this.isEditableReal = true;
    }
  }

  fillFeeIncome(fees, total_fee) {
    if (fees) {
      let total_acc = 0;
      this.feeIncome = new dateMonthStr();
      fees.forEach((inner) => {
        this.feeIncome[inner.id_month] = this._common.currencyFormatES(
          inner.amount,
          false
        );
        total_acc += parseFloat(inner.amount);
      });
    }
  }
  fillIncomes(incomes) {
    let total_acc = 0;
    incomes.forEach((element) => {
      _.extend(element, { incomes_real: {} });
    });
    incomes.forEach((element) => {
      _.extend(element.incomes_real, { january: "0.00" });
      _.extend(element.incomes_real, { february: "0.00" });
      _.extend(element.incomes_real, { march: "0.00" });
      _.extend(element.incomes_real, { april: "0.00" });
      _.extend(element.incomes_real, { may: "0.00" });
      _.extend(element.incomes_real, { june: "0.00" });
      _.extend(element.incomes_real, { july: "0.00" });
      _.extend(element.incomes_real, { august: "0.00" });
      _.extend(element.incomes_real, { september: "0.00" });
      _.extend(element.incomes_real, { october: "0.00" });
      _.extend(element.incomes_real, { november: "0.00" });
      _.extend(element.incomes_real, { december: "0.00" });

      element.real_incomes.forEach((inner) => {
        element.incomes_real[inner.id_month] = this._common.currencyFormatES(
          inner.amount,
          false
        );
      });

      total_acc = 0;
      total_acc = this._common.checkNumber(element.incomes_real.january);
      total_acc += this._common.checkNumber(element.incomes_real.february);
      total_acc += this._common.checkNumber(element.incomes_real.march);
      total_acc += this._common.checkNumber(element.incomes_real.april);
      total_acc += this._common.checkNumber(element.incomes_real.may);
      total_acc += this._common.checkNumber(element.incomes_real.june);
      total_acc += this._common.checkNumber(element.incomes_real.july);
      total_acc += this._common.checkNumber(element.incomes_real.august);
      total_acc += this._common.checkNumber(element.incomes_real.september);
      total_acc += this._common.checkNumber(element.incomes_real.october);
      total_acc += this._common.checkNumber(element.incomes_real.november);
      total_acc += this._common.checkNumber(element.incomes_real.december);

      element.incomes_real.total = this._common.currencyFormatES(total_acc);
    });
    this.incomes = incomes;
    this.checkTotalIncome();
    //this.setTotalByMonth(this.expenses, 0);
    //this.setTotalByMonth(this.incomes, 1);
  }

  fillExpenses(expenses) {
    let total_acc = 0,
      calendar_items_estimated = new dateMonth(),
      calendar_items_real = new dateMonth();
    expenses.forEach((element) => {
      _.extend(element, { filtered_estimated: {} });
      _.extend(element, { filtered_real: {} });
    });
    expenses.forEach((element) => {
      _.extend(element.filtered_estimated, { january: "0.00" });
      _.extend(element.filtered_estimated, { february: "0.00" });
      _.extend(element.filtered_estimated, { march: "0.00" });
      _.extend(element.filtered_estimated, { april: "0.00" });
      _.extend(element.filtered_estimated, { may: "0.00" });
      _.extend(element.filtered_estimated, { june: "0.00" });
      _.extend(element.filtered_estimated, { july: "0.00" });
      _.extend(element.filtered_estimated, { august: "0.00" });
      _.extend(element.filtered_estimated, { september: "0.00" });
      _.extend(element.filtered_estimated, { october: "0.00" });
      _.extend(element.filtered_estimated, { november: "0.00" });
      _.extend(element.filtered_estimated, { december: "0.00" });

      element.estimated_expenses.forEach((inner) => {
        element.filtered_estimated[inner.id_month] =
          this._common.currencyFormatES(inner.amount, false);
      });

      _.extend(element.filtered_real, { january: "0.00" });
      _.extend(element.filtered_real, { february: "0.00" });
      _.extend(element.filtered_real, { march: "0.00" });
      _.extend(element.filtered_real, { april: "0.00" });
      _.extend(element.filtered_real, { may: "0.00" });
      _.extend(element.filtered_real, { june: "0.00" });
      _.extend(element.filtered_real, { july: "0.00" });
      _.extend(element.filtered_real, { august: "0.00" });
      _.extend(element.filtered_real, { september: "0.00" });
      _.extend(element.filtered_real, { october: "0.00" });
      _.extend(element.filtered_real, { november: "0.00" });
      _.extend(element.filtered_real, { december: "0.00" });

      element.real_expenses.forEach((inner) => {
        element.filtered_real[inner.id_month] = this._common.currencyFormatES(
          inner.amount,
          false
        );
      });

      total_acc = this._common.checkNumber(element.filtered_estimated.january);
      total_acc += this._common.checkNumber(
        element.filtered_estimated.february
      );
      total_acc += this._common.checkNumber(element.filtered_estimated.march);
      total_acc += this._common.checkNumber(element.filtered_estimated.april);
      total_acc += this._common.checkNumber(element.filtered_estimated.may);
      total_acc += this._common.checkNumber(element.filtered_estimated.june);
      total_acc += this._common.checkNumber(element.filtered_estimated.july);
      total_acc += this._common.checkNumber(element.filtered_estimated.august);
      total_acc += this._common.checkNumber(
        element.filtered_estimated.september
      );
      total_acc += this._common.checkNumber(element.filtered_estimated.october);
      total_acc += this._common.checkNumber(
        element.filtered_estimated.november
      );
      total_acc += this._common.checkNumber(
        element.filtered_estimated.december
      );

      element.filtered_estimated.total =
        this._common.currencyFormatES(total_acc);
      total_acc = 0;
      total_acc = this._common.checkNumber(element.filtered_real.january);
      total_acc += this._common.checkNumber(element.filtered_real.february);
      total_acc += this._common.checkNumber(element.filtered_real.march);
      total_acc += this._common.checkNumber(element.filtered_real.april);
      total_acc += this._common.checkNumber(element.filtered_real.may);
      total_acc += this._common.checkNumber(element.filtered_real.june);
      total_acc += this._common.checkNumber(element.filtered_real.july);
      total_acc += this._common.checkNumber(element.filtered_real.august);
      total_acc += this._common.checkNumber(element.filtered_real.september);
      total_acc += this._common.checkNumber(element.filtered_real.october);
      total_acc += this._common.checkNumber(element.filtered_real.november);
      total_acc += this._common.checkNumber(element.filtered_real.december);

      element.filtered_real.total = this._common.currencyFormatES(total_acc);
    });
    this.expenses = expenses;
    this.setTotalByMonth(this.expenses, 0);
    this.setTotalByMonth(this.expenses, 1);
  }

  fillEmployeeCost(costs, cost_employee_estimated, cost_employee_real) {
    this.employeesCostEstimated.total = 0;
    this.employeesCostReal.total = 0;
    let sumValue = 0,
      totalMonths = new dateMonth();

    costs.forEach((element) => {
      sumValue = parseFloat(element.cost.toFixed(2));
      switch (element.date.split("-")[1]) {
        case "01":
          this.employeesCostReal.january = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.january) + sumValue,
            false
          );
          totalMonths.january = parseFloat(totalMonths.january) + sumValue;
          break;
        case "02":
          this.employeesCostReal.february = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.february) + sumValue,
            false
          );
          totalMonths.february = parseFloat(totalMonths.february) + sumValue;
          break;
        case "03":
          this.employeesCostReal.march = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.march) + sumValue,
            false
          );
          totalMonths.march = parseFloat(totalMonths.march) + sumValue;
          break;
        case "04":
          this.employeesCostReal.april = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.april) + sumValue,
            false
          );
          totalMonths.april = parseFloat(totalMonths.april) + sumValue;
          break;
        case "05":
          this.employeesCostReal.may = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.may) + sumValue,
            false
          );
          totalMonths.may = parseFloat(totalMonths.may) + sumValue;
          break;
        case "06":
          this.employeesCostReal.june = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.june) + sumValue,
            false
          );
          totalMonths.june = parseFloat(totalMonths.june) + sumValue;
          break;
        case "07":
          this.employeesCostReal.july = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.july) + sumValue,
            false
          );
          totalMonths.july = parseFloat(totalMonths.july) + sumValue;
          break;
        case "08":
          this.employeesCostReal.august = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.august) + sumValue,
            false
          );
          totalMonths.august = parseFloat(totalMonths.august) + sumValue;
          break;
        case "09":
          this.employeesCostReal.september = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.september) + sumValue,
            false
          );
          totalMonths.september = parseFloat(totalMonths.september) + sumValue;
          break;
        case "10":
          this.employeesCostReal.october = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.october) + sumValue,
            false
          );
          totalMonths.october = parseFloat(totalMonths.october) + sumValue;
          break;
        case "11":
          this.employeesCostReal.november = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.november) + sumValue,
            false
          );
          totalMonths.november = parseFloat(totalMonths.november) + sumValue;
          break;
        case "12":
          this.employeesCostReal.december = this._common.currencyFormatES(
            parseFloat(this.employeesCostReal.december) + sumValue,
            false
          );
          totalMonths.december = parseFloat(totalMonths.december) + sumValue;
          break;
      }
    });

    cost_employee_estimated.forEach((element) => {
      this.employeesCostEstimated[element.id_month] =
        this._common.currencyFormatES(element.amount, false);
    });

    let totalCost =
      this._common.checkNumber(this.employeesCostEstimated.january) +
      this._common.checkNumber(this.employeesCostEstimated.february) +
      this._common.checkNumber(this.employeesCostEstimated.march) +
      this._common.checkNumber(this.employeesCostEstimated.april) +
      this._common.checkNumber(this.employeesCostEstimated.may) +
      this._common.checkNumber(this.employeesCostEstimated.june) +
      this._common.checkNumber(this.employeesCostEstimated.july) +
      this._common.checkNumber(this.employeesCostEstimated.august) +
      this._common.checkNumber(this.employeesCostEstimated.september) +
      this._common.checkNumber(this.employeesCostEstimated.october) +
      this._common.checkNumber(this.employeesCostEstimated.november) +
      this._common.checkNumber(this.employeesCostEstimated.december);
    this.employeesCostEstimated.total =
      this._common.currencyFormatES(totalCost);

    cost_employee_real.forEach((element) => {
      this.employeesCostReal[element.id_month] = this._common.currencyFormatES(
        element.amount,
        false
      );
    });
    totalCost =
      this._common.checkNumber(this.employeesCostReal.january) +
      this._common.checkNumber(this.employeesCostReal.february) +
      this._common.checkNumber(this.employeesCostReal.march) +
      this._common.checkNumber(this.employeesCostReal.april) +
      this._common.checkNumber(this.employeesCostReal.may) +
      this._common.checkNumber(this.employeesCostReal.june) +
      this._common.checkNumber(this.employeesCostReal.july) +
      this._common.checkNumber(this.employeesCostReal.august) +
      this._common.checkNumber(this.employeesCostReal.september) +
      this._common.checkNumber(this.employeesCostReal.october) +
      this._common.checkNumber(this.employeesCostReal.november) +
      this._common.checkNumber(this.employeesCostReal.december);
    this.employeesCostReal.total = this._common.currencyFormatES(totalCost);
  }

  onEditComplete(value, type) {
    let key = value.column.field.split(".")[1],
      splitted = value.column.field.split("."),
      val = value.data[splitted[0]][splitted[1]],
      idx = value.index,
      total_acc = 0,
      body = "";

    if (type === "estimated") {
      this.expenses[idx].filtered_estimated[key] = val;

      total_acc = this._common.checkNumber(
        this.expenses[idx].filtered_estimated.january
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.february
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.march
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.april
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.may
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.june
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.july
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.august
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.september
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.october
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.november
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_estimated.december
      );

      this.expenses[idx].filtered_estimated.total =
        this._common.currencyFormatES(total_acc);
      this.setTotalByMonth(this.expenses, 0);
    }
    if (type === "real") {
      this.expenses[idx].filtered_real[key] = val;

      total_acc = this._common.checkNumber(
        this.expenses[idx].filtered_real.january
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.february
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.march
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.april
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.may
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.june
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.july
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.august
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.september
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.october
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.november
      );
      total_acc += this._common.checkNumber(
        this.expenses[idx].filtered_real.december
      );

      this.expenses[idx].filtered_real.total =
        this._common.currencyFormatES(total_acc);
      this.setTotalByMonth(this.expenses, 1);
    }

    body = `id_campaign=${this.id}`;
    body += `&id_month=${value.column.field.split(".")[1]}`;
    body += `&id_variable_concept=${value.data.id_variable_concept}`;
    body += `&amount=${this._common.checkNumber(val)}`;
    body += type === "estimated" ? `&type=0` : `&type=1`;

    this._api.updateVariableCost(body).subscribe((response) => {
      if (response.status === "ok") {
        this._notification.success(
          "Exito",
          "Se ha modificado el concepto variable " +
            value.data.name_variable_concept
        );
      }
    });
  }

  changeRealEmployeesCost(value, previous, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = "entertabeado";
      if (value.currentTarget.value === "") {
        value.currentTarget.value = 0;
      }
      let body = `&id_campaign=${this.id}`;
      body += `&id_month=${month}`;
      body += `&amount=${value.currentTarget.value.replace(",", ".")}`;

      let newValue = parseFloat(value.currentTarget.value.replace(",", "."));

      if (this._common.toFloat(previous) !== newValue) {
        this._api.updateRealEmployeeCost(body).subscribe((response) => {
          if (response && response.status === "ok" && newValue === -1) {
            this._notification.success(
              "Correcto",
              "Se ha eliminado el coste de personal"
            );
          } else if (response && response.status === "ok") {
            this._notification.success(
              "Correcto",
              "Se ha almacenado el coste de personal de " + newValue + "€"
            );
          } else {
            this._notification.error(
              "Error",
              "No se ha podido almacenar el coste de personal"
            );
          }
        });
      }
      this.accumulateTotalEmployeeCost(1);
      this.calculateSubtotalExpenses();
      this.calculateBenefitsMargin();
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }

  resetClass(value) {
    // No dejamos usar la coma
    if (value.which === 188) {
      value.preventDefault();
    }
    if (value.which === 13 || value.which === 9) {
      value.target.className = "";
    } else {
      value.target.className = "dirty";
    }
  }
  blurred(value, previous, type, month, onTable: Boolean = false) {
    if (value.target.className.indexOf("dirty") > -1) {
      type[month] = previous;
      this._notification.info(
        "Información",
        "Pulsa Enter o Tabulador para almacenar el valor"
      );
    }
    if (onTable) {
      type[month] = this._common.currencyFormatES(
        value.currentTarget.value,
        false
      );
    }
  }

  changeRealIncomes(value, previous, month) {
    if (value.which === 13 || value.which === 9) {
      value.currentTarget.className = "entertabeado";
      if (value.currentTarget.value === "") {
        value.currentTarget.value = 0;
      }
      let body = `&id_campaign=${this.id}`;
      body += `&id_month=${month}`;
      body += `&type=1`;
      body += `&amount=${value.currentTarget.value.replace(",", ".")}`;

      let newValue = parseFloat(value.currentTarget.value.replace(",", "."));

      if (parseFloat(previous) !== newValue) {
        this._api.updateEstimatedIncomes(body).subscribe((response) => {
          if (response && response.status === "ok") {
            this._notification.success(
              "Correcto",
              "Se ha almacenado el ingreso de " + newValue + "€"
            );
          } else {
            this._notification.error(
              "Error",
              "No se ha podido almacenar el ingreso"
            );
          }
        });
      }
      this.accumulateTotalIncome(this.incomesReal);
      this.calculateBenefitsMargin();
      if (value.which === 13) {
        value.target.blur();
      }
    }
  }

  accumulateTotalEmployeeCost(idx) {
    if (idx === 0) {
      this.employeesCostEstimated.total = Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.january)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.february)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.march)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.april)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.may)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.june)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.july)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.august)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.september)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.october)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.november)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostEstimated.december)
        ).toFixed(2)
      );
      this.employeesCostEstimated.total = this._common.currencyFormatES(
        this.employeesCostEstimated.total
      );
    } else if (idx === 1) {
      this.employeesCostReal.total = Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.january)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.february)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.march)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.april)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.may)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.june)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.july)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.august)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.september)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.october)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.november)
        ).toFixed(2)
      );
      this.employeesCostReal.total += Number(
        parseFloat(
          this._common.checkNumberStr(this.employeesCostReal.december)
        ).toFixed(2)
      );
      this.employeesCostReal.total = this._common.currencyFormatES(
        this.employeesCostReal.total
      );
    }
  }

  accumulateTotalIncome(type) {
    _.forOwn(type, (value, key) => {
      if (value === "") {
        return (type[key] = "0");
      }
    });
    type.total = this._common.toFloat(type.january);
    type.total += this._common.toFloat(type.february);
    type.total += this._common.toFloat(type.march);
    type.total += this._common.toFloat(type.april);
    type.total += this._common.toFloat(type.may);
    type.total += this._common.toFloat(type.june);
    type.total += this._common.toFloat(type.july);
    type.total += this._common.toFloat(type.august);
    type.total += this._common.toFloat(type.september);
    type.total += this._common.toFloat(type.october);
    type.total += this._common.toFloat(type.november);
    type.total += this._common.toFloat(type.december);
    type.total = this._common.currencyFormatES(type.total);
  }
  replaceComma(value, type, month) {
    if (value.which !== 13 && value.which !== 9) {
      var a = type[month].split("");
      a[type[month].lastIndexOf(".")] = ",";
      type[month] = a.join("");
    }
  }

  setTotalByMonth(items, idx) {
    let total = 0,
      type = null;
    this.accumulateMonths[idx].january = 0;
    this.accumulateMonths[idx].february = 0;
    this.accumulateMonths[idx].march = 0;
    this.accumulateMonths[idx].april = 0;
    this.accumulateMonths[idx].may = 0;
    this.accumulateMonths[idx].june = 0;
    this.accumulateMonths[idx].july = 0;
    this.accumulateMonths[idx].august = 0;
    this.accumulateMonths[idx].september = 0;
    this.accumulateMonths[idx].october = 0;
    this.accumulateMonths[idx].november = 0;
    this.accumulateMonths[idx].december = 0;
    this.accumulateMonths[idx].total = 0;

    _.forEach(items, (element) => {
      total = 0;
      type = idx === 0 ? element.filtered_estimated : element.filtered_real;
      this.accumulateMonths[idx].january += this._common.checkNumber(
        type.january
      );
      total = this._common.checkNumber(type.january);
      this.accumulateMonths[idx].february += this._common.checkNumber(
        type.february
      );
      total += this._common.checkNumber(type.february);
      this.accumulateMonths[idx].march += this._common.checkNumber(type.march);
      total += this._common.checkNumber(type.march);
      this.accumulateMonths[idx].april += this._common.checkNumber(type.april);
      total += this._common.checkNumber(type.april);
      this.accumulateMonths[idx].may += this._common.checkNumber(type.may);
      total += this._common.checkNumber(type.may);
      this.accumulateMonths[idx].june += this._common.checkNumber(type.june);
      total += this._common.checkNumber(type.june);
      this.accumulateMonths[idx].july += this._common.checkNumber(type.july);
      total += this._common.checkNumber(type.july);
      this.accumulateMonths[idx].august += this._common.checkNumber(
        type.august
      );
      total += this._common.checkNumber(type.august);
      this.accumulateMonths[idx].september += this._common.checkNumber(
        type.september
      );
      total += this._common.checkNumber(type.september);
      this.accumulateMonths[idx].october += this._common.checkNumber(
        type.october
      );
      total += this._common.checkNumber(type.october);
      this.accumulateMonths[idx].november += this._common.checkNumber(
        type.november
      );
      total += this._common.checkNumber(type.november);
      this.accumulateMonths[idx].december += this._common.checkNumber(
        type.december
      );
      total += this._common.checkNumber(type.december);
      this.accumulateMonths[idx].total += total;
    });

    this.calculateSubtotalExpenses();
    this.calculateBenefitsMargin();
  }

  calculateSubtotalExpenses() {
    _.forOwn(this.totalExpensesReal, (value, key) => {
      this.totalExpensesReal[key] = this._common.currencyFormatES(
        this._common.checkNumber(this.employeesCostReal[key]) +
          this._common.checkNumber(this.accumulateMonths[1][key]),
        key === "total"
      );
      if (key !== "total") {
        this.accumulateMonths[1][key] = this._common.currencyFormatES(
          this.accumulateMonths[1][key],
          false
        );
      } else {
        this.accumulateMonths[1].total = this._common.currencyFormatES(
          this.accumulateMonths[1].total
        );
      }
    });
  }

  calculateBenefitsMargin() {
    _.forOwn(this.benefitsReal, (value, key) => {
      this.benefitsReal[key] = this._common.currencyFormatES(
        this._common.checkNumber(this.totalIncome[key]) -
          this._common.checkNumber(this.totalExpensesReal[key]),
        key === "total"
      );
    });
    _.forOwn(this.marginReal, (value, key) => {
      this.marginReal[key] = this._common.marginCalculate(
        this.totalIncome[key],
        this.totalExpensesReal[key]
      );
    });
  }

  fillExcelData() {
    let exportData = [];
    let incomes = null;
    let expenses = null;
    let expenses_info = null;
    let accumulate = null;
    let employees = null;
    let totalExpenses = null;
    let benefits = null;
    let margins = null;

    incomes = this.incomesReal;
    expenses = _.map(this.expenses, "filtered_real");
    expenses_info = this.expenses;
    accumulate = this.accumulateMonths[1];
    employees = this.employeesCostReal;
    totalExpenses = this.totalExpensesReal;
    benefits = this.benefitsReal;
    margins = this.marginReal;

    if (
      this.role === 3 ||
      this.role === 6 ||
      this.role === 5 ||
      this.role === 4
    ) {
      this.incomes.forEach((element, key) => {
        // ingresos
        exportData.push({
          "": `${element.name_variable_concept}(${element.account_contability})`,
          Total: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.total),
            false
          ),
          Enero: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.january),
            false
          ),
          Febrero: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.february),
            false
          ),
          Marzo: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.march),
            false
          ),
          Abril: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.april),
            false
          ),
          Mayo: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.may),
            false
          ),
          Junio: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.june),
            false
          ),
          Julio: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.july),
            false
          ),
          Agosto: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.august),
            false
          ),
          Septiembre: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.september),
            false
          ),
          Octubre: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.october),
            false
          ),
          Noviembre: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.november),
            false
          ),
          Diciembre: this._common.currencyFormatES(
            this._common.toFloat(element.incomes_real.december),
            false
          ),
        });
      });
      // fee de empresa
      exportData.push({
        "": `Fee de empresa`,
        Total: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.total),
          false
        ),
        Enero: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.january),
          false
        ),
        Febrero: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.february),
          false
        ),
        Marzo: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.march),
          false
        ),
        Abril: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.april),
          false
        ),
        Mayo: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.may),
          false
        ),
        Junio: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.june),
          false
        ),
        Julio: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.july),
          false
        ),
        Agosto: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.august),
          false
        ),
        Septiembre: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.september),
          false
        ),
        Octubre: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.october),
          false
        ),
        Noviembre: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.november),
          false
        ),
        Diciembre: this._common.currencyFormatES(
          this._common.toFloat(this.feeIncome.december),
          false
        ),
      });
      // Total de ingresos
      exportData.push({
        "": `INGRESOS`,
        Total: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.total),
          false
        ),
        Enero: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.january),
          false
        ),
        Febrero: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.february),
          false
        ),
        Marzo: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.march),
          false
        ),
        Abril: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.april),
          false
        ),
        Mayo: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.may),
          false
        ),
        Junio: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.june),
          false
        ),
        Julio: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.july),
          false
        ),
        Agosto: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.august),
          false
        ),
        Septiembre: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.september),
          false
        ),
        Octubre: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.october),
          false
        ),
        Noviembre: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.november),
          false
        ),
        Diciembre: this._common.currencyFormatES(
          this._common.toFloat(this.totalIncome.december),
          false
        ),
      });
    }
    //space between last row
    exportData.push({
      Total: "",
      Enero: "",
      Febrero: "",
      Marzo: "",
      Abril: "",
      Mayo: "",
      Junio: "",
      Julio: "",
      Agosto: "",
      Septiembre: "",
      Octubre: "",
      Noviembre: "",
      Diciembre: "",
    });
    expenses.forEach((element, key) => {
      exportData.push({
        "": `${expenses_info[key].name_variable_concept}(${expenses_info[key].account_number})`,
        Total: this._common.currencyFormatES(
          this._common.toFloat(element.total),
          false
        ),
        Enero: this._common.currencyFormatES(
          this._common.toFloat(element.january),
          false
        ),
        Febrero: this._common.currencyFormatES(
          this._common.toFloat(element.february),
          false
        ),
        Marzo: this._common.currencyFormatES(
          this._common.toFloat(element.march),
          false
        ),
        Abril: this._common.currencyFormatES(
          this._common.toFloat(element.april),
          false
        ),
        Mayo: this._common.currencyFormatES(
          this._common.toFloat(element.may),
          false
        ),
        Junio: this._common.currencyFormatES(
          this._common.toFloat(element.june),
          false
        ),
        Julio: this._common.currencyFormatES(
          this._common.toFloat(element.july),
          false
        ),
        Agosto: this._common.currencyFormatES(
          this._common.toFloat(element.august),
          false
        ),
        Septiembre: this._common.currencyFormatES(
          this._common.toFloat(element.september),
          false
        ),
        Octubre: this._common.currencyFormatES(
          this._common.toFloat(element.october),
          false
        ),
        Noviembre: this._common.currencyFormatES(
          this._common.toFloat(element.november),
          false
        ),
        Diciembre: this._common.currencyFormatES(
          this._common.toFloat(element.december),
          false
        ),
      });
    });

    exportData.push({
      "": "Subtotal",
      Total: accumulate.total,
      Enero: accumulate.january,
      Febrero: accumulate.february,
      Marzo: accumulate.march,
      Abril: accumulate.april,
      Mayo: accumulate.may,
      Junio: accumulate.june,
      Julio: accumulate.july,
      Agosto: accumulate.august,
      Septiembre: accumulate.september,
      Octubre: accumulate.october,
      Noviembre: accumulate.november,
      Diciembre: accumulate.december,
    });

    exportData.push({
      "": "Personal Propio",
      Total: employees.total,
      Enero: employees.january,
      Febrero: employees.february,
      Marzo: employees.march,
      Abril: employees.april,
      Mayo: employees.may,
      Junio: employees.june,
      Julio: employees.july,
      Agosto: employees.august,
      Septiembre: employees.september,
      Octubre: employees.october,
      Noviembre: employees.november,
      Diciembre: employees.december,
    });

    exportData.push({
      "": "GASTOS",
      Total: totalExpenses.total,
      Enero: totalExpenses.january,
      Febrero: totalExpenses.february,
      Marzo: totalExpenses.march,
      Abril: totalExpenses.april,
      Mayo: totalExpenses.may,
      Junio: totalExpenses.june,
      Julio: totalExpenses.july,
      Agosto: totalExpenses.august,
      Septiembre: totalExpenses.september,
      Octubre: totalExpenses.october,
      Noviembre: totalExpenses.november,
      Diciembre: totalExpenses.december,
    });

    //space between last row
    exportData.push({
      Total: "",
      Enero: "",
      Febrero: "",
      Marzo: "",
      Abril: "",
      Mayo: "",
      Junio: "",
      Julio: "",
      Agosto: "",
      Septiembre: "",
      Octubre: "",
      Noviembre: "",
      Diciembre: "",
    });
    if (
      this.role === 3 ||
      this.role === 6 ||
      this.role === 5 ||
      this.role === 4
    ) {
      exportData.push({
        "": "BENEFICIOS",
        Total: benefits.total,
        Enero: benefits.january,
        Febrero: benefits.february,
        Marzo: benefits.march,
        Abril: benefits.april,
        Mayo: benefits.may,
        Junio: benefits.june,
        Julio: benefits.july,
        Agosto: benefits.august,
        Septiembre: benefits.september,
        Octubre: benefits.october,
        Noviembre: benefits.november,
        Diciembre: benefits.december,
      });

      exportData.push({
        "": "MARGEN",
        Total: margins.total,
        Enero: margins.january,
        Febrero: margins.february,
        Marzo: margins.march,
        Abril: margins.april,
        Mayo: margins.may,
        Junio: margins.june,
        Julio: margins.july,
        Agosto: margins.august,
        Septiembre: margins.september,
        Octubre: margins.october,
        Noviembre: margins.november,
        Diciembre: margins.december,
      });
    }

    return exportData;
  }

  actualizarobs() {
    this._api
      .updateObservations(
        this.info.observ_cli,
        this.info.observ_int,
        this.id,
        this.info.shipping_method,
        this.info.shipping_method_return
      )
      .subscribe((response) => {
        if (response.status === "ok") {
          this._notification.success(
            "Observaciones",
            "Se han guardado satisfactoriamente."
          );
        }
      });
  }

  exportExcel(): void {
    let exportData = [];
    let ws_name = "";

    exportData = this.fillExcelData();
    ws_name = "Real Mensual";

    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(exportData);

    if (
      this.role === 3 ||
      this.role === 7 ||
      this.role === 6 ||
      this.role === 5 ||
      this.role === 4
    ) {
      wb.SheetNames.push(ws_name);
      wb.Sheets[ws_name] = ws;
    } else if (this.role === 8) {
      this._notification.error(
        "Permisos",
        "Lo siento pero no tiene permisos para ver Real Mensual"
      );
    }

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
      `desglose-proyecto-${this.info.campaign_code}-${this.info.campaign_name}.xlsx`
    );
  }

  dataTableOnBlur(event, col, rowData, rowIndex, dt) {
    if (event.which === 13) {
      dt.onEditComplete.emit({ column: col, data: rowData, index: rowIndex });
      dt.switchCellToViewMode(event.target);
    } else if (event.which === 9) {
      dt.onEditComplete.emit({ column: col, data: rowData, index: rowIndex });
      event.currentTarget.nextElementSibling.blur();
    }
  }
}
