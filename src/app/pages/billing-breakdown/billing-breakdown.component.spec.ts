import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingBreakdownComponent } from './billing-breakdown.component';

describe('BillingBreakdownComponent', () => {
  let component: BillingBreakdownComponent;
  let fixture: ComponentFixture<BillingBreakdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingBreakdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
