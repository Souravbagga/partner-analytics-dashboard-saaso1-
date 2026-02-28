import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, LogIn, Info, TrendingUp, Shield, Users, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="flex flex-col lg:flex-row max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-secondary-100">
      <!-- Left: Demo Info Side -->
      <div class="lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
          <lucide-icon [img]="icons.TrendingUp" class="w-12 h-12 mb-6 text-primary-200"></lucide-icon>
          <h2 class="text-3xl font-bold mb-4">Welcome to Partnerly</h2>
          <p class="text-primary-100 leading-relaxed mb-8">
            The project is fully functional and ready for exploration. You can create your own account or use the demo credentials below to instantly see the different dashboard experiences.
          </p>

          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-widest text-primary-300">Quick Access</h3>
            
            <button (click)="quickLogin('Admin')" 
                    class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <lucide-icon [img]="icons.Shield" class="w-5 h-5"></lucide-icon>
                </div>
                <div class="text-left">
                  <p class="text-sm font-bold">Admin Dashboard</p>
                  <p class="text-[10px] text-primary-200 uppercase tracking-tighter">Full Enterprise Access</p>
                </div>
              </div>
              <lucide-icon [img]="icons.ChevronRight" class="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></lucide-icon>
            </button>

            <button (click)="quickLogin('Partner')" 
                    class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <lucide-icon [img]="icons.Users" class="w-5 h-5"></lucide-icon>
                </div>
                <div class="text-left">
                  <p class="text-sm font-bold">Partner Portal</p>
                  <p class="text-[10px] text-primary-200 uppercase tracking-tighter">Attribution & Commission View</p>
                </div>
              </div>
              <lucide-icon [img]="icons.ChevronRight" class="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="relative z-10 pt-8 mt-12 border-t border-white/10">
          <p class="text-[10px] text-primary-300 italic">
            Note: All dummy data is aggregated in real-time using RxJS streams.
          </p>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <div class="mb-10 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-secondary-900">Sign In</h2>
          <p class="text-secondary-500 mt-2">Access your partner analytics account</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="email" class="block text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div class="relative group">
              <lucide-icon [img]="icons.Mail" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-600 transition-colors w-5 h-5"></lucide-icon>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="username"
                class="input pl-11 h-12 rounded-xl text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-xs font-bold text-secondary-400 uppercase tracking-wider">
                Password
              </label>
              <a href="#" class="text-xs font-semibold text-primary-600 hover:underline">Forgot?</a>
            </div>
            <div class="relative group">
              <lucide-icon [img]="icons.Lock" class="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-600 transition-colors w-5 h-5"></lucide-icon>
              <input
                type="password"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                class="input pl-11 h-12 rounded-xl text-sm"
                placeholder="••••••••"
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
            class="w-full btn btn-primary py-4 rounded-xl text-base font-bold shadow-lg shadow-primary-200 hover:shadow-primary-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <lucide-icon *ngIf="!loading" [img]="icons.LogIn" class="w-5 h-5"></lucide-icon>
            <div *ngIf="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ loading ? 'Authenticating...' : 'Secure Sign In' }}</span>
          </button>
        </form>
        
        <div class="mt-8 text-center px-4">
          <p class="text-sm text-secondary-600">
            Need an enterprise account? 
            <a routerLink="/signup" class="text-primary-600 font-bold hover:underline">Create Account</a>
          </p>
        </div>
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
    Info,
    TrendingUp,
    Shield,
    Users,
    ChevronRight
  };

  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  async quickLogin(role: 'Admin' | 'Partner') {
    this.email = role === 'Admin' ? 'admin@demo.com' : 'partner@demo.com';
    this.password = 'demo123456';
    await this.onSubmit();
  }

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
