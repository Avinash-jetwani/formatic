"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getClientGrowth(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dailyData = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            const count = await this.prisma.user.count({
                where: {
                    role: 'CLIENT',
                    createdAt: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
            });
            dailyData.push({
                date: currentDate.toISOString().slice(0, 10),
                count,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dailyData;
    }
    async getFormQuality() {
        const forms = await this.prisma.form.findMany({
            include: { _count: { select: { submissions: true } } },
        });
        const avgSubs = forms.length > 0
            ? forms.reduce((sum, f) => sum + f._count.submissions, 0) / forms.length
            : 0;
        return { avgSubsPerForm: avgSubs };
    }
    async getFormCompletionRates(clientId) {
        const whereClause = clientId ? { clientId } : {};
        const forms = await this.prisma.form.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                _count: { select: { submissions: true } },
            },
        });
        return forms.map(form => {
            const submissionCount = form._count.submissions;
            const rate = submissionCount > 0
                ? Math.min(40 + Math.floor(submissionCount * 5), 95)
                : 0;
            return {
                form: form.title,
                rate,
            };
        });
    }
    async getSubmissionFunnel(clientId) {
        const forms = await this.prisma.form.findMany({
            where: { clientId },
            include: {
                _count: { select: { submissions: true } },
            },
        });
        const submissions = forms.reduce((sum, form) => sum + form._count.submissions, 0);
        const views = Math.max(submissions * 5, 10);
        const starts = Math.max(submissions * 2, 5);
        return {
            views,
            starts,
            submissions
        };
    }
    async getFieldDistribution(clientId) {
        const fields = await this.prisma.formField.findMany({
            where: {
                form: { clientId },
            },
            select: {
                type: true,
            },
        });
        const typeCounts = {};
        fields.forEach(field => {
            typeCounts[field.type] = (typeCounts[field.type] || 0) + 1;
        });
        return Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
        }));
    }
    async getConversionTrends(clientId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const submissions = await this.prisma.submission.findMany({
            where: {
                form: { clientId },
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                form: {
                    select: { title: true },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const submissionsByDay = {};
        submissions.forEach(sub => {
            const day = sub.createdAt.toISOString().slice(0, 10);
            submissionsByDay[day] = (submissionsByDay[day] || 0) + 1;
        });
        const result = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const day = currentDate.toISOString().slice(0, 10);
            const dailySubmissions = submissionsByDay[day] || 0;
            const views = dailySubmissions > 0 ? dailySubmissions * 5 : 0;
            const conversionRate = views > 0 ? (dailySubmissions / views) * 100 : 0;
            result.push({
                date: day,
                submissions: dailySubmissions,
                views: views,
                conversionRate: Math.round(conversionRate),
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
    }
    async exportDashboardData(role, userId, startDate, endDate) {
        let csvData = 'date,metric,value\n';
        if (role === 'SUPER_ADMIN') {
            const clientGrowth = await this.getClientGrowth(startDate, endDate);
            clientGrowth.forEach(day => {
                csvData += `${day.date},new_clients,${day.count}\n`;
            });
            const submissions = await this.prisma.submission.findMany({
                where: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
                include: {
                    form: {
                        select: {
                            title: true,
                            client: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
            const submissionsByDate = {};
            submissions.forEach(sub => {
                const date = sub.createdAt.toISOString().slice(0, 10);
                submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
            });
            Object.entries(submissionsByDate).forEach(([date, count]) => {
                csvData += `${date},submissions,${count}\n`;
            });
            const formQuality = await this.getFormQuality();
            csvData += `${new Date().toISOString().slice(0, 10)},avg_subs_per_form,${formQuality.avgSubsPerForm.toFixed(2)}\n`;
            const clientSubmissions = await this.prisma.submission.groupBy({
                by: ['formId'],
                _count: {
                    id: true
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                take: 5,
            });
            for (const item of clientSubmissions) {
                const form = await this.prisma.form.findUnique({
                    where: { id: item.formId },
                    include: {
                        client: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                });
                if (form) {
                    csvData += `${new Date().toISOString().slice(0, 10)},client_${form.client.name},${item._count.id}\n`;
                }
            }
        }
        else {
            const funnel = await this.getSubmissionFunnel(userId);
            csvData += `${new Date().toISOString().slice(0, 10)},form_views,${funnel.views}\n`;
            csvData += `${new Date().toISOString().slice(0, 10)},form_starts,${funnel.starts}\n`;
            csvData += `${new Date().toISOString().slice(0, 10)},form_submissions,${funnel.submissions}\n`;
            const clientForms = await this.prisma.form.findMany({
                where: { clientId: userId },
                include: {
                    _count: {
                        select: { submissions: true },
                    },
                    submissions: {
                        where: {
                            createdAt: {
                                gte: new Date(startDate),
                                lte: new Date(endDate),
                            },
                        },
                    },
                },
            });
            clientForms.forEach(form => {
                csvData += `${new Date().toISOString().slice(0, 10)},form_${form.title},${form._count.submissions}\n`;
            });
            const fieldDistribution = await this.getFieldDistribution(userId);
            fieldDistribution.forEach(item => {
                csvData += `${new Date().toISOString().slice(0, 10)},field_type_${item.type},${item.count}\n`;
            });
        }
        return csvData;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map