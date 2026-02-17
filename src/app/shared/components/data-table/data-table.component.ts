import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card overflow-hidden p-0">
      <div class="p-6 border-b border-secondary-200">
        <h3 class="text-lg font-semibold text-secondary-900">{{ title }}</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-secondary-50">
            <tr>
              <th *ngFor="let column of columns" 
                  class="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                {{ column.label }}
              </th>
            </tr>
          </thead>
        <tbody class="bg-white divide-y divide-secondary-200" [class.opacity-50]="loading">
          <tr *ngFor="let row of data" class="hover:bg-secondary-50 transition-colors">
            <td *ngFor="let column of columns" class="px-6 py-4 whitespace-nowrap">
              <ng-container [ngSwitch]="column.type || 'text'">
                <span *ngSwitchCase="'badge'" 
                      [ngClass]="getBadgeClass(row[column.key])"
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ row[column.key] }}
                </span>
                <span *ngSwitchCase="'date'" class="text-sm text-secondary-900">
                  {{ formatDate(row[column.key]) }}
                </span>
                <span *ngSwitchDefault class="text-sm text-secondary-900">
                  {{ row[column.key] }}
                </span>
              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && (!data || data.length === 0)" class="text-center py-12">
        <p class="text-secondary-500">No data available</p>
      </div>
      </div>
    </div>
  `,
  styles: []
})
export class DataTableComponent {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;

  getBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'paused':
        return 'bg-warning/10 text-warning';
      case 'completed':
      case 'inactive':
        return 'bg-secondary-200 text-secondary-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
;