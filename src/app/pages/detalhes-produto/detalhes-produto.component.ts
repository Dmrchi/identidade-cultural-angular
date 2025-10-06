import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProdutoService } from '../../services/produto/produto.service';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/autenticacao/auth.service'; // Importe o AuthService
import { UsuariosService } from '../../services/usuario/usuarios.service';
import { EnderecoResponse, Perfil } from '../perfil/perfil.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnderecoService } from '../../services/endereco/endereco.service';

export interface Produto {
  id: string;
  nome: string;
  categoria: Categoria;
  descricao: string;
  preco: number;
  autor: Autor;
  imagem: string;
  ehAutor: boolean;
}
export interface Categoria {
  descricao: string | null;
  icone: string;
  id: string;
  nome: string;
}
export interface Autor {
  cnpj: string | null;
  cpf: string;
  email: string;
  foto: string;
  id: string;
  loja: boolean;
  nome: string;
  pontos: number;
  senha: string;
  telefone: string;
}

@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './detalhes-produto.component.html',
  styleUrl: './detalhes-produto.component.scss',
})
export class DetalhesProdutoComponent implements OnInit {
  produto: Produto | undefined;
  isLoading = true;
  errorMessage: string | undefined;
  carrinho: any[] = [];
  perfilForm!: FormGroup;
  usuarioLogado : Perfil | null = null;
  enderecoUsuario: EnderecoResponse | null = null;
  constructor(
    private produtoService: ProdutoService,
    private usuarioService: UsuariosService,
    private enderecoService: EnderecoService,
    private carrinhoService: CarrinhoServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    const token = this.authService.getTokenLocalStorage();
    this.fetchUsuarioLogado();
    this.perfilForm = this.fb.group({
      nome: [''],
      email: [''],
      telefone: [''],
      endereco: ['']
    });
    this.buscarEndereco();
    this.carregarCarrinho();
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          this.errorMessage = undefined;
          this.produto = undefined;
          return this.produtoService.getProdutoById(id, token!);
        } else {
          this.errorMessage = 'ID do produto não encontrado na URL.';
          this.isLoading = false;
          return new Observable<Produto>();
        }
      })
    ).subscribe({
      next: (data: Produto) => {
        console.log('Dados do produto recebidos:', data);
        if (!data || !data.id || !data.nome || !data.imagem || typeof data.preco !== 'number') {
          console.error('Dados de produto inválidos ou incompletos recebidos:', data);
          this.errorMessage = 'Dados inválidos recebidos para o produto. Verifique o console para mais detalhes.';
          this.isLoading = false;
          return;
        }
        this.produto = data;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao buscar detalhes do produto:', error);
        if (error.status === 403 || error.status === 401) { // Lidar com status de erro de autenticação
          this.errorMessage = 'Acesso negado. Por favor, faça login para visualizar este produto.';
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'Produto não encontrado.';
        } else {
          const backendMessage = error.error?.message || error.message;
          this.errorMessage = `Ocorreu um erro ao carregar o produto: ${backendMessage || 'Por favor, tente novamente mais tarde.'}`;
        }
        this.isLoading = false;
        this.produto = undefined;
      },
    });
  }
  fetchUsuarioLogado(): void {
    this.isLoading = true;

    this.usuarioService.fetchUsuarioLogado().subscribe({
      next: (usuario) => {
        this.usuarioLogado = usuario;
        if (this.usuarioLogado) {
          this.perfilForm.patchValue({
            nome: this.usuarioLogado.nome + " " + this.usuarioLogado.sobrenome,
            email: this.usuarioLogado.email,
            telefone: this.usuarioLogado.telefone,
            foto: this.usuarioLogado.foto
          });
        }
       // this.isLoading = false;
        console.log('Dados do usuário logado:', this.usuarioLogado);
      },
      error: (error) => {
       // this.isLoading = false;
        console.error('Erro na requisição:', error);
      }
    });
  }

  //Métodos de carrinho não foram alterados
  carregarCarrinho(): void {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
  }
  buscarEndereco(): void {
    this.enderecoService.buscarEnderecoDoUsuarioLogado().subscribe({
      next: (endereco: EnderecoResponse) => {
        this.enderecoUsuario = endereco;
        this.perfilForm.patchValue({
          endereco: this.enderecoUsuario.rua + ', ' + this.enderecoUsuario.numero + (this.enderecoUsuario.complemento ? ', ' + this.enderecoUsuario.complemento : '') + ' - ' + this.enderecoUsuario.bairro + ', ' + this.enderecoUsuario.cidade + ' - ' + this.enderecoUsuario.estado + ', CEP: ' + this.enderecoUsuario.cep
        });
        console.log('Endereço encontrado e preenchido:', endereco);
      },
      error: (error: HttpErrorResponse) => {
        
        if (error.status === 404) {
          console.log('Nenhum endereço encontrado para o usuário. Prepare para cadastrar.');
          this.enderecoUsuario = null; // Garante que o estado seja limpo
        } else {
          console.error('Erro ao buscar o endereço:', error);
          //this.isError = true;
          //this.message = 'Erro ao buscar seu endereço. Tente novamente mais tarde.';
        }
      }
    });
  }
  salvarCarrinho(): void {
    localStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.carrinhoService.adicionarAoCarrinho(produto);
    this.carrinho = this.carrinhoService.obterCarrinho();
    this.salvarCarrinho();

    const url = `/carrinho`;
    window.location.href = url;
  }
}