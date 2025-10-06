import { TestBed } from '@angular/core/testing';

import { CarrinhoServiceService } from './carrinho-service.service';

describe('CarrinhoServiceService', () => {
  let service: CarrinhoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrinhoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
