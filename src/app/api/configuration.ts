import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { IMyDpOptions } from 'mydatepicker';

const PORT = ':8081';

@Injectable()
export class Configuration {
  public pagination: number = 20;
  public Server: string = environment.urlServer;

  public subscritionUser: string = 'subscritionUser';

  public importErp: string = 'importErp';
  public resetValuesFixedVariables: string = 'resetValuesFixedVariables';
  public getInfoImportERP: string = 'getInfoImportERP';
  public updateIncomeVariableConcept: string = 'updateIncomeVariableConcept';
  public getBreakdownSupervisor: string = 'getBreakdownSupervisor';

  public getStadisticsBilling: string = 'getStadisticsBilling'; 
  public getStadisticsCampaigns: string = 'getStadisticsCampaigns'; 
  public getArticlesLocation:string = 'getArticlesLocation';   
  public getArticlesMovement:string = 'getArticlesMovement'; 
  public getArticlesStock:string = 'getArticlesStock';
  public getArticlesNewStock:string = 'getArticlesNewStock';   
  public getInfoBilling: string = 'getInfoBilling';
  public getExpenses: string = 'getExpenses';
  public getExpenses4Exportation: string = 'getExpenses4Exportation';
  public getBills: string = 'getBills';
  public getBills4Exportation: string = 'getBills4Exportation';
  public createBill: string = 'createBill';
  public abonoBill: string = 'abonoBill';
  public tramitarpedido: string = 'tramitarpedido';
  public updateBill: string = 'updateBill';
  public insertExpense: string = 'insertExpense';
  public updateExpense: string = 'updateExpense';
  public updateStorage: string = 'updateStorage';
  public exitStorage: string = 'exitStorage';
  public getSubconceptsBillings: string = 'getSubconceptsBillings';
  public getTaxesValue: string = 'getTaxesValue';
  public updateInfoBill: string = 'updateInfoBill';
  public updateSubconceptBilling: string = 'updateSubconceptBilling';
  public addSubconceptBilling: string = 'addSubconceptBilling';
  public removeSubconceptBilling: string = 'removeSubconceptBilling';
  public updateTaxBilling: string = 'updateTaxBilling';  
  public addTax: string = 'addTax';
  public updateFeeIncome: string = 'updateFeeIncome';

  public getProjectsSupervisor: string = 'getProjectsSupervisor';
  public getInfoProjectsSupervisor: string = 'getInfoProjectsSupervisor';
  public toggleAutoNumbered: string = 'toggleAutoNumbered';
  public isAutoNumbered: string = 'isAutoNumbered';

  public deleteTax: string = 'deleteTax';
  public generateBackup: string = 'generateBackup';
  public restoreDB: string = 'restoreDB';
  public updateLastLogin: string = 'updateLastLogin';

  public updateCompanyReport: string = 'updateCompanyReport';
  public getCompanyReport: string = 'getCompanyReport';
  public getCompanyReportNew: string = 'getCompanyReportNew';

  public getCompanyReportStatistic: string = 'getCompanyReportStatistic';

  public getAccountFixed: string = 'getAccountFixed';
  public updateAccountsCompany: string = 'updateAccountsCompany';

  public getProjectsReport: string = 'getProjectsReport';
  public getAllProjectsReport: string = 'getAllProjectsReport';

  public getMonthReport: string = 'getMonthReport';
  public getInfoMonthReport: string = 'getInfoMonthReport';

  public getSubconceptsStandards: string = 'getSubconceptsStandards';
  public getCodesStandards: string = 'getCodesStandards';
  public getIncomeBudget: string = 'getIncomeBudget';
  public updateVariableCost: string = 'updateVariableCost';
  public updateEstimatedEmployeeCost: string = 'updateEstimatedEmployeeCost';
  public updateFeeLine: string = 'updateFeeLine';
  public updateRealEmployeeCost: string = 'updateRealEmployeeCost';
  public getInfoCampaign: string = 'getInfoCampaign';
  public getInfoAlbaran: string = 'getInfoAlbaran';
  public updateEstimatedIncomes: string = 'updateEstimatedIncomes';
  public updateLineSubconcept: string = 'updateLineSubconcept';

  public updateFixedCost: string = 'updateFixedCost';
  public updateVariableIncome: string = 'updateVariableIncome';
  public updateVariableExpenses: string = 'updateVariableExpenses';
  
  public getExpensesFixed: string = 'getExpensesFixed';
  public getExpensesVariable: string = 'getExpensesVariable';
  public getIncomeVariable: string = 'getIncomeVariable';


  public getBudgets: string = 'getBudgets';
  public getDataCombos: string = 'getDataCombos';
  public getDataCombosStorage: string = 'getDataCombosStorage';
  public getCampaigns: string = 'getCampaigns';
  public getCustomerAddresses: string = 'getCustomerAddresses';
  public getCountries: string = 'getCountries';
  public getExcelData: string = 'getExcelData';
  public addCampaign: string = 'addCampaign';
  public addStorage: string = 'addStorage';
  public clonarPresupuesto: string = 'clonarPresupuesto';
  public deleteCampaign: string = 'deleteCampaign';
  public updateCampaign: string = 'updateCampaign';
  public updatePresupuesto2Pedido: string = 'updatePresupuesto2Pedido';
  public updatePresupuestoDesestimado: string = 'updatePresupuestoDesestimado';
  public updatePassword: string = 'updatePassword';
  public deleteBill:string = 'deleteBill';
  public deleteExpense:string = 'deleteExpense';
  public deleteStorage:string = 'deleteStorage';
  public cobrarBill:string = 'cobrarBill';  
  public createExportationBilling:string = 'createExportationBilling';
  public deleteExportationBilling:string = 'deleteExportationBilling';
  public getExportationsBilling: string = 'getExportationsBilling';  
  public createExportationExpenses:string = 'createExportationExpenses';
  public deleteExportationExpenses:string = 'deleteExportationExpenses';
  public getExportationsExpenses: string = 'getExportationsExpenses';  

