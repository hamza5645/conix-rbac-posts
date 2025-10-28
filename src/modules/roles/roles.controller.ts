import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a role with its permissions' })
  @ApiResponse({ status: 200, description: 'Role with permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findRoleWithPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneWithPermissions(id);
  }
}
