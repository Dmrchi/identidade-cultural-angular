import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faClipboardList, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup } from '@angular/forms';
interface Demanda {
  titulo: string;
  descricao: string;
  nome: string;
  pontuacao: number;
  foto:string;
}
enum Estado {
  Desativado,
  ExibirDemanda,
  Cadastrar
}
enum InputState {
  Disabled = 'Disabled',
  Email = 'Email',
  Phone = 'Phone'
}
enum TituloState {
  Disabled = 'Disabled',
  Titulo = 'Titulo',
  Foto = 'Foto'
}
@Component({
  selector: 'app-demandas',
  standalone: true,
  imports: [ FontAwesomeModule, CommonModule, ReactiveFormsModule ],
  templateUrl: './demandas.component.html',
  styleUrl: './demandas.component.scss'
})
export class DemandasComponent {
  faClipboardList = faClipboardList;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faSyncAlt = faSyncAlt;

  currentState: InputState = InputState.Email;
  tituloState: TituloState = TituloState.Titulo;
  tituloValue: string = '';
  fotoValue: string = '';
  emailValue: string = '';
  phoneValue: string = '';
  form: FormGroup;
  estado: Estado = Estado.Desativado;
  demandaSelecionada: Demanda | null = null;
  novaDemanda: Demanda = { nome: '', titulo: '',descricao: '', pontuacao: 0, foto: '' };

