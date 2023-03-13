import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsSupervisorComponent } from './projects-supervisor.component';

describe('ProjectsSupervisorComponent', () => {
  let component: ProjectsSupervisorComponent;
  let fixture: ComponentFixture<ProjectsSupervisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsSupervisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
