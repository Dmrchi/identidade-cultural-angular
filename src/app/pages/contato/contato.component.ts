import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/autenticacao/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Page } from '../bazar/bazar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [ NgIf, NgFor, FontAwesomeModule, RouterLink, NgClass, FormsModule],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.scss'
})
export class ContatoComponent {
  @ViewChild('productList') productList: ElementRef | undefined;
  query: string = '';
  results: string[] = [];
  private apiUrl = 'http://localhost:8081/api';
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute

    
  ) {
  }
 ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const pagina = params['page'] ? parseInt(params['page'], 10) : 0;
      const nome = params['nome'] || null; // Lê o novo parâmetro 'nome'

      this.page.set(pagina);
      this.nomeBusca = nome || ''; // Atualiza a propriedade do input
      
      this.carregarPerfis(nome); // Chama o método com o nome como parâmetro
    });
  }
  page = signal(0);
  size = signal(4);
  totalPaginas = signal(0);
  totalElementos = signal(0);

  nomeBusca: string = '';


  paginasVisiveis = signal<(number | null)[]>([]);
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  perfis: any[] = [];

  selectedCategoryId: number | null = null;


  products = Array.from({ length: 20 }, (_, index) => ({
    icon: 'path/to/icon.png', // Replace with the actual path to your icons
    description: `Product Category ${index + 1}`
  }));


  selectCategory(id: number) {
    this.selectedCategoryId = id;
  }

  carregarPerfis(nome: string): void {
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
      .set('page', this.page().toString()) // Use o valor do signal
      .set('size', this.size().toString());

    if (nome) {
      params = params.set('nome', nome);
    }
    this.http.get<Page<any>>(`${this.apiUrl}/usuarios/perfis`, { headers: headers, params: params })
      .subscribe({
        next: (data) => {
          this.perfis = data.content;
          console.log('Perfis recebidos:', data.content);
          this.totalElementos.set(data.totalElements);
          this.totalPaginas.set(data.totalPages);
          this.gerarPaginasVisiveis();
        },
        error: (error) => {
          console.error('Erro ao carregar perfis:', error);
        }
      });
  }
onBuscar(): void {
  this.page.set(0); 
  
  let queryParams: any = { page: 0 };
  
    queryParams.nome = this.nomeBusca;
  
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: queryParams,
    queryParamsHandling: 'merge', // 'merge' vai manter outros params
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

  scrollRight() {
    this.productList?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    this.productList?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }
  private updateUrl(page: number): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { page },
    queryParamsHandling: 'merge',
  });
}

irParaPagina(numeroPagina: number | null): void {
  if (numeroPagina !== null && numeroPagina !== this.page()) {
    this.page.set(numeroPagina);
    this.updateUrl(numeroPagina);
  }
}

proximaPagina(): void {
  if (this.page() < this.totalPaginas() - 1) {
    const nextPage = this.page() + 1;
    this.page.set(nextPage);
    this.updateUrl(nextPage);
  }
}

paginaAnterior(): void {
  if (this.page() > 0) {
    const prevPage = this.page() - 1;
    this.page.set(prevPage);
    this.updateUrl(prevPage);
  }
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
}

