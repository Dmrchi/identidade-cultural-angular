import { NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/autenticacao/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, throwError } from 'rxjs';
import { EnderecoService } from '../../services/endereco/endereco.service';
import { UsuariosService } from '../../services/usuario/usuarios.service';
import { Perfil } from '../perfil/perfil.component';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}
interface Usuario {
  id: string;
}

export interface EnderecoPayload {
  cidade: string;
  estado: string;
  cep: string;
  rua: string;
  numero: number;
  adicional: string;
  bairro: string;
  complemento: string;
  usuario: Usuario;
}
export interface EnderecoResponse extends EnderecoPayload {
  id: string; 
}
interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  quantidade: number;
  imagem: string;
  icone: string | null;
  dataCriacao: string;
  steps: number;
  status: 'Iniciar Trilha' | 'Concluído' | 'Em Andamento';
  title: string;
  completion: string;
  lastActivity: string;
}

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.scss'
})
export class PerfilUsuarioComponent {

  private apiUrl = 'http://localhost:8081/api/produtos';
  contagemCaracteres: number = 0;

  usuarioLogado: Perfil | null = null;
  perfilForm!: FormGroup;
  enderecoForm!: FormGroup;
  editandoPerfil = false;

  isLoading: boolean = true;
  message: string | null = null;
  isError: boolean = false;
  isToggled = signal(false);

  produtos: Produto[] = [];
  email : string | null = "";

  activeTab: 'perfil' | 'produtos' | 'vendas' = 'perfil';
  enderecoExistente: EnderecoResponse | null = null;

  loadingCep = signal(false);
  cepSubject = new Subject<string>();

