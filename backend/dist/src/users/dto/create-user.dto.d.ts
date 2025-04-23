import { Role, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    status?: UserStatus;
}
