import { Component, ElementRef, Input, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface TemperatureData {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full">
      <canvas 
        #chartCanvas 
        class="w-full h-full"
        [attr.aria-label]="'Günlük sıcaklık grafiği'"
      ></canvas>
    </div>
  `
})
export class TemperatureChartComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: TemperatureData | null = null;
  @Input() unit: 'metric' | 'imperial' = 'metric';

  private chart: Chart | null = null;

  constructor() {
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [{
          data: this.getTemperatureValues(),
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false // Tooltip'i kapatıyoruz çünkü sürekli görünen labellar var
          },
          datalabels: {
            display: false // Data labels'ı kapatıyoruz çünkü alt grid'de gösteriyoruz
          }
        },
        layout: {
          padding: {
            top: 5,
            bottom: 5,
            left: 10,
            right: 10
          }
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: false,
            grid: {
              display: false
            },
            beginAtZero: false
          }
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.datasets[0].data = this.getTemperatureValues();
    this.chart.update('active');
  }

  private getTemperatureValues(): number[] {
    if (!this.data) {
      // Default placeholder values
      return [15, 22, 18, 12];
    }

    return [
      this.data.morning,
      this.data.afternoon,
      this.data.evening,
      this.data.night
    ];
  }
}
