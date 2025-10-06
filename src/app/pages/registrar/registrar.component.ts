import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/autenticacao/auth.service';
import { Router } from '@angular/router';
import { AuthResponse } from '../entrar/entrar.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent {

  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      repetirSenha: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });

    this.loginForm.valueChanges.subscribe(() => {
      this.loginForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const senha = form.get('senha')?.value;
    const repetirSenha = form.get('repetirSenha')?.value;
    return senha && repetirSenha && senha === repetirSenha ? null : { mismatch: true };
  }

  registrar(): void {
  if (this.loginForm.valid) {
    this.errorMessage = null;
    const { nome, email, telefone, senha } = this.loginForm.value;
    
    this.authService.register({ nome, email, telefone, senha }).subscribe({
      next: () => {
        console.log('Registro bem-sucedido, navegando...');
        this.router.navigate(['/bazar']);
      },
      error: (error) => {
        console.error('Erro no registro:', error);
        this.errorMessage = error.error?.message || 'Erro ao registrar. Verifique os dados e tente novamente.';
      }
    });
  } else {
    this.errorMessage = 'Por favor, preencha o formulário corretamente.';
    this.loginForm.markAllAsTouched(); 
  }
}
  /*
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const { nome, email, telefone, senha } = this.loginForm.value;
      const registerPayload = { nome, email, telefone, senha };

      this.http.post<AuthResponse>('http://localhost:8081/api/autenticacao/registrar', registerPayload)
        .subscribe({
          next: (response) => {
            console.log('Registro bem-sucedido!', response);
            this.authService.saveTokenLocalStorage(response.token);
            this.router.navigate(['/bazar']);
          },
          error: (error) => {
            console.error('Erro no registro:', error);
            // Provide more specific error message based on backend response
            this.errorMessage = error.error?.message || 'Erro ao registrar. Verifique os dados e tente novamente.';
          }
        });
    } else {
      this.errorMessage = 'Por favor, preencha o formulário corretamente.';
      this.loginForm.markAllAsTouched(); // Show all validation errors
    }
  }
*/
}