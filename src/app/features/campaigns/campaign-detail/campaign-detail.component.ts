import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { PartnerService } from '../../../core/services/partner.service';
import { Campaign, Partner } from '../../../core/models';
import { LucideAngularModule, ArrowLeft, Mail, Calendar, ExternalLink, Megaphone, TrendingUp, DollarSign, User, AlertCircle } from 'lucide-angular';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, StatCardComponent],
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
        <a routerLink="/campaigns" class="btn btn-secondary p-2 rounded-lg flex items-center justify-center">
          <lucide-icon [img]="icons.ArrowLeft" class="w-5 h-5"></lucide-icon>
        </a>
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">{{ campaign?.name || 'Campaign Details' }}</h1>
          <p class="text-secondary-600 mt-1">Deep dive into campaign performance and configuration</p>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <ng-container *ngIf="!loading && campaign">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <app-stat-card
            title="Total Budget"
            [value]="'$' + (campaign.budget || 0).toLocaleString()"
            icon="dollar-sign"
            iconBgClass="bg-success/10 text-success"
          ></app-stat-card>
          
          <app-stat-card
            title="Campaign Status"
            [value]="campaign.status"
            icon="trending-up"
            iconBgClass="bg-primary-50 text-primary-600"
          ></app-stat-card>

          <app-stat-card
            title="Days Active"
            [value]="daysActive"
            icon="calendar"
            iconBgClass="bg-warning/10 text-warning"
          ></app-stat-card>

          <app-stat-card
            title="Partner"
            [value]="partnerName"
            icon="user"
            iconBgClass="bg-secondary-100 text-secondary-600"
          ></app-stat-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Configuration Card -->
          <div class="card lg:col-span-2">
            <h3 class="text-lg font-bold text-secondary-900 mb-6 px-1">Campaign Configuration</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
              <div class="space-y-6">
                <div>
                  <label class="text-xs font-bold text-secondary-400 uppercase tracking-wider">Campaign Name</label>
                  <p class="text-lg font-semibold text-secondary-900 mt-1">{{ campaign.name }}</p>
                </div>
                
                <div>
                  <label class="text-xs font-bold text-secondary-400 uppercase tracking-wider">Associated Partner</label>
                  <div class="flex items-center gap-3 mt-2 p-3 bg-secondary-50 rounded-xl border border-secondary-100">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold shadow-sm">
                      {{ partnerName[0].toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-secondary-900">{{ partnerName }}</p>
                      <p class="text-xs text-secondary-500">ID: {{ campaign.partnerId }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <label class="text-xs font-bold text-secondary-400 uppercase tracking-wider">Timeline</label>
                  <div class="mt-2 space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                        <lucide-icon [img]="icons.Calendar" class="w-4 h-4"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-xs text-secondary-500">Starts</p>
                        <p class="text-sm font-bold text-secondary-900">{{ campaign.startDate | date:'longDate' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                        <lucide-icon [img]="icons.Calendar" class="w-4 h-4"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-xs text-secondary-500">Ends</p>
                        <p class="text-sm font-bold text-secondary-900">{{ campaign.endDate | date:'longDate' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-10 p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4">
              <div class="p-2 bg-white rounded-lg text-primary-600 shadow-sm shrink-0">
                <lucide-icon [img]="icons.AlertCircle" class="w-5 h-5"></lucide-icon>
              </div>
              <div>
                <h4 class="text-primary-900 font-bold text-sm">Campaign Note</h4>
                <p class="text-primary-700 text-sm mt-1 leading-relaxed">
                  This campaign is currently in <strong>{{ campaign.status }}</strong> state. All analytics data shown is synced in real-time with the partner platform.
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Stats -->
          <div class="space-y-6">
            <div class="card bg-secondary-900 text-white overflow-hidden relative">
              <div class="relative z-10">
                <h3 class="text-lg font-bold mb-6">Performance Score</h3>
                <div class="text-5xl font-black text-primary-400 mb-2">A+</div>
                <p class="text-secondary-400 text-sm">Top 5% of all partner campaigns this month.</p>
                
                <div class="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-secondary-400">Budget Spent</span>
                    <span class="font-bold">75%</span>
                  </div>
                  <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500" style="width: 75%"></div>
                  </div>
                </div>
              </div>
              <!-- Decorative circles -->
              <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl"></div>
              <div class="absolute -left-10 -top-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
            </div>

            <div class="card border-dashed border-2 bg-secondary-50/50">
              <h4 class="text-sm font-bold text-secondary-900 mb-4">Integrations</h4>
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-secondary-100 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">FB</div>
                  <span class="text-sm font-medium text-secondary-700">Facebook Meta</span>
                  <div class="ml-auto w-2 h-2 rounded-full bg-success animate-pulse"></div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-secondary-100 shadow-sm">
                  <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">GA</div>
                  <span class="text-sm font-medium text-secondary-700">Google Ads</span>
                  <div class="ml-auto w-2 h-2 rounded-full bg-success"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <div *ngIf="!loading && !campaign" class="card text-center py-20">
        <lucide-icon [img]="icons.Megaphone" class="w-16 h-16 text-secondary-200 mx-auto mb-4"></lucide-icon>
        <h3 class="text-xl font-bold text-secondary-900">Campaign not found</h3>
        <p class="text-secondary-500 mt-2">The campaign you are looking for does not exist or has been removed.</p>
        <a routerLink="/campaigns" class="btn btn-primary mt-6 inline-block">Back to Campaigns</a>
      </div>
    </div>
  `,
  styles: []
})
export class CampaignDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private campaignService = inject(CampaignService);
  private partnerService = inject(PartnerService);
  private cdr = inject(ChangeDetectorRef);

  campaign?: Campaign;
  partnerName: string = 'Loading...';
  loading = true;

  readonly icons = {
    ArrowLeft,
    Mail,
    Calendar,
    ExternalLink,
    Megaphone,
    TrendingUp,
    DollarSign,
    User,
    AlertCircle
  };

  get daysActive(): number {
    if (!this.campaign) return 0;
    const start = new Date(this.campaign.startDate);
    const end = new Date(this.campaign.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(id);
    }
  }

  private loadData(id: string) {
    this.loading = true;

    // Fetch campaign details
    this.campaignService.getCampaigns().subscribe(campaigns => {
      this.campaign = campaigns.find(c => c.id === id);

      if (this.campaign) {
        // Fetch partner for this campaign
        this.partnerService.getPartners().subscribe(partners => {
          this.partnerName = partners.find(p => p.id === this.campaign?.partnerId)?.name || 'Unknown Partner';
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