  cepError = signal<string | null>(null);


  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private enderecoService: EnderecoService,
    private usuarioService: UsuariosService,
    private route: ActivatedRoute, 

  ) { }

  ngOnInit(): void {
    // Inicializa o formulário no ngOnInit
    this.perfilForm = this.fb.group({
      nome: [''],
      sobrenome: [''],
      foto: [''],
      telefone: [''],
      cpf: [''],
      email:[''],
      documento:[''],
      pontos:['']
    });
     this.route.queryParamMap.subscribe(queryParams => {
      // A variável aqui pode ter qualquer nome, usei 'queryParams' para clareza
      this.email = queryParams.get('email'); // .get('email') busca a chave 'email' após o '?'

      if (this.email) {
        this.fetchUsuarioLogado(this.email);
        this.buscarEndereco(this.email);
        this.carregarProdutosEmail(this.email);
      } else {
        console.error('Nenhum email encontrado nos parâmetros de consulta da URL.');
        this.isError = true;
        this.message = 'Perfil não encontrado.';
        this.isLoading = false;
      }
});
    this.enderecoForm = this.fb.group({
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: [null],
      adicional: [''],
      bairro: ['', Validators.required],
      complemento: [''],
      isSemNumero: [false]
    })
    this.enderecoForm.get('isSemNumero')?.valueChanges.subscribe(value => {
      const numeroControl = this.enderecoForm.get('numero');
      if (value) {
        numeroControl?.disable();
        numeroControl?.setValue(''); // Opcional: limpa o valor quando desabilitado
      } else {
        numeroControl?.enable();
      }
    });
  }

  fetchUsuarioLogado(email: string): void {
    this.isLoading = true;
    this.message = null;
    this.isError = false;
    console.log('Email para buscar perfil:', email);
    this.usuarioService.fetchMostrarPerfil(email).subscribe({
      next: (usuario) => {
        this.usuarioLogado = usuario;
        if (this.usuarioLogado) {
           
          this.perfilForm.patchValue({
            nome: this.usuarioLogado.nome,
            sobrenome: this.usuarioLogado.sobrenome,
            foto: this.usuarioLogado.foto,
            telefone: this.usuarioLogado.telefone,
            cpf: this.usuarioLogado.cpf,
            email: this.usuarioLogado.email,
            pontos: this.usuarioLogado.pontos
          });
        }
        this.isLoading = false;
        console.log('Dados do usuário logado:', this.usuarioLogado);
      },
      error: (error) => {
        this.isError = true;
        this.isLoading = false;
        this.message = error.message;
        console.error('Erro na requisição:', error);
      }
    });
  }


  carregarProdutosEmail(email: string): void {
    const token = this.authService.getTokenLocalStorage();
    console.log('Token de autenticação:', token);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const params = new HttpParams().set('email', email);

      this.http.get<Produto[]>(this.apiUrl+'/loja', { headers: headers, params: params })
        .subscribe({
          next: (data) => {
            this.produtos = data;
            console.log('Produtos carregados com sucesso:', this.produtos);
          },
          error: (error) => {
            console.error('Erro ao carregar produtos:', error);
            if (error.status === 401 || error.status === 403) {
              console.log('Token inválido ou expirado. Redirecionando para o login.');
              this.router.navigate(['/login']);
            }
          }
        });
    } else {
      console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
      this.router.navigate(['/login']);
    }
  }
  

  setActiveTab(tab: 'perfil' | 'produtos' | 'vendas'): void {
    this.activeTab = tab;
  }
  enderecoParaCadastrar: EnderecoPayload = {
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-000',
    rua: 'Avenida Atlântica',
    numero: 1000,
    adicional: 'Bloco A',
    bairro: 'Copacabana',
    complemento: 'Apartamento 101',
    usuario: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'}
  };

  buscarEndereco(email: string): void {
    this.enderecoService.buscarEnderecoPorEmail(email).subscribe({
      next: (endereco: EnderecoResponse) => {
        this.enderecoExistente = endereco;
        this.enderecoForm.patchValue(endereco);
        console.log('Endereço encontrado e preenchido:', endereco);
      },
      error: (error: HttpErrorResponse) => {
        
        if (error.status === 404) {
          console.log('Nenhum endereço encontrado para o usuário. Prepare para cadastrar.');
          this.enderecoExistente = null; // Garante que o estado seja limpo
        } else {
          console.error('Erro ao buscar o endereço:', error);
          this.isError = true;
          this.message = 'Erro ao buscar seu endereço. Tente novamente mais tarde.';
        }
      }
    });
  }
  cadastrarEndereco(): void {
    console.log('Formulário válido?', this.enderecoForm.valid);
    console.log('Valores do formulário:', this.enderecoForm.getRawValue());
    if (this.enderecoForm.valid) {
      const formValue = this.enderecoForm.getRawValue();
      const enderecoPayload: EnderecoPayload = {
        cidade: formValue.cidade,
        estado: formValue.estado,
        cep: formValue.cep,
        rua: formValue.rua,
        numero: formValue.isSemNumero ? null : formValue.numero, // Envia null se isSemNumero for true
        adicional: formValue.adicional,
        bairro: formValue.bairro,
        complemento: formValue.complemento,
        usuario: { id : '' } // Usa o ID do usuário logado
      };

      this.enderecoService.cadastrarEndereco(enderecoPayload).subscribe({
        next: (response: EnderecoResponse) => {
          console.log('Endereço cadastrado com sucesso:', response);
          this.message = 'Endereço cadastrado com sucesso!';
          this.isError = false;
          this.enderecoForm.reset(); 
        },
        error: (error) => {
          console.error('Falha ao cadastrar o endereço:', error);
          console.log('Status:', error.status);
          console.log('Mensagem:', error.message);
          this.message = `Falha ao cadastrar o endereço: ${error.message || 'Por favor, tente novamente.'}`;
          this.isError = true;
        }
      });
    } else {
      this.message = 'Por favor, preencha todos os campos obrigatórios.';
      this.isError = true;
      this.enderecoForm.markAllAsTouched();
    }
  }
  toggle(): void {
    this.isToggled.update(value => {
      return !value;
    });
  }

  salvarEndereco(): void {
    this.message = null;
    this.isError = false;

    if (this.enderecoForm.valid) {
      const enderecoPayload = this.enderecoForm.getRawValue();

      if (this.enderecoExistente && this.enderecoExistente.id) {
        enderecoPayload.id = this.enderecoExistente.id;
        this.enderecoService.atualizarEndereco(enderecoPayload).subscribe({
          next: (response) => {
            this.message = 'Endereço atualizado com sucesso!';
            this.isError = false;
            console.log('Endereço atualizado:', response);
            this.enderecoExistente = response; // Atualiza o estado local
          },
          error: (error) => {
            this.isError = true;
            this.message = `Falha ao atualizar o endereço: ${error.message}`;
          }
        });
      } else {
        this.enderecoService.cadastrarEndereco(enderecoPayload).subscribe({
          next: (response) => {
            this.message = 'Endereço cadastrado com sucesso!';
            this.isError = false;
            console.log('Endereço cadastrado:', response);
            this.enderecoExistente = response; // Armazena o novo endereço com o ID
          },
          error: (error) => {
            this.isError = true;
            this.message = `Falha ao cadastrar o endereço: ${error.message}`;
          }
        });
      }
    } else {
      this.message = 'Por favor, preencha todos os campos obrigatórios.';
      this.isError = true;
      this.enderecoForm.markAllAsTouched();
    }
  }

  


  /*
  onCepChange(): void {
    const cepControl = this.enderecoForm.get('cep');

    if (cepControl && cepControl.valid) {
      const cep = cepControl.value;

      this.enderecoService.buscarCep(cep).subscribe({
        next: (data: ViaCepResponse) => {
          if (data.erro) {
            console.error('CEP não encontrado ou formato inválido.');
            // Opcional: Limpar os campos e notificar o usuário
            this.enderecoForm.patchValue({
              estado: '',
              cidade: '',
              bairro: '',
              rua: '',
              complemento: '',
            });
          } else {
            // Atualiza apenas os campos retornados pela API
            this.enderecoForm.patchValue({
              estado: data.uf,
              cidade: data.localidade,
              bairro: data.bairro,
              rua: data.logradouro,
              complemento: data.complemento,
            });
          }
        },
        error: (err) => {
          console.error(err);
          // Opcional: Tratar erros de requisição
        },
      });
    }
  }*/
/*
  onCepHelp(): void {
    console.log("Abrir link para busca de CEP");  
  }*/

}

