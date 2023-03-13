import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedCostComponent } from './fixed-cost.component';

describe('FixedCostComponent', () => {
  let component: FixedCostComponent;
  let fixture: ComponentFixture<FixedCostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedCostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
