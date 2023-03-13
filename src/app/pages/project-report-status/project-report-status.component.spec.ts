import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReportStatusComponent } from './project-report-status.component';

describe('ProjectReportStatusComponent', () => {
  let component: ProjectReportStatusComponent;
  let fixture: ComponentFixture<ProjectReportStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectReportStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectReportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
