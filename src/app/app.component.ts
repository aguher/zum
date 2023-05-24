import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";

import { TokenService } from "./services/token.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  removeMenu: boolean = false;
  role = "";
  public options = {
    timeOut: 2000,
    lastOnBottom: true,
    clickToClose: true,
    maxLength: 0,
    maxStack: 7,
    showProgressBar: true,
    pauseOnHover: false,
    preventDuplicates: false,
    preventLastDuplicates: "visible",
    rtl: false,
    animate: "fromRight",
    position: ["right", "bottom"],
  };
  constructor(private _route: Router, private _token: TokenService) {
    this._route.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        (val.url === "/login" || val.url === "/remember")
      ) {
        this.removeMenu = true;
      } else {
        this.removeMenu = false;
      }
    });
    this.role =
      this._token.getInfo() && this._token.getInfo().role
        ? this._token.getInfo().role
        : "0";
  }

  getClasses() {
    let cssClasses = {
      container: !this.removeMenu,
      "full-container": this.removeMenu,
      [this.role]: true,
    };
    return cssClasses;
  }
}
