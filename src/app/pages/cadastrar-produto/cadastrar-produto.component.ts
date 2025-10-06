import { NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/autenticacao/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cadastrar-produto',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    FontAwesomeModule,  
  ],
  templateUrl: './cadastrar-produto.component.html',
  styleUrl: './cadastrar-produto.component.scss'
})
export class CadastrarProdutoComponent implements OnInit {

  produtoForm!: FormGroup;
  categoriaForm!: FormGroup;
  faCircleMinus = faCircleMinus;
  faCirclePlus = faCirclePlus;
  private readonly API_CATEGORIAS = 'http://localhost:8081/api/categorias';
  private readonly API_PRODUTOS = 'http://localhost:8081/api/produtos';
  message: string | null = null;
  isError: boolean = false;
  listaDeCategorias: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    // Inicialização do Formulário de Produto
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required], // CORRIGIR ABAIXO OU ESSE
      categoriaId: [''], // Adicione este campo para armazenar o ID da categoria
      quantidade: [1, [Validators.required, Validators.min(1)]],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      imagem: ['', Validators.required],
    });

    // Inicialização do Formulário de Categoria
    this.categoriaForm = this.fb.group({
      nome: ['', Validators.required],
      icone: ['', Validators.required],
    });

    // Opcional: Carregar categorias ao iniciar o componente
    this.buscarTodasCategorias();
  }

 
  get produtoNomeControl(): AbstractControl | null {
    return this.produtoForm.get('nome');
  }
  get produtoCategoriaControl(): AbstractControl | null {
    return this.produtoForm.get('categoria');
  }
  get produtoPrecoControl(): AbstractControl | null {
    return this.produtoForm.get('preco');
  }
  get produtoImagemControl(): AbstractControl | null { // Este é o getter que estava faltando ou incorreto
    return this.produtoForm.get('imagem');
  }

  // --- Getters para os controles do categoriaForm (para validação no template) ---
  get categoriaNomeControl(): AbstractControl | null {
    return this.categoriaForm.get('nome');
  }
  get categoriaIconeControl(): AbstractControl | null {
    return this.categoriaForm.get('icone');
  }


  cadastrarCategoria() {
    this.message = null;
    this.isError = false;
    const token = this.authService.getTokenLocalStorage();
    console.log('Token de autenticação:', token);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

    if (this.categoriaForm.valid) {
      const novaCategoria = this.categoriaForm.value;
      console.log('Dados da Categoria para enviar:', novaCategoria);

      this.http.post<any>(this.API_CATEGORIAS, novaCategoria, { headers: headers })
        .subscribe({
          next: (response) => {
            this.message = `Categoria "${response.nome}" cadastrada com sucesso!`;
            this.isError = false;
            this.categoriaForm.reset();
            this.buscarTodasCategorias();
            console.log('Categoria cadastrada:', response);
          },
          error: (error) => {
            this.isError = true;
            if (error.status === 409) {
              this.message = 'Erro: Já existe uma categoria com este nome.';
            } else if (error.error && error.error.message) {
              this.message = `Erro ao cadastrar categoria: ${error.error.message}`;
            } else {
              this.message = 'Erro desconhecido ao cadastrar categoria. Por favor, tente novamente.';
            }
            console.error('Erro ao cadastrar categoria:', error);
          }
        });
    } else {
      this.isError = true;
      this.message = 'Por favor, preencha todos os campos da categoria corretamente.';
      this.categoriaForm.markAllAsTouched();
      }
    }
  }
 buscarTodasCategorias() {
  const token = this.authService.getTokenLocalStorage();
  
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    this.http.get<any[]>(this.API_CATEGORIAS, { headers: headers })
      .subscribe({
        next: (categorias) => {
          console.log('Todas as Categorias (antes do filtro):', categorias);
          
          // Adicione esta linha para filtrar a categoria "Todos"
          this.listaDeCategorias = categorias.filter(cat => cat.nome !== 'Todos');
          
          console.log('Categorias (após o filtro):', this.listaDeCategorias);
        },
        error: (error) => {
          console.error('Erro ao buscar categorias:', error);
          this.isError = true;
          this.message = 'Erro ao carregar categorias.';
        }
      });
  } else {
    console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
  }
}
  cadastrarProduto() {
    this.message = null;
    this.isError = false;
    const token = this.authService.getTokenLocalStorage();
    console.log('Token de autenticação:', token);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    
    if (this.produtoForm.valid) {
      const novoProduto = this.produtoForm.value;
      novoProduto.categoriaId = novoProduto.categoria.id.toString();
      novoProduto.categoria = novoProduto.categoria.nome.toString();
      console.log('Categoria ID do Produto:', novoProduto.categoria_id);
     ////////////// alert(novoProduto.categoria_id);
      console.log('Dados do Produto para enviar:', novoProduto);

      this.http.post<any>(this.API_PRODUTOS, novoProduto, { headers: headers })
        .subscribe({
          next: (response) => {
            this.message = `Produto "${response.nome}" cadastrado com sucesso!`;
            this.isError = false;
            this.produtoForm.reset();
            console.log('Produto cadastrado:', response);
          },
          error: (error) => {
            this.isError = true;
            if (error.error && error.error.message) {
              this.message = `Erro ao cadastrar produto: ${error.error.message}`;
            } else {
              this.message = 'Erro desconhecido ao cadastrar produto. Por favor, tente novamente.';
            }
            console.error('Erro ao cadastrar produto:', error);
          }
        });
    } else {
      this.isError = true;
      this.message = 'Por favor, preencha todos os campos do produto corretamente.';
      this.produtoForm.markAllAsTouched();
      }
    }
  }
  aumentarQuantidade(): void {
  const quantidadeControl = this.produtoForm.get('quantidade');
  if (quantidadeControl) {
    let valorAtual = Number(quantidadeControl.value);
    if(quantidadeControl.value < 10){
    quantidadeControl.setValue(valorAtual + 1);
    }
  }
}

// Método para diminuir a quantidade
diminuirQuantidade(): void {
  const quantidadeControl = this.produtoForm.get('quantidade');
  if (quantidadeControl) {
    let valorAtual = Number(quantidadeControl.value);
    // Só diminui se o valor for maior que 1 (respeitando sua validação min(1))
    if (valorAtual > 1) {
      quantidadeControl.setValue(valorAtual - 1);
      }
    }
  }

  // Métodos de submissão do formulário (chamados pelo HTML)
  onSubmitProduto() {
    this.cadastrarProduto();
  }

  onSubmitCategoria() {
    this.cadastrarCategoria();
  }
}
