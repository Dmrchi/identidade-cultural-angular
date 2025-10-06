import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/autenticacao/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use a lógica do seu serviço para verificar o token
  if (authService.isLoggedIn()) {
    // Se o usuário estiver logado, a navegação é permitida.
    return true;
  } else {
    // Se não estiver logado, redirecione para a página de login ('/login').
    router.navigate(['entrar']);
    // E retorne `false` para bloquear a navegação para a rota protegida.
    return false;
  }
};