import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<{
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }>;
    findAll(req: any): Promise<({
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
    findByForm(id: string, req: any): Promise<{
        id: string;
        formId: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }[]>;
    findOne(id: string, req: any): Promise<{
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
    findSiblings(id: string, formId: string, req: any): Promise<{
        next: string;
        previous: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
}
