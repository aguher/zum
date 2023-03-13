import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesSubconceptComponent } from './lines-subconcept.component';

describe('LinesSubconceptComponent', () => {
  let component: LinesSubconceptComponent;
  let fixture: ComponentFixture<LinesSubconceptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinesSubconceptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinesSubconceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
