import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [RouterOutlet],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">Partner Analytics</h1>
          <p class="text-primary-100">Manage your partners and campaigns</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
    styles: []
})
export class AuthLayoutComponent { }
