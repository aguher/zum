import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { TokenService } from "../services/token.service";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private auth: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let roleUser = 0;
    if (this.tokenService.getInfo()) {
      roleUser = parseInt(this.tokenService.getInfo().role);
    }

    let url = state.url.split("/")[1];

    url = url.split("/")[0];

    switch (url) {
      case "factura":
      case "facturas":
        return (roleUser === 3 || roleUser === 5) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "conceptos-fijos":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "conceptos-variables":
        return (roleUser === 3 || roleUser === 5) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "costes-fijos":
        return (roleUser === 3 || roleUser === 4) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "costes-fijos-old":
        return (roleUser === 3 || roleUser === 4) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "usuarios":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "clientes":
        return (roleUser === 3 ||
          roleUser === 5 ||
          roleUser === 9 ||
          roleUser === 10 ||
          roleUser === 11) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "equipos":
        return (roleUser === 3 || roleUser === 5) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "grupos":
        return (roleUser === 3 || roleUser === 5) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "subgrupos":
        return (roleUser === 3 || roleUser === 5) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "configuracion":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-proyectos":
        return (roleUser === 3 || roleUser === 4) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-mensual":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-empresa":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-empresa-old":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-proyectos-estado":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "informe-estadistico":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "proyecto":
        return roleUser === 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "desglose":
        return localStorage.getItem("token") ? true : this.userNotAllowed();
      case "resumen":
        return localStorage.getItem("token") ? true : this.userNotAllowed();
      case "remember":
        return localStorage.getItem("token") ? true : this.userNotAllowed();
      case "listado-proyectos":
        if (roleUser === 6 && localStorage.getItem("token")) {
          return true;
        } else {
          this.userNotAllowed();
        }
      case "proyectos":
        if (localStorage.getItem("token") && roleUser === 6) {
          this.router.navigate(["/listado-proyectos"]);
          return false;
        }
        return roleUser >= 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "proyectos":
        if (localStorage.getItem("token") && roleUser === 6) {
          this.router.navigate(["/listado-proyectos"]);
          return false;
        }
        return roleUser >= 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "compras":
        if (localStorage.getItem("token") && roleUser === 6) {
          this.router.navigate(["/compras"]);
          return false;
        }
        return roleUser >= 3 && localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "subconceptos-standard":
        return (roleUser === 3 ||
          roleUser === 5 ||
          roleUser === 6 ||
          roleUser === 9 ||
          roleUser === 10 ||
          roleUser === 11) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "almacen":
        return (roleUser === 3 ||
          roleUser === 5 ||
          roleUser === 6 ||
          roleUser === 9 ||
          roleUser === 10 ||
          roleUser === 11) &&
          localStorage.getItem("token")
          ? true
          : this.userNotAllowed();
      case "presupuestos":
      case "presupuesto":
        return true;
      case "demo":
        return true;
      case "calendario":
        return true;
      case "":
        if (roleUser > 3 && localStorage.getItem("token")) {
          this.router.navigate(["/proyectos"]);
        } else if (roleUser === 3 && localStorage.getItem("token")) {
          this.router.navigate(["/proyectos"]);
        } else {
          this.userNotAllowed();
        }
    }
  }

  userNotAllowed() {
    // not logged in so redirect to login page
    alert("El usuario no tiene permisos");
    this.auth.logout();
    this.router.navigate(["/login"]);
    return false;
  }
}
