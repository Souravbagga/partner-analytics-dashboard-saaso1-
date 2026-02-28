import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { PartnerService } from '../../../core/services/partner.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { Partner, Campaign } from '../../../core/models';
import { LucideAngularModule, ArrowLeft, Mail, Calendar, ExternalLink, Megaphone, TrendingUp, DollarSign, Users } from 'lucide-angular';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { Edit2, X } from 'lucide-angular';

@Component({
  selector: 'app-partner-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, DataTableComponent, StatCardComponent, FormsModule],
  animations: [
    trigger('pageEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div @pageEntrance class="space-y-8">
      <!-- Back Button & Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/partners" class="btn btn-secondary p-2 rounded-lg flex items-center justify-center">
          <lucide-icon [img]="icons.ArrowLeft" class="w-5 h-5"></lucide-icon>
        </a>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-secondary-900">{{ partner?.name || 'Partner Details' }}</h1>
          <p class="text-secondary-600 mt-1">Analytics and campaign history for this partner</p>
        </div>
        <button *ngIf="partner" (click)="openEditModal()" class="btn btn-secondary flex items-center gap-2">
          <lucide-icon [img]="icons.Edit2" class="w-4 h-4"></lucide-icon>
          <span>Edit Partner</span>
        </button>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <ng-container *ngIf="!loading && partner">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-stat-card
            title="Total Campaigns"
            [value]="partnerCampaigns.length"
            icon="megaphone"
            iconBgClass="bg-primary-50 text-primary-600"
          ></app-stat-card>
          
          <app-stat-card
            title="Total Budget"
            [value]="'$' + totalBudget.toLocaleString()"
            icon="dollar-sign"
            iconBgClass="bg-success/10 text-success"
          ></app-stat-card>
          
          <app-stat-card
            title="Partner Status"
            [value]="partner.status"
            icon="trending-up"
            iconBgClass="bg-warning/10 text-warning"
          ></app-stat-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Profile Card -->
          <div class="card h-fit">
            <h3 class="text-lg font-bold text-secondary-900 mb-6 px-1">Profile Overview</h3>
            <div class="space-y-6">
              <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                  {{ partner.name[0].toUpperCase() }}
                </div>
                <div>
                  <p class="text-xs text-secondary-500 font-medium">Full Name</p>
                  <p class="text-secondary-900 font-bold">{{ partner.name }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                <div class="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm border border-secondary-100">
                  <lucide-icon [img]="icons.Mail" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-xs text-secondary-500 font-medium">Email Address</p>
                  <p class="text-secondary-900 font-bold">{{ partner.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                <div class="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-secondary-400 shadow-sm border border-secondary-100">
                  <lucide-icon [img]="icons.Calendar" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-xs text-secondary-500 font-medium">Member Since</p>
                  <p class="text-secondary-900 font-bold">{{ partner.createdAt | date:'longDate' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Campaigns Table -->
          <div class="lg:col-span-2">
            <app-data-table
              title="Partner Campaigns"
              [columns]="campaignColumns"
              [data]="partnerCampaigns"
              [loading]="false"
            ></app-data-table>
          </div>
        </div>
      </ng-container>

      <div *ngIf="!loading && !partner" class="card text-center py-20">
        <lucide-icon [img]="icons.Users" class="w-16 h-16 text-secondary-200 mx-auto mb-4"></lucide-icon>
        <h3 class="text-xl font-bold text-secondary-900">Partner not found</h3>
        <p class="text-secondary-500 mt-2">The partner you are looking for does not exist or has been removed.</p>
        <a routerLink="/partners" class="btn btn-primary mt-6 inline-block">Back to Partners</a>
      </div>

      <!-- Edit Partner Modal -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
        <div class="card max-w-md w-full">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-secondary-900">Edit Partner</h2>
            <button (click)="showEditModal = false" class="text-secondary-400 hover:text-secondary-600">
              <lucide-icon [img]="icons.X" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          
          <form (ngSubmit)="updatePartner()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Partner Name</label>
              <input type="text" [(ngModel)]="editPartnerData.name" name="name" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
              <input type="email" [(ngModel)]="editPartnerData.email" name="email" required class="input" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-2">Account Status</label>
              <select [(ngModel)]="editPartnerData.status" name="status" class="input">
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Inactive">Inactive</option>
              </select>
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
export class PartnerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private partnerService = inject(PartnerService);
  private campaignService = inject(CampaignService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  partner?: Partner;
  partnerCampaigns: Campaign[] = [];
  loading = true;
  showEditModal = false;
  submitting = false;
  errorMessage = '';

  editPartnerData: Omit<Partner, 'id' | 'createdAt'> = {
    name: '',
    email: '',
    status: 'Active'
  };

  readonly icons = {
    ArrowLeft,
    Mail,
    Calendar,
    ExternalLink,
    Megaphone,
    TrendingUp,
    DollarSign,
    Users,
    Edit2,
    X
  };

  campaignColumns: TableColumn[] = [
    { key: 'name', label: 'Campaign Name' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'budget', label: 'Budget' }
  ];

  get totalBudget(): number {
    return this.partnerCampaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  openEditModal() {
    if (!this.partner) return;
    this.editPartnerData = {
      name: this.partner.name,
      email: this.partner.email,
      status: this.partner.status
    };
    this.showEditModal = true;
  }

  async updatePartner() {
    if (!this.partner?.id) return;

    this.errorMessage = '';
    this.submitting = true;
    try {
      await this.partnerService.updatePartner(this.partner.id, this.editPartnerData);
      this.showEditModal = false;
      this.loadData(this.partner.id); // Refresh data
    } catch (error: any) {
      this.errorMessage = error.message || 'Error updating partner';
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }

  private loadData(id: string) {
    this.loading = true;

    // Fetch partner details
    this.partnerService.getPartners().subscribe(partners => {
      this.partner = partners.find(p => p.id === id);

      if (this.partner) {
        // Fetch campaigns for this partner
        this.campaignService.getCampaigns().subscribe(campaigns => {
          this.partnerCampaigns = campaigns.filter(c => c.partnerId === id);
          this.loading = false;
          this.cdr.detectChanges();
        });
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
