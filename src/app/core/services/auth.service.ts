import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router = inject(Router);

    user$: Observable<User | null> = user(this.auth);
    private demoAuthenticated = false;

    async login(email: string, password: string): Promise<void> {
        // Demo bypass for easy testing if Firebase isn't set up
        if (email === 'demo@example.com' && password === 'demo123456') {
            this.demoAuthenticated = true;
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
            await createUserWithEmailAndPassword(this.auth, email, password);
            this.router.navigate(['/dashboard']);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            this.demoAuthenticated = false;
            await signOut(this.auth);
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    isAuthenticated(): boolean {
        return this.demoAuthenticated || this.auth.currentUser !== null;
    }

    isDemo(): boolean {
        return this.demoAuthenticated;
    }

    getCurrentUser(): User | null {
        if (this.demoAuthenticated) {
            return { email: 'demo@example.com' } as User;
        }
        return this.auth.currentUser;
    }
}
