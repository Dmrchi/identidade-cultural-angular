import { NgFor } from '@angular/common';
import { Component, OnInit, Renderer2, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-carrousel',
  standalone: true,
  imports: [ NgFor ],
  templateUrl: './carrousel.component.html',
  styleUrl: './carrousel.component.scss'
})
export class CarouselComponent implements OnInit {
  @ViewChildren('carouselItem') carouselItems!: QueryList<any>;
  activeIndex: number = 0;
  slides: string[] = [
    '../../../assets/praca-independencia.png', 
    '../../../assets/associacao-carrousel2.jpg',
  ];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  nextSlide(): void {
    this.carouselItems.forEach((item, index) => {
      if (index === this.activeIndex) {
        this.renderer.removeClass(item.nativeElement, 'active');
      }
    });

    this.activeIndex = (this.activeIndex + 1) % this.slides.length;

    this.carouselItems.forEach((item, index) => {
      if (index === this.activeIndex) {
        this.renderer.addClass(item.nativeElement, 'active');
      }
    });
  }
}
