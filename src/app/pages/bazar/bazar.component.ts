import { CommonModule, NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/autenticacao/auth.service';
import { Router } from '@angular/router';
import { Categoria } from '../detalhes-produto/detalhes-produto.component';

export interface Produto {
  id?: string;
  nome: string;
  descricao: string;
  categoria: Categoria;
  preco: number;
  quantidade: number;
  data_criacao: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}


export interface Item {
  label: string;
  imagem: string;
}

@Component({
  selector: 'app-bazar',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, FontAwesomeModule, CommonModule, NgOptimizedImage],
  templateUrl: './bazar.component.html',
  styleUrl: './bazar.component.scss'
})
export class BazarComponent implements OnInit {
  @ViewChild('productList') productList: ElementRef | undefined;
  query: string = '';
  results: string[] = [];
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  // Propriedades de paginação
  page = 0;
  size = 12;
  totalElementos = 0;
  totalPaginas = 0;
  paginasVisiveis: (number | null)[] = []; // Array que armazena os números das páginas a serem exibidos

  private apiUrl = 'http://localhost:8081/api';
  produtos: Produto[] = [];
  selectedCategoryId: String | null = null;
  selectedCategoriaNome: String | null = null;
  carrinho: any[] = [];
  categorias: any = [];
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  // As interfaces Item e Categoria já são definidas no seu código, não é necessário duplicar.
  // Mantive a lista de categorias e itens do seu código original para garantir que tudo seja preservado.
  @ViewChild('search-input', { static: false }) searchInput!: ElementRef;
  searchText: string = '';
  categoriasStatic: any =[];
  itens: Item[] = [];


  
  constructor(
    private carrinhoService: CarrinhoServiceService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authService.getTokenLocalStorage();
    this.carregarCarrinho();
    this.carregarProdutos();
    // Exemplo de como você pode carregar categorias dinamicamente
     this.getCategoriasDosProdutos().subscribe(categorias => {
       this.categorias = categorias;
       console.log('Categorias carregadas:', this.categorias);
     }, error => {
       console.error('Erro ao carregar categorias:', error);
     });
  }

  carregarProdutos(): void {
    const token = this.authService.getTokenLocalStorage();
    if (!token) {
      console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());

    this.http.get<Page<any>>(`${this.apiUrl}/produtos`, { headers: headers, params: params })
      .subscribe({
        next: (data) => {
          this.produtos = data.content;
          console.log('Produtos recebidos:', data.content); // Log para depuração
          this.totalElementos = data.totalElements;
          this.totalPaginas = data.totalPages;

          this.gerarPaginasVisiveis();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
        }
      });
  }

  gerarPaginasVisiveis(): void {
    const paginasParaExibir: Set<number> = new Set();
    const paginasTotais = this.totalPaginas;
    const paginaAtual = this.page;
    
    // Adiciona a primeira página se existir
    if (paginasTotais > 0) {
      paginasParaExibir.add(0);
    }

    // Adiciona 2 páginas antes e 2 depois da página atual
    for (let i = -2; i <= 2; i++) {
      const pagina = paginaAtual + i;
      if (pagina >= 0 && pagina < paginasTotais) {
        paginasParaExibir.add(pagina);
      }
    }

    // Adiciona a última página se existir
    if (paginasTotais > 1) {
      paginasParaExibir.add(paginasTotais - 1);
    }

    // Cria o array final com as reticências
    const paginasOrdenadas = Array.from(paginasParaExibir).sort((a, b) => a - b);
    const paginasComReticencias: (number | null)[] = [];
    let ultimaPaginaAdicionada = -1;

    paginasOrdenadas.forEach(pagina => {
      // Se houver um salto de mais de uma página, adicione as reticências
      if (pagina > ultimaPaginaAdicionada + 1) {
        paginasComReticencias.push(null);
      }
      paginasComReticencias.push(pagina);
      ultimaPaginaAdicionada = pagina;
    });

    this.paginasVisiveis = paginasComReticencias;
  }

