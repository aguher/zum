import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-budget-resume',
  templateUrl: './budget-resume.component.html',
  styleUrls: ['./budget-resume.component.scss']
})
export class BudgetResumeComponent implements OnInit {
  idBudget = null;
  info: any = {};

  constructor(
    private route: ActivatedRoute,
    private _api: ApiService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let body = `id=${+params['id']}`;
      this._api.getInfoBudget(body).subscribe((response) => {
        if (response !== null) {
          this.info.campaign_code = response.info.id;
          this.info.campaign_name = response.info.name;
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
          
          this.idBudget = +params['id']; 
        }
      });

      
    });
  }

}
