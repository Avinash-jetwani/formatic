import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClientGrowth(days: number) {
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
    const avgSubs =
      forms.reduce((sum, f) => sum + f._count.submissions, 0) /
      (forms.length || 1);
    return { avgSubsPerForm: avgSubs };
  }

  async getFunnelData(formId: string) {
    // Replace stubs with your real tracking if available
    const submissions = await this.prisma.submission.count({
      where: { formId },
    });
    return { views: 0, starts: 0, submissions };
  }

  async getFieldTypeDistribution(clientId: string) {
    const raw = await this.prisma.formField.groupBy({
      by: ['type'],
      where: { form: { clientId } },
      _count: { _all: true },
    });
    return raw.map(r => ({ type: r.type, count: r._count._all }));
  }
}