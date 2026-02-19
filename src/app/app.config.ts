import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, initializeFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Megaphone,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Filter,
  Inbox,
  Loader2,
  User,
  Shield,
  Info,
  Mail,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => initializeFirestore(getApp(), {})),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        Users,
        Megaphone,
        Settings,
        LogOut,
        TrendingUp,
        DollarSign,
        Plus,
        Search,
        Filter,
        Inbox,
        Loader2,
        User,
        Shield,
        Info,
        Mail,
        Lock,
        LogIn,
        UserPlus
      })
    )
  ]
};
