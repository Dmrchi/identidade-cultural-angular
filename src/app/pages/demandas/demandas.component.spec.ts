import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandasComponent } from './demandas.component';

describe('DemandasComponent', () => {
  let component: DemandasComponent;
  let fixture: ComponentFixture<DemandasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
