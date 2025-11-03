import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roleIds, password, ...userData } = createUserDto;
    
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    if (roleIds && roleIds.length > 0) {
      user.roles = roleIds.map((id) => ({ id } as Role));
    }

    return this.usersRepository.save(user);
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
