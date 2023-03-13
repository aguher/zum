import { Pipe, PipeTransform } from '@angular/core';
import {Common} from '../api/common';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  constructor(private _common: Common) {

  }

  transform(value: any, symbol: boolean): any {
    return this._common.currencyFormatES(value, symbol);
  }

}
