import { Pipe, PipeTransform } from "@angular/core";

const PADDING = "000000";

@Pipe({ name: "myCurrency" })
export class MyCurrencyPipe implements PipeTransform {

  private DECIMAL_SEPARATOR: string;
  private THOUSANDS_SEPARATOR: string;

  constructor() {
    // TODO comes from configuration settings
    this.DECIMAL_SEPARATOR = ",";
    this.THOUSANDS_SEPARATOR = ".";
  }

  transform(value, fractionSize: number = 2): string {
    let [ integer, fraction = "" ] = (value || "").toString()
      .split('.');

    fraction = fraction.replace(/[a-zA-Z]+/g, '');
    fraction = fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : "";
    
    integer = integer.replace(/[a-zA-Z]+/g, '');    
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);

    return integer + fraction;
  }

  parse(value: string, fractionSize: number = 2): string {
    let [ integer, fraction = "" ] = (value || "").split(this.DECIMAL_SEPARATOR);

    integer = integer.replace(/\./g, "");

    if (fraction === '') {
      fraction = '.' + (fraction + PADDING).substring(0, fractionSize)
    } else {
      fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
      ? '.' + (fraction + PADDING).substring(0, fractionSize)
      : "";
    }
    

    return integer + fraction;
  }

}