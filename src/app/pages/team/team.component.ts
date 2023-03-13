import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { ApiService } from '../../services/api.service';
import { Common } from '../../api/common';
import { AuthenticationService } from '../../services/authentication.service';
import { Configuration } from '../../api/configuration';

import * as _ from "lodash";

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  pagination: number;
  idSelected: number = null;
  teams: any = [];
  originalTeams: any = [];
  selectedTeam: any;
  displayDialog: boolean;
  displayPagination: boolean = false;
  displayDialogDelete: boolean;
  emptyMsg: string = "No hay equipos añadidos. Añade tu primer equipo en el formulario anterior";
  model: any = {
    teamName: ''
  };
  constructor(
    private _notification: NotificationsService,
    private _api: ApiService,
    private _auth: AuthenticationService,
    private _router: Router,
    private _config: Configuration,
    private _common: Common
  ) { }

  ngOnInit() {
    this.pagination = this._config.pagination;

    this._api.getTeams().subscribe((response) => {
      if (response !== null) {
        if (response.error) {
          this._auth.logout();
          this._router.navigate(['/login']);
        } else if (response.status === 'error') {
          this._notification.error("Aviso!", response.msg);
        } else {
          this.teams = (response.items) ? response.items : null;
          this.originalTeams = _.cloneDeep(response.items);
          this.displayPagination = (this.teams.length > this.pagination);
        }
      }

    });

  }

  selectTeam(team) {
    this.displayDialog = true;
    this.selectedTeam = team;
  }
  cancelEdition() {
    this.displayDialog = false;
    this.teams = this.originalTeams;
  }

  addTeam() {
    let idCompany = this._common.getIdCompanySelected();
    if (!idCompany) {
      this._notification.error('¡Aviso!', 'Debes seleccionar una empresa desde el menu de selección.');
    } else {
      if (this.model.teamName) {
        let body;
        body = 'team_name=' + this.model.teamName;
        body += '&id_company=' + idCompany;
        this._api.insertTeam(body).subscribe((response) => {
          if (response.status === 'ok') {
            this._notification.success('¡Éxito!', 'Se ha añadido el equipo');
            this.teams.unshift(response.items[0]);
            this.teams = [...this.teams];
            this.model.teamName = '';
          } else {
            this._notification.error('¡Error!', response.msg);
          }

        });
      } else {
        this._notification.error('¡Aviso!', 'Debes rellenar los datos correctamente');
      }
    }
  }

  updateApi(id) {
    let body = '';
    this.idSelected = parseInt(this.selectedTeam.id, 10);
    body = 'id=' + this.selectedTeam.id + '&team_name=' + this.selectedTeam.team_name;
    this._api.updateTeam(body).subscribe((response) => this.parseUpdate(response));
  }

  parseUpdate(response) {
    if (response.status === 'ok') {
      this.displayDialog = false;
      this._notification.success('¡Éxito!', 'Se ha actualizado el equipo');
      this.originalTeams = _.cloneDeep(this.teams);
    } else {
      this.teams = [...response.items];
      this.displayDialog = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

  deleteTeam(team) {
    this.displayDialogDelete = true;
    this.selectedTeam = team;
  }

  deleteApi(id) {
    this.idSelected = parseInt(this.selectedTeam.id, 10);
    this._api.deleteTeam(this.idSelected).subscribe((response) => this.parseDeleted(response));
  }

  parseDeleted(response) {
    if (response.status === 'ok') {
      let idx = _.findIndex(this.teams, (o) => { return o.id == this.idSelected; });
      this.teams.splice(idx, 1);
      this.teams = [...this.teams];
      this.displayDialogDelete = false;
      this._notification.success('¡Éxito!', 'Se ha eliminado el equipo');
    } else {
      this.displayDialogDelete = false;
      this._notification.error('¡Error!', response.msg);
    }
  }

}
