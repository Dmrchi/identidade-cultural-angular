import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface ActionCard {
  title: string;
  subtitle?: string;
  styleType: 'primary' | 'secondary';
  iconSvg: string; // Armazena a string do SVG do ícone
}

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [ NgClass, NgIf, NgFor],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {   @ViewChildren('menuButton') menuButtons!: QueryList<ElementRef>;

  activeTab: string = 'Bazar';
  activeTabPosition = { left: 0, width: 0 };
  
  activeContent: any;

  menuItems = [
    { name: 'Bazar' },
    { name: 'Vitrine' },
    { name: 'Pedidos' },
    { name: 'Networking' },
    { name: 'Perfil' },
    { name: 'Solicitações' },
  ];

  // A lista 'contents' agora contém a lista de botões para cada aba
  contents = [
    { 
      name: 'Bazar', 
      title: 'Acesso Bazar', 
      subtitle: 'Acesse o Bazar e veja as opções disponíveis:', 
      buttons: [
        { name: 'Ver itens de bazar', link: '/bazar' },
        { name: 'Vender um item', link: '/cadastrar-produto' },
        { name: 'Gerenciar minhas vendas', link: '/gerenciar-vendas' },
      ]
    },
    { 
      name: 'Vitrine', 
      title: 'Acesso Vitrine', 
      subtitle: 'Navegue pela vitrine e descubra produtos:',
      buttons: [
        { name: 'Explorar Vitrine', link: '/contato' },
        { name: 'Buscar produtos', link: '/bazar' },
      ]
    },
    { 
      name: 'Pedidos', 
      title: 'Acesso Pedidos', 
      subtitle: 'Gerencie seus pedidos de forma fácil:', 
      buttons: [
        { name: 'Ver Pedidos em andamento', link: '/pedidos' },
        { name: 'Vendas Concluidas', link: 'pedidos?estado=vendas&page=0' },
        { name: 'Cancelar um pedido', link: '#' },
      ]
    },
    { 
      name: 'Networking', 
      title: 'Acesso Networking', 
      subtitle: 'Conecte-se com outros usuários:', 
      buttons: [
        { name: 'Encontrar pessoas', link: '/contato' },
      ]
    },
    { 
      name: 'Perfil', 
      title: 'Acesso Perfil', 
      subtitle: 'Gerencie suas informações pessoais e de segurança:', 
      buttons: [
        { name: 'Editar informações do perfil', link: '/perfil' },
        { name: 'Alterar Endereço', link: '/perfil' },
      ]
    },
    { 
      name: 'Solicitações', 
      title: 'Acesso Solicitações', 
      subtitle: 'Envie e acompanhe suas solicitações:', 
      buttons: [
        { name: 'Abrir nova solicitação', link: '/demanda' },
      ]
    },
  ];

  actionCards = [
    { title: 'Bazar', subtitle: 'Acesse e venda seus itens', icon: 'fatura', isSpecial: true, linkedTab: 'Bazar' },
    { title: 'Vitrine', subtitle: 'Explore produtos de nossa vitrine', icon: 'boleto', isSpecial: false, linkedTab: 'Vitrine' },
    { title: 'Pedidos', subtitle: 'Acompanhe seus pedidos', icon: 'cliente', isSpecial: false, linkedTab: 'Pedidos' },
    { title: 'Networking', subtitle: 'Conecte-se com outros profissionais', icon: 'perfil', isSpecial: false, linkedTab: 'Networking' },
    { title: 'Perfil', subtitle: 'Gerencie seu perfil e dados', icon: 'duvidas', isSpecial: false, linkedTab: 'Perfil' },
    { title: 'Solicitações', subtitle: 'Envie e acompanhe suas solicitações', icon: 'acesso', isSpecial: false, linkedTab: 'Solicitações' }
  ];

  ngOnInit() {
    this.activeContent = this.contents.find(content => content.name === this.activeTab);
    setTimeout(() => this.updateUnderlinePosition(), 0);
  }

  selectTab(item: any) {
    this.activeTab = item.name;
    this.activeContent = this.contents.find(content => content.name === this.activeTab);
    this.updateUnderlinePosition();
  }

  updateUnderlinePosition() {
    const selectedButton = this.menuButtons.find(
      (button) => button.nativeElement.textContent.trim() === this.activeTab
    );
    if (selectedButton) {
      const parentRect = selectedButton.nativeElement.parentElement.getBoundingClientRect();
      const buttonRect = selectedButton.nativeElement.getBoundingClientRect();
      this.activeTabPosition = {
        left: buttonRect.left - parentRect.left,
        width: buttonRect.width
      };
    }
  }
}