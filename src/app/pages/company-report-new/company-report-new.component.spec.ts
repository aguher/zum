import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyReportNewComponent } from './company-report-new.component';

describe('CompanyReportNewComponent', () => {
  let component: CompanyReportNewComponent;
  let fixture: ComponentFixture<CompanyReportNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyReportNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyReportNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
