import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, limit, Timestamp, where } from '@angular/fire/firestore';
import { Observable, map, switchMap, of, catchError } from 'rxjs';
import { ConversionEvent } from '../models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private firestore: Firestore = inject(Firestore);
    private authService = inject(AuthService);

    getRecentEvents(partnerId?: string): Observable<ConversionEvent[]> {
        return this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                if (!profile) return of([]);

                const eventsCollection = collection(this.firestore, 'conversion_events');
                let q;

                if (profile.role === 'Partner') {
                    // Partners only see their own events
                    q = query(
                        eventsCollection,
                        where('partnerId', '==', profile.partnerId),
                        limit(50)
                    );
                } else {
                    // Admins only see events OWNED by them
                    q = query(
                        eventsCollection,
                        where('ownerId', '==', profile.uid),
                        limit(50)
                    );
                }

                return collectionData(q, { idField: 'id' }).pipe(
                    catchError(err => {
                        console.warn('Events fetch failed (Demo Mode expected):', err);
                        return of([]);
                    }),
                    map(events => events.map(event => ({
                        ...event,
                        timestamp: (event['timestamp'] as any)?.toDate() || new Date()
                    } as ConversionEvent))),
                    // Sort in memory to bypass index requirement
                    map(events => events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
                );
            })
        );
    }

    async trackEvent(event: Omit<ConversionEvent, 'id'>): Promise<void> {
        const eventsCollection = collection(this.firestore, 'conversion_events');
        await addDoc(eventsCollection, {
            ...event,
            ownerId: event.ownerId || 'demo-admin', // Ensure owner is tracked
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
