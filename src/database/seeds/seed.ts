import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Post } from '../../modules/posts/entities/post.entity';

export async function seedDatabase(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const userRepository = dataSource.getRepository(User);
  const postRepository = dataSource.getRepository(Post);

  console.log('🌱 Starting database seeding...');

  // ============================================
  // 1. SEED PERMISSIONS
  // ============================================
  console.log('📝 Seeding permissions...');
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
      console.log(`  ✅ Created permission: ${permissionData.name}`);
    } else {
      console.log(`  ⏭️  Permission already exists: ${permissionData.name}`);
    }
    savedPermissions.push(permission);
  }

  // ============================================
  // 2. SEED ROLES
  // ============================================
  console.log('\n👥 Seeding roles...');
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
      console.log(`  ✅ Created role: ${roleData.name}`);
    } else {
      console.log(`  ⏭️  Role already exists: ${roleData.name}`);
    }
    savedRoles.push(role);
  }

  // ============================================
  // 3. ASSIGN PERMISSIONS TO ROLES
  // ============================================
  console.log('\n🔗 Assigning permissions to roles...');
  const adminRole = savedRoles.find(r => r.name === 'admin')!;
  const moderatorRole = savedRoles.find(r => r.name === 'moderator')!;
  const userRole = savedRoles.find(r => r.name === 'user')!;

  // Admin gets all permissions
  adminRole.permissions = savedPermissions;
  await roleRepository.save(adminRole);
  console.log(`  ✅ Admin role assigned ${savedPermissions.length} permissions`);

  // Moderator gets post management and view users
  moderatorRole.permissions = [
    savedPermissions.find(p => p.name === 'create_post')!,
    savedPermissions.find(p => p.name === 'edit_post')!,
    savedPermissions.find(p => p.name === 'delete_post')!,
    savedPermissions.find(p => p.name === 'view_post')!,
    savedPermissions.find(p => p.name === 'view_user')!,
  ];
  await roleRepository.save(moderatorRole);
  console.log(`  ✅ Moderator role assigned ${moderatorRole.permissions.length} permissions`);

  // User gets basic post permissions
  userRole.permissions = [
    savedPermissions.find(p => p.name === 'create_post')!,
    savedPermissions.find(p => p.name === 'view_post')!,
  ];
  await roleRepository.save(userRole);
  console.log(`  ✅ User role assigned ${userRole.permissions.length} permissions`);

  // ============================================
  // 4. SEED USERS
  // ============================================
  console.log('\n👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [adminRole],
    },
    {
      name: 'John Moderator',
      email: 'moderator@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [moderatorRole],
    },
    {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [userRole],
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [userRole],
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: hashedPassword,
      isActive: true,
      roles: [userRole],
    },
    {
      name: 'Diana Prince',
      email: 'diana@example.com',
      password: hashedPassword,
      isActive: false,
      roles: [userRole],
    },
  ];

  const savedUsers: User[] = [];
  for (const userData of users) {
    let user = await userRepository.findOne({ where: { email: userData.email } });
    if (!user) {
      user = userRepository.create(userData);
      user = await userRepository.save(user);
      console.log(`  ✅ Created user: ${userData.name} (${userData.email})`);
    } else {
      console.log(`  ⏭️  User already exists: ${userData.email}`);
    }
    savedUsers.push(user);
  }

  // ============================================
  // 5. SEED POSTS
  // ============================================
  console.log('\n📄 Seeding posts...');
  const posts = [
    {
      title: 'Welcome to Our Blog!',
      content: 'This is the first post on our amazing blog. We are excited to share our thoughts and experiences with you. Stay tuned for more updates and interesting content!',
      authorId: savedUsers[0].id, // Admin
    },
    {
      title: 'Getting Started with NestJS',
      content: 'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses modern JavaScript, is built with TypeScript, and combines elements of OOP, FP, and FRP.',
      authorId: savedUsers[1].id, // Moderator
    },
    {
      title: 'Understanding TypeORM',
      content: 'TypeORM is an ORM that can run in NodeJS and can be used with TypeScript and JavaScript. It supports various databases including PostgreSQL, MySQL, MariaDB, SQLite, and more.',
      authorId: savedUsers[2].id, // Alice
    },
    {
      title: 'Role-Based Access Control Best Practices',
      content: 'RBAC is a method of regulating access to computer or network resources based on the roles of individual users. This post explores best practices for implementing RBAC in modern applications.',
      authorId: savedUsers[0].id, // Admin
    },
    {
      title: 'Building RESTful APIs',
      content: 'REST APIs are the backbone of modern web applications. In this post, we will explore the principles of REST and how to build robust, scalable APIs.',
      authorId: savedUsers[3].id, // Bob
    },
    {
      title: 'Authentication and Authorization',
      content: 'Understanding the difference between authentication and authorization is crucial for building secure applications. Authentication verifies who you are, while authorization determines what you can do.',
      authorId: savedUsers[1].id, // Moderator
    },
    {
      title: 'Database Migrations with TypeORM',
      content: 'Database migrations are essential for managing database schema changes over time. TypeORM provides a powerful migration system that makes this process seamless.',
      authorId: savedUsers[4].id, // Charlie
    },
    {
      title: 'JWT Authentication Explained',
      content: 'JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties. They are commonly used for authentication in modern web applications.',
      authorId: savedUsers[2].id, // Alice
    },
    {
      title: 'Advanced TypeScript Tips',
      content: 'TypeScript offers many advanced features that can help you write better, more maintainable code. This post covers generics, decorators, and advanced types.',
      authorId: savedUsers[0].id, // Admin
    },
    {
      title: 'Testing NestJS Applications',
      content: 'Testing is a critical part of software development. NestJS provides excellent support for unit testing and e2e testing using Jest and Supertest.',
      authorId: savedUsers[3].id, // Bob
    },
  ];

  for (const postData of posts) {
    const existingPost = await postRepository.findOne({ 
      where: { title: postData.title } 
    });
    if (!existingPost) {
      const post = postRepository.create(postData);
      await postRepository.save(post);
      console.log(`  ✅ Created post: "${postData.title}"`);
    } else {
      console.log(`  ⏭️  Post already exists: "${postData.title}"`);
    }
  }

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Permissions: ${savedPermissions.length}`);
  console.log(`  - Roles: ${savedRoles.length}`);
  console.log(`  - Users: ${savedUsers.length}`);
  console.log(`  - Posts: ${posts.length}`);
  console.log('\n🔐 Default credentials:');
  console.log('  Admin:     admin@example.com / password123');
  console.log('  Moderator: moderator@example.com / password123');
  console.log('  User:      alice@example.com / password123');
}
