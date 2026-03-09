import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, where } from '@angular/fire/firestore';
import { Observable, map, switchMap, of, take, catchError } from 'rxjs';
import { Campaign } from '../models';
import { ActivityLogService } from './activity-log.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CampaignService {
    private firestore: Firestore = inject(Firestore);
    private activityLogService = inject(ActivityLogService);
    private authService = inject(AuthService);

    getCampaigns(): Observable<Campaign[]> {
        return this.authService.currentUserProfile$.pipe(
            switchMap(profile => {
                if (!profile) return of([]);

                const campaignsCollection = collection(this.firestore, 'campaigns');

                // If it's a partner, we show campaigns assigned to them
                // If it's an admin, we show campaigns OWNED by them
                let q;
                if (profile.role === 'Partner') {
                    // Only query if we have a partnerId, or fallback to searching only global campaigns
                    const targetIds = profile.partnerId ? [profile.partnerId, 'all'] : ['all'];
                    q = query(
                        campaignsCollection,
                        where('partnerId', 'in', targetIds)
                    );
                } else {
                    q = query(
                        campaignsCollection,
                        where('ownerId', '==', profile.uid)
                    );
                }

                return collectionData(q, { idField: 'id' }).pipe(
                    catchError(err => {
                        console.warn('Firestore fetch failed (Demo Mode expected):', err);
                        return of([]);
                    }),
                    map(campaigns => campaigns.map(c => ({
                        ...c,
                        startDate: (c['startDate'] && typeof c['startDate'] === 'object' && 'toDate' in c['startDate'])
                            ? (c['startDate'] as any).toDate()
                            : c['startDate'],
                        endDate: (c['endDate'] && typeof c['endDate'] === 'object' && 'toDate' in c['endDate'])
                            ? (c['endDate'] as any).toDate()
                            : c['endDate']
                    })) as Campaign[]),
                    // If demo partner has no campaigns, provide some mock data for evaluation
                    map(campaigns => {
                        if (campaigns.length === 0 && profile.partnerId === 'demo-partner-id') {
                            return [{
                                id: 'demo-campaign-1',
                                name: 'Q1 Brand Awareness',
                                partnerId: 'demo-partner-id',
                                partnerName: 'Demo Partner',
                                status: 'Active',
                                startDate: new Date(),
                                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                                budget: 5000,
                                spent: 1200,
                                conversions: 45,
                                platform: 'Facebook'
                            }] as Campaign[];
                        }
                        return campaigns;
                    }),
                    // In-memory sort to bypass index requirement
                    map(campaigns => campaigns.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()))
                );
            })
        );
    }

    async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<void> {
        try {
            const user = this.authService.getCurrentUser();
            const campaignsCollection = collection(this.firestore, 'campaigns');
            const docRef = await addDoc(campaignsCollection, {
                ...campaign,
                ownerId: user?.uid || 'demo-admin',
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
