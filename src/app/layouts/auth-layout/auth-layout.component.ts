import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-secondary-50 flex items-center justify-center p-4 lg:p-12">
      <div class="w-full max-w-[1200px]">
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
