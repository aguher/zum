import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthReportComponent } from './month-report.component';

describe('MonthReportComponent', () => {
  let component: MonthReportComponent;
  let fixture: ComponentFixture<MonthReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
