import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData, Timestamp } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { PayoutRequest } from '../models';

@Injectable({
    providedIn: 'root'
})
export class PayoutService {
    private firestore: Firestore = inject(Firestore);

    getPayoutRequests(partnerId: string): Observable<PayoutRequest[]> {
        const payoutCollection = collection(this.firestore, 'payout_requests');
        const q = query(
            payoutCollection,
            where('partnerId', '==', partnerId),
            orderBy('requestedAt', 'desc')
        );

        return collectionData(q, { idField: 'id' }).pipe(
            map(requests => requests.map(r => ({
                ...r,
                requestedAt: (r['requestedAt'] as Timestamp).toDate(),
                paidAt: r['paidAt'] ? (r['paidAt'] as Timestamp).toDate() : undefined
            })) as PayoutRequest[])
        );
    }

    async requestPayout(partnerId: string, amount: number): Promise<string> {
        const payoutCollection = collection(this.firestore, 'payout_requests');
        const docRef = await addDoc(payoutCollection, {
            partnerId,
            amount,
            status: 'Pending',
            requestedAt: new Date()
        });
        return docRef.id;
    }
}
