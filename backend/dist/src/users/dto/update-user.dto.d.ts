import { Role, UserStatus } from '@prisma/client';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: Role;
    status?: UserStatus;
    lastLogin?: Date;
}
