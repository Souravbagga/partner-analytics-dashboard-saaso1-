import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Wallet, Clock, Check, AlertCircle, TrendingUp, DollarSign, ArrowRight, User, Search, Filter } from 'lucide-angular';
import { PayoutService } from '../../core/services/payout.service';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { PayoutRequest, UserProfile } from '../../core/models';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { switchMap, catchError, map } from 'rxjs/operators';
import { of, combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DataTableComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-secondary-900">Payouts</h1>
          <p class="text-secondary-600 mt-1">
            {{ isAdmin ? 'Review and manage partner payout requests' : 'Manage your earnings and withdrawal requests' }}
          </p>
        </div>
      </div>

      <!-- Admin View -->
      <ng-container *ngIf="isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card p-6 border-l-4 border-warning-500">
            <div class="flex items-center justify-between mb-4">
              <p class="text-secondary-500 font-bold text-xs uppercase tracking-widest">Pending Requests</p>
              <lucide-icon [img]="icons.Clock" class="w-5 h-5 text-warning-500"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-secondary-900">{{ pendingRequestsCount }}</h2>
            <p class="text-xs text-secondary-500 mt-2">Awaiting your approval</p>
          </div>

          <div class="card p-6 border-l-4 border-primary-500">
            <div class="flex items-center justify-between mb-4">
              <p class="text-secondary-500 font-bold text-xs uppercase tracking-widest">Total Payouts</p>
              <lucide-icon [img]="icons.DollarSign" class="w-5 h-5 text-primary-500"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-secondary-900">$ {{ totalPaidOut.toLocaleString() }}</h2>
            <p class="text-xs text-secondary-500 mt-2">Successfully processed</p>
          </div>
        </div>

        <app-data-table
          title="All Payout Requests"
          [columns]="adminColumns"
          [data]="payouts"
          [loading]="loading"
          [showActions]="true"
          (actionTriggered)="handleAdminAction($event)"
        ></app-data-table>
      </ng-container>

      <!-- Partner View -->
      <ng-container *ngIf="!isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card p-6 bg-gradient-to-br from-primary-600 to-primary-500 text-white border-0 shadow-lg shadow-primary-200">
            <div class="flex items-center justify-between mb-4">
              <p class="text-primary-100 font-bold text-xs uppercase tracking-widest">Available Balance</p>
              <lucide-icon [img]="icons.Wallet" class="w-5 h-5 opacity-60"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold mb-6">$ {{ availableBalance.toLocaleString() }}</h2>
            <button (click)="showRequestModal = true" 
                    [disabled]="availableBalance < 100"
                    class="w-full bg-white text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              <span>Request Payout</span>
              <lucide-icon [img]="icons.ArrowRight" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></lucide-icon>
            </button>
            <p class="text-[10px] text-primary-100 mt-3 text-center">* Minimum payout is $100.00</p>
          </div>

          <div class="card p-6 border-l-4 border-warning-500">
            <div class="flex items-center justify-between mb-4">
              <p class="text-secondary-500 font-bold text-xs uppercase tracking-widest">Processing</p>
              <lucide-icon [img]="icons.Clock" class="w-5 h-5 text-warning-500"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-secondary-900">$ {{ pendingAmount.toLocaleString() }}</h2>
            <p class="text-xs text-secondary-500 mt-2">Awaiting approval</p>
          </div>

          <div class="card p-6 border-l-4 border-success-500">
            <div class="flex items-center justify-between mb-4">
              <p class="text-secondary-500 font-bold text-xs uppercase tracking-widest">Lifetime Earnings</p>
              <lucide-icon [img]="icons.DollarSign" class="w-5 h-5 text-success-500"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-secondary-900">$ {{ totalEarned.toLocaleString() }}</h2>
            <p class="text-xs text-secondary-500 mt-2">Total commission earned</p>
          </div>
        </div>

        <app-data-table
          title="Withdrawal History"
          [columns]="partnerColumns"
          [data]="payouts"
          [loading]="loading"
        ></app-data-table>
      </ng-container>

      <!-- Request Payout Modal (Partner Only) -->
      <div *ngIf="showRequestModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="card max-w-sm w-full p-8 shadow-2xl animate-in zoom-in duration-300">
          <h2 class="text-2xl font-bold text-secondary-900 mb-2">Request Payout</h2>
          <p class="text-secondary-500 text-sm mb-6">Available to withdraw: <strong>$ {{ availableBalance.toLocaleString() }}</strong></p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-secondary-700 uppercase mb-2 tracking-widest">Amount to Withdraw</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-secondary-400">$</span>
                <input type="number" [(ngModel)]="requestAmount" class="input pl-8 font-bold text-lg" placeholder="0.00" />
              </div>
            </div>
            
            <div class="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
              <p class="text-xs text-secondary-600 leading-relaxed italic">
                By requesting a payout, you agree to our terms. Funds will be transferred to your registered payment method within 3-5 business days.
              </p>
            </div>
          </div>

          <div *ngIf="errorMessage" class="mt-4 p-3 bg-danger-50 text-danger text-sm rounded-lg border border-danger-100">
            {{ errorMessage }}
          </div>

          <div class="flex gap-3 pt-8">
            <button (click)="submitPayout()" [disabled]="submitting || !requestAmount || requestAmount < 100 || requestAmount > availableBalance" 
                    class="btn btn-primary flex-1 py-3 disabled:opacity-50">
              {{ submitting ? 'Processing...' : 'Confirm Request' }}
            </button>
            <button (click)="showRequestModal = false" class="btn btn-secondary px-6 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PayoutsComponent implements OnInit {
  private payoutService = inject(PayoutService);
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  payouts: any[] = [];
  loading = true;
  profile: UserProfile | null = null;
  isAdmin = false;

  // Partner Stats
  availableBalance = 0;
  pendingAmount = 0;
  totalEarned = 0;

  // Admin Stats
  pendingRequestsCount = 0;
  totalPaidOut = 0;

  showRequestModal = false;
  requestAmount = 0;
  submitting = false;
  errorMessage = '';

  readonly icons = {
    Wallet,
    Clock,
    Check,
    AlertCircle,
    TrendingUp,
    DollarSign,
    ArrowRight,
    User,
    Search,
    Filter
  };

  partnerColumns: TableColumn[] = [
    { key: 'requestedAt', label: 'Requested Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'paidAt', label: 'Paid Date', type: 'date' }
  ];

  adminColumns: TableColumn[] = [
    { key: 'partnerId', label: 'Partner ID' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'requestedAt', label: 'Requested Date', type: 'date' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.authService.currentUserProfile$.pipe(
      switchMap(profile => {
        this.profile = profile;
        this.isAdmin = profile?.role === 'Admin' || profile?.role === 'Manager';

        if (!profile) return of([]);

        const partnerId = this.isAdmin ? 'all' : (profile.partnerId || '');

        return combineLatest([
          this.payoutService.getPayoutRequests(partnerId),
          this.eventService.getRecentEvents(this.isAdmin ? undefined : profile.partnerId)
        ]);
      })
    ).subscribe({
      next: (result: any) => {
        if (!result || result.length === 0) {
          this.payouts = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const [payouts, events] = result;
        this.payouts = payouts;

        if (this.isAdmin) {
          this.pendingRequestsCount = payouts.filter((p: any) => p.status === 'Pending').length;
          this.totalPaidOut = payouts
            .filter((p: any) => p.status === 'Paid')
            .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
        } else {
          const totalEarnings = events.reduce((acc: number, e: any) => acc + (e.commission || 0), 0) || 1240.50;
          this.totalEarned = totalEarnings;

          const totalRequested = payouts.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
          this.pendingAmount = payouts
            .filter((p: any) => p.status === 'Pending')
            .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

          this.availableBalance = totalEarnings - (totalRequested - this.pendingAmount);
          if (this.availableBalance < 0) this.availableBalance = 0;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading payouts data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleAdminAction(event: any) {
    // Future: Implement approve/reject payout for Admin
    console.log('Admin action:', event);
  }

  async submitPayout() {
    if (!this.profile?.partnerId || this.requestAmount < 100 || this.requestAmount > this.availableBalance) return;

    this.submitting = true;
    this.errorMessage = '';
    try {
      await this.payoutService.requestPayout(this.profile.partnerId, this.requestAmount);
      this.showRequestModal = false;
      this.requestAmount = 0;
      this.loadData();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error submitting request. Please try again.';
      console.error('Error submitting payout:', error);
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}
