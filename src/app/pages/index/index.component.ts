import { NgClass, NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [ NgClass, NgFor ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  
    items = [
      { image: 'independencia.jpg', title1: 'Participação Ativa', title2: 'Organização em Comunidade', title3: 'Acreditamos na participação de cada membro da comunidade para o bem-estar e a melhoria do nosso bairro.' },
      { image: 'localizacao-digital.png', title1: 'Levantamento Demandas', title2: 'Identificar Necessidades', title3: 'Compreender as necessidades da nossa comunidade. Juntos, identificar as prioridades e demandas urgentes.' },
      { image: 'publico.png', title1: 'Sociedade Digital', title2: 'Conectando Comunidades Inovadoras', title3: 'Promover a inclusão tecnológica e a inovação dentro da nossa comunidade aproximar pessoas e criar oportunidades.' }
    ];
    currentIndex = 0;
    cards = [
      {
        title: 'Associado Digital',
        subtitle: 'Colaboração para Transformar',
        description: 'Ser membro de uma associação de moradores é ajudar no desenvolvimento e o bem-estar de toda a comunidade. A participação ativa nesta organização oferece inúmeras vantagens e benefícios que impactam diretamente a qualidade de vida de todos os residentes. A seguir, destacamos alguns dos principais benefícios de ser associado.Em primeiro lugar, a associação desempenha um papel crucial na organização da limpeza e manutenção de áreas comuns, como praças e ruas. Através de esforços colaborativos, os membros garantem que os espaços públicos estejam sempre limpos e bem cuidados, proporcionando um ambiente agradável e saudável para todos.Além disso, a associação promove eventos e atividades culturais que enriquecem a vida comunitária. Festivais, feiras, encontros e oficinas culturais são apenas algumas das iniciativas que fortalecem os laços entre os moradores e incentivam a participação coletiva em atividades recreativas e educativas. Outra vantagem significativa é a defesa dos direitos dos moradores. A associação atua como uma voz coletiva, representando os interesses dos residentes junto às autoridades locais e regionais. Isso assegura que as demandas e necessidades da comunidade sejam ouvidas e atendidas de forma eficaz.A promoção de ações que visam o desenvolvimento social e cultural da região também é uma prioridade. Através de projetos e parcerias, a associação oferece cursos, workshops e outras iniciativas que contribuem para o crescimento pessoal e profissional dos moradores, promovendo uma comunidade mais instruída e engajada.Além disso, a associação facilita o compartilhamento de ideias em grupo sobre como obter melhorias na infraestrutura, segurança, saúde e educação do bairro. Reuniões regulares permitem que os moradores discutam suas preocupações e sugestões, criando um plano de ação conjunto que beneficia a todos.',
        showDescription: false
      },
      {
        title: 'Resultados Concretos ',
        subtitle: 'Planejamento e priorização de melhorias',
        description: 'Quando nos unimos, nossa comunidade ganha uma voz mais forte e influente. Unidos, conseguimos negociar de maneira mais eficaz com as autoridades e aumentar nossas chances de ver as demandas do bairro atendidas. Participando ativamente da nossa associação, contribuímos para um futuro com mais oportunidades e qualidade de vida para todos',
        showDescription: false
      },
      
 
    ];
  
   
  
    @ViewChild('prevButton') prevButton!: ElementRef;
    @ViewChild('nextButton') nextButton!: ElementRef;
  
    ngOnInit() {
      setInterval(() => {
        this.nextSlide();
      }, 5000);
  
      // Torne os botões visíveis após o carregamento da página
      this.showButtons();
    }
    toggleDescription(card: any) {
      card.showDescription = !card.showDescription;
    }
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
      this.updateCarouselPosition();
    }
  
    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this.updateCarouselPosition();
    }
  
    updateCarouselPosition() {
      const carousel = document.querySelector('.carousel') as HTMLElement;
      if (carousel) {
        const offset = -this.currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
      }
    }
  
    showButtons() {
      if (this.prevButton && this.nextButton) {
        this.prevButton.nativeElement.style.opacity = '1';
        this.prevButton.nativeElement.style.visibility = 'visible';
        this.nextButton.nativeElement.style.opacity = '1';
        this.nextButton.nativeElement.style.visibility = 'visible';
      }
    }
  }