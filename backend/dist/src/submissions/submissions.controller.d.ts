import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
export declare class SubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    }>;
    findAll(req: any): Promise<({
        form: {
            title: string;
            clientId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    })[]>;
    findByForm(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
        formId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
}
