import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PartnerService } from '../../core/services/partner.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Partner, Campaign, Activity, AuditLog, ConversionEvent, UserProfile } from '../../core/models';
import { combineLatest, take, Observable, of, switchMap, catchError } from 'rxjs';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { PayoutService } from '../../core/services/payout.service';
import {
    LucideAngularModule,
    Users,
    Megaphone,
    DollarSign,
    TrendingUp,
    ExternalLink,
    Copy,
    Check,
    Clock,
    Wallet,
    AlertCircle
} from 'lucide-angular';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, StatCardComponent, ChartCardComponent, DataTableComponent, LucideAngularModule],
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
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p class="text-secondary-600 mt-1">
            {{ (authService.currentUserProfile$ | async)?.role === 'Partner' ? 'Your performance at a glance.' : "Welcome back to Partnerly! Here's what's happening today." }}
          </p>
        </div>
        
        <div class="flex items-center gap-3">
            <div *ngIf="(authService.currentUserProfile$ | async)?.role === 'Admin'" class="flex gap-2">
                <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold self-start">Admin View</span>
            </div>
            
            <button *ngIf="(authService.currentUserProfile$ | async)?.role === 'Partner'"
                    (click)="showPayoutModal = true"
                    class="btn btn-primary flex items-center gap-2 px-6 shadow-lg shadow-primary-200">
                <lucide-icon [img]="icons.Wallet" class="w-5 h-5"></lucide-icon>
                <span>Request Payout</span>
            </button>
        </div>
      </div>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Admin/Manager KPIs -->
        <ng-container *ngIf="(authService.currentUserProfile$ | async)?.role !== 'Partner'">
            <app-stat-card
              title="Total Partners"
              [value]="stats.totalPartners"
              change="+12% from last month"
              icon="users"
              iconBgClass="bg-primary-100/50 text-primary-600"
              [loading]="loading"
            ></app-stat-card>
            
            <app-stat-card
              title="Active Campaigns"
              [value]="stats.activeCampaigns"
              change="+8% from last month"
              icon="megaphone"
              iconBgClass="bg-success/10 text-success"
              [loading]="loading"
            ></app-stat-card>
            
            <app-stat-card
              title="Total Revenue"
              [value]="'$' + stats.totalRevenue.toLocaleString()"
              change="+23% from last month"
              icon="dollar-sign"
              iconBgClass="bg-warning/10 text-warning-600"
              [loading]="loading"
            ></app-stat-card>

            <app-stat-card
              title="Global Conversions"
              [value]="stats.conversions.toLocaleString()"
              change="+15% from last month"
              icon="trending-up"
              iconBgClass="bg-purple-100/50 text-purple-600"
              [loading]="loading"
            ></app-stat-card>
        </ng-container>

        <!-- Partner Specific KPIs -->
        <ng-container *ngIf="(authService.currentUserProfile$ | async)?.role === 'Partner'">
            <app-stat-card
              title="Total Earnings"
              [value]="'$' + stats.totalCommission.toLocaleString()"
              change="All time earnings"
              icon="dollar-sign"
              iconBgClass="bg-success/10 text-success"
              [loading]="loading"
            ></app-stat-card>
            
            <app-stat-card
              title="This Month"
              [value]="'$' + (stats.totalCommission * 0.4).toLocaleString()"
              change="Projected this month"
              icon="trending-up"
              iconBgClass="bg-primary-100/50 text-primary-600"
              [loading]="loading"
            ></app-stat-card>
            
            <app-stat-card
              title="Pending Approval"
              [value]="'$' + (stats.totalCommission * 0.15).toLocaleString()"
              change="Awaiting verification"
              icon="clock"
              iconBgClass="bg-warning/10 text-warning-600"
              [loading]="loading"
            ></app-stat-card>

            <app-stat-card
              title="Available for Payout"
              [value]="'$' + (stats.totalCommission * 0.7).toLocaleString()"
              change="Ready to withdraw"
              icon="wallet"
              iconBgClass="bg-purple-100/50 text-purple-600"
              [loading]="loading"
            ></app-stat-card>
        </ng-container>
      </div>

      <!-- Partner Referral Links Section -->
      <div *ngIf="(authService.currentUserProfile$ | async)?.role === 'Partner'" class="space-y-4">
        <h2 class="text-xl font-bold text-secondary-900 flex items-center gap-2">
            <lucide-icon [img]="icons.Megaphone" class="w-6 h-6 text-primary-600"></lucide-icon>
            My Active Campaigns
        </h2>
        
        <div *ngIf="partnerCampaigns.length === 0 && !loading" class="card p-12 text-center flex flex-col items-center">
            <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-400 mb-4">
                <lucide-icon [img]="icons.AlertCircle" class="w-10 h-10"></lucide-icon>
            </div>
            <h3 class="text-lg font-bold text-secondary-900">No active campaigns</h3>
            <p class="text-secondary-500 max-w-sm mt-2">You are not assigned to any campaigns yet. Contact your manager to start earning.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let campaign of partnerCampaigns" class="card p-6 border-l-4 border-primary-600 group hover:shadow-xl transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-secondary-900 text-lg">{{ campaign.name }}</h3>
                        <p class="text-xs font-bold text-success uppercase tracking-widest">{{ campaign.platform }} • 20% Commission</p>
                    </div>
                </div>
                
                <div class="bg-secondary-50 p-4 rounded-xl border border-secondary-200 mb-4 group-hover:bg-white transition-colors">
                    <p class="text-xs text-secondary-500 font-medium mb-2 uppercase tracking-tight">Your Referral Link</p>
                    <div class="flex items-center gap-2">
                        <code class="text-xs text-primary-700 font-semibold truncate flex-1">
                            https://partnerly.com/track?cid={{ campaign.id }}&pid={{ profile?.partnerId }}
                        </code>
                        <button (click)="copyLink(campaign.id!)" class="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors">
                            <lucide-icon [img]="copiedId === campaign.id ? icons.Check : icons.Copy" class="w-4 h-4"></lucide-icon>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <div class="text-center p-2 rounded-lg bg-secondary-50">
                        <p class="text-[10px] text-secondary-500 font-bold uppercase">Clicks</p>
                        <p class="text-sm font-bold text-secondary-900">{{ (campaign.conversions || 0) * 12 + 4 }}</p>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-secondary-50">
                        <p class="text-[10px] text-secondary-500 font-bold uppercase">Conversions</p>
                        <p class="text-sm font-bold text-secondary-900">{{ campaign.conversions || 0 }}</p>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-secondary-50">
                        <p class="text-[10px] text-secondary-500 font-bold uppercase">Earned</p>
                        <p class="text-sm font-bold text-success">$ {{ ((campaign.conversions || 0) * 45).toLocaleString() }}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Performance Section (Table vs Charts) -->
      <div class="grid grid-cols-1 gap-8">
        <!-- Partner Detailed Performance Table -->
        <app-data-table
            *ngIf="(authService.currentUserProfile$ | async)?.role === 'Partner'"
            title="Campaign Performance Breakdown"
            [columns]="partnerPerformanceColumns"
            [data]="partnerPerformanceData"
            [loading]="loading"
        ></app-data-table>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-chart-card
                title="Revenue Trend"
                subtitle="Performance over time"
                [chartConfig]="revenueChartConfig"
                [height]="300"
                [loading]="loading"
            ></app-chart-card>
            
            <app-chart-card
                title="Conversions Trend"
                subtitle="Growth analytics"
                [chartConfig]="conversionsChartConfig"
                [height]="300"
                [loading]="loading"
            ></app-chart-card>
        </div>
      </div>
      
      <!-- Recent Activity / Payout History -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <app-data-table
                [title]="(authService.currentUserProfile$ | async)?.role === 'Admin' ? 'Admin Activity Log' : 'Recent Conversions'"
                [columns]="(authService.currentUserProfile$ | async)?.role === 'Admin' ? activityColumns : conversionColumns"
                [data]="(authService.currentUserProfile$ | async)?.role === 'Admin' ? recentActivity : recentConversions"
                [loading]="loading"
            ></app-data-table>
        </div>

        <div class="lg:col-span-1">
            <!-- Payout Card (Partner Only) -->
            <div *ngIf="(authService.currentUserProfile$ | async)?.role === 'Partner'" class="card h-full flex flex-col">
                <div class="p-6 border-b border-secondary-100 flex items-center justify-between">
                    <h3 class="font-bold text-secondary-900">Payout History</h3>
                    <lucide-icon [img]="icons.Wallet" class="w-5 h-5 text-secondary-400"></lucide-icon>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-4">
                    <div *ngFor="let payout of payouts" class="flex items-center justify-between p-3 rounded-xl bg-secondary-50 border border-secondary-100">
                        <div>
                            <p class="text-sm font-bold text-secondary-900">$ {{ payout.amount }}</p>
                            <p class="text-[10px] text-secondary-500 uppercase">{{ payout.requestedAt | date:'mediumDate' }}</p>
                        </div>
                        <span class="px-2 py-1 rounded text-[10px] font-bold uppercase" 
                              [ngClass]="{
                                'bg-warning/10 text-warning-700': payout.status === 'Pending',
                                'bg-success/10 text-success': payout.status === 'Paid'
                              }">
                            {{ payout.status }}
                        </span>
                    </div>

                    <div *ngIf="payouts.length === 0" class="h-40 flex flex-col items-center justify-center text-center opacity-50">
                        <lucide-icon [img]="icons.AlertCircle" class="w-8 h-8 mb-2"></lucide-icon>
                        <p class="text-xs font-medium">No payouts requested yet.</p>
                    </div>
                </div>
                <div class="p-4 bg-secondary-50/50 border-t border-secondary-100 mt-auto">
                    <div class="flex justify-between text-xs font-bold text-secondary-600 mb-2 uppercase">
                        <span>Min Payout</span>
                        <span>$100.00</span>
                    </div>
                    <button [disabled]="(stats.totalCommission * 0.7) < 100" 
                            (click)="showPayoutModal = true"
                            class="w-full btn btn-primary py-2 text-sm shadow-md shadow-primary-200">
                        Request Withdrawal
                    </button>
                </div>
            </div>

            <!-- Admin Stats Side Card -->
            <div *ngIf="(authService.currentUserProfile$ | async)?.role === 'Admin'" class="card p-6 h-full flex flex-col justify-center items-center text-center">
                <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4 shadow-inner">
                    <lucide-icon [img]="icons.Users" class="w-8 h-8"></lucide-icon>
                </div>
                <h3 class="font-bold text-secondary-900 text-lg">Manage Network</h3>
                <p class="text-secondary-500 text-sm mt-2 mb-6">Review partner onboarding requests and approve pending payouts.</p>
                <div class="grid grid-cols-2 gap-3 w-full">
                    <div class="p-3 bg-secondary-50 rounded-xl">
                        <p class="text-xl font-bold text-primary-600">3</p>
                        <p class="text-[10px] font-bold text-secondary-500 uppercase">Waitlist</p>
                    </div>
                    <div class="p-3 bg-secondary-50 rounded-xl">
                        <p class="text-xl font-bold text-warning-600">5</p>
                        <p class="text-[10px] font-bold text-secondary-500 uppercase">Payouts</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Payout Request Modal -->
      <div *ngIf="showPayoutModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="card max-w-sm w-full p-8 shadow-2xl scale-up-center">
            <h2 class="text-2xl font-bold text-secondary-900 mb-2">Request Payout</h2>
            <p class="text-secondary-500 text-sm mb-6">Maximum available: <strong>$ {{ (stats.totalCommission * 0.7).toLocaleString() }}</strong></p>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-secondary-700 uppercase mb-2 tracking-widest">Amount to Withdraw</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary-400">$</span>
                        <input type="number" [(ngModel)]="payoutAmount" class="input pl-8 font-bold text-lg" placeholder="0.00" />
                    </div>
                </div>
                
                <div class="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <p class="text-xs text-secondary-600 leading-relaxed italic">
                        By requesting a payout, you agree to our terms. Funds will be transferred to your registered payment method within 3-5 business days.
                    </p>
                </div>
            </div>

            <div class="flex gap-3 pt-8">
                <button (click)="submitPayout()" [disabled]="!payoutAmount || payoutAmount < 100" class="btn btn-primary flex-1 py-3 group">
                    Confirm Request 
                </button>
                <button (click)="showPayoutModal = false" class="btn btn-secondary px-6">Cancel</button>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
    private partnerService = inject(PartnerService);
    private campaignService = inject(CampaignService);
    private activityLogService = inject(ActivityLogService);
    private eventService = inject(EventService);
    private payoutService = inject(PayoutService);
    public authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    stats = {
        totalPartners: 0,
        activeCampaigns: 0,
        totalRevenue: 0,
        totalCommission: 0,
        conversions: 0,
        pendingCommission: 0,
        availableBalance: 850 // Mock initial balance
    };
    loading: boolean = true;
    profile: UserProfile | null = null;

    partnerCampaigns: Campaign[] = [];
    payouts: any[] = [];
    showPayoutModal = false;
    payoutAmount: number = 0;
    copiedId: string = '';

    activityColumns: TableColumn[] = [
        { key: 'userEmail', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'entityType', label: 'Type', type: 'badge' },
        { key: 'timestamp', label: 'Date', type: 'date' }
    ];

    conversionColumns: TableColumn[] = [
        { key: 'campaignId', label: 'Campaign ID' },
        { key: 'revenue', label: 'Order Value', type: 'currency' },
        { key: 'commission', label: 'Your Commission', type: 'currency' },
        { key: 'timestamp', label: 'Date', type: 'date' }
    ];

    partnerPerformanceColumns: TableColumn[] = [
        { key: 'campaignName', label: 'Campaign' },
        { key: 'clicks', label: 'Total Clicks' },
        { key: 'conversions', label: 'Conversions' },
        { key: 'revenue', label: 'Sales Revenue', type: 'currency' },
        { key: 'commission', label: 'Commission Earned', type: 'currency' }
    ];

    partnerPerformanceData: any[] = [];
    recentConversions: any[] = [];

    readonly icons = {
        Users,
        Megaphone,
        DollarSign,
        TrendingUp,
        ExternalLink,
        Copy,
        Check,
        Clock,
        Wallet,
        AlertCircle
    };

    recentActivity: AuditLog[] = [];

    revenueChartConfig: ChartConfiguration = {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value: any) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    };

    conversionsChartConfig: ChartConfiguration = {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Conversions',
                data: [450, 520, 480, 650, 720, 850],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    ngOnInit() {
        this.loadDashboardData();
    }

    private loadDashboardData() {
        this.loading = true;

        this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                this.profile = profile;
                const partnerId = profile?.role === 'Partner' ? profile.partnerId : undefined;

                return combineLatest([
                    this.partnerService.getPartners().pipe(catchError(() => of([]))),
                    this.campaignService.getCampaigns().pipe(catchError(() => of([]))),
                    this.eventService.getRecentEvents(partnerId).pipe(catchError(() => of([]))),
                    this.activityLogService.getRecentLogs(30).pipe(catchError(() => of([]))),
                    partnerId ? this.payoutService.getPayoutRequests(partnerId).pipe(catchError(() => of([]))) : of([])
                ]);
            })
        ).subscribe({
            next: ([partners, campaigns, events, logs, payouts]) => {
                const isPartner = this.profile?.role === 'Partner';
                const partnerId = this.profile?.partnerId;

                // Filter data based on role
                const filteredPartners = isPartner ? partners.filter(p => p.id === partnerId) : partners;
                const filteredCampaigns = isPartner ? campaigns.filter(c => c.partnerId === partnerId || c.partnerId === 'all') : campaigns;

                if (isPartner) {
                    this.partnerCampaigns = filteredCampaigns.filter(c => c.status === 'Active');
                    this.recentConversions = events.slice(0, 10);
                    this.payouts = payouts;

                    // Aggregate Performance Data by Campaign
                    this.partnerPerformanceData = this.partnerCampaigns.map(c => {
                        const campaignEvents = events.filter(e => e.campaignId === c.id);
                        return {
                            campaignName: c.name,
                            clicks: (c.conversions || 0) * 12 + 4, // Simulated clicks
                            conversions: campaignEvents.length,
                            revenue: campaignEvents.reduce((acc, e) => acc + (e.revenue || 0), 0),
                            commission: campaignEvents.reduce((acc, e) => acc + (e.commission || 0), 0)
                        };
                    });
                }

                // For activity logs, Partners should only see relevant entity logs if possible, 
                // but usually, they see their own campaign/partner logs.
                const filteredLogs = isPartner ? logs.filter(l => l.entityId === partnerId) : logs;

                this.stats.totalPartners = filteredPartners.length;
                this.stats.activeCampaigns = filteredCampaigns.filter(c => c.status === 'Active').length;

                // Real data calculation from events
                this.stats.totalRevenue = events.reduce((acc, e) => acc + (e.revenue || 0), 0);
                this.stats.totalCommission = events.reduce((acc, e) => acc + (e.commission || 0), 0);
                this.stats.conversions = events.length;

                this.recentActivity = filteredLogs.slice(0, 10);

                // Fallback for demo if no events exist yet
                if (this.stats.totalRevenue === 0) {
                    if (isPartner) {
                        this.stats.totalCommission = 1240.50;
                        this.stats.conversions = 86;
                        this.stats.availableBalance = 850;
                    } else {
                        this.stats.totalRevenue = 127500;
                        this.stats.conversions = 4170;
                    }
                }

                this.loading = false;
                this.updateCharts(events);
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private updateCharts(events: ConversionEvent[]) {
        if (events.length > 5) {
            // Future: Implement real trend calculation from event timestamps
        }
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

    async submitPayout() {
        if (!this.profile?.partnerId || this.payoutAmount < 100) return;

        try {
            await this.payoutService.requestPayout(this.profile.partnerId, this.payoutAmount);
            this.showPayoutModal = false;
            this.payoutAmount = 0;
            this.loadDashboardData(); // Refresh history
        } catch (error) {
            console.error('Error submitting payout:', error);
        }
    }
}
