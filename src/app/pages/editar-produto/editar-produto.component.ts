import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/autenticacao/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-editar-produto',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    FontAwesomeModule,
    
  ],
  templateUrl: './editar-produto.component.html',
  styleUrl: './editar-produto.component.scss'
})
export class EditarProdutoComponent {
  produtoForm!: FormGroup;
  categoriaForm!: FormGroup;

  faCircleMinus = faCircleMinus;
  faCirclePlus = faCirclePlus;
  private readonly API_CATEGORIAS = 'http://localhost:8081/api/categorias';
  private readonly API_PRODUTOS = 'http://localhost:8081/api/produtos';
  message: string | null = null;
  isError: boolean = false;
  listaDeCategorias: any[] = [];

  produtoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.produtoId = this.route.snapshot.paramMap.get('id');

    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: [null, Validators.required],
      categoriaId: [null],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      imagem: ['', Validators.required],
      descricao: [''],
    });


    this.carregarDadosParaEdicao();
  }

  private carregarDadosParaEdicao(): void {
    if (this.produtoId) {
      this.buscarTodasCategorias(() => {
        this.buscarProdutoParaEdicao(this.produtoId!);
      });
    } else {
      this.isError = true;
      this.message = 'ID do produto não encontrado na URL.';
    }
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
  get produtoImagemControl(): AbstractControl | null {
    return this.produtoForm.get('imagem');
  }
  get produtoDescricaoControl(): AbstractControl | null {
    return this.produtoForm.get('descricao');
  }

  get categoriaNomeControl(): AbstractControl | null {
    return this.categoriaForm.get('nome');
  }
  get categoriaIconeControl(): AbstractControl | null {
    return this.categoriaForm.get('icone');
  }



  buscarTodasCategorias(onSuccess?: () => void) {
    const token = this.authService.getTokenLocalStorage();

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get<any[]>(this.API_CATEGORIAS, { headers: headers })
        .subscribe({
          next: (categorias) => {
            console.log('Todas as Categorias:', categorias);
            this.listaDeCategorias = categorias;
            if (onSuccess) {
              onSuccess();
            }
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

  buscarProdutoParaEdicao(id: string): void {
    const token = this.authService.getTokenLocalStorage();
    if (!token) return; // Boa prática: sair mais cedo se não houver token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${this.API_PRODUTOS}/${id}`, { headers }).subscribe({
      next: (produto) => {
        console.log('Dados do produto recebido:', produto);

        // **A LÓGICA CORRIGIDA ESTÁ AQUI**
        // Encontra o objeto da categoria na sua lista local comparando pelo ID.
        const categoriaSelecionada = this.listaDeCategorias.find(
          cat => cat.id === produto.categoria.id // Compara ID com ID
        );

        if (!categoriaSelecionada) {
          console.warn('A categoria do produto não foi encontrada na lista de categorias disponíveis.');
        }

        // Preenche o formulário com os dados do produto obtido
        this.produtoForm.patchValue({
          nome: produto.nome,
          preco: produto.preco,
          descricao: produto.descricao,
          imagem: produto.imagem,
          quantidade: produto.quantidade, // Não se esqueça de preencher a quantidade também
          // Define o valor do controle 'categoria' como o objeto encontrado.
          // O Angular selecionará a <option> correta por causa do [ngValue].
          categoria: categoriaSelecionada || null 
        });
      },
      error: (err) => {
        console.error('Erro ao buscar dados do produto:', err);
        this.message = 'Erro ao carregar dados do produto para edição.';
        this.isError = true;
      }
    });
  }

  editarProduto() {
    this.message = null;
    this.isError = false;
    const token = this.authService.getTokenLocalStorage();

    if (!this.produtoId) {
      console.error('ID do produto não está disponível para edição.');
      this.message = 'Erro: ID do produto não está disponível para edição.';
      this.isError = true;
      return;
    }

    if (token && this.produtoForm.valid) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Verifica se categoria foi selecionada
      if (!this.produtoForm.value.categoria || !this.produtoForm.value.categoria.id) {
        this.message = 'Por favor, selecione uma categoria válida.';
        this.isError = true;
        this.produtoForm.markAllAsTouched();
        return;
      }

      // Cria o objeto com os dados do formulário
      const produtoAtualizado = {
        ...this.produtoForm.value,
        categoriaId: this.produtoForm.value.categoria.id
      };
      //delete produtoAtualizado.categoria; // Remove o campo categoria para evitar duplicação
      console.log('Payload enviado para a API:', produtoAtualizado);

      this.http.patch<any>(`${this.API_PRODUTOS}/${this.produtoId}`, produtoAtualizado, { headers: headers })
        .subscribe({
          next: (response) => {
            this.message = `Produto "${response.nome}" atualizado com sucesso!`;
            this.isError = false;
            console.log('Produto atualizado:', response);
          },
          error: (error) => {
            this.isError = true;
            if (error.error && error.error.message) {
              this.message = `Erro ao atualizar produto: ${error.error.message}`;
            } else {
              this.message = 'Erro desconhecido ao atualizar produto. Por favor, tente novamente.';
            }
            console.error('Erro ao atualizar produto:', error);
          }
        });
    } else {
      this.isError = true;
      this.message = 'Por favor, preencha todos os campos do produto corretamente.';
      this.produtoForm.markAllAsTouched();
    }
  }

  onSubmitProduto() {
    this.editarProduto();
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
}

/*
    // 3. Inicialização do Formulário de Categoria
    this.categoriaForm = this.fb.group({
      nome: ['', Validators.required],
      icone: ['', Validators.required],
    });
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
          .pipe(
            finalize(() => this.buscarTodasCategorias())
          )
          .subscribe({
            next: (response) => {
              this.message = `Categoria "${response.nome}" cadastrada com sucesso!`;
              this.isError = false;
              this.categoriaForm.reset();
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

  onSubmitCategoria() {
    this.cadastrarCategoria();
  }
    */