import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, LogIn, Info } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="card">
      <h2 class="text-2xl font-bold text-secondary-900 mb-6 text-center">Sign In</h2>
      
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
            Email Address
          </label>
          <div class="relative">
            <lucide-icon [img]="icons.Mail" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5"></lucide-icon>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              class="input pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-secondary-700 mb-2">
            Password
          </label>
          <div class="relative">
            <lucide-icon [img]="icons.Lock" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5"></lucide-icon>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              class="input pl-10"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p class="text-sm text-danger">{{ errorMessage }}</p>
        </div>
        
        <button
          type="submit"
          [disabled]="loading"
          class="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <lucide-icon *ngIf="!loading" [img]="icons.LogIn" class="w-5 h-5"></lucide-icon>
          <div *ngIf="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-secondary-600">
          Don't have an account? 
          <a routerLink="/signup" class="text-primary-600 font-semibold hover:underline">Create Account</a>
        </p>
      </div>

      <div class="mt-6 p-4 bg-secondary-50 rounded-lg flex gap-3">
        <lucide-icon [img]="icons.Info" class="w-5 h-5 text-secondary-400 shrink-0 mt-0.5"></lucide-icon>
        <p class="text-xs text-secondary-600">
          <strong>Demo Credentials:</strong><br>
          Email: demo@example.com<br>
          Password: demo123456
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private authService = inject(AuthService);

  readonly icons = {
    Mail,
    Lock,
    LogIn,
    Info
  };

  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
    } finally {
      this.loading = false;
    }
  }
}
