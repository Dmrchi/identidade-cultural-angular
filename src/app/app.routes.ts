import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { InicialComponent } from './pages/inicial/inicial.component';
import { BazarComponent } from './pages/bazar/bazar.component';
import { IndexComponent } from './pages/index/index.component';
import { QuemSomosComponent } from './pages/quem-somos/quem-somos.component';
import { DemandasComponent } from './pages/demandas/demandas.component';
import { ContatoComponent } from './pages/contato/contato.component';
import { CadastrarProdutoComponent } from './pages/cadastrar-produto/cadastrar-produto.component';
import { DetalhesProdutoComponent } from './pages/detalhes-produto/detalhes-produto.component';
import { EntrarComponent } from './pages/entrar/entrar.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { EditarProdutoComponent } from './pages/editar-produto/editar-produto.component';
import { CarrinhoComprasComponent } from './pages/carrinho-compras/carrinho-compras.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { LojaComponent } from './pages/loja/loja.component';
import { PerfilUsuarioComponent } from './pages/perfil-usuario/perfil-usuario.component';
import { PainelComponent } from './pages/painel/painel.component';

import { authGuard } from './guard/auth.guard';
import { GerenciarVendasComponent } from './pages/gerenciar-vendas/gerenciar-vendas.component';


export const routes: Routes = [
    {
        path: '',
        component: IndexComponent
    },
    {
        path: 'entrar',
        component: EntrarComponent
    },    
    {
        path: 'painel',
        component: PainelComponent,
        canActivate: [authGuard],
        
    },
    {
        path: 'gerenciar-vendas',
        component: GerenciarVendasComponent,
        canActivate: [authGuard],
        
    },
    {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [authGuard]
    },
    {
        path: 'perfil-usuario',
        component: PerfilUsuarioComponent,
        canActivate: [authGuard]
    },
    {
        path: 'carrinho',
        component: CarrinhoComprasComponent,
        canActivate: [authGuard]
    },
    {
        path: 'pedidos',
        component: PedidosComponent,
        canActivate: [authGuard]
    },
    {
        path: 'registrar',
        component: RegistrarComponent
    },
    {
        path: 'loja',
        component: LojaComponent,
        canActivate: [authGuard]
    },       
    {
        path: 'editar-produto/:id',
        component: EditarProdutoComponent,
        canActivate: [authGuard]
    },   
    {
        path: 'cadastrar-produto',
        component: CadastrarProdutoComponent,
        canActivate: [authGuard]
    },
    {
        path: 'detalhes-produto/:id', 
        component: DetalhesProdutoComponent
    },
    {
        path: 'quem-somos',
        component: QuemSomosComponent,
    },
    {
        path: 'demandas',
        component: DemandasComponent
    },
    {
        path: 'inicio',
        component: IndexComponent
    },
    {
        path: 'bazar',
        component: BazarComponent
    },
    {
        path: 'demanda',
        component: DemandasComponent
    },
    {
        path: 'contato',
        component: ContatoComponent,
        canActivate: [authGuard]
    }
];
