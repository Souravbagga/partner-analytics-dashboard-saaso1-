import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Inbox, Loader2, Eye, Edit2, ChevronRight } from 'lucide-angular';
import { RouterModule } from '@angular/router';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
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
              <th *ngIf="showActions" class="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-secondary-200" [class.opacity-50]="loading">
            <tr *ngFor="let row of data" class="hover:bg-secondary-50 transition-colors group">
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
              <td *ngIf="showActions" class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="onAction('view', row)" 
                          class="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Quick View">
                    <lucide-icon [img]="icons.Eye" class="w-4 h-4"></lucide-icon>
                  </button>
                  <button (click)="onAction('edit', row)" 
                          class="p-2 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                          title="Edit">
                    <lucide-icon [img]="icons.Edit2" class="w-4 h-4"></lucide-icon>
                  </button>
                  <a [routerLink]="[row.id]" 
                     class="p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                     title="Full Details">
                    <lucide-icon [img]="icons.ChevronRight" class="w-4 h-4"></lucide-icon>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
      </table>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col justify-center items-center py-12 gap-3 text-secondary-500">
        <lucide-icon [img]="icons.Loader2" class="w-8 h-8 animate-spin text-primary-600"></lucide-icon>
        <span class="text-sm font-medium">Loading data...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && (!data || data.length === 0)" class="flex flex-col justify-center items-center py-12 gap-3 text-secondary-400">
        <lucide-icon [img]="icons.Inbox" class="w-12 h-12"></lucide-icon>
        <p class="text-sm font-medium">No results found</p>
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
  @Input() showActions: boolean = false;
  @Output() actionTriggered = new EventEmitter<{ type: string, row: any }>();

  readonly icons = {
    Inbox,
    Loader2,
    Eye,
    Edit2,
    ChevronRight
  };

  onAction(type: string, row: any) {
    this.actionTriggered.emit({ type, row });
  }

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