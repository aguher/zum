import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedCostNewComponent } from './fixed-cost-new.component';

describe('FixedCostNewComponent', () => {
  let component: FixedCostNewComponent;
  let fixture: ComponentFixture<FixedCostNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedCostNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedCostNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
