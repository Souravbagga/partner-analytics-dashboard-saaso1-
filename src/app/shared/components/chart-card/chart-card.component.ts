import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  host: { class: 'block' },
  template: `
    <div class="card relative min-h-[100px]" [class.animate-pulse]="loading">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-secondary-900">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-secondary-600 mt-1">{{ subtitle }}</p>
      </div>
      <div class="relative" [style.height.px]="height">
        <canvas #chartCanvas [class.hidden]="loading"></canvas>
        <div *ngIf="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <lucide-icon [img]="icons.Loader2" class="w-8 h-8 animate-spin text-primary-600"></lucide-icon>
          <span class="text-xs text-secondary-500 font-medium">Loading chart...</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChartCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas?: ElementRef<HTMLCanvasElement>;

  readonly icons = {
    Loader2
  };
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
