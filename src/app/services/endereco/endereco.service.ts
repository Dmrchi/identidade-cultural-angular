import { Injectable } from '@angular/core';
import { EnderecoPayload, EnderecoResponse, ViaCepResponse } from '../../pages/perfil/perfil.component';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../autenticacao/auth.service';

@Injectable({
  providedIn: 'root'
})


export class EnderecoService {
  private apiUrl = 'http://localhost:8081/api/endereco';
  enderecoExistente: EnderecoResponse | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  public cadastrarEndereco(endereco: EnderecoPayload): Observable<EnderecoResponse> {
    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<EnderecoResponse>(this.apiUrl, endereco, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  public buscarEnderecoDoUsuarioLogado(): Observable<EnderecoResponse> {
      const token = this.authService.getTokenLocalStorage();

      if (!token) {
        return throwError(() => new Error('Authentication token not found.'));
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      return this.http.get<EnderecoResponse>(`${this.apiUrl}/usuario`, { headers: headers }).pipe(
        catchError(this.handleError)
      );
  }
    public buscarEnderecoPorEmail(email: string): Observable<EnderecoResponse> {
      const token = this.authService.getTokenLocalStorage();

      if (!token) {
        return throwError(() => new Error('Authentication token not found.'));
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const params = new HttpParams().set('email', email);
      return this.http.get<EnderecoResponse>(`${this.apiUrl}/email`, { headers: headers, params:params }).pipe(
        catchError(this.handleError)
      );
  }
   atualizarEndereco(endereco: EnderecoResponse) {
    const token = this.authService.getTokenLocalStorage();

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      
      const url = `${this.apiUrl}`;///${endereco.id}

      return this.http.put<EnderecoResponse>(url, endereco, { headers: headers });

    } else {
      return throwError(() => new Error('Token de autenticação não encontrado.'));
    }
  }

  public buscarCep(cep: string): Observable<ViaCepResponse> {
    const cleanedCep = cep.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cleanedCep}/json/`;

    return this.http.get<ViaCepResponse>(url).pipe(
      catchError(this.handleViaCepError)
    );
  }
  /*

  public buscarCep(cep: string): Observable<ViaCepResponse> {
    const cleanedCep = cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(cleanedCep)) {
      return throwError(() => new Error('Formato de CEP inválido. Deve conter 8 dígitos.'));
    }
    const url = `https://viacep.com.br/ws/${cleanedCep}/json/`;
    return this.http.get<ViaCepResponse>(url).pipe(
      catchError(this.handleViaCepError)
    );
  }

  */
  private handleViaCepError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400 || error.status === 404) {
      console.error('CEP not found or invalid format.');
      return throwError(() => new Error('CEP não encontrado ou formato inválido.'));
    }
    return throwError(() => new Error(`Erro ${error.status}: ${error.message || 'Something went wrong with ViaCEP request'}`));
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Something went wrong'}`));
  }
}