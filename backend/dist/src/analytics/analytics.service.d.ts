import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getClientGrowth(days: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getFormQualityMetrics(): Promise<{
        avgSubsPerForm: number;
    }>;
    getFunnelData(formId: string): Promise<{
        views: number;
        starts: number;
        submissions: number;
    }>;
    getFieldTypeDistribution(clientId: string): Promise<{
        type: import(".prisma/client").$Enums.FieldType;
        count: number;
    }[]>;
}
