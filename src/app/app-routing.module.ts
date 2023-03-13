import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { AuthGuard } from './guards/auth.guards';

import { LoginComponent } from './pages/login/login.component';
import { RememberComponent } from './pages/remember/remember.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { SettingComponent } from './pages/setting/setting.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { TeamComponent } from './pages/team/team.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { SubgroupsComponent } from './pages/subgroups/subgroups.component';
import { UsersComponent } from './pages/users/users.component';
import { FixedConceptComponent } from './pages/fixed-concept/fixed-concept.component';
import { VariableConceptComponent } from './pages/variable-concept/variable-concept.component';
import { FixedCostComponent } from './pages/fixed-cost/fixed-cost.component';
import { FixedCostNewComponent } from './pages/fixed-cost-new/fixed-cost-new.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectsNewComponent } from './pages/projects-new/projects-new.component';
import { BreakdownComponent } from './pages/breakdown/breakdown.component';
import { SummaryProjectsComponent } from './pages/summary-projects/summary-projects.component';
import { StatisticReportComponent } from './pages/statistic-report/statistic-report.component';
import { BreakdownResumeComponent } from './pages/breakdown-resume/breakdown-resume.component';
import { MonthReportComponent } from './pages/month-report/month-report.component';
import { ProjectsReportComponent } from './pages/projects-report/projects-report.component';
import { ProjectReportStatusComponent } from './pages/project-report-status/project-report-status.component';
import { CompanyReportComponent } from './pages/company-report/company-report.component';
import { CompanyReportNewComponent } from './pages/company-report-new/company-report-new.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { BudgetResumeComponent } from './pages/budget-resume/budget-resume.component';
import { BillingComponent } from './pages/billing/billing.component';
import { BillingBreakdownComponent } from './pages/billing-breakdown/billing-breakdown.component';
import { SubconceptStandardComponent } from './pages/subconcept-standard/subconcept-standard.component';
import { ProjectsSupervisorComponent } from './pages/projects-supervisor/projects-supervisor.component';
import { CustomersNewComponent } from './pages/customers-new/customers-new.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { StorageComponent } from './pages/storage/storage.component';
import { DemoComponent } from './pages/demo/demo.component';


const appRoutes: Routes = [
  { path: '', component: ProjectsNewComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'remember', component: RememberComponent },
  { path: 'informe-estadistico', component: StatisticReportComponent, canActivate: [AuthGuard] },
  { path: 'informe-empresa', component: CompanyReportNewComponent, canActivate: [AuthGuard] },
  { path: 'informe-empresa-old', component: CompanyReportComponent, canActivate: [AuthGuard] },
  { path: 'informe-mensual', component: MonthReportComponent, canActivate: [AuthGuard] },
  { path: 'informe-proyectos', component: ProjectsReportComponent, canActivate: [AuthGuard] },
  { path: 'informe-proyectos-estado', component: ProjectReportStatusComponent, canActivate: [AuthGuard] },
  { path: 'costes-fijos', component: FixedCostNewComponent, canActivate: [AuthGuard] },
  { path: 'costes-fijos-old', component: FixedCostComponent, canActivate: [AuthGuard] },
  { path: 'facturas', component: BillingComponent, canActivate: [AuthGuard] },
  { path: 'factura/:id', component: BillingBreakdownComponent, canActivate: [AuthGuard] },
  { path: 'proyectos-old', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'proyectos', component: ProjectsNewComponent, canActivate: [AuthGuard] },   
  { path: 'listado-proyectos', component: ProjectsSupervisorComponent, canActivate: [AuthGuard] },  
  { path: 'presupuestos', component: BudgetsComponent, canActivate: [AuthGuard] },
  { path: 'presupuesto/:id', component: BudgetResumeComponent, canActivate: [AuthGuard] },
  { path: 'proyecto/:id', component: BreakdownResumeComponent, canActivate: [AuthGuard] },
  { path: 'desglose/:id', component: BreakdownComponent, canActivate: [AuthGuard] },
  { path: 'resumen/:id', component: SummaryProjectsComponent, canActivate: [AuthGuard] },
  { path: 'configuracion', component: SettingComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: CustomersNewComponent, canActivate: [AuthGuard] },
  { path: 'compras', component: ExpensesComponent, canActivate: [AuthGuard] },  
  { path: 'equipos', component: TeamComponent, canActivate: [AuthGuard] },
  { path: 'grupos', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'subgrupos', component: SubgroupsComponent, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'conceptos-fijos', component: FixedConceptComponent, canActivate: [AuthGuard] },
  { path: 'conceptos-variables', component: VariableConceptComponent, canActivate: [AuthGuard] },
  { path: 'subconceptos-standard', component: SubconceptStandardComponent, canActivate: [AuthGuard] },
  { path: 'almacen', component: StorageComponent, canActivate: [AuthGuard] },  
  { path: 'demo', component: DemoComponent, canActivate: [AuthGuard] },  
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
