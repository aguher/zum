import {Pipe, PipeTransform} from '@angular/core';
import {Common} from '../api/common';

@Pipe({name: 'margin'})
export class MarginPipe implements PipeTransform {

  constructor(private _common : Common) {}

  transform(value : any, symbol : boolean) : any {
    return this
      ._common
      .currency(value);
  }
}
