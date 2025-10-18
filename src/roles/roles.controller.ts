import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':id/permissions')
  findRoleWithPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneWithPermissions(id);
  }
}
