import { Component, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ChartComponent,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { PedidoService } from '../../services/pedido/pedido.service';
import { ItemPedido, PaginaResponse } from '../pedidos/pedidos.component';
import { catchError, throwError } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

interface VendasPorMes {
  mes: string;
  totalVendas: number;
}

@Component({
  selector: 'app-gerenciar-vendas',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './gerenciar-vendas.component.html',
  styleUrl: './gerenciar-vendas.component.scss'
})
export class GerenciarVendasComponent implements OnInit {
  
  public chartOptions: ChartOptions;
  public pedidos = signal<ItemPedido[]>([]);
  public loading = signal(true);

  constructor(private pedidoService: PedidoService) {
    this.chartOptions = this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.fetchPedidos();
  }

  /**
   * Inicializa o objeto de configuração do gráfico com valores padrão.
   * Isso garante que a propriedade 'chartOptions' não seja indefinida.
   */
  private initializeChartOptions(): ChartOptions {
    return {
      series: [{
        name: "Vendas",
        data: []
      }],
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 10,
          columnWidth: '55%',
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [],
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val: number) {
            return `R$ ${val.toFixed(2)}`;
          }
        }
      },
      title: {
        text: 'Vendas por Mês',
        align: 'center'
      }
    };
  }
  
  /**
   * Busca os pedidos e processa os dados para o gráfico.
   */
  fetchPedidos(): void {
    this.loading.set(true);
    this.pedidoService.buscarPedidosVendidos(0, 10)
      .pipe(
        catchError((err) => {
          console.error('Erro ao buscar pedidos:', err);
          this.pedidos.set([]);
          this.loading.set(false);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (response: PaginaResponse<ItemPedido>) => {
          this.pedidos.set(response.content);
          this.processarEAtualizarGrafico(response.content);
          this.loading.set(false);
        }
      });
  }

  /**
   * Processa a lista de pedidos e atualiza a configuração do gráfico.
   * @param pedidos A lista de itens de pedido.
   */
  private processarEAtualizarGrafico(pedidos: ItemPedido[]): void {
    const vendasAgrupadas = new Map<string, number>();

    // Agrupa e soma as vendas por mês
    pedidos.forEach(itemPedido => {
      const data = new Date(itemPedido.pedido.dataEntrega);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      const preco = itemPedido.produto.preco;
      const totalAtual = vendasAgrupadas.get(mes) || 0;
      vendasAgrupadas.set(mes, totalAtual + preco);
    });

    // Converte o mapa para o formato ideal para o gráfico
    const dadosParaGrafico: VendasPorMes[] = Array.from(vendasAgrupadas.entries()).map(([mes, totalVendas]) => ({
      mes: this.formatarMes(mes),
      totalVendas: totalVendas
    }));

    // Separa os dados em categorias (eixo X) e valores (eixo Y)
    const labels = dadosParaGrafico.map(item => item.mes);
    const data = dadosParaGrafico.map(item => item.totalVendas);

    // Atualiza o objeto de configuração do gráfico.
    // Isso faz com que o gráfico seja renderizado com os novos dados.
    this.chartOptions = {
      ...this.chartOptions, // Mantém a configuração existente
      series: [{
        name: "Total de Vendas",
        data: data,
        color: '#1a237e'
      }],
      xaxis: {
        categories: labels,
      }
    };
  }

  /**
   * Formata a string do mês para um formato legível.
   */
  private formatarMes(mesString: string): string {
    const [ano, mes] = mesString.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return data.toLocaleDateString('pt-BR', options);
  }
}
