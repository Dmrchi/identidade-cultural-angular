import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PedidoService } from '../../services/pedido/pedido.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

// Interfaces
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  foto: string | null;
  cpf: string | null;
  cnpj: string | null;
  telefone: string | null;
  pontos: number | null;
}

export interface ProdutoDetalhes {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  imagem: string | null;
}
export interface Endereco {
  id: string;
  rua: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  adicional?: string;
}
export interface Pedido {
  id: string;
  cliente: Usuario;
 // vendedor: Usuario;
  dataCriacao: string;
  dataEntrega: string;
  enderecoEntrega: Endereco;
  remote: boolean;
}

export interface ItemPedido {
  id: string;
  quantidade: number;
  produto: ProdutoDetalhes;
  pedido: Pedido;
  vendedor: Usuario;
  comprador: Usuario;
}

export interface PaginaResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', overflow: 'hidden', opacity: 0, display: 'none' })),
      state('expanded', style({ height: '*', overflow: 'hidden', opacity: 1, display: 'block' })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class PedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isToggled = signal(false);

  public tituloPagina = computed(() => (this.isToggled() ? 'Vendas' : 'Compras'));
  public expandedPedidoId = signal<string | null>(null);

  public page = signal(0);
  public size = signal(12);
  public totalElementos = signal(0);
  public totalPaginas = signal(0);
  public loading = signal(true);
  public pedidos = signal<ItemPedido[]>([]);
  public paginasVisiveis = signal<(number | null)[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const isVendas = params['estado'] === 'vendas';
      const pagina = params['page'] ? parseInt(params['page'], 10) : 0;
      this.isToggled.set(isVendas);
      this.page.set(pagina);
      this.fetchPedidos();
    });
  }

  fetchPedidos(): void {
    this.loading.set(true);
    const data$ = this.isToggled()
      ? this.pedidoService.buscarPedidosVendidos(this.page(), this.size())
      : this.pedidoService.buscarPedidosComprados(this.page(), this.size());

    data$.subscribe({
      next: (response: PaginaResponse<ItemPedido>) => {
        this.pedidos.set(response.content);
        console.log('Pedidos fetched:', response.content); // Depuração
        this.totalElementos.set(response.totalElements);
        this.totalPaginas.set(response.totalPages);
        this.gerarPaginasVisiveis();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar pedidos:', err);
        this.pedidos.set([]);
        this.loading.set(false);
      },
    });
  }

  toggle(): void {
    this.isToggled.update(value => {
      this.page.set(0);
      this.updateUrl(!value, 0);
      return !value;
    });
  }

  irParaPagina(numeroPagina: number | null): void {
    if (numeroPagina !== null && numeroPagina !== this.page()) {
      this.page.set(numeroPagina);
      this.updateUrl(this.isToggled(), numeroPagina);
    }
  }

  proximaPagina(): void {
    if (this.page() < this.totalPaginas() - 1) {
      const nextPage = this.page() + 1;
      this.page.set(nextPage);
      this.updateUrl(this.isToggled(), nextPage);
    }
  }

  paginaAnterior(): void {
    if (this.page() > 0) {
      const prevPage = this.page() - 1;
      this.page.set(prevPage);
      this.updateUrl(this.isToggled(), prevPage);
    }
  }

  private updateUrl(isToggledValue: boolean, page: number): void {
    const estado = isToggledValue ? 'vendas' : 'compras';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado, page },
      queryParamsHandling: 'merge',
    });
  }

  gerarPaginasVisiveis(): void {
    const paginasParaExibir: Set<number> = new Set();
    const paginasTotais = this.totalPaginas();
    const paginaAtual = this.page();

    if (paginasTotais > 0) paginasParaExibir.add(0);
    for (let i = -2; i <= 2; i++) {
      const pagina = paginaAtual + i;
      if (pagina >= 0 && pagina < paginasTotais) {
        paginasParaExibir.add(pagina);
      }
    }
    if (paginasTotais > 1) paginasParaExibir.add(paginasTotais - 1);

    const paginasOrdenadas = Array.from(paginasParaExibir).sort((a, b) => a - b);
    const paginasComReticencias: (number | null)[] = [];
    let ultimaPaginaAdicionada = -1;

    paginasOrdenadas.forEach(pagina => {
      if (pagina > ultimaPaginaAdicionada + 1) {
        paginasComReticencias.push(null);
      }
      paginasComReticencias.push(pagina);
      ultimaPaginaAdicionada = pagina;
    });

    this.paginasVisiveis.set(paginasComReticencias);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  redirecionarParaPerfil(email: string): void {
  // Constrói a URL com o e-mail como parâmetro de consulta
  const url = `/perfil-usuario?email=${email}`;

  // Redireciona o navegador para a nova URL
  window.location.href = url;
  }

  verDetalhesPedido(pedidoId: string): void {
    console.log('Toggling details for pedido ID:', pedidoId); // Depuração
    this.expandedPedidoId.update(currentId => {
      console.log('Current expanded ID:', currentId, 'New ID:', pedidoId); // Depuração
      return currentId === pedidoId ? null : pedidoId;
    });
  }
}
