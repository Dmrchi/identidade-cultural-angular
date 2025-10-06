import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-quem-somos',
  standalone: true,
  imports: [NgFor, FontAwesomeModule],
  templateUrl: './quem-somos.component.html',
  styleUrls: ['./quem-somos.component.scss']
})
export class QuemSomosComponent {
  faCheckCircle = faCheckCircle;
  features = [
    { title: 'Voz Unificada', text: 'A união faz a força! Juntos, podemos amplificar nossas vozes para reivindicar melhorias e serviços essenciais junto às autoridades locais. Uma comunidade unida é mais ouvida e respeitada, e nossas demandas têm maior chance de serem atendidas.' },
    { title: 'Segurança e Vigilância', text: 'Ao unir esforços, podemos implementar programas de segurança, como vigilância comunitária e parcerias com a polícia local, para reduzir a criminalidade e garantir um bairro mais seguro para todos.' },
    { title: 'Melhoria da Infraestrutura', text: 'Com uma associação forte, podemos lutar por melhorias na infraestrutura do bairro, como manutenção de ruas, calçadas, iluminação pública, saneamento básico e espaços de lazer.' },
    { title: 'Eventos Comunitários', text: 'A Associação de Moradores organiza eventos e atividades que promovem a convivência e integração entre os moradores, fortalecendo os laços de amizade e criando um verdadeiro sentido de comunidade.' },
    { title: 'Apoio e Recursos', text: 'Fornecemos apoio e recursos para os moradores, incluindo assistência jurídica, programas educacionais e iniciativas de saúde, para garantir que todos tenham acesso às oportunidades e serviços necessários para uma vida plena.' },
    { title: 'Sustentabilidade e Meio Ambiente', text: 'Trabalhamos em projetos de sustentabilidade que promovem a preservação do meio ambiente, como reciclagem, jardinagem comunitária e campanhas de conscientização sobre o uso responsável dos recursos naturais.' }
  ];
}
