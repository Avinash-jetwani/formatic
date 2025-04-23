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
        clientId: string;
        slug: string;
        published: boolean;
    }>;
    findAll(req: any): Promise<({
        _count: {
            fields: number;
            submissions: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        clientId: string;
        slug: string;
        published: boolean;
    })[]>;
    findOne(id: string, req: any): Promise<{
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
        clientId: string;
        slug: string;
        published: boolean;
    }>;
    update(id: string, req: any, updateFormDto: UpdateFormDto): Promise<{
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
        clientId: string;
        slug: string;
        published: boolean;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
    addField(id: string, req: any, createFormFieldDto: CreateFormFieldDto): Promise<{
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
    updateField(id: string, fieldId: string, req: any, updateFormFieldDto: UpdateFormFieldDto): Promise<{
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
    removeField(id: string, fieldId: string, req: any): Promise<{
        id: string;
    }>;
    findPublicForm(clientId: string, slug: string): Promise<{
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
        clientId: string;
        slug: string;
        published: boolean;
    }>;
}
