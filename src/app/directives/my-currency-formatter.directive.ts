import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
import { MyCurrencyPipe } from "./my-currency.pipe";

@Directive({ selector: "[myCurrencyFormatter]" })
export class MyCurrencyFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: MyCurrencyPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.currencyPipe.transform(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    console.log('prefocus:', this.el.value);
    this.el.value = this.currencyPipe.parse(value); // opossite of transform
    console.log('focus:', this.el.value);
    this.el.select();
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.currencyPipe.transform(value);
    console.log('blur:', this.el.value);
  }

}