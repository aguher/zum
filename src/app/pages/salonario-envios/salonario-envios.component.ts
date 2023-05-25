import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { NotificationsService } from "angular2-notifications";
import { Configuration } from "app/api/configuration";
import { ApiService } from "app/services/api.service";
import { IMyDateModel } from "mydatepicker";

import { AuthenticationService } from "../../services/authentication.service";

@Component({
  selector: "app-salonario-envios",
  templateUrl: "./salonario-envios.component.html",
  styleUrls: ["./salonario-envios.component.scss"],
})
export class SalonarioEnviosComponent implements OnInit {
  id;
  loading = true;
  router;
  infoSalonario;
  infoOrder;
  myDatePickerOptions = this._config.myDatePickerOptions;
  contactName = "";
  constructor(
    private _notification: NotificationsService,
    private route: ActivatedRoute,
    private _api: ApiService,
    private _router: Router,
    private _config: Configuration
  ) {
    this.router = _router;
  }
  goToOrder() {
    this._router.navigate(["/desglose", this.id]);
  }

  ngOnInit() {
    let idOrder = undefined;
    this.route.paramMap.subscribe((params: ParamMap) => {
      idOrder = params.get("id_order");
      this.id = idOrder;
    });
    this._api.getOrderSalonarioEnvio(idOrder).subscribe((response) => {
      if (response.status === "ok") {
        this.infoOrder = response.order;

        this.infoSalonario = {
          date_shipment: response.salonario
            ? response.salonario.date_shipment
            : response.order.start_date_event,
          date_return: response.salonario
            ? response.salonario.date_return
            : response.order.end_date_event,
          method_shipment: response.salonario
            ? response.salonario.method_shipment
            : response.order.shipping_method,
          method_return: response.salonario
            ? response.salonario.method_return
            : response.order.shipping_method_return,
          contact_name: response.salonario
            ? response.salonario.contact_name
            : response.order.contact,
          address: response.salonario ? response.salonario.address : " ",
          postal_code: response.salonario
            ? response.salonario.postal_code
            : " ",
          city: response.salonario ? response.salonario.city : " ",
          phone_number: response.salonario
            ? response.salonario.phone_number
            : " ",
          observations: response.salonario
            ? response.salonario.observations
            : " ",
          package_number: response.salonario
            ? response.salonario.packages_number
            : " ",
          employee: response.salonario ? response.salonario.employee : " ",
          made_by: response.salonario ? response.salonario.made_by : " ",
          incidents: response.salonario ? response.salonario.incidents : " ",
        };

        this.infoSalonario = {
          ...this.infoSalonario,
          date_shipment: {
            date: {
              year: parseInt(this.infoSalonario.date_shipment.split("-")[0]),
              month: parseInt(this.infoSalonario.date_shipment.split("-")[1]),
              day: parseInt(this.infoSalonario.date_shipment.split("-")[2]),
            },
          },
          date_return: {
            date: {
              year: parseInt(this.infoSalonario.date_return.split("-")[0]),
              month: parseInt(this.infoSalonario.date_return.split("-")[1]),
              day: parseInt(this.infoSalonario.date_return.split("-")[2]),
            },
          },
        };
        this.loading = false;
      }
    });
  }

  onDateShipmentChanged(event: IMyDateModel) {
    this.infoSalonario.date_shipment = event.date;
  }
  onDateReturnChanged(event: IMyDateModel) {
    this.infoSalonario.date_return = event.date;
  }

  onUpdateForm(event, field) {
    this.infoSalonario[field] = event;
  }

  onSave() {
    console.log(this.infoSalonario);
    this._api
      .saveOrderSalonarioEnvio(this.id, this.infoSalonario)
      .subscribe((response) => {
        if (response.status === "ok") {
          this._notification.success(
            "¡Éxito!",
            "Se ha guardado satisfactoriamente"
          );
        } else {
          this._notification.error(
            "¡Error!",
            "No se ha podido guardar el salonario"
          );
        }
      });
  }
}
