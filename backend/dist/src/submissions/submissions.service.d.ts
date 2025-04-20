import { CreateSubmissionDto } from './dto/create-submission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    }>;
    findAll(userId: string, userRole: Role): Promise<({
        form: {
            title: string;
        };
    } & {
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    })[]>;
    findByForm(formId: string, userId: string, userRole: Role): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    }[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        form: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            clientId: string;
            slug: string;
            published: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    }>;
    remove(id: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
}
