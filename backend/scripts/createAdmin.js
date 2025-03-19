// Script para crear un usuario administrador
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear hash de la contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario administrador
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('Usuario administrador creado:', admin);
    
    // Crear usuario normal
    const userPassword = 'user123';
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {
        firstName: 'Normal',
        lastName: 'User',
        password: hashedUserPassword,
        role: 'USER'
      },
      create: {
        firstName: 'Normal',
        lastName: 'User',
        email: 'user@example.com',
        password: hashedUserPassword,
        role: 'USER',
        isActive: true
      }
    });
    
    console.log('Usuario normal creado:', user);
    
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 