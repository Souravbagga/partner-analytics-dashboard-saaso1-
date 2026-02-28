import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Campaign } from '../models';
import { ActivityLogService } from './activity-log.service';


@Injectable({
    providedIn: 'root'
})
export class CampaignService {
    private firestore: Firestore = inject(Firestore);
    private activityLogService = inject(ActivityLogService);

    getCampaigns(): Observable<Campaign[]> {
        console.log('Fetching campaigns from Firestore...');
        const campaignsCollection = collection(this.firestore, 'campaigns');
        const q = query(campaignsCollection, orderBy('startDate', 'desc'));
        return collectionData(q, { idField: 'id' }).pipe(
            map(campaigns => {
                console.log(`Received ${campaigns.length} campaigns`);
                return campaigns.map(c => ({
                    ...c,
                    startDate: (c['startDate'] && typeof c['startDate'] === 'object' && 'toDate' in c['startDate'])
                        ? (c['startDate'] as any).toDate()
                        : c['startDate'],
                    endDate: (c['endDate'] && typeof c['endDate'] === 'object' && 'toDate' in c['endDate'])
                        ? (c['endDate'] as any).toDate()
                        : c['endDate']
                }));
            })
        ) as Observable<Campaign[]>;
    }

    async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<void> {
        try {
            const campaignsCollection = collection(this.firestore, 'campaigns');
            const docRef = await addDoc(campaignsCollection, {
                ...campaign,
                startDate: campaign.startDate instanceof Date ? campaign.startDate : new Date(campaign.startDate),
                endDate: campaign.endDate instanceof Date ? campaign.endDate : new Date(campaign.endDate)
            });
            await this.activityLogService.logAction(`Created campaign: ${campaign.name}`, docRef.id, 'Campaign');
        } catch (error) {
            console.error('Error adding campaign:', error);
            throw error;
        }
    }

    async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<void> {
        try {
            const campaignDoc = doc(this.firestore, 'campaigns', id);
            await updateDoc(campaignDoc, campaign);
            await this.activityLogService.logAction(`Updated campaign: ${campaign.name || 'details'}`, id, 'Campaign');
        } catch (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }
    }

    async deleteCampaign(id: string): Promise<void> {
        try {
            const campaignDoc = doc(this.firestore, 'campaigns', id);
            await deleteDoc(campaignDoc);
        } catch (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    }
}
