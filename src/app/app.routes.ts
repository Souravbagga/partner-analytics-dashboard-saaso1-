import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PartnersComponent } from './features/partners/partners.component';
import { CampaignsComponent } from './features/campaigns/campaigns.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'signup',
                component: SignupComponent
            }
        ]
    },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'partners',
                component: PartnersComponent
            },
            {
                path: 'campaigns',
                component: CampaignsComponent
            },
            {
                path: 'settings',
                component: SettingsComponent
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
