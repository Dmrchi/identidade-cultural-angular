// src/app/components/carrinho-compras/carrinho-compras.component.ts
import { Component, OnInit } from '@angular/core';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe o FormsModule aqui
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido/pedido.service';

export interface ItemPedidoRequest {
  produtoId: string; // Ou number, dependendo do tipo do seu ID no Java
  quantidade: number;
}

// Interface para a estrutura completa do pedido que será enviada
export interface PedidoRequest {
  clienteId:  string ; // ID do cliente logado
  //vendedorId: string ; // ID do vendedor (pode vir do produto)
  remote?: boolean; // Opcional
  dataPedido?: string; // string no formato ISO 8601 (ex: "2025-08-30T10:00:00")
  dataEntrega: string; // string no formato ISO 8601 (ex: "2025-08-30T10:00:00")
  enderecoEntregaId: string;
  itens: ItemPedidoRequest[];
}

// Interface para a resposta da API (o que o backend retorna)
export interface PedidoResponse {
  id: string; // ID do pedido criado
  dataCriacao: string;
  // Outros campos da resposta...
}

@Component({
  selector: 'app-carrinho-compras',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicione FormsModule ao array imports
  templateUrl: './carrinho-compras.component.html',
  styleUrl: './carrinho-compras.component.scss'
})
export class CarrinhoComprasComponent implements OnInit {
  carrinho: any[] = [];
  frete: number = 9.99; // Valor fixo do frete

  constructor(
    private carrinhoService: CarrinhoServiceService,
    private pedidoService: PedidoService,
    private router: Router
  ) {
  }
  finalizarCompra(): void {
    // O seu código já está correto. Vamos adicionar a tipagem
    if (this.carrinho.length === 0) {
      console.log('Carrinho vazio. Não é possível finalizar a compra.');
      return;
    }

    // Mapeia os itens do carrinho para o formato da interface 'ItemPedidoRequest'
    // O ': ItemPedidoRequest[]' garante que o array resultante terá o tipo correto
    this.carrinho =  this.carrinhoService.obterCarrinho();
    alert(this.carrinho);
    const itensPedido: ItemPedidoRequest[] = this.carrinho.map(item => ({
      produtoId: item.id,
      quantidade: item.quantidade
    }));

    // Cria a estrutura do pedido com a interface 'PedidoRequest'
    // O uso da interface garante que o objeto final terá todas as propriedades esperadas pelo backend
    const pedidoRequest: PedidoRequest = {
      clienteId: "",
      // Opcional: verifique se o primeiro item existe antes de tentar acessar 'vendedorId'
      //vendedorId: this.carrinho[0]?.vendedorId.toString() ,//|| 'UUID_DO_VENDEDOR_PADRAO' },
      remote: false,
      // O ideal é usar uma data dinâmica, não fixa
      dataEntrega: new Date().toISOString(),
      dataPedido: new Date().toISOString(),
      enderecoEntregaId: "",
      itens: itensPedido
    };

    // Chama o serviço com o objeto tipado
    this.pedidoService.criarPedido(pedidoRequest).subscribe({
      next: (response: PedidoResponse) => {
        console.log('Pedido criado com sucesso!', response);
        this.carrinhoService.limparCarrinho();
        // O `response.id` agora tem certeza que existe, graças à tipagem forte de 'PedidoResponse'
        this.router.navigate(['/confirmacao-pedido', response.id]);
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        // Exibe uma mensagem de erro mais detalhada, se possível
        if (error.error && error.error.message) {
          alert('Erro ao finalizar a compra: ' + error.error.message);
        } else {
          alert('Ocorreu um erro ao finalizar a compra. Tente novamente.');
        }
      }
    });
  }

  ngOnInit(): void {
    this.obterCarrinho();
  }

  obterCarrinho(): void {
    this.carrinho = this.carrinhoService.obterCarrinho();
    console.log('Carrinho de compras:', this.carrinho);
  }

  decrementarQuantidade(produto: any): void {
    this.carrinhoService.atualizarQuantidade(produto.id, produto.quantidade - 1);
    this.obterCarrinho();
  }

  incrementarQuantidade(produto: any): void {
    this.carrinhoService.atualizarQuantidade(produto.id, produto.quantidade + 1);
    this.obterCarrinho();
  }

  removerDoCarrinho(produtoId: number): void {
    this.carrinhoService.removerDoCarrinho(produtoId);
    this.obterCarrinho();
  }

  calcularSubtotal(): number {
    return this.carrinho.reduce((total, produto) => total + (produto.preco * produto.quantidade), 0);
  }
  limparCarrinho(): void {
      this.carrinho = []; // Resetar o array do carrinho para uma lista vazia
      //this.salvarCarrinho(); // Salvar a lista vazia no localStorage
    }
  calcularTotalComFrete(): number {
    return this.calcularSubtotal() + this.frete;
  }
}
