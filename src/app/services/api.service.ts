import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, Response } from "@angular/http";

import { Observable } from "rxjs/Observable";

import { Configuration } from "../api/configuration";

import { TokenService } from "../services/token.service";
import { Common } from "../api/common";

@Injectable()
export class ApiService {
  currentUser;
  constructor(
    private http: Http,
    private _config: Configuration,
    private tokenService: TokenService,
    private _common: Common
  ) {
    this.currentUser = this.tokenService.getInfo();
  }

  // BACKUP
  restoreDB(body) {
    return this.http
      .post(
        this._config.Server + this._config.restoreDB,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  generateBackup() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.generateBackup + queryString)
        .map((response: Response) => response.json());
    }
  }
  // COMPANY REPORT
  updateCompanyReport(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(
          this._config.Server + this._config.updateCompanyReport + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  cloneData(id, type, source_id, source_type) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&id=${id}`;
      queryString += `&source_id=${source_id}`;
      queryString += `&source_type=${source_type}`;
      queryString += `&type=${type}`;
      return this.http
        .get(this._config.Server + this._config.cloneData + queryString)
        .map((response: Response) => response.json());
    }
  }

  getAccountFixed() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getAccountFixed + queryString)
        .map((response: Response) => response.json());
    }
  }
  getCompanyReportStatistic() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_company_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getCompanyReportStatistic +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getCompanyReport() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_company_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getCompanyReport + queryString)
        .map((response: Response) => response.json());
    }
  }

  getCompanyReportNew(anyo) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_company_year=${dataSelected.year}`;
      queryString += `&anyo=${anyo}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getCompanyReportNew + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getProjectsBudgets() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_company_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getProjectsBudgets + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getInfoBilling(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&id=${body}`;
      return this.http
        .get(this._config.Server + this._config.getInfoBilling + queryString)
        .map((response: Response) => response.json());
    }
  }
  isAutoNumbered() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;

      return this.http
        .get(this._config.Server + this._config.isAutoNumbered + queryString)
        .map((response: Response) => response.json());
    }
  }
  getInfoProjectsSupervisor() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getInfoProjectsSupervisor +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }
  // MONTH REPORT
  getInfoMonthReport() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getInfoMonthReport + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  getSubconceptsStandards(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getSubconceptsStandards +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getCodesStandards(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(this._config.Server + this._config.getCodesStandards + queryString)
        .map((response: Response) => response.json());
    }
  }

  getMonthReport(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(this._config.Server + this._config.getMonthReport + queryString)
        .map((response: Response) => response.json());
    }
  }

  // PROJECT REPORT
  getAllProjectsReport(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(
          this._config.Server + this._config.getAllProjectsReport + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  getProjectsSupervisor(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(
          this._config.Server + this._config.getProjectsSupervisor + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getProjectsReport(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(this._config.Server + this._config.getProjectsReport + queryString)
        .map((response: Response) => response.json());
    }
  }

  deleteDatesLines(ids) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&ids=${ids}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.deleteDatesLines + queryString)
        .map((response: Response) => response.json());
    }
  }
  // BREAKDOWN CAMPAIGNS
  checkLinesSubconcept(valueId, start_date, end_date) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&${valueId}`;
      queryString += `&start_date=${start_date}&end_date=${end_date}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.checkLinesSubconcept + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  getIncomeBudget(id_project) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_project=${id_project}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getIncomeBudget + queryString)
        .map((response: Response) => response.json());
    }
  }
  updateInfoBill(field, value, valueId) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id=${valueId}`;
      queryString += `&field=${field}`;
      queryString += `&value=${value}`;

      return this.http
        .put(
          this._config.Server + this._config.updateInfoBill,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  toggleAutoNumbered(body, value) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      queryString += `&value=${value}`;
      return this.http
        .put(
          this._config.Server + this._config.toggleAutoNumbered,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateTaxBilling(value, id_bill) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_bill=${id_bill}`;
      queryString += `&value=${value}`;

      return this.http
        .put(
          this._config.Server + this._config.updateTaxBilling,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateInfoBudget(field, value, valueId) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&${valueId}`;
      queryString += `&field=${field}`;
      queryString += `&value=${value}`;
      queryString += `&token=${token}`;
      return this.http
        .put(
          this._config.Server + this._config.updateInfoBudget,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateInfoPersonalFieldBudget(field, tipocampo, value, valueId) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&${valueId}`;
      queryString += `&field=${field}`;
      queryString += `&value=${value}`;
      queryString += `&tipocampo=${tipocampo}`;
      queryString += `&token=${token}`;
      return this.http
        .put(
          this._config.Server + this._config.updateInfoPersonalFieldBudget,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateLastLogin(id_company, id_fiscal_year) {
    let token = localStorage.getItem("token");
    let queryString = `&id_company=${id_company}`;
    queryString += `&id_fiscal_year=${id_fiscal_year}`;
    queryString += `&token=${token}`;
    return this.http
      .put(
        this._config.Server + this._config.updateLastLogin,
        this.addToken(queryString),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  updateVariableCost(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .put(
          this._config.Server + this._config.updateVariableCost,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateRealEmployeeCost(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `${body}`;
      return this.http
        .get(
          this._config.Server +
            this._config.updateRealEmployeeCost +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  updateFeeLines(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `${body}`;
      return this.http
        .get(this._config.Server + this._config.updateFeeLine + queryString)
        .map((response: Response) => response.json());
    }
  }

  updateEstimatedEmployeeCost(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `${body}`;
      return this.http
        .get(
          this._config.Server +
            this._config.updateEstimatedEmployeeCost +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  updateLineSubconcept(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `${body}`;
      return this.http
        .put(
          this._config.Server + this._config.updateLineSubconcept,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateFeeIncome(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `${body}`;
      return this.http
        .put(
          this._config.Server + this._config.updateFeeIncome,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateIncomeVariableConcept(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `${body}`;
      return this.http
        .put(
          this._config.Server + this._config.updateIncomeVariableConcept,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateEstimatedIncomes(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `${body}`;
      return this.http
        .put(
          this._config.Server + this._config.updateEstimatedIncomes,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  getInfoBudget(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(this._config.Server + this._config.getInfoBudget + queryString)
        .map((response: Response) => response.json());
    }
  }
  getBreakdownSupervisor(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getBreakdownSupervisor +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getInfoCampaign(body: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${body}`;
      return this.http
        .get(this._config.Server + this._config.getInfoCampaign + queryString)
        .map((response: Response) => response.json());
    }
  }

  getInfoAlbaran(idcampaign: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&id=${idcampaign}`;
      return this.http
        .get(this._config.Server + this._config.getInfoAlbaran + queryString)
        .map((response: Response) => response.json());
    }
  }

  // CAMPAIGNS

  getDataCombos() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getDataCombos + queryString)
        .map((response: Response) => response.json());
    }
  }

  getDataCombosStorage() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getDataCombosStorage + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  addBudget(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addBudget,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  insertCampaign(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addCampaign,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  insertStorage(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addStorage,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  clonarPresupuesto(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.clonarPresupuesto,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  getBudgets() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getBudgets + queryString)
        .map((response: Response) => response.json());
    }
  }
  getExcelData() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getExcelData + queryString)
        .map((response: Response) => response.json());
    }
  }
  getCampaigns(start_date, end_date) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&start_date=${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`;
      queryString += `&end_date=${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getCampaigns + queryString)
        .map((response: Response) => response.json());
    }
  }

  getCountries() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getCountries + queryString)
        .map((response: Response) => response.json());
    }
  }

  getCustomerAddresses(idCustomer) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&id_customer=${idCustomer}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getCustomerAddresses + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getStadisticsBilling() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getStadisticsBilling + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getStadisticsCampaigns(filtroestado) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&estado=${filtroestado}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getStadisticsCampaigns +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getExportationsBilling() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getExportationsBilling +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getExportationsExpenses() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getExportationsExpenses +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getArticlesLocation() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getArticlesLocation + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getArticlesMovement(start_date, end_date) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&start_date=${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`;
      queryString += `&end_date=${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getArticlesMovement + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getArticlesStock() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getArticlesStock + queryString)
        .map((response: Response) => response.json());
    }
  }

  getArticlesNewStock() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getArticlesNewStock + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getBills(start_date, end_date) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&start_date=${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`;
      queryString += `&end_date=${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getBills + queryString)
        .map((response: Response) => response.json());
    }
  }

  getBills4Exportation(start_date, end_date) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&start_date=${start_date.date.year}-${start_date.date.month}-${start_date.date.day}`;
      queryString += `&end_date=${end_date.date.year}-${end_date.date.month}-${end_date.date.day}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getBills4Exportation + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getExpenses() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getExpenses + queryString)
        .map((response: Response) => response.json());
    }
  }

  getExpenses4Exportation() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getExpenses4Exportation +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  createExportationBilling(fechafin) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&fechafin=${fechafin}`;
      queryString += `&token=${token}`;
      return this.http
        .post(
          this._config.Server + this._config.createExportationBilling,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  createExportationExpenses(fechafin) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&fechafin=${fechafin}`;
      queryString += `&token=${token}`;
      return this.http
        .post(
          this._config.Server + this._config.createExportationExpenses,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  createBill(id_project: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${id_project}`;
      return this.http
        .post(
          this._config.Server + this._config.createBill,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  abonoBill(id_factura: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${id_factura}`;
      return this.http
        .post(
          this._config.Server + this._config.abonoBill,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  tramitarpedido(tramitedeseado: string, idcampaign: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&${tramitedeseado}`;
      queryString += `&${idcampaign}`;
      return this.http
        .post(
          this._config.Server + this._config.tramitarpedido,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  addTax(taxValue) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&token=${token}`;
      queryString += `&value=${taxValue}`;
      return this.http
        .post(
          this._config.Server + this._config.addTax,
          this.addToken(queryString),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateBudget(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateBudget,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateStorage(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateStorage,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  deleteStorage(body) {
    return this.http
      .put(
        this._config.Server + this._config.deleteStorage,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  exitStorage(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.exitStorage,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateBill(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateBill,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateExpense(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateExpense,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  insertExpense(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.insertExpense,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updatePresupuesto2Pedido(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updatePresupuesto2Pedido,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateCampaign(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateCampaign,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updatePresupuestoDesestimado(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updatePresupuestoDesestimado,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updatePassword(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updatePassword,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  deleteBudget(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteBudget, this.jwt(id))
      .map((response: Response) => response.json());
  }
  deleteCampaigns(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteCampaign, this.jwt(id))
      .map((response: Response) => response.json());
  }
  deleteBill(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteBill, this.jwt(id))
      .map((response: Response) => response.json());
  }

  deleteExpense(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteExpense, this.jwt(id))
      .map((response: Response) => response.json());
  }

  deleteExportationBilling(id: number) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteExportationBilling,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }

  deleteExportationExpenses(id: number) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteExportationExpenses,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }
  deleteTax(valueTax) {
    return this.http
      .delete(this._config.Server + this._config.deleteTax, this.jwt(valueTax))
      .map((response: Response) => response.json());
  }
  // FIXED COST
  getExpensesFixed(type) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&type=${type}`;
      return this.http
        .get(this._config.Server + this._config.getExpensesFixed + queryString)
        .map((response: Response) => response.json());
    }
  }

  // VARIABLE COST
  getExpensesVariable(type) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&type=${type}`;
      return this.http
        .get(
          this._config.Server + this._config.getExpensesVariable + queryString
        )
        .map((response: Response) => response.json());
    }
  }

  // VARIABLE COST
  getIncomeVariable(type) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      queryString += `&type=${type}`;
      return this.http
        .get(this._config.Server + this._config.getIncomeVariable + queryString)
        .map((response: Response) => response.json());
    }
  }

  updateFixedCost(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateFixedCost,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateVariableIncome(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateVariableIncome,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateVariableExpenses(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateVariableExpenses,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  //ADD SUBCONCEPTS
  updateFee(id, field, value, type, id_value) {
    let token = localStorage.getItem("token");
    let queryString = `id=${id}`;
    queryString += `&field=${field}`;
    queryString += `&value=${value}`;
    queryString += `&type=${type}`;
    queryString += `&id_value=${id_value}`;
    let body = queryString;
    return this.http
      .put(this._config.Server + this._config.updateFee, body, this.jwt())
      .map((response: Response) => response.json());
  }

  cobrarBill(id: number, numero: number, fecha_cobro: any) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let body = `id_company=${dataSelected.company}`;
      body += `&id=${id}`;
      body += `&numero=${numero}`;
      body += `&fecha_cobro=${fecha_cobro.date.year}-${fecha_cobro.date.month}-${fecha_cobro.date.day}`;
      return this.http
        .put(
          this._config.Server + this._config.cobrarBill,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }

  updateSubconceptStandard(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${dataSelected.company}`;
      body += `&id_fiscal_year=${dataSelected.year}`;
      return this.http
        .put(
          this._config.Server + this._config.updateSubconceptStandard,
          this.addToken(body),
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateSubconceptBilling(id, type, value, parsedPrice, idBill) {
    let token = localStorage.getItem("token");
    let queryString = `id=${id}`;
    queryString += `&field=${type}`;
    queryString += `&value=${encodeURIComponent(value)}`;
    queryString += `&id_bill=${idBill}`;
    if (parsedPrice) {
      queryString += `&price=${parsedPrice}`;
    }
    let body = queryString;

    body = body;
    return this.http
      .put(
        this._config.Server + this._config.updateSubconceptBilling,
        body,
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  updateEventDateSubconcept(subconcept_id, field, date) {
    const parsedDate = new Date(date);
    const valueDate = `${parsedDate.getFullYear()}-${
      parsedDate.getMonth() + 1
    }-${parsedDate.getDate()}`;
    let token = localStorage.getItem("token");
    let queryString = `id=${subconcept_id}`;
    queryString += `&field=${field}`;
    queryString += `&value=${valueDate}`;

    let body = queryString;
    return this.http
      .put(
        this._config.Server + this._config.updateEventDateSubconcept,
        body,
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  updateSubconcept(
    id,
    type,
    value,
    parsedPrice,
    parsedDescription,
    parsedCode,
    idCompany
  ) {
    let token = localStorage.getItem("token");
    let queryString = `id=${id}`;
    queryString += `&field=${type}`;
    queryString += `&value=${encodeURIComponent(value)}`;
    if (parsedPrice) {
      queryString += `&price=${parsedPrice}`;
    }
    if (parsedDescription) {
      queryString += `&name=${encodeURIComponent(parsedDescription)}`;
    }
    if (parsedCode) {
      queryString += `&code=${encodeURIComponent(parsedCode)}`;
    }
    if (idCompany) {
      queryString += `&id_company=${idCompany}`;
    }
    let body = queryString;
    return this.http
      .put(
        this._config.Server + this._config.updateSubconcept,
        body,
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  updateObservations(
    observ_cli,
    observ_int,
    id,
    shipping_method,
    shipping_method_return
  ) {
    let token = localStorage.getItem("token");
    let queryString = `id=${id}`;
    queryString += `&observ_cli=${observ_cli}`;
    queryString += `&observ_int=${observ_int}`;
    queryString += `&shipping_method=${shipping_method}`;
    queryString += `&shipping_method_return=${shipping_method_return}`;

    let body = queryString;
    return this.http
      .put(
        this._config.Server + this._config.updateObservations,
        body,
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  removeSubconcept(id: string) {
    let body = `id=${id}`;
    return this.http
      .post(
        this._config.Server + this._config.removeSubconcept,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  removeSubconceptBilling(id: string) {
    let body = `id=${id}`;
    return this.http
      .post(
        this._config.Server + this._config.removeSubconceptBilling,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  addSubconceptBilling(valueId: string, idVariableConcept: string) {
    let body = `id_bill=${valueId}&id_variable_concept=${idVariableConcept}`;
    return this.http
      .post(
        this._config.Server + this._config.addSubconceptBilling,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  removeAddress(id: string) {
    let body = `id=${id}`;
    return this.http
      .post(
        this._config.Server + this._config.removeAddress,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  addAddress(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addAddressCustomer,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  updateAddress(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.updateAddressCustomer,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  addSubconcept(valueId: string, idVariableConcept: string, idCompany: string) {
    let body = `${valueId}&id_variable_concept=${idVariableConcept}&id_company=${idCompany}`;
    return this.http
      .post(
        this._config.Server + this._config.addSubconcept,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  getLinesSubconcept(idProject: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_project=${idProject}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getLinesSubconcept + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  getSubconceptStandard() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getSubconceptStandard + queryString
        )
        .map((response: Response) => {
          return response.json();
        });
    }
  }
  getSubconceptsBillings(idValue: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&idBill=${idValue}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server +
            this._config.getSubconceptsBillings +
            queryString
        )
        .map((response: Response) => response.json());
    }
  }

  getSubconcept(idValue: string) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&${idValue}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getSubconcept + queryString)
        .map((response: Response) => response.json());
    }
  }

  // VARIABLE CONCEPTS
  getVariableConcept() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(
          this._config.Server + this._config.getVariableConcept + queryString
        )
        .map((response: Response) => response.json());
    }
  }
  insertVariableConcept(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addVariableConcept,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateVariableConcept(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      body += queryString;
      return this.http
        .put(
          this._config.Server + this._config.updateVariableConcept,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  deleteVariableConcept(id: number) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteVariableConcept,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }

  // FIXED CONCEPTS
  getParentAccount() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getParentAccount + queryString)
        .map((response: Response) => response.json());
    }
  }
  getFixedConcept() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getFixedConcept + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertFixedConcept(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addFixedConcept,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateFixedConcept(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;

      return this.http
        .put(
          this._config.Server + this._config.updateFixedConcept,
          body + queryString,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  deleteFixedConcept(id: number) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteFixedConcept,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }
  deleteParentFixedConcept(body) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteParentFixedConcept,
        this.addBodyHeader(body)
      )
      .map((response: Response) => response.json());
  }

  // USERS
  getRolesTeams() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let body = `&id_company=${idCompany}`;
      return this.http
        .get(
          this._config.Server + this._config.getRolesTeams + body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  getUsers() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getUsers + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertUser(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addUsers,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateUser(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(this._config.Server + this._config.updateUser, body, this.jwt())
        .map((response: Response) => response.json());
    }
  }
  deleteUser(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteUser, this.jwt(id))
      .map((response: Response) => response.json());
  }

  //CUSTOMER PRICES
  getcustomerPrices(idArticulo: number) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}&id_article=${idArticulo}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getCustomerPrices + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertcustomerPrice(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addCustomerPrice,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updatecustomerPrice(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(
          this._config.Server + this._config.updateCustomerPrice,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  deletecustomerPrice(id: number) {
    return this.http
      .post(
        this._config.Server + this._config.deleteCustomerPrice,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }

  //CONTACTS
  getContacts() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getContacts + queryString)
        .map((response: Response) => response.json());
    }
  }

  // CUSTOMER
  getCustomers() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getCustomers + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertCustomer(body: string) {
    return this.http
      .post(this._config.Server + this._config.addCustomer, body, this.jwt())
      .map((response: Response) => response.json());
  }
  updateCustomer(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(
          this._config.Server + this._config.updateCustomer,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  deleteCustomer(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteCustomer, this.jwt(id))
      .map((response: Response) => response.json());
  }

  // TEAMS
  getTeams() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getTeams + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertTeam(body: string) {
    return this.http
      .post(this._config.Server + this._config.addTeam, body, this.jwt())
      .map((response: Response) => response.json());
  }
  updateTeam(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(this._config.Server + this._config.updateTeam, body, this.jwt())
        .map((response: Response) => response.json());
    }
  }
  deleteTeam(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteTeam, this.jwt(id))
      .map((response: Response) => response.json());
  }

  // GROUPS
  getGroups() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getGroups + queryString)
        .map((response: Response) => response.json());
    }
  }
  insertGroup(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addGroup,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateGroup(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(this._config.Server + this._config.updateGroup, body, this.jwt())
        .map((response: Response) => response.json());
    }
  }
  deleteGroup(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteGroup, this.jwt(id))
      .map((response: Response) => response.json());
  }

  // GROUPS
  getSubgroups() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getSubgroups + queryString)
        .map((response: Response) => response.json());
    }
  }

  addSubconceptStandard(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addSubconceptStandard,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }

  insertSubgroup(body: string) {
    return this.http
      .post(
        this._config.Server + this._config.addSubgroup,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateSubgroup(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      return this.http
        .put(
          this._config.Server + this._config.updateSubgroup,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  deleteSubconceptStandard(id: number) {
    return this.http
      .delete(
        this._config.Server + this._config.deleteSubconceptStandard,
        this.jwt(id)
      )
      .map((response: Response) => response.json());
  }

  deleteSubgroup(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteSubgroup, this.jwt(id))
      .map((response: Response) => response.json());
  }

  // SETTINGS
  importErp(dataVariablesExpenses, dataVariablesIncomes, dataFixed) {
    let token = localStorage.getItem("token");
    let body = `dataVariablesIncomes=${JSON.stringify(
      dataVariablesIncomes
    )}&dataVariablesExpenses=${JSON.stringify(
      dataVariablesExpenses
    )}&dataFixed=${JSON.stringify(dataFixed)}`;

    body += `&token=${token}`;
    return this.http
      .post(
        this._config.Server + this._config.importErp,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  resetValuesFixedVariables(body) {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");

      body += `&id_company=${dataSelected.company}&id_fiscal_year=${dataSelected.year}`;
      body += `&token=${token}`;
      return this.http
        .put(
          this._config.Server + this._config.resetValuesFixedVariables,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  getInfoImportERP() {
    let dataSelected = this._common.getIdCompanyYearSelected();
    if (!dataSelected) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa/año desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${dataSelected.company}`;
      queryString += `&id_fiscal_year=${dataSelected.year}`;
      queryString += `&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getInfoImportERP + queryString)
        .map((response: Response) => response.json());
    }
  }
  subscritionUser(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      body = this.addToken(body);
      return this.http
        .put(
          this._config.Server + this._config.subscritionUser,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  getBudgetCost() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      let token = localStorage.getItem("token");
      let queryString = `&id_company=${idCompany}&token=${token}`;
      return this.http
        .get(this._config.Server + this._config.getBudgetCost + queryString)
        .map((response: Response) => response.json());
    }
  }
  updateBudgetCost(body) {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_company=${idCompany}`;
      body = this.addToken(body);
      return this.http
        .put(
          this._config.Server + this._config.updateBudgetCost,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  updateAccountsCompany(body) {
    let idFiscalYear = this._common.getIdCompanyYearSelected();
    if (!idFiscalYear) {
      let data: Observable<any>;
      data = new Observable((observer) => {
        observer.next({
          status: "error",
          msg: "Debes seleccionar una empresa desde el menu de selección.",
        });
      });
      return data;
    } else {
      body += `&id_fiscal_year=${idFiscalYear.year}`;
      body = this.addToken(body);
      return this.http
        .put(
          this._config.Server + this._config.updateAccountsCompany,
          body,
          this.jwt()
        )
        .map((response: Response) => response.json());
    }
  }
  addCompany(body) {
    return this.http
      .post(
        this._config.Server + this._config.addCompany,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateCompany(body) {
    return this.http
      .post(
        this._config.Server + this._config.updateCompany,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  deleteCompany(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteCompany, this.jwt(id))
      .map((response: Response) => response.json());
  }
  insertFiscalYear(body) {
    return this.http
      .post(
        this._config.Server + this._config.insertFiscalYear,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  updateFiscalYear(body) {
    return this.http
      .post(
        this._config.Server + this._config.updateFiscalYear,
        this.addToken(body),
        this.jwt()
      )
      .map((response: Response) => response.json());
  }
  deleteFiscalYear(id: number) {
    return this.http
      .delete(this._config.Server + this._config.deleteFiscalYear, this.jwt(id))
      .map((response: Response) => response.json());
  }
  getCompanies() {
    let token = localStorage.getItem("token");
    let queryString = `&token=${token}`;
    return this.http
      .get(this._config.Server + this._config.getCompanies + queryString)
      .map((response: Response) => response.json());
  }
  getFiscalYears() {
    let token = localStorage.getItem("token");
    let queryString = `&token=${token}`;
    return this.http
      .get(this._config.Server + this._config.getFiscalYears + queryString)
      .map((response: Response) => response.json());
  }
  getTaxesValue() {
    let token = localStorage.getItem("token");
    let queryString = `&token=${token}`;
    return this.http
      .get(this._config.Server + this._config.getTaxesValue)
      .map((response: Response) => response.json());
  }

  // private helper methods

  private jwt(id?) {
    // create authorization header with jwt token
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    let token = localStorage.getItem("token");
    let body = "";
    if (token) {
      if (id) {
        body = "id=" + id + "&token=" + token;
      }
      let headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });
      if (body !== "") {
        return new RequestOptions({ headers: headers, body: body });
      } else {
        return new RequestOptions({ headers: headers });
      }
    }
  }

  private addBodyHeader(id?) {
    // create authorization header with jwt token
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    let token = localStorage.getItem("token");
    let body = "";
    if (token) {
      if (id) {
        body = id + "&token=" + token;
      }
      let headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });
      if (body !== "") {
        return new RequestOptions({ headers: headers, body: body });
      } else {
        return new RequestOptions({ headers: headers });
      }
    }
  }

  private addToken(body?) {
    // create authorization header with jwt token
    let token = localStorage.getItem("token");
    if (token && body !== "") {
      body = "token=" + token + "&" + body;
      return body;
    }
    if (token && body === "") {
      body = "token=" + token;
      return body;
    }
  }
}
