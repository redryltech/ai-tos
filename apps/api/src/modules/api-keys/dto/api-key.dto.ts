import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiKeyProviderSchema, type ApiKeyProvider } from '@ai-tos/shared';

const PROVIDERS = ApiKeyProviderSchema.options;

export class CreateApiKeyDto {
  @ApiProperty({ enum: PROVIDERS })
  @IsIn(PROVIDERS)
  provider!: ApiKeyProvider;

  @ApiProperty({ example: 'Production OpenAI' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ description: 'Raw provider API key (encrypted at rest; never returned)' })
  @IsString()
  @MinLength(8)
  @MaxLength(4096)
  secret!: string;
}

export class UpdateApiKeyDto {
  @ApiPropertyOptional({ example: 'Production OpenAI (rotated)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: PROVIDERS })
  @IsOptional()
  @IsIn(PROVIDERS)
  provider?: ApiKeyProvider;

  @ApiPropertyOptional({ description: 'Optional new secret (re-encrypts; never returned)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(4096)
  secret?: string;
}
