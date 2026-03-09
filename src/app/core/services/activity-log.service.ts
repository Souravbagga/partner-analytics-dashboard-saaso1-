import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, limit, collectionData, Timestamp, where } from '@angular/fire/firestore';
import { Observable, map, switchMap, of } from 'rxjs';
import { AuditLog } from '../models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ActivityLogService {
    private firestore: Firestore = inject(Firestore);
    private authService = inject(AuthService);

    async logAction(action: string, entityId: string, entityType: 'Partner' | 'Campaign' | 'User'): Promise<void> {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        const log: any = {
            userId: user.uid || 'demo-uid',
            userEmail: user.email || 'unknown',
            action,
            entityId,
            entityType,
            ownerId: user.uid, // Track for multi-tenancy
            timestamp: new Date()
        };

        try {
            const logsCollection = collection(this.firestore, 'audit_logs');
            await addDoc(logsCollection, {
                ...log,
                timestamp: Timestamp.fromDate(log.timestamp)
            });
        } catch (error) {
            console.error('Error adding audit log:', error);
        }
    }

    getRecentLogs(maxLogs: number = 20): Observable<AuditLog[]> {
        return this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                if (!profile) return of([]);

                const logsCollection = collection(this.firestore, 'audit_logs');
                // Filter by ownerId to only see your own logs
                const q = query(
                    logsCollection,
                    where('ownerId', '==', profile.uid),
                    orderBy('timestamp', 'desc'),
                    limit(maxLogs)
                );

                return collectionData(q, { idField: 'id' }).pipe(
                    map(logs => logs.map(log => ({
                        ...log,
                        timestamp: (log['timestamp'] as any)?.toDate() || new Date()
                    } as AuditLog)))
                );
            })
        );
    }
}
