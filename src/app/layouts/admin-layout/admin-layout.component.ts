import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Megaphone,
  Settings,
  LogOut,
  TrendingUp
} from 'lucide-angular';

interface NavItem {
  label: string;
  route: string;
  icon: any;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-secondary-200 z-50 flex flex-col">
        <div class="p-6 border-b border-secondary-200 flex items-center gap-2 shrink-0">
          <lucide-icon [img]="icons.TrendingUp" class="text-primary-600 w-8 h-8"></lucide-icon>
          <h1 class="text-xl font-bold text-primary-600">Partnerly</h1>
        </div>
        
        <nav class="p-4 flex-1 overflow-y-auto">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="bg-primary-50 text-primary-700 border-primary-600 shadow-sm"
             class="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-all border-l-4 border-transparent">
            <lucide-icon [img]="item.icon" class="w-5 h-5"></lucide-icon>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Sidebar Bottom Logout -->
        <div class="p-4 border-t border-secondary-100">
          <button (click)="logout()" 
                  class="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-secondary-600 hover:bg-danger-50 hover:text-danger-600 transition-all group font-medium">
            <lucide-icon [img]="icons.LogOut" class="w-5 h-5 group-hover:scale-110 transition-transform"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <div class="ml-64">
        <!-- Top Header -->
        <header class="bg-white border-b border-secondary-200 px-8 py-4 sticky top-0 z-40">
          <div class="flex items-center justify-end">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-bold border border-secondary-200">
                  {{ userInitial }}
                </div>
                <div class="text-left hidden md:block">
                  <p class="text-sm font-semibold text-secondary-900 leading-none">{{ userName }}</p>
                  <p class="text-xs text-secondary-500 mt-1">Administrator</p>
                </div>
              </div>
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
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Partners', route: '/partners', icon: Users },
    { label: 'Campaigns', route: '/campaigns', icon: Megaphone },
    { label: 'Settings', route: '/settings', icon: Settings }
  ];

  readonly icons = {
    LayoutDashboard,
    Users,
    Megaphone,
    Settings,
    LogOut,
    TrendingUp
  };

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email || 'User';
  }

  get userName(): string {
    const email = this.userEmail;
    return email.split('@')[0] || 'Admin';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
