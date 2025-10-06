import { Component } from '@angular/core';
import { CarouselComponent } from "../../components/carrousel/carrousel.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-inicial',
  standalone: true,
  imports: [CarouselComponent, NgIf],
  templateUrl: './inicial.component.html',
  styleUrl: './inicial.component.scss'
})

export class InicialComponent {
  currentCard: number = 0;
  cards: any = [
    { title: 'Por Que Ser um Associado?', subtitle: 'Fortalecimento da Comunidade', description: 'Juntos somos mais fortes! Ao se tornar um associado, você contribui diretamente para o desenvolvimento e a melhoria de nosso bairro.\nA união dos moradores é fundamental para conseguirmos recursos e apoio em editais culturais e artesanais.' },
    { title: 'Título 2', subtitle: 'Subtítulo 2', description: 'Descrição do Card 2' },
    { title: 'Título 3', subtitle: 'Subtítulo 3', description: 'Descrição do Card 3' }
  ];

  nextCard() {
    this.currentCard = (this.currentCard + 1) % this.cards.length;
  }

  prevCard() {
    this.currentCard = (this.currentCard - 1 + this.cards.length) % this.cards.length;
  }
}