  public getRolesTeams: string = 'getRolesTeams';
  public getUsers: string = 'getUsers';
  public addUsers: string = 'addUsers';
  public deleteUser: string = 'deleteUser';
  public updateUser: string = 'updateUser'; 

  public getCustomerPrices: string = 'getCustomerPrices';
  public addCustomerPrice: string = 'addCustomerPrice';
  public deleteCustomerPrice: string = 'deleteCustomerPrice';
  public updateCustomerPrice: string = 'updateCustomerPrice'; 


  public getVariableConcept: string = 'getVariableConcept';
  public addVariableConcept: string = 'addVariableConcept';
  public deleteVariableConcept: string = 'deleteVariableConcept';
  public updateVariableConcept: string = 'updateVariableConcept';

  public getParentAccount: string = 'getParentAccount';
  public getFixedConcept: string = 'getFixedConcept';
  public addFixedConcept: string = 'addFixedConcept';
  public deleteFixedConcept: string = 'deleteFixedConcept';
  public deleteParentFixedConcept: string = 'deleteParentFixedConcept';
  public updateFixedConcept: string = 'updateFixedConcept';

  public getGroups: string = 'getGroups';
  public addGroup: string = 'addGroup';
  public deleteGroup: string = 'deleteGroup';
  public updateGroup: string = 'updateGroup';

  public getSubgroups: string = 'getSubgroups';
  public getSubconceptStandard: string = 'getSubconceptStandard';
  public addSubconceptStandard: string = 'addSubconceptStandard';
  public addSubgroup: string = 'addSubgroup';
  public deleteSubconceptStandard: string = 'deleteSubconceptStandard';
  public deleteSubgroup: string = 'deleteSubgroup';
  public updateSubgroup: string = 'updateSubgroup';

  public getContacts: string = 'getContacts';
  public addContact: string = 'addContact';
  public deleteContact: string = 'deleteContact';
  public updateContact: string = 'updateContact';

  public getCustomers: string = 'getCustomers';
  public addCustomer: string = 'addCustomer';
  public deleteCustomer: string = 'deleteCustomer';
  public updateCustomer: string = 'updateCustomer';

  public getTeams: string = 'getTeams';
  public addTeam: string = 'addTeam';
  public deleteTeam: string = 'deleteTeam';
  public updateTeam: string = 'updateTeam';

  public updateBudgetCost: string = 'updateBudgetCost';
  public addCompany: string = 'addCompany';
  public updateCompany: string = 'updateCompany';
  public insertFiscalYear: string = 'addFiscalYear';
  public updateFiscalYear: string = 'updateFiscalYear';
  public deleteFiscalYear: string = 'deleteFiscalYear';
  public deleteCompany: string = 'deleteCompany';
  public getCompanies: string = 'getCompanies';
  public getFiscalYears: string = 'getFiscalYears';
  public getBudgetCost: string = 'getBudgetCost';

  public addAddressCustomer: string = 'addAddressCustomer';
  public updateAddressCustomer: string = 'updateAddressCustomer';
 
  public removeAddress: string = 'removeAddress';

  public addSubconcept: string = 'addSubconcept';
  public getLinesSubconcept: string = 'getLinesSubconcept';
  public getSubconcept: string = 'getSubconcept';
  public updateSubconcept: string = 'updateSubconcept';
  public updateObservations: string = 'updateObservations';
  public updateSubconceptStandard: string = 'updateSubconceptStandard';

  public updateFee: string = 'updateFee';
  public updateInfoBudget: string = 'updateInfoBudget';
  public updateInfoPersonalFieldBudget: string = 'updateInfoPersonalFieldBudget';
  public removeSubconcept: string = 'removeSubconcept';

  public addBudget: string = 'addBudget';
  public updateBudget: string = 'updateBudget';
  public deleteBudget: string = 'deleteBudget';
  public getInfoBudget: string = 'getInfoBudget';
  public getProjectsBudgets: string = 'getProjectsBudgets';
  public cloneData: string = 'cloneData';

  public checkLinesSubconcept: string = 'checkLinesSubconcept';
  public deleteDatesLines: string = 'deleteDatesLines';
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    dayLabels: {
      su: 'Dom',
      mo: 'Lun',
      tu: 'Mar',
      we: 'Mie',
      th: 'Jue',
      fr: 'Vie',
      sa: 'Sab',
    },
    monthLabels: {
      1: 'Ene',
      2: 'Feb',
      3: 'Mar',
      4: 'Abr',
      5: 'May',
      6: 'Jun',
      7: 'Jul',
      8: 'Ago',
      9: 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dic',
    },
    todayBtnTxt: 'Hoy',
    satHighlight: true,
  };
}