  irParaPagina(numeroPagina: number | null): void {
    if (numeroPagina !== null) {
      this.page = numeroPagina;
      this.carregarProdutos();
    }
  }

  proximaPagina(): void {
    if (this.page < this.totalPaginas - 1) {
      this.page++;
      this.carregarProdutos();
    }
  }

  paginaAnterior(): void {
    if (this.page > 0) {
      this.page--;
      this.carregarProdutos();
    }
  }


  getCategoriasDosProdutos(): Observable<Categoria[]> {
    const token = this.authService.getTokenLocalStorage();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`, { headers: headers });
    } else {
      return new Observable(observer => {
        observer.error('Nenhum token de autenticação encontrado.');
        observer.complete();
      });
    }
  }
  


selectCategory(categoria: Categoria): void {
  this.selectedCategoryId = categoria.id.toString();
  this.selectedCategoriaNome = categoria.nome;
  this.page = 0; // Resetar a página para 0 ao selecionar uma nova categoria
  const inputElement = document.getElementById('search-input') as HTMLInputElement;
  if (inputElement) {
    console.log(`Categoria selecionada: ${this.selectedCategoryId} || ${this.selectedCategoriaNome} `);
    inputElement.value = '';
  }
  this.searchText = '';
  if(categoria.nome === 'Todos'){
  this.selectedCategoryId = '0';
  this.selectedCategoriaNome = '';

    this.carregarProdutos();
  }
  else if(categoria.id === '0') {
    this.carregarProdutos();
   } else {
    this.carregarProdutosFiltroCategorias(categoria.id);
  }
}

// Método carregarProdutosFiltroCategorias
carregarProdutosFiltroCategorias(id: string): void {
  const token = this.authService.getTokenLocalStorage();
  if (!token) {
    console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  let params = new HttpParams()
    .set('page', this.page.toString())
    .set('size', this.size.toString())
    .set('categoriaId', id);

  this.http.get<Page<any>>(`${this.apiUrl}/produtos/filtro`, { headers: headers, params: params })
    .subscribe({
      next: (data) => {
        console.log('Produtos recebidos:', data.content); // Log para depuração
        this.produtos = data.content || []; // Garantir que produtos seja um array
        this.totalElementos = data.totalElements;
        this.totalPaginas = data.totalPages;
        this.gerarPaginasVisiveis();
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.produtos = []; // Limpar produtos em caso de erro
        this.totalElementos = 0;
        this.totalPaginas = 0;
        this.gerarPaginasVisiveis();
      }
    });
}

// Método getFilteredProducts
getFilteredProducts(): any[] {
  return this.produtos.filter(produto => {
    // Tratar a categoria "Todos" (id === '0') e alinhar com a propriedade categoriaId
    const matchesCategory = this.selectedCategoryId === '0' || !this.selectedCategoryId || produto?.categoria.id === this.selectedCategoryId;
    const matchesSearchText = this.searchText === '' || produto.nome.toLowerCase().includes(this.searchText.toLowerCase());
    return matchesCategory && matchesSearchText;
  });
}
  
  onSearch(): void {
    const query = this.query.toLowerCase();
    if (query) {
      this.results = this.items.filter(item => item.toLowerCase().includes(query));
    } else {
      this.results = [];
    }
  }

  onSearchs(event: any) {
    this.searchText = event.target.value.toLowerCase();
  }

  scrollRight() {
    this.productList?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    this.productList?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  carregarCarrinho(): void {
    const carrinhoSalvo = sessionStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
  }

  salvarCarrinho(): void {
    sessionStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  adicionarAoCarrinho(produto: any): void {
    console.log(produto)
    this.carrinhoService.adicionarAoCarrinho(produto);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }

  removerDoCarrinho(produtoId: number): void {
    this.carrinhoService.removerDoCarrinho(produtoId);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }

  atualizarQuantidade(produtoId: number, quantidade: number): void {
    this.carrinhoService.atualizarQuantidade(produtoId, quantidade);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }
}
