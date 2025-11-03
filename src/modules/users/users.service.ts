import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, password, ...userData } = createUserDto;
    const defaultRole = await this.dataSource.getRepository(Role).findOne({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new NotFoundException('Default role "user" not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRepository = queryRunner.manager.getRepository(User);
      const roleRepository = queryRunner.manager.getRepository(Role);

      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      const roles: Role[] = [];
      if (roleIds && roleIds.length > 0) {
        const additionalRoles = await roleRepository.find({
          where: { id: In(roleIds) },
        });
        roles.push(...additionalRoles);
      }

      const uniqueRoleIds = new Set<number>([
        defaultRole.id,
        ...roles.map((role) => role.id),
      ]);
      user.roles = Array.from(uniqueRoleIds).map((id) => ({ id } as Role));

      const savedUser = await userRepository.save(user);
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.isActive',
        'user.createdAt',
        'role.id',
        'role.name',
      ])
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();
  }

  async findOneWithRoles(id: number): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.id = :id', { id })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ 
      where: { id, isDeleted: false } 
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Use softRemove which sets deletedAt timestamp
    const softRemovedUser = await this.usersRepository.softRemove(user);
    
    // Also update isDeleted flag for consistency
    softRemovedUser.isDeleted = true;
    await this.usersRepository.save(softRemovedUser);
    
    return { message: `User with ID ${id} has been deleted successfully` };
  }
}
