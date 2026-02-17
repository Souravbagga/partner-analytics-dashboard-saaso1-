import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="card">
      <h2 class="text-2xl font-bold text-secondary-900 mb-6 text-center">Create Account</h2>
      
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

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-secondary-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
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
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-secondary-600">
          Already have an account? 
          <a routerLink="/login" class="text-primary-600 font-semibold hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  `,
    styles: []
})
export class SignupComponent {
    private authService = inject(AuthService);

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
