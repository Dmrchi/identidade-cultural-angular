import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BazarPublicoComponent } from './bazar-publico.component';

describe('BazarPublicoComponent', () => {
  let component: BazarPublicoComponent;
  let fixture: ComponentFixture<BazarPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BazarPublicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BazarPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
