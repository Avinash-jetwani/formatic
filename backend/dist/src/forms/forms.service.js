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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FormsService = class FormsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createFormDto) {
        const slug = createFormDto.slug || this.generateSlug(createFormDto.title);
        return this.prisma.form.create({
            data: {
                ...createFormDto,
                slug,
                clientId: userId,
            },
            include: {
                fields: true,
            },
        });
    }
    async findAll(userId, userRole) {
        if (userRole === client_1.Role.SUPER_ADMIN) {
            return this.prisma.form.findMany({
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            submissions: true,
                        },
                    },
                },
            });
        }
        return this.prisma.form.findMany({
            where: {
                clientId: userId,
            },
            include: {
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
        });
    }
    async findOne(id, userId, userRole) {
        const form = await this.prisma.form.findUnique({
            where: { id },
            include: {
                fields: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${id} not found`);
        }
        if (userRole !== client_1.Role.SUPER_ADMIN && form.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to access this form');
        }
        return form;
    }
    async findBySlug(clientId, slug) {
        const form = await this.prisma.form.findFirst({
            where: {
                clientId,
                slug,
                published: true,
            },
            include: {
                fields: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException('Form not found');
        }
        return form;
    }
    async update(id, userId, userRole, updateFormDto) {
        await this.findOne(id, userId, userRole);
        return this.prisma.form.update({
            where: { id },
            data: updateFormDto,
            include: {
                fields: true,
            },
        });
    }
    async remove(id, userId, userRole) {
        await this.findOne(id, userId, userRole);
        await this.prisma.form.delete({ where: { id } });
        return { id };
    }
    async addField(formId, userId, userRole, createFormFieldDto) {
        await this.findOne(formId, userId, userRole);
        return this.prisma.formField.create({
            data: {
                ...createFormFieldDto,
                formId,
            },
        });
    }
    async updateField(formId, fieldId, userId, userRole, updateFormFieldDto) {
        await this.findOne(formId, userId, userRole);
        const field = await this.prisma.formField.findUnique({
            where: { id: fieldId },
        });
        if (!field || field.formId !== formId) {
            throw new common_1.NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
        }
        return this.prisma.formField.update({
            where: { id: fieldId },
            data: updateFormFieldDto,
        });
    }
    async removeField(formId, fieldId, userId, userRole) {
        await this.findOne(formId, userId, userRole);
        const field = await this.prisma.formField.findUnique({
            where: { id: fieldId },
        });
        if (!field || field.formId !== formId) {
            throw new common_1.NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
        }
        await this.prisma.formField.delete({ where: { id: fieldId } });
        return { id: fieldId };
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50)
            + '-' + Date.now().toString().slice(-6);
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map