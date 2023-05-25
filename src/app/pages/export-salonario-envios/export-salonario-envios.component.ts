import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { Configuration } from "app/api/configuration";
import { ApiService } from "app/services/api.service";
import { saveAs } from "file-saver";
import { IMyDateModel } from "mydatepicker";
import { utils, write, WorkBook } from "xlsx";

@Component({
  selector: "app-export-salonario-envios",
  templateUrl: "./export-salonario-envios.component.html",
  styleUrls: ["./export-salonario-envios.component.scss"],
})
export class ExportSalonarioEnviosComponent implements OnInit {
  router;
  start_date;
  end_date;
  myDatePickerOptions = this._config.myDatePickerOptions;
  constructor(
    private _notification: NotificationsService,
    private route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _config: Configuration
  ) {
    this.router = _router;
  }

  ngOnInit() {
    let idOrder = undefined;
    this.route.paramMap.subscribe((params: ParamMap) => {
      idOrder = params.get("id_article");
    });
  }

  onDateStartChanged(event: IMyDateModel) {
    this.start_date = event.date;
  }
  onDateEndChanged(event: IMyDateModel) {
    this.end_date = event.date;
  }

  exportExcel(): void {
    console.log(this.start_date, this.end_date);
    if (this.start_date === undefined || this.end_date === undefined) {
      this._notification.error("¡Error!", "Las fechas no pueden estar vacias");
      return null;
    }

    if (this.start_date.epoc > this.end_date.epoc) {
      this._notification.error(
        "¡Error!",
        "La fecha de inicio tiene que ser menos que la de fin"
      );
      return null;
    }

    const start = `${this.start_date.date.year}-${this.start_date.date.month}-${this.start_date.date.day}`;
    const end = `${this.end_date.date.year}-${this.end_date.date.month}-${this.end_date.date.day}`;

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }

    let exportData = [];
    this._api.getSalonariosBetweenDates(start, end).subscribe((response) => {
      if (response.data.length === 0) {
        this._notification.warn(
          "¡Aviso!",
          "No hay salonarios entre las fechas elegidas"
        );
      } else {
        response.data.forEach((line) => {
          exportData.push({
            "Cod Pedido": line.ped_code,
            "Fecha de envío": `${line.date_shipment.split("-")[2]}-${
              line.date_shipment.split("-")[1]
            }-${line.date_shipment.split("-")[0]}`,
            "Método envío": line.method_shipment,
            "Nombre de contacto": line.contact_name,
            Dirección: line.address,
            "Cod Postal": line.postal_code,
            Población: line.city,
            Teléfono: line.phone_number,
            Observaciones: line.observations,
            "Nº Bultos": line.packages_number,
            "Fecha de retorno": `${line.date_return.split("-")[2]}-${
              line.date_return.split("-")[1]
            }-${line.date_return.split("-")[0]}`,
            "Método retorno": line.method_return,
            Empleado: line.employee,
            Realizado: line.made_by,
            "Incidencias envío": line.incidents,
          });
        });

        let ws_name = "";
        console.log(exportData);
        ws_name = "Listado de salonarios";

        const wb: WorkBook = { SheetNames: [], Sheets: {} };
        const ws: any = utils.json_to_sheet(exportData);

        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;

        const wbout = write(wb, {
          bookType: "xlsx",
          bookSST: true,
          type: "binary",
        });

        saveAs(
          new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
          `salonario-envios.xlsx`
        );
        this._notification.success("¡Éxito!", "Se ha generado el listado");
      }
    });
  }
}