  inputType: 'email' | 'tel' = 'tel';
  inputPlaceholder: string = 'Digite seu telefone';
  inputValue: string = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titulo: [''],
      descricao: [''],
      nome: [''],
      rua: [''],
      local: [''],
      foto: ['']
    });
  }
  
  demandas: Demanda[] = [
    { nome: 'Remoção de entulho ', titulo: '', descricao: 'Remoção de entulho ', pontuacao: 200, foto: 'https://s2.glbimg.com/NrAB2xCcGz6tBTG_Bp0WYlUgU0UA_rqXuBIQi_pD0ZFIoz-HdGixxa_8qOZvMp3w/s.glbimg.com/jo/g1/f/original/2013/03/21/entulho_1.jpg' },
    { nome: 'Demanda 1',titulo: '',  descricao: '', pontuacao: 90, foto: ''  },
    { nome: 'Demanda 2',titulo: '',  descricao: '', pontuacao: 115, foto: ''  },
    { nome: 'Demanda 3',titulo: '',  descricao: '', pontuacao: 95, foto: ''  },
    { nome: 'Demanda 4',titulo: '',  descricao: '', pontuacao: 85, foto: ''  },
    { nome: 'Demanda 5',titulo: '',  descricao: '', pontuacao: 90, foto: ''  },
    { nome: 'Demanda 6',titulo: '',  descricao: '', pontuacao: 115, foto: ''  },
    { nome: 'Demanda 7',titulo: '',  descricao: '', pontuacao: 95, foto: ''  },
    { nome: 'Demanda 8',titulo: '',  descricao: '', pontuacao: 95, foto: ''  },
    { nome: 'Demanda 9',titulo: '',  descricao: '', pontuacao: 85, foto: ''  },
    { nome: 'Demanda 10',titulo: '',  descricao: '', pontuacao: 90, foto: ''  },
    { nome: 'Demanda 11',titulo: '',  descricao: '', pontuacao: 115, foto: ''  },
    { nome: 'Demanda 12', titulo: '', descricao: '', pontuacao: 95, foto: ''  }
  ];
  currentPage = 0;
  itemsPerPage = 10;
  demandasPaginadas: Demanda[] = [];

  ngOnInit(): void {
    if (this.inputType === 'tel') {
      this.inputValue = localStorage.getItem('telefone') || '';
    } else {
      this.inputValue = localStorage.getItem('email') || '';
    }
    this.demandas.sort((a, b) => b.pontuacao - a.pontuacao);
    this.updateDemandasPaginadas();
  }

  updateDemandasPaginadas() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.demandasPaginadas = this.demandas.slice(start, end);
  }

  nextPage() {
    if ((this.currentPage + 1) * this.itemsPerPage < this.demandas.length) {
      this.currentPage++;
      this.updateDemandasPaginadas();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDemandasPaginadas();
    }
  }
  //ngOnInit(): void {this.demandas.sort((a, b) => b.pontuacao - a.pontuacao);}

    produtos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição do produto 1',
        valor: 29.99,
        quantidade: 1,
        foto: 'https://bonecanopano.com.br/wp-content/uploads/2020/06/babylook-pink-flor-margarida-no-boneca-no-pano-scaled.jpg'
      },
      {
        id: 2,
        nome: 'Produto 2',
        descricao: 'Descrição do produto 2',
        valor: 49.99,
        quantidade: 1,
        foto: 'https://bonecanopano.com.br/wp-content/uploads/2020/06/babylook-pink-flor-margarida-no-boneca-no-pano-scaled.jpg'
      },
      {
        id: 3,
        nome: 'Produto 3',
        descricao: 'Descrição do produto 3',
        valor: 19.99,
        quantidade: 1,
        foto: 'https://bonecanopano.com.br/wp-content/uploads/2020/06/babylook-pink-flor-margarida-no-boneca-no-pano-scaled.jpg'
      }
    ];
  
    activeSlide = 0;
  
    setActiveSlide(index: number) {
      this.activeSlide = index;
      this.updateCarousel();
    }
  
    // ===
 /*
    demandas: Demanda[] = [
      { nome: 'Demanda 1', descricao: 'Descrição da demanda 1', pontuacao: 85 },
      { nome: 'Demanda 2', descricao: 'Descrição da demanda 2', pontuacao: 90 },
      { nome: 'Demanda 3', descricao: 'Descrição da demanda 3', pontuacao: 75 },
      { nome: 'Demanda 4', descricao: 'Descrição da demanda 4', pontuacao: 95 },
      // Adicione mais demandas conforme necessário...
         ];
  */
 
    
    
  
    /*ngOnInit(): void {
      this.demandas.sort((a, b) => b.pontuacao - a.pontuacao);
      this.updateDemandasPaginadas();
    }*/
  
   
    // ===
    updateCarousel() {
      const items = document.querySelectorAll('[data-carousel-item]');
      items.forEach((item, i) => {
        if (i === this.activeSlide) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  
    atualizarQuantidade(id: number, quantidade: number) {
      const produto = this.produtos.find(p => p.id === id);
      if (produto) {
        produto.quantidade = quantidade;
      }
    }
  
    removerDoCarrinho(id: number) {
      this.produtos = this.produtos.filter(p => p.id !== id);
    }

    selecionarDemanda(demanda: Demanda) {
      this.demandaSelecionada = demanda;
      this.estado = Estado.ExibirDemanda;
    }
  
    cadastrar() {
      this.estado = Estado.Cadastrar;
    }
 onSubmit() {
  alert(this.form.get('descricao')?.value);
    const novaDemanda: Demanda = {
      titulo: this.tituloValue,
      descricao: this.form.get('descricao')?.value,
      nome: this.form.get('nome')?.value,
      pontuacao: 0, // Você pode ajustar a lógica para definir a pontuação
      foto: this.fotoValue // Você pode adicionar lógica para definir uma foto
    };
    
    this.demandas.push(novaDemanda);
    console.log('Demanda salva:', novaDemanda);
  }
     
    toggleInput() {
    const inputElement = document.getElementById('email') as HTMLInputElement;
    if (this.currentState === InputState.Email) {
      this.emailValue = inputElement.value;
      this.currentState = InputState.Phone;
      inputElement.value = this.phoneValue;
    } else if (this.currentState === InputState.Phone) {
      this.phoneValue = inputElement.value;
      this.currentState = InputState.Email;
      inputElement.value = this.emailValue;
    }
  }
  toggleTituloInput() {
    const inputElement = document.getElementById('titulo') as HTMLInputElement;
    if (this.tituloState === TituloState.Titulo) {
      this.tituloValue = inputElement.value;
      this.tituloState = TituloState.Foto;
      inputElement.value = this.fotoValue;
    } else if (this.tituloState === TituloState.Foto) {
      this.fotoValue = inputElement.value;
      this.tituloState = TituloState.Titulo;
      inputElement.value = this.tituloValue;
    }
  }
  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (this.currentState === InputState.Email) {
      this.emailValue = inputValue;
    } else if (this.currentState === InputState.Phone) {
      this.phoneValue = inputValue;
    }
  }
  onInputTituloChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (this.tituloState === TituloState.Titulo) {
      this.tituloValue = inputValue;
    } else if (this.tituloState === TituloState.Foto) {
      this.fotoValue = inputValue;
    }
  }
    get estadoAtual() {
      return Estado;
    }
  }
