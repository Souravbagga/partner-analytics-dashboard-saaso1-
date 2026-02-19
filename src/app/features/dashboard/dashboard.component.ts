import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PartnerService } from '../../core/services/partner.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Partner, Campaign, Activity } from '../../core/models';
import { combineLatest, take } from 'rxjs';


@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent, ChartCardComponent, DataTableComponent],
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
      <div>
        <h1 class="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p class="text-secondary-600 mt-1">Welcome back to Partnerly! Here's what's happening today.</p>
      </div>
      
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Conversions"
          [value]="stats.conversions.toLocaleString()"
          change="+15% from last month"
          icon="trending-up"
          iconBgClass="bg-purple-100/50 text-purple-600"
          [loading]="loading"
        ></app-stat-card>
      </div>
      
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-chart-card
          title="Revenue Trend"
          subtitle="Last 6 months"
          [chartConfig]="revenueChartConfig"
          [height]="300"
          [loading]="loading"
        ></app-chart-card>
        
        <app-chart-card
          title="Conversions Trend"
          subtitle="Last 6 months"
          [chartConfig]="conversionsChartConfig"
          [height]="300"
          [loading]="loading"
        ></app-chart-card>
      </div>
      
      <!-- Recent Activity -->
      <app-data-table
        title="Recent Activity"
        [columns]="activityColumns"
        [data]="recentActivity"
        [loading]="loading"
      ></app-data-table>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
    private partnerService = inject(PartnerService);
    private campaignService = inject(CampaignService);
    private cdr = inject(ChangeDetectorRef);

    stats = {
        totalPartners: 0,
        activeCampaigns: 0,
        totalRevenue: 0,
        conversions: 0
    };
    loading: boolean = true;

    activityColumns: TableColumn[] = [
        { key: 'partnerName', label: 'Partner' },
        { key: 'campaignName', label: 'Campaign' },
        { key: 'status', label: 'Status', type: 'badge' },
        { key: 'date', label: 'Date', type: 'date' }
    ];

    recentActivity: Activity[] = [];

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
                        callback: function (value) {
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

        // Use combineLatest to wait for initial data from both streams
        combineLatest([
            this.partnerService.getPartners(),
            this.campaignService.getCampaigns()
        ]).pipe(take(1)).subscribe({
            next: ([partners, campaigns]) => {
                this.stats.totalPartners = partners.length;
                this.stats.activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
                this.generateMockActivity(partners);

                // Mock data for revenue and conversions
                this.stats.totalRevenue = 127500;
                this.stats.conversions = 4170;

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        // Separately listen for updates to keep stats updated in real-time
        this.partnerService.getPartners().subscribe(partners => {
            this.stats.totalPartners = partners.length;
            this.cdr.detectChanges();
        });

        this.campaignService.getCampaigns().subscribe(campaigns => {
            this.stats.activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
            this.cdr.detectChanges();
        });
    }

    private generateMockActivity(partners: Partner[]) {
        const names = partners.length > 0 ? partners.map(p => p.name) : ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Digital Dynamics'];

        // Generate some mock recent activity
        this.recentActivity = [
            {
                partnerName: names[0] || 'Acme Corp',
                campaignName: 'Summer Sale 2026',
                status: 'Active',
                date: new Date('2026-02-08'),
                type: 'created'
            },
            {
                partnerName: names[1] || 'TechStart Inc',
                campaignName: 'Product Launch',
                status: 'Completed',
                date: new Date('2026-02-07'),
                type: 'completed'
            },
            {
                partnerName: names[2] || 'Global Solutions',
                campaignName: 'Brand Awareness',
                status: 'Active',
                date: new Date('2026-02-06'),
                type: 'updated'
            },
            {
                partnerName: names[3] || 'Digital Dynamics',
                campaignName: 'Q1 Campaign',
                status: 'Paused',
                date: new Date('2026-02-05'),
                type: 'updated'
            }
        ];
    }
}
