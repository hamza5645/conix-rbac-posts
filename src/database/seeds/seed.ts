import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

export async function seedDatabase(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  // Create default roles
  const roles = [
    { name: 'admin' },
    { name: 'moderator' },
    { name: 'user' },
  ];

  const savedRoles: Role[] = [];
  for (const roleData of roles) {
    let role = await roleRepository.findOne({ where: { name: roleData.name } });
    if (!role) {
      role = roleRepository.create(roleData);
      role = await roleRepository.save(role);
    }
    savedRoles.push(role);
  }

  // Create default permissions
  const permissions = [
    { name: 'create_post' },
    { name: 'edit_post' },
    { name: 'delete_post' },
    { name: 'view_post' },
    { name: 'create_user' },
    { name: 'edit_user' },
    { name: 'delete_user' },
    { name: 'view_user' },
    { name: 'manage_roles' },
    { name: 'manage_permissions' },
  ];

  const savedPermissions: Permission[] = [];
  for (const permissionData of permissions) {
    let permission = await permissionRepository.findOne({ 
      where: { name: permissionData.name } 
    });
    if (!permission) {
      permission = permissionRepository.create(permissionData);
      permission = await permissionRepository.save(permission);
    }
    savedPermissions.push(permission);
  }

  // Assign permissions to roles using many-to-many relationships
  const adminRole = savedRoles.find(r => r.name === 'admin')!;
  const moderatorRole = savedRoles.find(r => r.name === 'moderator')!;
  const userRole = savedRoles.find(r => r.name === 'user')!;

  // Admin gets all permissions
  adminRole.permissions = savedPermissions;
  await roleRepository.save(adminRole);

  // Moderator gets post management and view users
  moderatorRole.permissions = [
    savedPermissions.find(p => p.name === 'create_post')!,
    savedPermissions.find(p => p.name === 'edit_post')!,
    savedPermissions.find(p => p.name === 'delete_post')!,
    savedPermissions.find(p => p.name === 'view_post')!,
    savedPermissions.find(p => p.name === 'view_user')!,
  ];
  await roleRepository.save(moderatorRole);

  // User gets basic post permissions
  userRole.permissions = [
    savedPermissions.find(p => p.name === 'create_post')!,
    savedPermissions.find(p => p.name === 'view_post')!,
  ];
  await roleRepository.save(userRole);

  console.log('Database seeded successfully!');
}