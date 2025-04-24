import { CreateSubmissionDto } from './dto/create-submission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<{
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    findAll(userId: string, userRole: Role): Promise<({
        form: {
            title: string;
            clientId: string;
        };
    } & {
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    })[]>;
    findByForm(formId: string, userId: string, userRole: Role): Promise<{
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        form: {
            id: string;
            createdAt: Date;
            title: string;
            description: string | null;
            clientId: string;
            slug: string;
            published: boolean;
            updatedAt: Date;
        };
    } & {
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    findSiblings(id: string, formId: string, userId: string, userRole: Role): Promise<{
        next: string;
        previous: string;
    }>;
    remove(id: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
}
