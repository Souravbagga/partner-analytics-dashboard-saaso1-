import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card hover:shadow-md transition-shadow duration-200" [class.animate-pulse]="loading">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-secondary-600 mb-1">{{ title }}</p>
          <div *ngIf="loading; else valueTpl" class="h-8 bg-secondary-100 rounded w-24"></div>
          <ng-template #valueTpl>
            <p class="text-3xl font-bold text-secondary-900">{{ value }}</p>
          </ng-template>
          
          <div *ngIf="loading; else changeTpl" class="h-4 bg-secondary-100 rounded w-32 mt-2"></div>
          <ng-template #changeTpl>
            <p *ngIf="change" class="text-sm mt-2" [ngClass]="changeClass">
              <span>{{ change }}</span>
            </p>
          </ng-template>
        </div>
        <div [ngClass]="iconBgClass" class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ml-4">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() change?: string;
  @Input() icon: string = '📊';
  @Input() iconBgClass: string = 'bg-primary-100';
  @Input() loading: boolean = false;

  get changeClass(): string {
    if (!this.change) return '';
    return this.change.startsWith('+')
      ? 'text-success'
      : this.change.startsWith('-')
        ? 'text-danger'
        : 'text-secondary-600';
  }
}
