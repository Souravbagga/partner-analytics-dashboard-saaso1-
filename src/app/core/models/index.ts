export interface Partner {
    id?: string;
    name: string;
    email: string;
    status: 'Active' | 'Paused' | 'Inactive';
    createdAt: Date;
    revenue?: number;
    campaigns?: number;
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
}

export interface Activity {
    id?: string;
    partnerName: string;
    campaignName: string;
    status: string;
    date: Date;
    type: 'created' | 'updated' | 'completed';
}

export interface DashboardStats {
    totalPartners: number;
    activeCampaigns: number;
    totalRevenue: number;
    conversions: number;
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
