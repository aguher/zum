import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { ApiService } from "app/services/api.service";

@Component({
  selector: "app-export-salonario-envios",
  templateUrl: "./export-salonario-envios.component.html",
  styleUrls: ["./export-salonario-envios.component.scss"],
})
export class ExportSalonarioEnviosComponent implements OnInit {
  router;

  constructor(
    private route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router
  ) {
    this.router = _router;
  }

  ngOnInit() {
    let idOrder = undefined;
    this.route.paramMap.subscribe((params: ParamMap) => {
      idOrder = params.get("id_article");
    });
  }
}
