import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NotificationsService } from 'angular2-notifications';
import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';

import { dateMonthStr } from '../../models/dateMonthStr';
import { dateMonth } from '../../models/dateMonth';
import { TokenService } from '../../services/token.service';
import { Configuration } from '../../api/configuration';


@Component({
  selector: 'app-summary-projects',
  templateUrl: './summary-projects.component.html',
  styleUrls: ['./summary-projects.component.scss']
})
export class SummaryProjectsComponent implements OnInit, OnDestroy {
  role: number = null;
  id:number = null;
  info: any = {};
  values = null;
  private sub = null;

  constructor(
    private route: ActivatedRoute,
    private _api: ApiService,
    private _common: Common,
    private _notification: NotificationsService,
    private _token: TokenService,
    private _config: Configuration,
  ) { }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnInit() {
    this.role = parseInt(this._token.getInfo().role);

    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      let body = `id=${this.id}`;
      let id_project = `id_project=${this.id}`;
      this._api.getInfoCampaign(body).subscribe((response) => {
        if (response !== null) {
          this.info.campaign_code = response.info.campaign_code;
          this.info.campaign_name = response.info.campaign_name;
          this.info.creation_date = this._common.parseDatefromDate(response.info.creation_date);
          this.info.end_date = this._common.parseDatefromDate(response.info.end_date);

          this.info.customer = {
            id_customer: response.customer.id_customer,
            name: response.customer.customer,
            logo: response.customer.customer_logo,
            address: response.customer.customer_address,
            address_bis: response.customer.customer_address_bis,
            cif: response.customer.customer_cif
          };
          this.info.team = response.info.team;
          this.info.user = response.info.user;
          this.info.group = response.info.grupo;
          this.info.subgroup = response.info.subgroup;
          this.info.status = response.info.status;
          this._api.getBreakdownSupervisor(id_project).subscribe((response) => {
            this.values = response.report;
          });
        }
      });
    });
  }

}
