import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import "lodash";

import { HttpModule } from "@angular/http";

import { ClickOutsideModule } from "ng-click-outside";

import { SimpleNotificationsModule } from "angular2-notifications";
import { NgUploaderModule } from "ngx-uploader";
import { MyDatePickerModule } from "mydatepicker";

import { MultiSelectModule } from "primeng/primeng";
import { DialogModule } from "primeng/primeng";

import { DropdownModule } from "primeng/components/dropdown/dropdown";
import { AutoCompleteModule } from "primeng/primeng";
import {
  DataTableModule,
  SharedModule,
  TabViewModule,
  InputMaskModule,
  SlideMenuModule,
  InputTextModule,
} from "primeng/primeng";

import { ChartsModule } from "ng2-charts";

import { AuthGuard } from "./guards/auth.guards";
import { AuthenticationService } from "./services/authentication.service";
import { Configuration } from "./api/configuration";
import { Common } from "./api/common";
import { TokenService } from "./services/token.service";
import { ApiService } from "./services/api.service";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./pages/login/login.component";
import { RememberComponent } from "./pages/remember/remember.component";
import { PageNotFoundComponent } from "./pages/page-not-found/page-not-found.component";
import { HeaderComponent } from "./components/header/header.component";
import { SettingComponent } from "./pages/setting/setting.component";
import { CustomersComponent } from "./pages/customers/customers.component";
import { TeamComponent } from "./pages/team/team.component";
import { GroupsComponent } from "./pages/groups/groups.component";
import { UsersComponent } from "./pages/users/users.component";
import { FixedConceptComponent } from "./pages/fixed-concept/fixed-concept.component";
import { VariableConceptComponent } from "./pages/variable-concept/variable-concept.component";

import { SubgroupsComponent } from "./pages/subgroups/subgroups.component";
import { FixedCostComponent } from "./pages/fixed-cost/fixed-cost.component";
import { ProjectsComponent } from "./pages/projects/projects.component";
import { BreakdownComponent } from "./pages/breakdown/breakdown.component";
import { BreakdownResumeComponent } from "./pages/breakdown-resume/breakdown-resume.component";
import { RowDifferencesComponent } from "./pages/breakdown-resume/row-differences/row-differences.component";
import { MonthReportComponent } from "./pages/month-report/month-report.component";
import { ProjectsReportComponent } from "./pages/projects-report/projects-report.component";
import { CompanyReportComponent } from "./pages/company-report/company-report.component";
import { MyCurrencyFormatterDirective } from "./directives/my-currency-formatter.directive";
import { MyCurrencyPipe } from "./directives/my-currency.pipe";
import { CurrencyPipe } from "./directives/currency.pipe";
import { FooterComponent } from "./components/footer/footer.component";
import { BudgetProjectComponent } from "./pages/breakdown/budget-project/budget-project.component";
import { MarginPipe } from "./directives/margin.pipe";
import { LinesSubconceptComponent } from "./pages/breakdown/lines-subconcept/lines-subconcept.component";
import { BudgetsComponent } from "./pages/budgets/budgets.component";
import { BudgetResumeComponent } from "./pages/budget-resume/budget-resume.component";
import { StatisticReportComponent } from "./pages/statistic-report/statistic-report.component";
import { ProjectReportStatusComponent } from "./pages/project-report-status/project-report-status.component";
import { SubconceptStandardComponent } from "./pages/subconcept-standard/subconcept-standard.component";
import { SummaryProjectsComponent } from "./pages/summary-projects/summary-projects.component";
import { BillingComponent } from "./pages/billing/billing.component";
import { BillingBreakdownComponent } from "./pages/billing-breakdown/billing-breakdown.component";
import { ProjectsSupervisorComponent } from "./pages/projects-supervisor/projects-supervisor.component";
import { CompanyReportNewComponent } from "./pages/company-report-new/company-report-new.component";
import { FixedCostNewComponent } from "./pages/fixed-cost-new/fixed-cost-new.component";
import { ProjectsNewComponent } from "./pages/projects-new/projects-new.component";
import { CustomersNewComponent } from "./pages/customers-new/customers-new.component";
import { CustomersEditComponent } from "./pages/customers-new/customers-edit/customers-edit.component";
import { ExpensesComponent } from "./pages/expenses/expenses.component";
import { RedNegDirective } from "./directives/red-neg.directive";
import { StorageComponent } from "./pages/storage/storage.component";
import { AutofocusDirective } from "./directives/autofocus.directive";
import { DemoComponent } from "./pages/demo/demo.component";
import { CalendarModule } from "angular-calendar";
import { CalendarioComponent } from "./pages/calendario/calendario.component";

@NgModule({
  declarations: [
    CalendarioComponent,
    AppComponent,
    LoginComponent,
    RememberComponent,
    PageNotFoundComponent,
    HeaderComponent,
    SettingComponent,
    CustomersComponent,
    TeamComponent,
    GroupsComponent,
    UsersComponent,
    FixedConceptComponent,
    VariableConceptComponent,
    SubgroupsComponent,
    FixedCostComponent,
    ProjectsComponent,
    BreakdownComponent,
    BreakdownResumeComponent,
    RowDifferencesComponent,
    MonthReportComponent,
    ProjectsReportComponent,
    CompanyReportComponent,
    MyCurrencyFormatterDirective,
    MyCurrencyPipe,
    CurrencyPipe,
    FooterComponent,
    BudgetProjectComponent,
    MarginPipe,
    LinesSubconceptComponent,
    BudgetsComponent,
    BudgetResumeComponent,
    StatisticReportComponent,
    ProjectReportStatusComponent,
    SubconceptStandardComponent,
    SummaryProjectsComponent,
    BillingComponent,
    BillingBreakdownComponent,
    ProjectsSupervisorComponent,
    CompanyReportNewComponent,
    FixedCostNewComponent,
    ProjectsNewComponent,
    CustomersNewComponent,
    CustomersEditComponent,
    ExpensesComponent,
    RedNegDirective,
    StorageComponent,
    AutofocusDirective,
    DemoComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CalendarModule.forRoot(),
    DropdownModule,
    AutoCompleteModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    DataTableModule,
    InputMaskModule,
    InputTextModule,
    TabViewModule,
    SharedModule,
    MultiSelectModule,
    MyDatePickerModule,
    DialogModule,
    NgUploaderModule,
    SimpleNotificationsModule.forRoot(),
    ChartsModule,
    ClickOutsideModule,
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    Configuration,
    TokenService,
    ApiService,
    Common,
    MyCurrencyPipe,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
