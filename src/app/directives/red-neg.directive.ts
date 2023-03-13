import { Directive, ElementRef, HostListener, DoCheck } from '@angular/core';

@Directive({
  selector: '[appRedNeg]'
})
export class RedNegDirective {

  constructor(private el: ElementRef) {
    //this.el.nativeElement.style.backgroundColor = this.highlightColor || this.defaultColor;
  }

  ngDoCheck() {
    this.highlight('red');
  }

  private highlight(color: string) {
    if (parseInt(this.el.nativeElement.innerText)<0 ){
      this.el.nativeElement.style.color = color;
    }else{
      this.el.nativeElement.style.color = "";
    }
  }

}
