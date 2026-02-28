import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User, Shield, LogOut, Info, Clock, CheckCircle, Database } from 'lucide-angular';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { AuditLog } from '../../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold text-secondary-900">Settings</h1>
        <p class="text-secondary-600 mt-1">Manage your account and preferences</p>
      </div>
      
      <!-- Profile Section -->
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon [img]="icons.User" class="w-5 h-5 text-secondary-500"></lucide-icon>
          <h2 class="text-xl font-semibold text-secondary-900">Profile Information</h2>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <div class="input bg-secondary-50 cursor-not-allowed">
              {{ userEmail }}
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">Role</label>
            <div class="input bg-secondary-50 cursor-not-allowed">
              {{ (authService.currentUserProfile$ | async)?.role || 'User' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Activity Log Section -->
      <div class="card" *ngIf="(authService.currentUserProfile$ | async)?.role === 'Admin'">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="icons.Clock" class="w-5 h-5 text-secondary-500"></lucide-icon>
            <h2 class="text-xl font-semibold text-secondary-900">Admin Activity Timeline</h2>
          </div>
          <span class="text-xs font-medium px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full">Recent Logs</span>
        </div>
        
        <div class="space-y-6">
          <div *ngIf="recentLogs$ | async as logs; else loadingLogs" class="relative">
            <!-- Vertical Line -->
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-secondary-100"></div>
            
            <div *ngFor="let log of logs" class="relative pl-10 pb-6 last:pb-0">
              <!-- Dot -->
              <div class="absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                   [ngClass]="log.entityType === 'Partner' ? 'bg-primary-500' : 'bg-warning-500'"></div>
              
              <div>
                <p class="text-sm font-bold text-secondary-900">{{ log.action }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-secondary-500">{{ log.userEmail }}</span>
                  <span class="text-xs text-secondary-300">•</span>
                  <span class="text-xs text-secondary-500">{{ log.timestamp | date:'short' }}</span>
                </div>
                <div class="mt-2 text-[10px] text-secondary-400 font-mono uppercase tracking-tighter">
                  ID: {{ log.entityId }} • TYPE: {{ log.entityType }}
                </div>
              </div>
            </div>

            <div *ngIf="logs.length === 0" class="text-center py-4 text-secondary-500">
              No recent activity found.
            </div>
          </div>
          
          <ng-template #loadingLogs>
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </ng-template>
        </div>
      </div>
      
      <!-- Account Actions -->
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon [img]="icons.Shield" class="w-5 h-5 text-secondary-500"></lucide-icon>
          <h2 class="text-xl font-semibold text-secondary-900">Account Actions</h2>
        </div>
        <div class="space-y-3">
          <button (click)="logout()" class="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <lucide-icon [img]="icons.LogOut" class="w-4 h-4"></lucide-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      <!-- About -->
      <div class="card bg-primary-50 border-primary-200">
        <div class="flex items-center gap-2 mb-4">
          <lucide-icon [img]="icons.Info" class="w-5 h-5 text-primary-600"></lucide-icon>
          <h2 class="text-xl font-semibold text-primary-900">About</h2>
        </div>
        <div class="space-y-2 text-sm text-primary-800">
          <p><strong>Partner Analytics Dashboard</strong></p>
          <p>Version 1.0.0</p>
          <p>Built with Angular 21, Tailwind CSS, and Firebase</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
  public authService = inject(AuthService);

  readonly icons = {
    User,
    Shield,
    LogOut,
    Info,
    Clock,
    CheckCircle,
    Database
  };

  recentLogs$: Observable<AuditLog[]>;

  constructor() {
    const activityService = inject(ActivityLogService);
    this.recentLogs$ = activityService.getRecentLogs(10);
  }

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email || 'Not logged in';
  }

  logout() {
    this.authService.logout();
  }
}
