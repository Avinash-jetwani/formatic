import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  // e.g. GET /analytics/clients/growth?days=30
  @Get('clients/growth')
  @Roles(Role.SUPER_ADMIN)
  getClientGrowth(@Query('days') days: string) {
    return this.analytics.getClientGrowth(+days || 30);
  }

  // GET /analytics/forms/quality
  @Get('forms/quality')
  @Roles(Role.SUPER_ADMIN)
  getFormQuality() {
    return this.analytics.getFormQualityMetrics();
  }

  // GET /analytics/submissions/funnel?formId=...
  @Get('submissions/funnel')
  getSubmissionFunnel(@Query('formId') formId: string) {
    return this.analytics.getFunnelData(formId);
  }

  // GET /analytics/fields/distribution?clientId=...
  @Get('fields/distribution')
  getFieldDistribution(@Query('clientId') clientId: string) {
    return this.analytics.getFieldTypeDistribution(clientId);
  }
}