import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map } from 'rxjs';
import { Produto } from '../../pages/detalhes-produto/detalhes-produto.component'; // Adjust the import path as necessary
import { AuthService } from '../autenticacao/auth.service';
@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = 'http://localhost:8081/api/produtos';

  constructor(private http: HttpClient,
              private authService: AuthService,
  ) {}

  getProdutoById(id: string, token: string): Observable<any> {
    // 1. Crie os HttpHeaders com o token recebido como argumento
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 2. Passe os headers como um objeto de opções para o método get
    return this.http.get<Produto>(`${this.apiUrl}/${id}`, { headers: headers }).pipe(
      map((response) => ({
        id: response.id.toString(),
        nome: response.nome,
        descricao: response.descricao,
        preco: Number(response.preco),
        imagem: response.imagem,
        autor: response.autor,
        ehAutor: response.ehAutor,
        categoria: response.categoria
      })),
      catchError(this.handleError)
    );
  }

  getMeusProdutos(): Observable<Produto[]> {
    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      console.error('Nenhum token de autenticação encontrado.');
      // Retorna um erro para quem chamou a função.
      return throwError(() => new Error('Não autenticado')); 
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Produto[]>(this.apiUrl + '/loja', { headers: headers }).pipe(
      catchError(error => {
        // Você pode tratar o erro aqui, mas a navegação deve ser no componente
        console.error('Erro na requisição:', error);
        return throwError(() => error);
      })
    );
  }
  

  getProdutosLoja(lojaEmail: string): Observable<Produto[]> {
    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      console.error('Nenhum token de autenticação encontrado.');
      return throwError(() => new Error('Não autenticado'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Cria os parâmetros de consulta
    const params = new HttpParams().set('email', lojaEmail);

    return this.http.get<Produto[]>(this.apiUrl + '/loja', { headers: headers, params: params }).pipe(
      catchError(error => {
        console.error('Erro na requisição:', error);
        return throwError(() => error);
      })
    );
  }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto).pipe(
      catchError(this.handleError)
    );
  }

  updateProduto(id: string, produto: Produto): Observable<Produto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Produto>(url, produto).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduto(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Something went wrong'}`));
  }
}