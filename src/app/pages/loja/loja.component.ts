import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChildren, QueryList, ElementRef, signal, computed } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProdutoService } from '../../services/produto/produto.service';
import { UsuariosService } from '../../services/usuario/usuarios.service';
import { Usuario } from '../pedidos/pedidos.component';
import { Produto } from '../detalhes-produto/detalhes-produto.component';

// Interface do Produto, conforme fornecido


@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loja.component.html',
  styleUrl: './loja.component.scss'
})
export class LojaComponent implements OnInit { 
  
  // Referências para os carrosséis no DOM, usando ViewChildren
  @ViewChildren('carouselContainer') carouselContainers!: QueryList<ElementRef>;
  
  // Lista de produtos completa, usando um signal para reatividade
  produtos = signal<Produto[]>([]);
  usuario: Usuario | null = null;
  
  // Computed signals para dividir a lista de produtos em duas metades
  metade1 = computed(() => {
    const todosProdutos = this.produtos();
    if (todosProdutos.length <= 8) {
      return todosProdutos;
    }
    const meio = Math.ceil(todosProdutos.length / 2);
    return todosProdutos.slice(0, meio);
  });

  metade2 = computed(() => {
    const todosProdutos = this.produtos();
    if (todosProdutos.length <= 8) {
      return [];
    }
    const meio = Math.ceil(todosProdutos.length / 2);
    return todosProdutos.slice(meio);
  });

  // Signals para controlar a visibilidade dos botões, um par para cada carrossel
  showPrevButtonTop = signal(false);
  showNextButtonTop = signal(true);
  showPrevButtonBottom = signal(false);
  showNextButtonBottom = signal(true);
  
  constructor(
    private router: Router,
    private produtoService: ProdutoService,
    private usuarioService: UsuariosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const lojaEmail = params['loja'];
      if (lojaEmail) {
        this.carregarProdutosLoja(lojaEmail);
        this.carregarDonoLoja(lojaEmail)
      }
    });
  }
  // Método para carregar os produtos do service
  carregarProdutosLoja(email: string): void {

    this.produtoService.getProdutosLoja(email).subscribe({
      next: (data) => {
        // Atualiza o signal com os dados recebidos do service
        this.produtos.set(data); 
      },
      error: (error: HttpErrorResponse) => {
        // Trata erros de autenticação aqui, no componente
        if (error.status === 401 || error.status === 403 || error.message.includes('Não autenticado')) {
          this.router.navigate(['/login']);
        } else {
          console.error('Erro ao carregar produtos:', error);
        }
      }
    });
  }
  carregarDonoLoja(email: string): void {
        this.usuarioService.getProdutosLoja(email).subscribe({
      next: (data) => {
        // Atualiza o signal com os dados recebidos do service
        this.usuario = data; 
      },
      error: (error: HttpErrorResponse) => {
        // Trata erros de autenticação aqui, no componente
        if (error.status === 401 || error.status === 403 || error.message.includes('Não autenticado')) {
          this.router.navigate(['/login']);
        } else {
          console.error('Erro ao carregar produtos:', error);
        }
      }
    });
  }
  // Método de scroll que recebe o índice do carrossel para ser movido
  scroll(direction: 'left' | 'right', carouselIndex: number) {
    const container = this.carouselContainers.get(carouselIndex)?.nativeElement;
    if (container) {
      const scrollAmount = direction === 'right' ? container.clientWidth : -container.clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  // Método que atualiza o estado dos botões de acordo com a posição do scroll
  onScroll(event: Event, carouselIndex: number) {
    const container = event.target as HTMLElement;
    if (container) {
      const isAtStart = container.scrollLeft <= 5;
      const isAtEnd = Math.abs(container.scrollWidth - container.scrollLeft - container.clientWidth) <= 5;

      if (carouselIndex === 0) {
        this.showPrevButtonTop.set(!isAtStart);
        this.showNextButtonTop.set(!isAtEnd);
      } else if (carouselIndex === 1) {
        this.showPrevButtonBottom.set(!isAtStart);
        this.showNextButtonBottom.set(!isAtEnd);
      }
    }
  }
}
