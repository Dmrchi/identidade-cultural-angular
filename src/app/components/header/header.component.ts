import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, NgModule } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/autenticacao/auth.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  produtos: any[] = [
    { nome: 'Caneca Personalizada', foto: 'https://http2.mlstatic.com/D_NQ_NP_743292-MLU70464443042_072023-O.webp', valor: 13.20, descricao: 'Uma caneca simples e personalizada', categoria: 0 },
    // Adicione mais produtos aqui
  ];

  carrinho: any[] = [];
  private carrinhoSubscription: Subscription | undefined;

  constructor(private carrinhoService: CarrinhoServiceService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.logginSucess().subscribe(() => {
      setTimeout(() => {
        initFlowbite();
      }, 0);
    });
    // Inscreve-se no Observable carrinho$ para atualizar automaticamente
    this.carrinhoSubscription = this.carrinhoService.carrinho$.subscribe(carrinho => {
      this.carrinho = carrinho;
    });
  }
  estaLogado(): boolean {
    return this.authService.isLoggedIn();
  }
  deslogar() {
    this.authService.removeToken();
    const url = `/`;
  
    // Redireciona o navegador para a nova URL
    window.location.href = url;

  }
  ngOnDestroy(): void {
    // Cancela a subscrição para evitar memory leaks
    if (this.carrinhoSubscription) {
      this.carrinhoSubscription.unsubscribe();
    }
  }

  adicionarAoCarrinho(produto: any): void {
    this.carrinhoService.adicionarAoCarrinho(produto);
    // Não precisa chamar obterCarrinho(), pois o carrinho$ já atualiza
  }

  removerDoCarrinho(produtoId: number): void {
    this.carrinhoService.removerDoCarrinho(produtoId);
    // Não precisa chamar obterCarrinho(), pois o carrinho$ já atualiza
  }

  atualizarQuantidade(produtoId: number, quantidade: number): void {
    this.carrinhoService.atualizarQuantidade(produtoId, quantidade);
    // Não precisa chamar obterCarrinho(), pois o carrinho$ já atualiza
  }
}