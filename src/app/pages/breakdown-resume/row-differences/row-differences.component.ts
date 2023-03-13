import {Component, Input} from '@angular/core';

@Component({
  selector: 'row-differences', 
  templateUrl: './row-differences.component.html', 
  styleUrls: ['./row-differences.component.scss']
})
export class RowDifferencesComponent {

  @Input()real;
  @Input()estimated;
  @Input()differences;
  @Input()labelTitle: string = "";
  @Input()header:boolean = true;
  @Input()symbol:string = "";

}
