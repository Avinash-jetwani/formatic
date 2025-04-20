import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    create(req: any, createFormDto: CreateFormDto): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, req: any, updateFormDto: UpdateFormDto): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
    addField(id: string, req: any, createFormFieldDto: CreateFormFieldDto): Promise<{
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
    updateField(id: string, fieldId: string, req: any, updateFormFieldDto: UpdateFormFieldDto): Promise<{
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
    removeField(id: string, fieldId: string, req: any): Promise<{
        id: string;
    }>;
    findPublicForm(clientId: string, slug: string): Promise<{
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
}
