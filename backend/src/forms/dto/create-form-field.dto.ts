import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FieldType } from '@prisma/client';

export class CreateFormFieldDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[] = [];
}