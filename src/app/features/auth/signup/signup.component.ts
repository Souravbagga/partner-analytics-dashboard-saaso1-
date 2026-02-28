import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, UserPlus, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="flex flex-col lg:flex-row max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-secondary-100">
      <!-- Left: Benefits Side -->
      <div class="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-primary-700 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
          <lucide-icon [img]="icons.UserPlus" class="w-12 h-12 mb-6 text-indigo-200"></lucide-icon>
          <h2 class="text-3xl font-bold mb-4">Grow with Partnerly</h2>
          <p class="text-indigo-100 leading-relaxed mb-8">
            Join our enterprise network and start tracking your performance with real-time attribution and advanced analytics.
          </p>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-1">
                <lucide-icon [img]="icons.CheckCircle" class="w-3 h-3 text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-bold text-sm">Instant Dashboard</p>
                <p class="text-xs text-indigo-200 mt-1">Get immediate access to your data streams.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-1">
                <lucide-icon [img]="icons.CheckCircle" class="w-3 h-3 text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-bold text-sm">Real-time Attribution</p>
                <p class="text-xs text-indigo-200 mt-1">Never miss a conversion with our live tracking.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-1">
                <lucide-icon [img]="icons.CheckCircle" class="w-3 h-3 text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-bold text-sm">Enterprise Security</p>
                <p class="text-xs text-indigo-200 mt-1">Your data is protected by industry-leading security.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 pt-8 mt-12 border-t border-white/10">
          <p class="text-xs text-indigo-300">
            Trusted by 500+ global marketing partners.
          </p>
        </div>
      </div>

      <!-- Right: Signup Form -->
      <div class="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <div class="mb-10 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-secondary-900">Create Account</h2>
          <p class="text-secondary-500 mt-2">Start your 14-day free trial today</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="email" class="block text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div class="relative group">
              <lucide-icon [img]="icons.Mail" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5"></lucide-icon>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="username"
                class="input pl-11 h-12 rounded-xl text-sm"
                placeholder="you@company.com"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div class="relative group">
              <lucide-icon [img]="icons.Lock" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5"></lucide-icon>
              <input
                type="password"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="new-password"
                class="input pl-11 h-12 rounded-xl text-sm"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div class="relative group">
              <lucide-icon [img]="icons.Lock" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5"></lucide-icon>
              <input
                type="password"
                id="confirmPassword"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                autocomplete="new-password"
                class="input pl-11 h-12 rounded-xl text-sm"
                placeholder="Repeat your password"
              />
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="p-4 bg-danger-50 border border-danger-100 rounded-xl flex items-center gap-3">
             <div class="w-2 h-2 rounded-full bg-danger"></div>
             <p class="text-sm text-danger-700 font-medium">{{ errorMessage }}</p>
          </div>
          
          <button
            type="submit"
            [disabled]="loading"
            class="w-full btn btn-primary bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <lucide-icon *ngIf="!loading" [img]="icons.UserPlus" class="w-5 h-5"></lucide-icon>
            <div *ngIf="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ loading ? 'Creating Account...' : 'Get Started Now' }}</span>
          </button>
        </form>
        
        <div class="mt-8 text-center px-4">
          <p class="text-sm text-secondary-600">
            Already a member? 
            <a routerLink="/login" class="text-indigo-600 font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent {
  private authService = inject(AuthService);

  readonly icons = {
    Mail,
    Lock,
    UserPlus,
    CheckCircle
  };

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.signUp(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create account. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
