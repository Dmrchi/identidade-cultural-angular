import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarVendasComponent } from './gerenciar-vendas.component';

describe('GerenciarVendasComponent', () => {
  let component: GerenciarVendasComponent;
  let fixture: ComponentFixture<GerenciarVendasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarVendasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GerenciarVendasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
