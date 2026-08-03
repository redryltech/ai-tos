import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RbacRoleKeySchema, type RbacRoleKey } from '@ai-tos/shared';

export class AssignRoleDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: RbacRoleKeySchema.options })
  @IsEnum(RbacRoleKeySchema.enum)
  roleKey!: RbacRoleKey;
}
