import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      relations: ['rolePermissions', 'rolePermissions.role'],
    });
  }

  async findOne(id: number): Promise<Permission | null> {
    return this.permissionsRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.role'],
    });
  }
}