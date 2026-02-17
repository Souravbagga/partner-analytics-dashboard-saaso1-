import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PartnerService } from '../../core/services/partner.service';
import { AuthService } from '../../core/services/auth.service';
import { Partner } from '../../core/models';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Partners</h1>
          <p class="text-secondary-600 mt-1">Manage your partner relationships</p>
        </div>
        <button (click)="showAddModal = true" class="btn btn-primary">
          <span class="mr-2">+</span> Add Partner
        </button>
      </div>
      
      <!-- Search Bar -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterPartners()"
              placeholder="Search partners by name or email..."
              class="input"
            />
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="filterPartners()" class="input w-48">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <!-- Partners Table -->
      <app-data-table
        title="All Partners"
        [columns]="columns"
        [data]="filteredPartners"
        [loading]="loading"
      ></app-data-table>
      
      <!-- Add Partner Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-md w-full">
          <h2 class="text-2xl font-bold text-secondary-900 mb-6">Add New Partner</h2>
          
          <form (ngSubmit)="addPartner()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name</label>
              <input type="text" [(ngModel)]="newPartner.name" name="name" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
              <input type="email" [(ngModel)]="newPartner.email" name="email" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <select [(ngModel)]="newPartner.status" name="status" class="input">
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div *ngIf="authService.isDemo()" class="p-3 bg-warning/10 border border-warning/20 rounded-lg mb-4">
              <p class="text-xs text-warning-700 font-medium">
                ⚠️ You are in <strong>Demo Mode</strong>. Changes may not be saved to the real database.
              </p>
            </div>

            <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p class="text-sm text-danger">{{ errorMessage }}</p>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" [disabled]="submitting" class="btn btn-primary flex-1">
                {{ submitting ? 'Adding...' : 'Add Partner' }}
              </button>
              <button type="button" (click)="closeModal()" class="btn btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PartnersComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private partnerService = inject(PartnerService);
  public authService = inject(AuthService);

  partners: Partner[] = [];
  filteredPartners: Partner[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  showAddModal: boolean = false;
  loading: boolean = true;
  errorMessage: string = '';

  newPartner: Omit<Partner, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    status: 'Active'
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Partner Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'createdAt', label: 'Created Date', type: 'date' }
  ];

  ngOnInit() {
    this.loadPartners();
  }

  private loadPartners() {
    this.loading = true;
    this.partnerService.getPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
        this.filterPartners();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading partners:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterPartners() {
    this.filteredPartners = this.partners.filter(partner => {
      const matchesSearch = !this.searchQuery ||
        partner.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        partner.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || partner.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  submitting: boolean = false;

  async addPartner() {
    if (!this.newPartner.name || !this.newPartner.email) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    try {
      console.log('Attempting to add partner:', this.newPartner);
      await this.partnerService.addPartner(this.newPartner as Omit<Partner, 'id'>);
      console.log('Partner added successfully, closing modal...');
      this.closeModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error adding partner';
      console.error('Error adding partner:', error);
    } finally {
      this.submitting = false;
    }
  }

  closeModal() {
    console.log('Setting showAddModal to false');
    this.showAddModal = false;
    this.cdr.detectChanges();
    this.newPartner = {
      name: '',
      email: '',
      status: 'Active'
    };
  }
}
