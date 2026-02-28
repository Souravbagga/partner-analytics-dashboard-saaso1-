import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, of, switchMap, shareReplay, catchError, BehaviorSubject, combineLatest } from 'rxjs';
import { UserProfile } from '../models';
import { UserService } from './user.service';

interface DemoState {
    authenticated: boolean;
    role: 'Admin' | 'Partner';
    email: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router = inject(Router);
    private userService = inject(UserService);

    user$: Observable<User | null> = user(this.auth);

    private demoStateSubject = new BehaviorSubject<DemoState>({
        authenticated: false,
        role: 'Admin',
        email: '',
        name: ''
    });

    currentUserProfile$: Observable<UserProfile | null> = combineLatest([
        this.user$,
        this.demoStateSubject
    ]).pipe(
        switchMap(([user, demoState]) => {
            if (demoState.authenticated) {
                return of({
                    uid: 'demo-uid',
                    email: demoState.email,
                    role: demoState.role,
                    displayName: demoState.name,
                    partnerId: demoState.role === 'Partner' ? 'demo-partner-id' : undefined
                } as UserProfile);
            }
            if (user) {
                return this.userService.getUserProfile(user.uid).pipe(
                    catchError(error => {
                        console.error('Error fetching user profile:', error);
                        return of(null);
                    })
                );
            }
            return of(null);
        }),
        shareReplay(1)
    );

    async login(email: string, password: string): Promise<void> {
        // Demo bypass for easy testing
        if (password === 'demo123456' || password === 'Partner123!') {
            const isDefaultAdmin = (email === 'demo@example.com' && password === 'demo123456') || email === 'admin@demo.com';

            this.demoStateSubject.next({
                authenticated: true,
                role: isDefaultAdmin ? 'Admin' : 'Partner',
                email: email,
                name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
            });

            this.router.navigate(['/dashboard']);
            return;
        }

        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            this.router.navigate(['/dashboard']);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async signUp(email: string, password: string): Promise<void> {
        try {
            const credential = await createUserWithEmailAndPassword(this.auth, email, password);
            await this.userService.createUserProfile({
                uid: credential.user.uid,
                email: email,
                role: 'Admin'
            });
            this.router.navigate(['/dashboard']);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            this.demoStateSubject.next({
                authenticated: false,
                role: 'Admin',
                email: '',
                name: ''
            });
            await signOut(this.auth);
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return this.demoStateSubject.value.authenticated || this.auth.currentUser !== null;
    }

    isDemo(): boolean {
        return this.demoStateSubject.value.authenticated;
    }

    getCurrentUser(): User | null {
        if (this.demoStateSubject.value.authenticated) {
            return { email: this.demoStateSubject.value.email } as User;
        }
        return this.auth.currentUser;
    }
}
