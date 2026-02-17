import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { CampaignService } from '../../core/services/campaign.service';
import { PartnerService } from '../../core/services/partner.service';
import { AuthService } from '../../core/services/auth.service';
import { Campaign, Partner } from '../../core/models';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Campaigns</h1>
          <p class="text-secondary-600 mt-1">Track and manage your marketing campaigns</p>
        </div>
        <button (click)="showAddModal = true" class="btn btn-primary">
          <span class="mr-2">+</span> New Campaign
        </button>
      </div>
      
      <!-- Filter Bar -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterCampaigns()"
              placeholder="Search campaigns..."
              class="input"
            />
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="filterCampaigns()" class="input w-48">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      <!-- Campaigns Table -->
      <app-data-table
        title="All Campaigns"
        [columns]="columns"
        [data]="filteredCampaigns"
        [loading]="loading"
      ></app-data-table>
      
      <!-- Add Campaign Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-md w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-secondary-900 mb-6">Create New Campaign</h2>
          
          <form (ngSubmit)="addCampaign()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Campaign Name</label>
              <input type="text" [(ngModel)]="newCampaign.name" name="name" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Partner</label>
              <select [(ngModel)]="newCampaign.partnerId" name="partnerId" required class="input">
                <option value="">Select a partner</option>
                <option *ngFor="let partner of partners" [value]="partner.id">
                  {{ partner.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <select [(ngModel)]="newCampaign.status" name="status" class="input">
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                <input type="date" [(ngModel)]="startDateString" name="startDate" required class="input" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                <input type="date" [(ngModel)]="endDateString" name="endDate" required class="input" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Budget ($)</label>
              <input type="number" [(ngModel)]="newCampaign.budget" name="budget" class="input" />
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
                {{ submitting ? 'Creating...' : 'Create Campaign' }}
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
export class CampaignsComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private campaignService = inject(CampaignService);
  private partnerService = inject(PartnerService);
  public authService = inject(AuthService);

  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  partners: Partner[] = [];
  searchQuery: string = '';
  statusFilter: string = '';
  showAddModal: boolean = false;
  loading: boolean = true;
  errorMessage: string = '';

  startDateString: string = '';
  endDateString: string = '';

  submitting: boolean = false;

  newCampaign: Omit<Campaign, 'id'> = {
    name: '',
    partnerId: '',
    status: 'Active',
    startDate: new Date(),
    endDate: new Date(),
    budget: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Campaign Name' },
    { key: 'partnerName', label: 'Partner' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date', type: 'date' }
  ];

  ngOnInit() {
    this.loadCampaigns();
    this.loadPartners();
  }

  private loadCampaigns() {
    this.loading = true;
    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.enrichCampaignsWithPartnerNames();
        this.filterCampaigns();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadPartners() {
    this.partnerService.getPartners().subscribe({
      next: (partners) => {
        this.partners = partners;
        this.enrichCampaignsWithPartnerNames();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading partners for campaigns:', error);
      }
    });
  }

  private enrichCampaignsWithPartnerNames() {
    this.campaigns = this.campaigns.map(campaign => ({
      ...campaign,
      partnerName: this.partners.find(p => p.id === campaign.partnerId)?.name || 'Unknown'
    }));
  }

  filterCampaigns() {
    this.filteredCampaigns = this.campaigns.filter(campaign => {
      const matchesSearch = !this.searchQuery ||
        campaign.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.statusFilter || campaign.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  async addCampaign() {
    if (!this.newCampaign.name || !this.newCampaign.partnerId || !this.startDateString || !this.endDateString) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;
    try {
      console.log('Attempting to add campaign:', this.newCampaign);
      const campaign = {
        ...this.newCampaign,
        startDate: new Date(this.startDateString),
        endDate: new Date(this.endDateString)
      };

      await this.campaignService.addCampaign(campaign);
      console.log('Campaign added successfully, closing modal...');
      this.closeModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error adding campaign';
      console.error('Error adding campaign:', error);
    } finally {
      this.submitting = false;
    }
  }

  closeModal() {
    console.log('Setting showAddModal to false (Campaign)');
    this.showAddModal = false;
    this.cdr.detectChanges();
    this.errorMessage = '';
    this.newCampaign = {
      name: '',
      partnerId: '',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(),
      budget: 0
    };
    this.startDateString = '';
    this.endDateString = '';
  }
}
