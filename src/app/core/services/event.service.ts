import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, Timestamp, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { ConversionEvent } from '../models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private firestore: Firestore = inject(Firestore);

    getRecentEvents(partnerId?: string): Observable<ConversionEvent[]> {
        const eventsCollection = collection(this.firestore, 'conversion_events');
        let q = query(eventsCollection, orderBy('timestamp', 'desc'), limit(50));

        if (partnerId) {
            q = query(eventsCollection, where('partnerId', '==', partnerId), orderBy('timestamp', 'desc'), limit(50));
        }

        return collectionData(q, { idField: 'id' }).pipe(
            map(events => events.map(event => ({
                ...event,
                timestamp: (event['timestamp'] as any)?.toDate() || new Date()
            } as ConversionEvent)))
        );
    }

    async trackEvent(event: Omit<ConversionEvent, 'id'>): Promise<void> {
        const eventsCollection = collection(this.firestore, 'conversion_events');
        await addDoc(eventsCollection, {
            ...event,
            timestamp: Timestamp.fromDate(event.timestamp || new Date())
        });
    }

    /**
     * Helper to simulate a conversion for testing purposes
     */
    async simulateConversion(partnerId: string, campaignId: string): Promise<void> {
        const revenue = Math.floor(Math.random() * 500) + 50;
        const commission = revenue * 0.1; // 10% commission

        await this.trackEvent({
            partnerId,
            campaignId,
            revenue,
            commission,
            type: 'Sale',
            timestamp: new Date()
        });
    }
}
