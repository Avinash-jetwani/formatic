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
    async getClientGrowth(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const raw = await this.prisma.user.groupBy({
            by: ['createdAt'],
            where: { role: 'CLIENT', createdAt: { gte: cutoff } },
            _count: { _all: true },
        });
        return raw.map(r => ({
            date: r.createdAt.toISOString().slice(0, 10),
            count: r._count._all,
        }));
    }
    async getFormQualityMetrics() {
        const forms = await this.prisma.form.findMany({
            include: { _count: { select: { submissions: true } } },
        });
        const avgSubs = forms.reduce((sum, f) => sum + f._count.submissions, 0) /
            (forms.length || 1);
        return { avgSubsPerForm: avgSubs };
    }
    async getFunnelData(formId) {
        const submissions = await this.prisma.submission.count({
            where: { formId },
        });
        return { views: 0, starts: 0, submissions };
    }
    async getFieldTypeDistribution(clientId) {
        const raw = await this.prisma.formField.groupBy({
            by: ['type'],
            where: { form: { clientId } },
            _count: { _all: true },
        });
        return raw.map(r => ({ type: r.type, count: r._count._all }));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map