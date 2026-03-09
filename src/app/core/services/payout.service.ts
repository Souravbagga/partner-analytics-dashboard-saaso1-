import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, Timestamp } from '@angular/fire/firestore';
import { Observable, map, switchMap, of, take, catchError } from 'rxjs';
import { PayoutRequest } from '../models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PayoutService {
    private firestore: Firestore = inject(Firestore);
    private authService = inject(AuthService);

    getPayoutRequests(partnerId: string): Observable<PayoutRequest[]> {
        return this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                if (!profile) return of([]);

                const payoutCollection = collection(this.firestore, 'payout_requests');

                let q;
                if (partnerId === 'all') {
                    // Admin viewing all payout requests for their partners
                    q = query(
                        payoutCollection,
                        where('ownerId', '==', profile.uid)
                    );
                } else {
                    // Partner viewing their own, or admin viewing specific partner
                    q = query(
                        payoutCollection,
                        where('partnerId', '==', partnerId),
                        where('ownerId', '==', profile.role === 'Partner' ? profile.ownerId : profile.uid)
                    );
                }

                return collectionData(q, { idField: 'id' }).pipe(
                    catchError(err => {
                        console.warn('Payout requests fetch failed (Demo Mode expected):', err);
                        return of([]);
                    }),
                    map(requests => requests.map(r => ({
                        ...r,
                        requestedAt: (r['requestedAt'] as Timestamp).toDate(),
                        paidAt: r['paidAt'] ? (r['paidAt'] as Timestamp).toDate() : undefined
                    })) as PayoutRequest[]),
                    // If demo partner has no payouts, provide some mock data
                    map(requests => {
                        if (requests.length === 0 && profile.partnerId === 'demo-partner-id') {
                            return [{
                                id: 'demo-payout-1',
                                partnerId: 'demo-partner-id',
                                amount: 1200,
                                status: 'Paid',
                                requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                                paidAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                                ownerId: 'demo-admin'
                            }, {
                                id: 'demo-payout-2',
                                partnerId: 'demo-partner-id',
                                amount: 850,
                                status: 'Pending',
                                requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                                ownerId: 'demo-admin'
                            }] as PayoutRequest[];
                        }
                        return requests;
                    }),
                    // In-memory sorting to bypass index requirement
                    map(requests => requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()))
                );
            })
        );
    }

    async requestPayout(partnerId: string, amount: number): Promise<string> {
        const profile = await new Promise(resolve => this.authService.currentUserProfile$.pipe(take(1)).subscribe(resolve)) as any;
        const payoutCollection = collection(this.firestore, 'payout_requests');
        const docRef = await addDoc(payoutCollection, {
            partnerId,
            amount,
            status: 'Pending',
            ownerId: profile?.ownerId || 'demo-admin', // Tag with the admin who owns this partner
            requestedAt: new Date()
        });
        return docRef.id;
    }
}
