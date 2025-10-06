import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importa o serviço Router
import { AuthService } from '../../services/autenticacao/auth.service';

export interface AuthResponse {
  nome: string;
  token: string;
}

@Component({
  selector: 'app-entrar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './entrar.component.html',
  styleUrl: './entrar.component.scss'
})
export class EntrarComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService, // Injeta o AuthService
    private router: Router // Injeta o serviço Router no construtor
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  entrar(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const loginPayload = this.loginForm.value; //const { email, senha } =this.loginForm.value;

      this.authService.login(loginPayload).subscribe({
          next: () => {
              console.log('Login bem-sucedido, navegando...');
              this.router.navigate(['/bazar']);
            },
          error: (error) => {
              console.error('Erro no login:', error);
              this.errorMessage = 'Credenciais inválidas. Por favor, tente novamente.';
            }
          });
        } else {
          this.errorMessage = 'Por favor, preencha o formulário corretamente.';
        }
  }

}