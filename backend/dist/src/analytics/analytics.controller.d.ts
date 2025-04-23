import { AnalyticsService } from './analytics.service';
import { Response } from 'express';
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    getClientGrowth(start: string, end: string): Promise<any[]>;
    getFormQuality(): Promise<{
        avgSubsPerForm: number;
    }>;
    getFormCompletionRates(req: any, clientId?: string): Promise<{
        form: string;
        rate: number;
    }[]>;
    getSubmissionFunnel(req: any, clientId: string): Promise<{
        views: number;
        starts: number;
        submissions: number;
    } | {
        error: string;
        status: number;
    }>;
    getTopPerformingForms(req: any, clientId: string): Promise<{
        title: string;
        formId: string;
        count: number;
        conversionRate: number;
    }[] | {
        error: string;
        status: number;
    }>;
    getFieldDistribution(req: any, clientId?: string): Promise<{
        type: string;
        count: unknown;
    }[]>;
    getConversionTrends(req: any, clientId: string, start: string, end: string): Promise<any[] | {
        error: string;
        status: number;
    }>;
    exportDashboardData(req: any, role: string, userId: string, start: string, end: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
