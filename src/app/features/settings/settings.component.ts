import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule, User, Shield, LogOut, Info } from 'lucide-angular';

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
              Administrator
            </div>
          </div>
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
  private authService = inject(AuthService);

  readonly icons = {
    User,
    Shield,
    LogOut,
    Info
  };

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email || 'Not logged in';
  }

  logout() {
    this.authService.logout();
  }
}
