import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    getClientGrowth(days: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getFormQuality(): Promise<{
        avgSubsPerForm: number;
    }>;
    getSubmissionFunnel(formId: string): Promise<{
        views: number;
        starts: number;
        submissions: number;
    }>;
    getFieldDistribution(clientId: string): Promise<{
        type: import(".prisma/client").$Enums.FieldType;
        count: number;
    }[]>;
}
