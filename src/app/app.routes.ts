import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PartnersComponent } from './features/partners/partners.component';
import { CampaignsComponent } from './features/campaigns/campaigns.component';
import { SettingsComponent } from './features/settings/settings.component';
import { PartnerDetailComponent } from './features/partners/partner-detail/partner-detail.component';
import { CampaignDetailComponent } from './features/campaigns/campaign-detail/campaign-detail.component';
import { MyCampaignsComponent } from './features/my-campaigns/my-campaigns.component';
import { PayoutsComponent } from './features/payouts/payouts.component';

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
                component: PartnersComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin', 'Manager'] }
            },
            {
                path: 'partners/:id',
                component: PartnerDetailComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin', 'Manager'] }
            },
            {
                path: 'campaigns',
                component: CampaignsComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin', 'Manager'] }
            },
            {
                path: 'campaigns/:id',
                component: CampaignDetailComponent,
                canActivate: [roleGuard],
                data: { roles: ['Admin', 'Manager', 'Partner'] }
            },
            {
                path: 'my-campaigns',
                component: MyCampaignsComponent,
                canActivate: [roleGuard],
                data: { roles: ['Partner'] }
            },
            {
                path: 'payouts',
                component: PayoutsComponent,
                canActivate: [roleGuard],
                data: { roles: ['Partner', 'Admin'] }
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
