import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

import { UserProfile, UserRole } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore: Firestore = inject(Firestore);

    getUserProfile(uid: string): Observable<UserProfile | null> {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        return from(getDoc(userDocRef)).pipe(
            map(docSnap => {
                if (docSnap.exists()) {
                    return docSnap.data() as UserProfile;
                }
                return null;
            })
        );
    }

    async createUserProfile(profile: UserProfile): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${profile.uid}`);
        await setDoc(userDocRef, profile);
    }

    async updateUserRole(uid: string, role: UserRole): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDocRef, { role });
    }
}
