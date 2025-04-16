import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    // Check if form exists and is published
    const form = await this.prisma.form.findUnique({
      where: { id: createSubmissionDto.formId },
    });
    
    if (!form || !form.published) {
      throw new NotFoundException('Form not found or not published');
    }
    
    return this.prisma.submission.create({
      data: {
        formId: createSubmissionDto.formId,
        data: createSubmissionDto.data,
      },
    });
  }

  async findAll(userId: string, userRole: Role) {
    // Super admin can see all submissions
    if (userRole === Role.SUPER_ADMIN) {
      return this.prisma.submission.findMany({
        include: {
          form: {
            select: {
              title: true,
              client: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
      });
    }
    
    // Clients can only see submissions for their forms
    return this.prisma.submission.findMany({
      where: {
        form: {
          clientId: userId,
        },
      },
      include: {
        form: {
          select: {
            title: true,
          }
        }
      },
    });
  }

  async findByForm(formId: string, userId: string, userRole: Role) {
    // Check if form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });
    
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }
    
    // Check permissions
    if (userRole !== Role.SUPER_ADMIN && form.clientId !== userId) {
      throw new ForbiddenException('You do not have permission to access submissions for this form');
    }
    
    return this.prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        form: true,
      },
    });
    
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    
    // Check permissions
    if (userRole !== Role.SUPER_ADMIN && submission.form.clientId !== userId) {
      throw new ForbiddenException('You do not have permission to access this submission');
    }
    
    return submission;
  }

  async remove(id: string, userId: string, userRole: Role) {
    // Check if submission exists and user has permission
    await this.findOne(id, userId, userRole);
    
    await this.prisma.submission.delete({ where: { id } });
    return { id };
  }
}