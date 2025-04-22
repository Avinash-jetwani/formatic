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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AnalyticsController = class AnalyticsController {
    constructor(analytics) {
        this.analytics = analytics;
    }
    async getClientGrowth(start, end) {
        const data = await this.analytics.getClientGrowth(start, end);
        return data;
    }
    async getFormQuality() {
        const data = await this.analytics.getFormQuality();
        return data;
    }
    async getFormCompletionRates(req, clientId) {
        if (req.user.role === client_1.Role.SUPER_ADMIN) {
            const data = await this.analytics.getFormCompletionRates(clientId);
            return data;
        }
        else {
            const data = await this.analytics.getFormCompletionRates(req.user.id);
            return data;
        }
    }
    async getSubmissionFunnel(req, clientId) {
        if (req.user.role === client_1.Role.SUPER_ADMIN || req.user.id === clientId) {
            const data = await this.analytics.getSubmissionFunnel(clientId);
            return data;
        }
        else {
            return { error: 'Unauthorized', status: 403 };
        }
    }
    async getFieldDistribution(req, clientId) {
        if (req.user.role === client_1.Role.SUPER_ADMIN) {
            const data = await this.analytics.getFieldDistribution(clientId);
            return data;
        }
        else {
            const data = await this.analytics.getFieldDistribution(req.user.id);
            return data;
        }
    }
    async getConversionTrends(req, clientId, start, end) {
        if (req.user.role === client_1.Role.SUPER_ADMIN || req.user.id === clientId) {
            const data = await this.analytics.getConversionTrends(clientId, start, end);
            return data;
        }
        else {
            return { error: 'Unauthorized', status: 403 };
        }
    }
    async exportDashboardData(req, role, userId, start, end, res) {
        if (req.user.role === client_1.Role.SUPER_ADMIN ||
            (req.user.role === client_1.Role.CLIENT && req.user.id === userId)) {
            const csvData = await this.analytics.exportDashboardData(role, userId, start, end);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.csv');
            return res.send(csvData);
        }
        else {
            return res.status(403).json({ error: 'Unauthorized' });
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('client-growth'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getClientGrowth", null);
__decorate([
    (0, common_1.Get)('form-quality'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFormQuality", null);
__decorate([
    (0, common_1.Get)('form-completion-rates'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFormCompletionRates", null);
__decorate([
    (0, common_1.Get)('submission-funnel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSubmissionFunnel", null);
__decorate([
    (0, common_1.Get)('field-distribution'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFieldDistribution", null);
__decorate([
    (0, common_1.Get)('conversion-trends'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('start')),
    __param(3, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getConversionTrends", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('start')),
    __param(4, (0, common_1.Query)('end')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "exportDashboardData", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map