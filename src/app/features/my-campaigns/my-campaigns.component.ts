import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Megaphone, ExternalLink, Copy, Check, AlertCircle, TrendingUp, DollarSign } from 'lucide-angular';
import { CampaignService } from '../../core/services/campaign.service';
import { AuthService } from '../../core/services/auth.service';
import { Campaign, UserProfile } from '../../core/models';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { take, switchMap, catchError } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-my-campaigns',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DataTableComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">My Campaigns</h1>
          <p class="text-secondary-600 mt-1">Track and manage your assigned marketing campaigns</p>
        </div>
      </div>

      <!-- Active Campaigns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let campaign of campaigns" class="card p-6 border-l-4 border-primary-600 group hover:shadow-xl transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-secondary-900 text-lg">{{ campaign.name }}</h3>
              <p class="text-xs font-bold text-success uppercase tracking-widest">{{ campaign.platform }} • Active</p>
            </div>
          </div>
          
          <div class="bg-secondary-50 p-4 rounded-xl border border-secondary-200 mb-4 group-hover:bg-white transition-colors">
            <p class="text-xs text-secondary-500 font-medium mb-2 uppercase tracking-tight">Your Referral Link</p>
            <div class="flex items-center gap-2">
              <code class="text-xs text-primary-700 font-semibold truncate flex-1">
                https://partnerly.com/track?cid={{ campaign.id }}&pid={{ profile?.partnerId }}
              </code>
              <button (click)="copyLink(campaign.id!)" class="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors">
                <lucide-icon [img]="icons.Check" *ngIf="copiedId === campaign.id" class="w-4 h-4"></lucide-icon>
                <lucide-icon [img]="icons.Copy" *ngIf="copiedId !== campaign.id" class="w-4 h-4"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="text-center p-2 rounded-lg bg-secondary-50">
              <p class="text-[10px] text-secondary-500 font-bold uppercase">Clicks</p>
              <p class="text-sm font-bold text-secondary-900">{{ (campaign.conversions || 0) * 12 + 4 }}</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-secondary-50">
              <p class="text-[10px] text-secondary-500 font-bold uppercase">Conv.</p>
              <p class="text-sm font-bold text-secondary-900">{{ campaign.conversions || 0 }}</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-secondary-50">
              <p class="text-[10px] text-secondary-500 font-bold uppercase">Earned</p>
              <p class="text-sm font-bold text-success">$ {{ ((campaign.conversions || 0) * 45).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="campaigns.length === 0 && !loading" class="col-span-full card p-12 text-center flex flex-col items-center">
          <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 mb-4">
            <lucide-icon [img]="icons.AlertCircle" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-secondary-900">No campaigns assigned</h3>
          <p class="text-secondary-500 max-w-sm mt-2">You don't have any active campaigns at the moment. Contact your manager for more information.</p>
        </div>
      </div>

      <!-- Performance Breakdown Table -->
      <app-data-table
        title="Performance Breakdown"
        [columns]="columns"
        [data]="performanceData"
        [loading]="loading"
      ></app-data-table>
    </div>
  `,
  styles: []
})
export class MyCampaignsComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  campaigns: Campaign[] = [];
  performanceData: any[] = [];
  loading = true;
  profile: UserProfile | null = null;
  copiedId = '';

  readonly icons = {
    Megaphone,
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    TrendingUp,
    DollarSign
  };

  columns: TableColumn[] = [
    { key: 'campaignName', label: 'Campaign' },
    { key: 'platform', label: 'Platform', type: 'badge' },
    { key: 'clicks', label: 'Units/Clicks' },
    { key: 'conversions', label: 'Conversions' },
    { key: 'revenue', label: 'Sales Revenue', type: 'currency' },
    { key: 'commission', label: 'Earnings', type: 'currency' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.authService.currentUserProfile$.pipe(
      switchMap(profile => {
        this.profile = profile;
        if (!profile?.partnerId) return of([]);

        return combineLatest([
          this.campaignService.getCampaigns(),
          this.eventService.getRecentEvents(profile.partnerId)
        ]);
      })
    ).subscribe({
      next: (result: any) => {
        if (!result || result.length === 0) {
          this.campaigns = [];
          this.performanceData = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const [campaigns, events] = result;
        const partnerId = this.profile?.partnerId;

        // Filter for active campaigns only
        this.campaigns = campaigns.filter((c: Campaign) =>
          (c.partnerId === partnerId || c.partnerId === 'all') && c.status === 'Active'
        );

        // Map performance data
        this.performanceData = this.campaigns.map(c => {
          const campaignEvents = events.filter((e: any) => e.campaignId === c.id);
          return {
            campaignName: c.name,
            platform: c.platform || 'General',
            clicks: (c.conversions || 0) * 12 + 4,
            conversions: campaignEvents.length,
            revenue: campaignEvents.reduce((acc: number, e: any) => acc + (e.revenue || 0), 0),
            commission: campaignEvents.reduce((acc: number, e: any) => acc + (e.commission || 0), 0)
          };
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading my campaigns:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  copyLink(campaignId: string) {
    const link = `https://partnerly.com/track?cid=${campaignId}&pid=${this.profile?.partnerId}`;
    navigator.clipboard.writeText(link).then(() => {
      this.copiedId = campaignId;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedId = '';
        this.cdr.detectChanges();
      }, 2000);
    });
  }
}
