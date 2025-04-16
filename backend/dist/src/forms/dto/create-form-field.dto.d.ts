import { FieldType } from '@prisma/client';
export declare class CreateFormFieldDto {
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    order: number;
    options?: string[];
}
