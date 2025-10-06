import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Usuario } from '../../pages/pedidos/pedidos.component';
import { AuthService } from '../autenticacao/auth.service';
import { Perfil, UsuarioUpdate } from '../../pages/perfil/perfil.component';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8081/api/usuarios';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getProdutos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  fetchUsuarioLogado(): Observable<Perfil> {
    const token = this.authService.getTokenLocalStorage();
    if (!token) {
      return throwError(() => new Error('Nenhum token de autenticação encontrado. Por favor, faça login.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(this.apiUrl+"/logado", { headers }).pipe(
      map((usuario) => {
        let primeiroNome = usuario.nome;
        let sobrenome = '';

        // Verifica se o nome completo tem um espaço para dividir em nome e sobrenome
        if (usuario.nome && typeof usuario.nome === 'string' && usuario.nome.includes(' ')) {
          const nomeCompleto = usuario.nome.split(' ');
          primeiroNome = nomeCompleto[0];
          sobrenome = nomeCompleto.slice(1).join(' ');
        }

        return {
          ...usuario,
          nome: primeiroNome,
          sobrenome: sobrenome,
          foto: usuario.foto || 'https://www.llt.at/wp-content/uploads/2021/11/blank-profile-picture-g77b5d6651-1280-705x705.png'
        };
      }),
      catchError((error) => {
        let errorMessage = 'Erro ao buscar dados do usuário. Por favor, tente novamente.';
        if (error.status === 401) {
          errorMessage = 'Sessão expirada ou não autorizada. Por favor, faça login novamente.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
    }
  fetchMostrarPerfil(email: string): Observable<Perfil> {
    const token = this.authService.getTokenLocalStorage();
    if (!token) {
      return throwError(() => new Error('Nenhum token de autenticação encontrado. Por favor, faça login.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    const params = new HttpParams().set('email', email);

    return this.http.get<any>(this.apiUrl+"/dono", { headers: headers, params: params }).pipe(
      map((usuario) => {
        let primeiroNome = usuario.nome;
        let sobrenome = '';

        // Verifica se o nome completo tem um espaço para dividir em nome e sobrenome
        if (usuario.nome && typeof usuario.nome === 'string' && usuario.nome.includes(' ')) {
          const nomeCompleto = usuario.nome.split(' ');
          primeiroNome = nomeCompleto[0];
          sobrenome = nomeCompleto.slice(1).join(' ');
        }

        return {
          ...usuario,
          nome: primeiroNome,
          sobrenome: sobrenome,
          foto: usuario.foto || 'https://www.llt.at/wp-content/uploads/2021/11/blank-profile-picture-g77b5d6651-1280-705x705.png'
        };
      }),
      catchError((error) => {
        let errorMessage = 'Erro ao buscar dados do usuário. Por favor, tente novamente.';
        if (error.status === 401) {
          errorMessage = 'Sessão expirada ou não autorizada. Por favor, faça login novamente.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
    }
  
  public atualizarPerfil(dadosPerfil: UsuarioUpdate): Observable<Perfil> {
      const token = this.authService.getTokenLocalStorage();

      if (!token) {
        return throwError(() => new Error('Erro: Nenhum token de autenticação encontrado.'));
      }

      // 2. Criação dos Headers
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      return this.http.patch<Perfil>(this.apiUrl+'/alterar', dadosPerfil, { headers });
  }
public atualizaToggleLoja(novoStatus: boolean): Observable<Perfil> {
  const token = this.authService.getTokenLocalStorage();

  if (!token) {
    return throwError(() => new Error('Erro: Nenhum token de autenticação encontrado.'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // 1. Defina a URL completa para o endpoint
  const url = `${this.apiUrl}/loja/status`;

  // 2. Crie o corpo (body) da requisição que o backend espera
  //    Normalmente, um objeto JSON com a propriedade a ser alterada.
  const body = { status: novoStatus }; 

  return this.http.patch<Perfil>(url, body, { headers: headers});
}
  getProdutosLoja(lojaEmail: string): Observable<Usuario> {
      const token = this.authService.getTokenLocalStorage();
  
      if (!token) {
        console.error('Nenhum token de autenticação encontrado.');
        return throwError(() => new Error('Não autenticado'));
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  
      const params = new HttpParams().set('email', lojaEmail);
  
      return this.http.get<Usuario>(this.apiUrl+'/dono', { headers: headers, params: params }).pipe(
        catchError(error => {
          console.error('Erro na requisição:', error);
          return throwError(() => error);
        })
      );
    }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
      console.error('An error occurred:', error);
      return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Something went wrong'}`));
  }

}
