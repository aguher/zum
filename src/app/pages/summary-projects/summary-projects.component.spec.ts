import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryProjectsComponent } from './summary-projects.component';

describe('SummaryProjectsComponent', () => {
  let component: SummaryProjectsComponent;
  let fixture: ComponentFixture<SummaryProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
