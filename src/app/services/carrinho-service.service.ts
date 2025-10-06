import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoServiceService {

  // O BehaviorSubject irá armazenar a lista do carrinho e emitir atualizações
  private carrinhoSubject = new BehaviorSubject<any[]>([]);
  public carrinho$: Observable<any[]> = this.carrinhoSubject.asObservable();
  
  constructor() {
    this.carregarCarrinho();
  }

  private salvarCarrinho(): void {
    sessionStorage.setItem('carrinho', JSON.stringify(this.carrinhoSubject.value));
    this.carrinhoSubject.next(this.carrinhoSubject.value); // Notifica os inscritos sobre a mudança
  }

  private carregarCarrinho(): void {
    const carrinhoSalvo = sessionStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinhoSubject.next(JSON.parse(carrinhoSalvo));
    }
  }

  private gerarIdUnico(): number {
    return Math.floor(Math.random() * 1000000);
  }

  adicionarAoCarrinho(produto: any): void {
    const carrinhoAtual = this.carrinhoSubject.value;
    const itemExistente = carrinhoAtual.find(item => item.nome === produto.nome);
    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      produto.id = produto.id || null;
      carrinhoAtual.push({ ...produto, quantidade: 1 });
    }
    this.salvarCarrinho();
  }

  removerDoCarrinho(produtoId: number): void {
    const carrinhoAtual = this.carrinhoSubject.value;
    const carrinhoFiltrado = carrinhoAtual.filter(item => item.id !== produtoId);
    this.carrinhoSubject.next(carrinhoFiltrado);
    this.salvarCarrinho();
  }
  limparCarrinho(): void { 
    localStorage.setItem('carrinho', JSON.stringify([]));

    console.log('Carrinho limpo.');
  }
  atualizarQuantidade(produtoId: number, quantidade: number): void {
    const carrinhoAtual = this.carrinhoSubject.value;
    const itemExistente = carrinhoAtual.find(item => item.id === produtoId);
    if (itemExistente) {
      itemExistente.quantidade = quantidade;
      if (itemExistente.quantidade <= 0) {
        this.removerDoCarrinho(produtoId);
      } else {
        this.salvarCarrinho();
      }
    }
  }

  obterCarrinho(): any[] {
    return this.carrinhoSubject.value;
  }
}
