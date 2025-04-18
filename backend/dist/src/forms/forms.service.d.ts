import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { Role } from '@prisma/client';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createFormDto: CreateFormDto): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            type: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            required: boolean;
            order: number;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        slug: string;
        published: boolean;
        clientId: string;
    }>;
    findAll(userId: string, userRole: Role): Promise<({
        _count: {
            submissions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        slug: string;
        published: boolean;
        clientId: string;
    })[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
        };
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            type: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            required: boolean;
            order: number;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        slug: string;
        published: boolean;
        clientId: string;
    }>;
    findBySlug(clientId: string, slug: string): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
        };
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            type: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            required: boolean;
            order: number;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        slug: string;
        published: boolean;
        clientId: string;
    }>;
    update(id: string, userId: string, userRole: Role, updateFormDto: UpdateFormDto): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            type: import(".prisma/client").$Enums.FieldType;
            placeholder: string | null;
            required: boolean;
            order: number;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            formId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        slug: string;
        published: boolean;
        clientId: string;
    }>;
    remove(id: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
    addField(formId: string, userId: string, userRole: Role, createFormFieldDto: CreateFormFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        type: import(".prisma/client").$Enums.FieldType;
        placeholder: string | null;
        required: boolean;
        order: number;
        options: string[];
        config: import("@prisma/client/runtime/library").JsonValue | null;
        formId: string;
    }>;
    updateField(formId: string, fieldId: string, userId: string, userRole: Role, updateFormFieldDto: UpdateFormFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        type: import(".prisma/client").$Enums.FieldType;
        placeholder: string | null;
        required: boolean;
        order: number;
        options: string[];
        config: import("@prisma/client/runtime/library").JsonValue | null;
        formId: string;
    }>;
    removeField(formId: string, fieldId: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
    private generateSlug;
}
