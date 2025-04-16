import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
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
    findAll(req: any): Promise<({
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
        formId: string;
    }>;
    updateField(id: string, fieldId: string, req: any, updateFormFieldDto: CreateFormFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        type: import(".prisma/client").$Enums.FieldType;
        placeholder: string | null;
        required: boolean;
        order: number;
        options: string[];
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
}
