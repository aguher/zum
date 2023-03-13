import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubconceptStandardComponent } from './subconcept-standard.component';

describe('SubconceptStandardComponent', () => {
  let component: SubconceptStandardComponent;
  let fixture: ComponentFixture<SubconceptStandardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubconceptStandardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubconceptStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
