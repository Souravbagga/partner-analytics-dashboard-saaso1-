import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Inbox, Loader2, Eye, Edit2, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Search, Filter, Download } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'currency';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="card overflow-hidden p-0">
      <div class="p-6 border-b border-secondary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 class="text-lg font-semibold text-secondary-900">{{ title }}</h3>
        
        <div *ngIf="showFilters" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-2xl">
          <div class="relative flex-1">
            <lucide-icon [img]="icons.Search" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4"></lucide-icon>
            <input
              type="text"
              [ngModel]="searchQuery"
              (ngModelChange)="searchQueryChange.emit($event)"
              [placeholder]="searchPlaceholder"
              class="input pl-9 py-1.5 text-sm"
            />
          </div>
          
          <div class="relative min-w-[160px]" *ngIf="statusOptions.length > 0">
            <lucide-icon [img]="icons.Filter" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-3.5 h-3.5"></lucide-icon>
            <select 
              [ngModel]="statusFilter" 
              (ngModelChange)="statusFilterChange.emit($event)"
              class="input pl-8 py-1.5 text-sm w-full"
            >
              <option value="">All Status</option>
              <option *ngFor="let option of statusOptions" [value]="option">{{ option }}</option>
            </select>
          </div>

          <button *ngIf="showExport" 
                  (click)="exportToCSV()" 
                  class="btn btn-secondary px-3 py-1.5 text-sm flex items-center gap-2"
                  title="Export to CSV">
            <lucide-icon [img]="icons.Download" class="w-4 h-4"></lucide-icon>
            <span class="hidden md:inline">Export</span>
          </button>
        </div>
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
            <tr *ngFor="let row of paginatedData" class="hover:bg-secondary-50 transition-colors group">
              <td *ngFor="let column of columns" class="px-6 py-4 whitespace-nowrap">
                <ng-container [ngSwitch]="column.type">
                  <!-- Currency -->
                  <span *ngSwitchCase="'currency'" class="font-bold text-secondary-900">
                    {{ row[column.key] | currency:'USD':'symbol':'1.0-0' }}
                  </span>
                  
                  <!-- Badge -->
                  <span *ngSwitchCase="'badge'" 
                        [ngClass]="getBadgeClass(row[column.key])"
                        class="px-2 py-1 rounded-full text-xs font-bold ring-1">
                    {{ row[column.key] }}
                  </span>
                  
                  <!-- Date -->
                  <span *ngSwitchCase="'date'" class="text-secondary-500">
                    {{ row[column.key] | date:'mediumDate' }}
                  </span>
                  
                  <!-- Default -->
                  <span *ngSwitchDefault [class.font-medium]="column.key === 'name'">
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

      <!-- Pagination Controls -->
      <div *ngIf="!loading && data && data.length > pageSize" 
           class="px-6 py-4 bg-white border-t border-secondary-100 flex items-center justify-between">
        <div class="flex-1 flex items-center justify-between sm:hidden">
          <button (click)="prevPage()" [disabled]="currentPage === 1" 
                  class="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50">Previous</button>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages" 
                  class="btn btn-secondary px-4 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
        
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-secondary-700">
              Showing <span class="font-medium">{{ startIndex + 1 }}</span> to 
              <span class="font-medium">{{ endIndex }}</span> of 
              <span class="font-medium">{{ data.length }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button (click)="goToPage(1)" [disabled]="currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                <span class="sr-only">First</span>
                <lucide-icon [img]="icons.ChevronsLeft" class="h-4 w-4"></lucide-icon>
              </button>
              <button (click)="prevPage()" [disabled]="currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                <span class="sr-only">Previous</span>
                <lucide-icon [img]="icons.ChevronLeft" class="h-4 w-4"></lucide-icon>
              </button>
              
              <ng-container *ngFor="let page of visiblePages">
                <button (click)="goToPage(page)"
                        [class.bg-primary-50]="currentPage === page"
                        [class.text-primary-600]="currentPage === page"
                        [class.border-primary-500]="currentPage === page"
                        [class.z-10]="currentPage === page"
                        class="bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  {{ page }}
                </button>
              </ng-container>

              <button (click)="nextPage()" [disabled]="currentPage === totalPages"
                      class="relative inline-flex items-center px-2 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                <span class="sr-only">Next</span>
                <lucide-icon [img]="icons.ChevronRight" class="h-4 w-4"></lucide-icon>
              </button>
              <button (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50">
                <span class="sr-only">Last</span>
                <lucide-icon [img]="icons.ChevronsRight" class="h-4 w-4"></lucide-icon>
              </button>
            </nav>
          </div>
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
  @Input() pageSize: number = 5;
  @Input() showFilters: boolean = false;
  @Input() showExport: boolean = false;
  @Input() searchQuery: string = '';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() statusFilter: string = '';
  @Input() statusOptions: string[] = [];

  @Output() actionTriggered = new EventEmitter<{ type: string, row: any }>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<string>();

  currentPage: number = 1;

  readonly icons = {
    Inbox,
    Loader2,
    Eye,
    Edit2,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Filter,
    Download
  };

  get totalPages(): number {
    return Math.ceil((this.data?.length || 0) / this.pageSize);
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.data?.slice(start, start + this.pageSize) || [];
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.data?.length || 0);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  // Reset to first page when data changes
  private _previousDataLength = 0;
  ngOnChanges() {
    if (this.data?.length !== this._previousDataLength) {
      this.currentPage = 1;
      this._previousDataLength = this.data?.length || 0;
    }
  }

  onAction(type: string, row: any) {
    this.actionTriggered.emit({ type, row });
  }

  exportToCSV() {
    if (!this.data || this.data.length === 0) return;

    const headers = this.columns.map(col => col.label).join(',');
    const rows = this.data.map(row => {
      return this.columns.map(col => {
        let value = row[col.key];
        if (col.type === 'date' && value) {
          value = this.formatDate(value);
        }
        // Handle commas in values
        const stringValue = String(value || '');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${this.title.replace(/\s+/g, '_').toLowerCase()}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
