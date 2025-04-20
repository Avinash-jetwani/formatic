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
            formId: string;
            type: import(".prisma/client").$Enums.FieldType;
            label: string;
            placeholder: string | null;
            required: boolean;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            order: number;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(userId: string, userRole: Role): Promise<({
        _count: {
            fields: number;
            submissions: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        client: {
            id: string;
            name: string;
            email: string;
        };
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
            type: import(".prisma/client").$Enums.FieldType;
            label: string;
            placeholder: string | null;
            required: boolean;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            order: number;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findBySlug(clientId: string, slug: string): Promise<{
        client: {
            id: string;
            name: string;
            email: string;
        };
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
            type: import(".prisma/client").$Enums.FieldType;
            label: string;
            placeholder: string | null;
            required: boolean;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            order: number;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, userRole: Role, updateFormDto: UpdateFormDto): Promise<{
        fields: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            formId: string;
            type: import(".prisma/client").$Enums.FieldType;
            label: string;
            placeholder: string | null;
            required: boolean;
            options: string[];
            config: import("@prisma/client/runtime/library").JsonValue | null;
            order: number;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
    addField(formId: string, userId: string, userRole: Role, createFormFieldDto: CreateFormFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        formId: string;
        type: import(".prisma/client").$Enums.FieldType;
        label: string;
        placeholder: string | null;
        required: boolean;
        options: string[];
        config: import("@prisma/client/runtime/library").JsonValue | null;
        order: number;
    }>;
    updateField(formId: string, fieldId: string, userId: string, userRole: Role, updateFormFieldDto: UpdateFormFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        formId: string;
        type: import(".prisma/client").$Enums.FieldType;
        label: string;
        placeholder: string | null;
        required: boolean;
        options: string[];
        config: import("@prisma/client/runtime/library").JsonValue | null;
        order: number;
    }>;
    removeField(formId: string, fieldId: string, userId: string, userRole: Role): Promise<{
        id: string;
    }>;
    private generateSlug;
}
