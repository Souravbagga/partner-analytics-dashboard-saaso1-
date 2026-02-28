import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Partner } from '../models';
import { ActivityLogService } from './activity-log.service';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private firestore: Firestore = inject(Firestore);
    private activityLogService = inject(ActivityLogService);

    getPartners(): Observable<Partner[]> {
        console.log('Fetching partners from Firestore...');
        const partnersCollection = collection(this.firestore, 'partners');
        const q = query(partnersCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }).pipe(
            map(partners => {
                console.log(`Received ${partners.length} partners`, partners);
                return partners.map(p => ({
                    ...p,
                    createdAt: (p['createdAt'] && typeof p['createdAt'] === 'object' && 'toDate' in p['createdAt'])
                        ? (p['createdAt'] as any).toDate()
                        : p['createdAt']
                }));
            })
        ) as Observable<Partner[]>;
    }

    async addPartner(partner: Omit<Partner, 'id'>): Promise<string> {
        try {
            const partnersCollection = collection(this.firestore, 'partners');
            const docRef = await addDoc(partnersCollection, {
                ...partner,
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
            await updateDoc(partnerDoc, partner);
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
