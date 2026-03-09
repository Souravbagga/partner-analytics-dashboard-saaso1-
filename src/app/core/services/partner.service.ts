import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Partner } from '../models';
import { ActivityLogService } from './activity-log.service';
import { AuthService } from './auth.service';
import { switchMap, of, catchError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private firestore: Firestore = inject(Firestore);
    private activityLogService = inject(ActivityLogService);
    private authService = inject(AuthService);

    getPartners(): Observable<Partner[]> {
        return this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                if (!profile) return of([]);

                // If partner, they shouldn't even be calling this list really, 
                // but let's filter for safety anyway
                const partnerId = profile.role === 'Partner' ? profile.partnerId : undefined;

                const partnersCollection = collection(this.firestore, 'partners');

                // Filter by ownerId (the Admin who created them)
                let q = query(
                    partnersCollection,
                    where('ownerId', '==', profile.uid)
                );

                return collectionData(q, { idField: 'id' }).pipe(
                    catchError(err => {
                        console.warn('Partners fetch failed (Demo Mode expected):', err);
                        return of([]);
                    }),
                    map(partners => partners.map(p => ({
                        ...p,
                        createdAt: (p['createdAt'] && typeof p['createdAt'] === 'object' && 'toDate' in p['createdAt'])
                            ? (p['createdAt'] as any).toDate()
                            : p['createdAt']
                    })) as Partner[]),
                    // If admin demo has no partners, provide some mock data
                    map(partners => {
                        if (partners.length === 0 && profile.uid === 'demo-uid' && profile.role === 'Admin') {
                            return [{
                                id: 'demo-partner-1',
                                name: 'Alex Johnson',
                                email: 'alex@example.com',
                                status: 'Active',
                                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                revenue: 4500,
                                campaigns: 3,
                                ownerId: 'demo-uid'
                            }, {
                                id: 'demo-partner-2',
                                name: 'Sarah Smith',
                                email: 'sarah@example.com',
                                status: 'Active',
                                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                                revenue: 2800,
                                campaigns: 1,
                                ownerId: 'demo-uid'
                            }] as Partner[];
                        }
                        return partners;
                    }),
                    // Sort in memory to avoid mandatory composite index requirement
                    map(partners => partners.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
                );
            })
        );
    }

    async addPartner(partner: Omit<Partner, 'id'>): Promise<string> {
        try {
            const user = this.authService.getCurrentUser();
            const partnersCollection = collection(this.firestore, 'partners');
            const docRef = await addDoc(partnersCollection, {
                ...partner,
                email: partner.email.toLowerCase().trim(),
                ownerId: user?.uid || 'demo-admin', // Track who created this partner
                createdAt: new Date()
            });
            await this.activityLogService.logAction(`Created partner: ${partner.name}`, docRef.id, 'Partner');
            return docRef.id;
        } catch (error) {
            console.error('Error adding partner:', error);
            throw error;
        }
    }

    async updatePartner(id: string, partner: Partial<Partner>): Promise<void> {
        try {
            const partnerDoc = doc(this.firestore, 'partners', id);
            const dataToUpdate = { ...partner };
            if (dataToUpdate.email) dataToUpdate.email = dataToUpdate.email.toLowerCase().trim();
            await updateDoc(partnerDoc, dataToUpdate);
            await this.activityLogService.logAction(`Updated partner profile`, id, 'Partner');
        } catch (error) {
            console.error('Error updating partner:', error);
            throw error;
        }
    }

    async deletePartner(id: string): Promise<void> {
        try {
            const partnerDoc = doc(this.firestore, 'partners', id);
            await deleteDoc(partnerDoc);
        } catch (error) {
            console.error('Error deleting partner:', error);
            throw error;
        }
    }
}
