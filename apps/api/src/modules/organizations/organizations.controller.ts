import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@ai-tos/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizationsService } from './organizations.service';
import {
  AcceptInviteDto,
  CreateOrganizationDto,
  InviteMemberDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  private requireUser(user?: AuthUser): AuthUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create organization (caller becomes owner)' })
  async create(@CurrentUser() user: AuthUser | undefined, @Body() body: CreateOrganizationDto) {
    const u = this.requireUser(user);
    const data = await this.orgs.create(u, body.name, body.slug);
    return { data, error: null };
  }

  @Get()
  @ApiOperation({ summary: 'List organizations for authenticated user' })
  async list(@CurrentUser() user: AuthUser | undefined) {
    const u = this.requireUser(user);
    const data = await this.orgs.listMine(u);
    return { data, error: null };
  }

  @Post('invites/accept')
  @ApiOperation({ summary: 'Accept organization invite for authenticated user' })
  async acceptInvite(
    @CurrentUser() user: AuthUser | undefined,
    @Body() body: AcceptInviteDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.orgs.acceptInvite(u, body.token);
    return { data, error: null };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by id (members only)' })
  async get(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.orgs.get(u, id);
    return { data, error: null };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization (owner/admin)' })
  async update(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOrganizationDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.orgs.update(u, id, body);
    return { data, error: null };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete organization (owner only)' })
  async remove(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    await this.orgs.remove(u, id);
    return { data: { success: true }, error: null };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List organization members' })
  async members(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const u = this.requireUser(user);
    const data = await this.orgs.listMembers(u, id);
    return { data, error: null };
  }

  @Post(':id/invites')
  @ApiOperation({ summary: 'Invite member by email (owner/admin)' })
  async invite(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: InviteMemberDto,
  ) {
    const u = this.requireUser(user);
    const data = await this.orgs.invite(u, id, body.email, body.role ?? 'member');
    return { data, error: null };
  }
}
