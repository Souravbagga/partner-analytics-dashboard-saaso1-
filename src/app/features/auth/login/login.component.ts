import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="card">
      <h2 class="text-2xl font-bold text-secondary-900 mb-6 text-center">Sign In</h2>
      
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            [(ngModel)]="email"
            name="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-secondary-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            [(ngModel)]="password"
            name="password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>
        
        <div *ngIf="errorMessage" class="p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <p class="text-sm text-danger">{{ errorMessage }}</p>
        </div>
        
        <button
          type="submit"
          [disabled]="loading"
          class="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-secondary-600">
          Don't have an account? 
          <a routerLink="/signup" class="text-primary-600 font-semibold hover:underline">Create Account</a>
        </p>
      </div>

      <div class="mt-6 p-4 bg-secondary-50 rounded-lg">
        <p class="text-xs text-secondary-600 text-center">
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
