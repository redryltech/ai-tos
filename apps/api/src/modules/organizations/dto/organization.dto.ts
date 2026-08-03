import { IsEmail, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Trading' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'acme-trading' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MinLength(2)
  @MaxLength(64)
  slug?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MinLength(2)
  @MaxLength(64)
  slug?: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'trader@acme.example' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['admin', 'member'], default: 'member' })
  @IsOptional()
  @IsIn(['admin', 'member'])
  role?: 'admin' | 'member';
}

export class AcceptInviteDto {
  @ApiProperty({ description: 'Raw invite token from invite response' })
  @IsString()
  @MinLength(16)
  token!: string;
}

export class OrgIdParamDto {
  @IsUUID()
  id!: string;
}
