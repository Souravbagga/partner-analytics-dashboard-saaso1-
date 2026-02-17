import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card relative min-h-[100px]" [class.animate-pulse]="loading">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-secondary-900">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-secondary-600 mt-1">{{ subtitle }}</p>
      </div>
      <div class="relative" [style.height.px]="height">
        <canvas #chartCanvas [class.hidden]="loading"></canvas>
        <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChartCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas?: ElementRef<HTMLCanvasElement>;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() height: number = 300;
  @Input() chartConfig!: ChartConfiguration;
  @Input() loading: boolean = false;

  private chart?: Chart;

  ngOnInit() {
    // Logic moved to ngAfterViewInit
  }

  ngAfterViewInit() {
    if (!this.loading) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['loading'] && !changes['loading'].currentValue) {
      setTimeout(() => this.createChart(), 0);
    }
  }

  private createChart() {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = this.chartCanvas.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx && this.chartConfig) {
      this.chart = new Chart(ctx, this.chartConfig);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
