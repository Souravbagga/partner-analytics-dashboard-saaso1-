export type UserRole = 'Admin' | 'Manager' | 'Partner';

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    displayName?: string;
    partnerId?: string;
    ownerId?: string;
}

export interface Partner {
    id?: string;
    name: string;
    email: string;
    status: 'Active' | 'Paused' | 'Inactive';
    createdAt: Date;
    revenue?: number;
    campaigns?: number;
    ownerId?: string;
}

export interface Campaign {
    id?: string;
    name: string;
    partnerId: string;
    partnerName?: string;
    status: 'Active' | 'Paused' | 'Completed';
    startDate: Date;
    endDate: Date;
    budget?: number;
    spent?: number;
    conversions?: number;
    platform?: 'Facebook' | 'Google' | 'Instagram' | 'LinkedIn';
    ownerId?: string;
}

export interface Activity {
    id?: string;
    partnerName: string;
    campaignName: string;
    status: string;
    date: Date;
    type: 'created' | 'updated' | 'completed';
}

export interface AuditLog {
    id?: string;
    userId: string;
    userEmail: string;
    action: string;
    entityId: string;
    entityType: 'Partner' | 'Campaign' | 'User';
    timestamp: Date;
}

export interface ConversionEvent {
    id?: string;
    partnerId: string;
    campaignId: string;
    revenue: number;
    commission: number;
    type: string;
    timestamp: Date;
    ownerId?: string;
}

export interface PayoutRequest {
    id?: string;
    partnerId: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
    requestedAt: Date;
    paidAt?: Date;
    ownerId?: string;
}


export interface DashboardStats {
    totalPartners: number;
    activeCampaigns: number;
    totalRevenue: number;
    conversions: number;
    totalCommission: number;
    pendingCommission: number;
    availableBalance: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
        tension?: number;
    }[];
}
