import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8 flex flex-col items-center">
          <div class="bg-white/10 p-3 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
            <lucide-icon [img]="icons.TrendingUp" class="w-12 h-12 text-white"></lucide-icon>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Partnerly</h1>
          <p class="text-primary-100">Manage your partners and campaigns</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent {
  readonly icons = {
    TrendingUp
  };
}
