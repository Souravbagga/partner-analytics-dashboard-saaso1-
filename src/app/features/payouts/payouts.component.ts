import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
    selector: 'app-payouts',
    standalone: true,
    imports: [CommonModule, DashboardComponent],
    template: `
    <app-dashboard></app-dashboard>
  `
})
export class PayoutsComponent { }
