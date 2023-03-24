import { Injectable, EventEmitter } from "@angular/core";
import { Http, Headers, Response, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import { environment } from "environments/environment";

import { TokenService } from "./token.service";
const PORT = ":8081";

@Injectable()
export class AuthenticationService {
  public isLogged$;
  baseUrl = environment.urlServer;
  constructor(private http: Http, private _token: TokenService) {
    this.isLogged$ = new EventEmitter();
  }

  login(email: string, password: string) {
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    let body = "email=" + email + "&pwd=" + password;
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(this.baseUrl + "login", body, options)
      .map((response: any) => {
        // login successful if there's a jwt token in the response
        let user = response.json();
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem("token", user.token);
          let infoToken = this._token.getInfo();
          if (user.company) {
            localStorage.setItem(
              "selectedCompany",
              JSON.stringify({
                label: user.company.name,
                value: {
                  id: user.company.id_company,
                  name: user.company.name,
                  address: user.company.address,
                  address_bis: user.company.address_bis,
                  cif: user.company.cif,
                  logo: user.company.logo,
                  phone: user.company.phone,
                  credits: user.company.credits,
                  rgpd: user.company.rgpd,
                },
              })
            );
            localStorage.setItem(
              "selectedFiscalYear",
              JSON.stringify({
                label: user.fiscal_year.year,
                value: { id: user.fiscal_year.id, name: user.fiscal_year.name },
              })
            );
          } else {
            localStorage.setItem(
              "selectedCompany",
              JSON.stringify({
                label: infoToken.company_name,
                value: {
                  id: infoToken.id_company,
                  name: infoToken.company_name,
                },
              })
            );
          }
          this.isLogged$.emit(true);
        }
        return user;
      });
  }

  remember(email: string) {
    let headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    });
    let body = "email=" + email;
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(this.baseUrl + "remember", body, options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        let user = response.json();
        return user;
      });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("token");
    // TODO: habra que quitar esta opcion, porque cuando se desloga porque la sesión se ha acabado, elimina
    // los valores, y hay que volver a seleccionar. En la tabla del usuario habra que poner la ultima compañia y año seleccionados
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("selectedFiscalYear");
    this.isLogged$.emit(false);
  }
}
