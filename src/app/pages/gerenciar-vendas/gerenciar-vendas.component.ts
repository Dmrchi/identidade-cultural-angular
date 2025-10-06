import { Component, OnInit, signal, ViewChild } from '@angular/core';
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

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: ChartOptions;
  public pedidos = signal<ItemPedido[]>([]);
  public loading = signal(true);

  constructor(private pedidoService: PedidoService) {
    this.chartOptions = this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.fetchAllPedidos();
  }


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

  private fetchAllPedidos(): void {
    this.loading.set(true);
    const allPedidos: ItemPedido[] = [];
    const pageSize = 100;
    const fetchPage = (page: number) => {
      this.pedidoService.buscarPedidosVendidos(page, pageSize)
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
            allPedidos.push(...response.content);
            if (page < response.totalPages - 1) {
              fetchPage(page + 1);
            } else {
              this.pedidos.set(allPedidos);
              this.processarEAtualizarGrafico(allPedidos);
              this.loading.set(false);
            }
          }
        });
    };
    fetchPage(0);
  }

  private processarEAtualizarGrafico(pedidos: ItemPedido[]): void {
    const vendasAgrupadas = new Map<string, number>();

    pedidos.forEach(itemPedido => {
      const data = new Date(itemPedido.pedido.dataEntrega);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;

      const preco = itemPedido.produto.preco;
      const quantidade = itemPedido.quantidade || 1;

      if (typeof preco === 'number' && !isNaN(preco)) {
        const valorItem = preco * quantidade;
        const totalAtual = vendasAgrupadas.get(mes) || 0;
        vendasAgrupadas.set(mes, totalAtual + valorItem);
      } else {
        console.warn('Item de pedido ignorado por ter preço inválido:', itemPedido);
      }
    });

    const dadosParaGrafico: VendasPorMes[] = Array.from(vendasAgrupadas.entries()).map(([mes, totalVendas]) => ({
      mes: this.formatarMes(mes),
      totalVendas: totalVendas
    }));

    const labels = dadosParaGrafico.map(item => item.mes);
    const data = dadosParaGrafico.map(item => item.totalVendas);

    // Agora que `this.chart` está acessível, usamos o método `updateOptions`.
    // É a maneira mais segura e recomendada pela biblioteca ApexCharts.
    if (this.chart) {
        this.chart.updateOptions({
            series: [{
                name: "Total de Vendas",
                data: data,
                color: '#1a237e'
            }],
            xaxis: {
                categories: labels
            }
        });
    }
  }

  private formatarMes(mesString: string): string {
    const [ano, mes] = mesString.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return data.toLocaleDateString('pt-BR', options);
  }
}

