import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { CampaignService } from '../../core/services/campaign.service';
import { PartnerService } from '../../core/services/partner.service';
import { AuthService } from '../../core/services/auth.service';
import { Campaign, Partner } from '../../core/models';
import { LucideAngularModule, Plus, Search, Filter, Megaphone, X, Calendar, DollarSign, TrendingUp, User, ExternalLink } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DataTableComponent, LucideAngularModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slidePanel', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.2, 0.8, 0.4, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.2, 0.8, 0.4, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('pageEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div @pageEntrance class="space-y-8">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Campaigns</h1>
          <p class="text-secondary-600 mt-1">Track and manage your marketing campaigns</p>
        </div>
        <button (click)="showAddModal = true" class="btn btn-primary flex items-center gap-2 px-6">
          <lucide-icon [img]="icons.Plus" class="w-5 h-5"></lucide-icon>
          <span>New Campaign</span>
        </button>
      </div>
      
      <!-- Filter Bar -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <lucide-icon [img]="icons.Search" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterCampaigns()"
              placeholder="Search campaigns..."
              class="input pl-10"
            />
          </div>
          <div class="relative">
            <lucide-icon [img]="icons.Filter" class="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4"></lucide-icon>
            <select [(ngModel)]="statusFilter" (ngModelChange)="filterCampaigns()" class="input w-48 pl-9">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Campaigns Table -->
      <app-data-table
        title="All Campaigns"
        [columns]="columns"
        [data]="filteredCampaigns"
        [loading]="loading"
        [showActions]="true"
        (actionTriggered)="handleAction($event)"
      ></app-data-table>

      <!-- Quick View Sidebar -->
      <div *ngIf="showQuickView" 
           class="fixed inset-0 z-[60] overflow-hidden" 
           aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div @fadeIn class="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm transition-opacity" (click)="showQuickView = false"></div>
        
        <div class="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div @slidePanel class="w-screen max-w-md transform transition-all">
            <div class="flex h-full flex-col bg-white shadow-2xl">
              <!-- Header -->
              <div class="p-6 bg-primary-600">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-bold text-white">Campaign Quick View</h2>
                  <button (click)="showQuickView = false" class="text-white/80 hover:text-white transition-colors">
                    <lucide-icon [img]="icons.X" class="w-6 h-6"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-auto p-6 space-y-8">
                <div class="flex flex-col items-center text-center space-y-4">
                  <div class="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 border-4 border-primary-50">
                    <lucide-icon [img]="icons.Megaphone" class="w-10 h-10"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-secondary-900">{{ selectedCampaign?.name }}</h3>
                    <p class="text-secondary-500 uppercase text-xs font-bold tracking-widest mt-1">{{ selectedCampaign?.status }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <div class="p-4 bg-secondary-50 rounded-xl flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm">
                      <lucide-icon [img]="icons.User" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-xs text-secondary-500 font-medium">Partner</p>
                      <p class="text-secondary-900 font-semibold">{{ selectedCampaign?.partnerName }}</p>
                    </div>
                  </div>

                  <div class="p-4 bg-secondary-50 rounded-xl flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm text-success">
                      <lucide-icon [img]="icons.DollarSign" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-xs text-secondary-500 font-medium">Budget</p>
                      <p class="text-secondary-900 font-bold text-lg">\${{ selectedCampaign?.budget?.toLocaleString() }}</p>
                    </div>
                  </div>

                  <div class="p-4 bg-secondary-50 rounded-xl flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm">
                      <lucide-icon [img]="icons.Calendar" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-xs text-secondary-500 font-medium">Duration</p>
                      <p class="text-secondary-900 font-semibold text-sm">
                        {{ selectedCampaign?.startDate | date:'shortDate' }} - {{ selectedCampaign?.endDate | date:'shortDate' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="border-t border-secondary-100 pt-6">
                  <h4 class="text-sm font-bold text-secondary-900 mb-4 px-1">Quick Actions</h4>
                  <div class="space-y-2 px-1">
                    <button (click)="openEditModal(selectedCampaign)" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-secondary-700 transition-all font-medium">
                      <lucide-icon [img]="icons.Plus" class="w-4 h-4"></lucide-icon>
                      <span>Edit Campaign</span>
                    </button>
                    <a [routerLink]="['/campaigns', selectedCampaign?.id]" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 text-secondary-700 transition-all font-medium">
                      <lucide-icon [img]="icons.ExternalLink" class="w-4 h-4"></lucide-icon>
                      <span>Full Analytics</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="p-6 border-t border-secondary-100 bg-secondary-50/50">
                <button (click)="showQuickView = false" class="w-full btn btn-secondary py-3">Close Panel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
      <!-- Edit Campaign Modal -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
        <div class="card max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-secondary-900">Edit Campaign</h2>
            <button (click)="showEditModal = false" class="text-secondary-400 hover:text-secondary-600">
              <lucide-icon [img]="icons.X" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          
          <form (ngSubmit)="updateCampaign()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Campaign Name</label>
              <input type="text" [(ngModel)]="newCampaign.name" name="name" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Partner</label>
              <select [(ngModel)]="newCampaign.partnerId" name="partnerId" required class="input">
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
              <label class="block text-sm font-medium text-secondary-700 mb-2">Budget (\$)</label>
              <input type="number" [(ngModel)]="newCampaign.budget" name="budget" class="input" />
            </div>

            <div *ngIf="authService.isDemo()" class="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p class="text-xs text-warning-700 font-medium">
                ⚠️ Demo Mode: Changes might not persist.
              </p>
            </div>

            <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p class="text-sm text-danger">{{ errorMessage }}</p>
            </div>
            
            <div class="flex gap-3 pt-4">
              <button type="submit" [disabled]="submitting" class="btn btn-primary flex-1">
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" (click)="showEditModal = false" class="btn btn-secondary flex-1">Cancel</button>
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
  submitting: boolean = false;

  selectedCampaign?: any;
  showQuickView: boolean = false;
  showEditModal: boolean = false;

  startDateString: string = '';
  endDateString: string = '';

  newCampaign: Omit<Campaign, 'id'> = {
    name: '',
    partnerId: '',
    status: 'Active',
    startDate: new Date(),
    endDate: new Date(),
    budget: 0
  };

  readonly icons = {
    Plus,
    Search,
    Filter,
    Megaphone,
    X,
    Calendar,
    DollarSign,
    TrendingUp,
    User,
    ExternalLink
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
      const campaign = {
        ...this.newCampaign,
        startDate: new Date(this.startDateString),
        endDate: new Date(this.endDateString)
      };

      await this.campaignService.addCampaign(campaign);
      this.closeModal();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error adding campaign';
    } finally {
      this.submitting = false;
    }
  }

  handleAction(event: { type: string, row: any }) {
    this.selectedCampaign = event.row;
    if (event.type === 'view') {
      this.showQuickView = true;
    } else if (event.type === 'edit') {
      this.openEditModal(event.row);
    }
  }

  openEditModal(campaign: any) {
    this.selectedCampaign = campaign;
    this.newCampaign = {
      name: campaign.name,
      partnerId: campaign.partnerId,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget
    };
    this.startDateString = this.formatDateForInput(campaign.startDate);
    this.endDateString = this.formatDateForInput(campaign.endDate);
    this.showEditModal = true;
    this.showQuickView = false;
  }

  private formatDateForInput(date: any): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }

  async updateCampaign() {
    if (!this.selectedCampaign?.id) return;

    this.errorMessage = '';
    this.submitting = true;
    try {
      const campaign = {
        ...this.newCampaign,
        startDate: new Date(this.startDateString),
        endDate: new Date(this.endDateString)
      };

      await this.campaignService.updateCampaign(this.selectedCampaign.id, campaign);
      this.showEditModal = false;
      this.loadCampaigns();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error updating campaign';
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
