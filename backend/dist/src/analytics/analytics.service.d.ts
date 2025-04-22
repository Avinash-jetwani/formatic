import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getClientGrowth(startDate: string, endDate: string): Promise<any[]>;
    getFormQuality(): Promise<{
        avgSubsPerForm: number;
    }>;
    getFormCompletionRates(clientId?: string): Promise<{
        form: string;
        rate: number;
    }[]>;
    getSubmissionFunnel(clientId: string): Promise<{
        views: number;
        starts: number;
        submissions: number;
    }>;
    getFieldDistribution(clientId?: string): Promise<{
        type: string;
        count: unknown;
    }[]>;
    getConversionTrends(clientId: string, startDate: string, endDate: string): Promise<any[]>;
    exportDashboardData(role: string, userId: string, startDate: string, endDate: string): Promise<string>;
}
