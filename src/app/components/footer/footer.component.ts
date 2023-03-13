import { Component, OnInit } from '@angular/core';
import * as data from '../../../../package.json';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year: number = -1;
  version: String = '0';
  constructor() { }

  ngOnInit() {
    this.year = new Date().getFullYear();
    this.version = (<any>data).version;
  }

}
