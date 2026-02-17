import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="min-h-screen bg-secondary-50">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-secondary-200 z-10">
        <div class="p-6 border-b border-secondary-200">
          <h1 class="text-2xl font-bold text-primary-600">Partner Analytics</h1>
        </div>
        
        <nav class="p-4">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="bg-primary-50 text-primary-700 border-primary-600"
             class="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-secondary-700 hover:bg-secondary-50 transition-colors border-l-4 border-transparent">
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <div class="ml-64">
        <!-- Top Header -->
        <header class="bg-white border-b border-secondary-200 px-8 py-4 sticky top-0 z-5">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-secondary-900">Dashboard</h2>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm font-medium text-secondary-900">{{ userEmail }}</p>
                <p class="text-xs text-secondary-600">Administrator</p>
              </div>
              <button (click)="logout()" 
                      class="btn btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: []
})
export class AdminLayoutComponent {
    private authService = inject(AuthService);

    navItems: NavItem[] = [
        { label: 'Dashboard', route: '/dashboard', icon: '📊' },
        { label: 'Partners', route: '/partners', icon: '🤝' },
        { label: 'Campaigns', route: '/campaigns', icon: '📢' },
        { label: 'Settings', route: '/settings', icon: '⚙️' }
    ];

    get userEmail(): string {
        return this.authService.getCurrentUser()?.email || 'User';
    }

    logout() {
        this.authService.logout();
    }
}
