import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@ai-tos/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-organization-id',
  required: false,
  description: 'Optional org context (profile remains user-owned)',
})
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  async getMine(
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-organization-id') _orgId?: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.profiles.getMine(u);
    return { data, error: null };
  }

  @Post('me')
  @ApiOperation({ summary: 'Create authenticated user profile' })
  async create(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: CreateProfileDto,
    @Headers('x-organization-id') _orgId?: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.profiles.create(u, body);
    return { data, error: null };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  async update(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: UpdateProfileDto,
    @Headers('x-organization-id') _orgId?: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.profiles.update(u, body, _orgId);
    return { data, error: null };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete authenticated user profile' })
  async remove(
    @CurrentUser() user: AuthUser | undefined,
    @Headers('x-organization-id') _orgId?: string,
  ) {
    const u = this.requireUser(user);
    await this.profiles.remove(u);
    return { data: { success: true }, error: null };
  }
}
