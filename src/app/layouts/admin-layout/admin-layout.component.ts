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
  TrendingUp,
  Layout,
  Wallet,
  Link
} from 'lucide-angular';
import { map, Observable } from 'rxjs';

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
        <div class="p-6 border-b border-secondary-200 flex items-center gap-2 shrink-0 font-display">
          <lucide-icon [img]="icons.TrendingUp" class="text-primary-600 w-8 h-8"></lucide-icon>
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Partnerly</h1>
        </div>
        
        <nav class="p-4 flex-1 overflow-y-auto">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="shouldShowItem(item)"
               [routerLink]="item.route"
               routerLinkActive="bg-primary-50 text-primary-700 border-primary-600 shadow-sm"
               class="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-all border-l-4 border-transparent group">
              <lucide-icon [img]="item.icon" class="w-5 h-5 group-hover:scale-110 transition-transform"></lucide-icon>
              <span class="font-medium">{{ item.label }}</span>
            </a>
          </ng-container>
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
        <header class="bg-white/80 backdrop-blur-md border-b border-secondary-200 px-8 py-4 sticky top-0 z-40">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
               <span class="text-xs font-bold text-secondary-400 uppercase tracking-widest">{{ pageTitle }}</span>
            </div>

            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3 pl-6 border-l border-secondary-100">
                <div class="text-right hidden md:block">
                  <p class="text-sm font-bold text-secondary-900 leading-none">{{ userName }}</p>
                  <p class="text-[10px] font-bold text-primary-600 uppercase tracking-tighter mt-1 px-1.5 py-0.5 bg-primary-50 rounded border border-primary-100">
                    {{ (authService.currentUserProfile$ | async)?.role || 'User' }}
                  </p>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary-100 to-white flex items-center justify-center text-primary-600 font-bold border border-secondary-200 shadow-sm">
                  {{ userInitial }}
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
  public authService = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Partners', route: '/partners', icon: Users },
    { label: 'Campaigns', route: '/campaigns', icon: Megaphone },
    { label: 'My Campaigns', route: '/my-campaigns', icon: Link },
    { label: 'Payouts', route: '/payouts', icon: Wallet },
    { label: 'Settings', route: '/settings', icon: Settings }
  ];

  readonly icons = {
    LayoutDashboard,
    Users,
    Megaphone,
    Settings,
    LogOut,
    TrendingUp,
    Wallet,
    Link
  };

  currentRole: string = 'User';

  constructor() {
    this.authService.currentUserProfile$.subscribe(profile => {
      if (profile) {
        this.currentRole = profile.role;
      }
    });
  }

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

  get pageTitle(): string {
    const segments = window.location.pathname.split('/');
    const last = segments[segments.length - 1];
    return last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Overview';
  }

  shouldShowItem(item: NavItem): boolean {
    const role = this.currentRole;
    if (role === 'Admin') {
      // Admins see everything except Partner-specific "My Campaigns"
      return item.route !== '/my-campaigns';
    }

    if (role === 'Partner') {
      // Partners see specific routes only
      const partnerRoutes = ['/dashboard', '/my-campaigns', '/payouts', '/settings'];
      return partnerRoutes.includes(item.route);
    }

    // Default (Manager, etc.) - Block Partner management
    return item.route !== '/partners';
  }

  logout() {
    this.authService.logout();
  }
}
