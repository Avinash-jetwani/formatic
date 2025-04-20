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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { email, password, name, role, status } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                status,
                lastLogin: null,
            },
        });
        const { password: _, ...result } = user;
        return result;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        forms: true
                    }
                }
            }
        });
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const submissionsCount = await this.prisma.submission.count({
                where: {
                    form: {
                        clientId: user.id
                    }
                }
            });
            const { password, ...rest } = user;
            return {
                ...rest,
                formsCount: user._count.forms,
                submissionsCount
            };
        }));
        return usersWithStats;
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        forms: true
                    }
                }
            }
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const submissionsCount = await this.prisma.submission.count({
            where: {
                form: {
                    clientId: id
                }
            }
        });
        const { password, ...result } = user;
        return {
            ...result,
            formsCount: user._count.forms,
            submissionsCount
        };
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        const data = { ...updateUserDto };
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
        });
        const { password, ...result } = updatedUser;
        return result;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { id };
    }
    async getUserStats(userId) {
        const formsCount = await this.prisma.form.count({
            where: { clientId: userId }
        });
        const submissionsCount = await this.prisma.submission.count({
            where: {
                form: {
                    clientId: userId
                }
            }
        });
        return {
            formsCount,
            submissionsCount
        };
    }
    async updateLastLogin(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map