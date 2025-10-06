import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { AuthResponse } from '../../pages/entrar/entrar.component';


import { HttpClient } from '@angular/common/http';
export interface RegistrarPayload {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken';
  //private loginSuccess$ = new Subject<void>();
  private loginSuccess$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  private API_URL = 'http://localhost:8081/api/autenticacao';
  constructor(private http: HttpClient) { }
  
  public login(credentials: { email: string, senha: string }) {
      return this.http.post<AuthResponse>(this.API_URL+'/login', credentials)
        .pipe(
          tap(response => {
            if (response && response.token) {
              this.saveTokenLocalStorage(response.token);
              
              console.log('Tentativa de Login!');
              this.loginSuccess$.next(true);
            }
          })
        );
    }
    public register(payload: RegistrarPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.API_URL+'/registrar', payload)
          .pipe(
            tap(response => {
              if (response && response.token) {
                this.saveTokenLocalStorage(response.token);
                console.log('Registro bem-sucedido, emitindo estado de login!');
                this.loginSuccess$.next(true); 
              }
            })
          );
  }
  saveTokenLocalStorage(token: any): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }


  getTokenLocalStorage(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getTokenLocalStorage();
  }

  logginSucess() {
    return this.loginSuccess$.asObservable();
  }

  public isLoggedIn(): boolean {
    const token = this.getTokenLocalStorage();

    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const isTokenExpired = decodedToken.exp < Date.now() / 1000;
      return !isTokenExpired;

    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return false;
    }
  }

}