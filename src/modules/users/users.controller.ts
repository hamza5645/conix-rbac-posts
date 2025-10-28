import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a user with their roles' })
  @ApiResponse({ status: 200, description: 'User with roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findUserWithRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneWithRoles(id);
  }
}
