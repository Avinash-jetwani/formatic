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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SubmissionsService = class SubmissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubmissionDto) {
        const form = await this.prisma.form.findUnique({
            where: { id: createSubmissionDto.formId },
        });
        if (!form || !form.published) {
            throw new common_1.NotFoundException('Form not found or not published');
        }
        return this.prisma.submission.create({
            data: {
                formId: createSubmissionDto.formId,
                data: createSubmissionDto.data,
            },
        });
    }
    async findAll(userId, userRole) {
        if (userRole === client_1.Role.SUPER_ADMIN) {
            return this.prisma.submission.findMany({
                include: {
                    form: {
                        select: {
                            title: true,
                            clientId: true,
                            client: {
                                select: {
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
            });
        }
        return this.prisma.submission.findMany({
            where: {
                form: {
                    clientId: userId,
                },
            },
            include: {
                form: {
                    select: {
                        title: true,
                        clientId: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
        });
    }
    async findByForm(formId, userId, userRole) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found`);
        }
        if (userRole !== client_1.Role.SUPER_ADMIN && form.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access submissions for this form');
        }
        return this.prisma.submission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId, userRole) {
        const submission = await this.prisma.submission.findUnique({
            where: { id },
            include: {
                form: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${id} not found`);
        }
        if (userRole !== client_1.Role.SUPER_ADMIN && submission.form.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this submission');
        }
        return submission;
    }
    async findSiblings(id, formId, userId, userRole) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found`);
        }
        if (userRole !== client_1.Role.SUPER_ADMIN && form.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access submissions for this form');
        }
        const currentSubmission = await this.prisma.submission.findUnique({
            where: { id },
            select: { createdAt: true },
        });
        if (!currentSubmission) {
            throw new common_1.NotFoundException(`Submission with ID ${id} not found`);
        }
        const nextSubmission = await this.prisma.submission.findFirst({
            where: {
                formId,
                createdAt: { gt: currentSubmission.createdAt },
            },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        const previousSubmission = await this.prisma.submission.findFirst({
            where: {
                formId,
                createdAt: { lt: currentSubmission.createdAt },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
        });
        return {
            next: nextSubmission?.id || null,
            previous: previousSubmission?.id || null,
        };
    }
    async remove(id, userId, userRole) {
        await this.findOne(id, userId, userRole);
        await this.prisma.submission.delete({ where: { id } });
        return { id };
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map