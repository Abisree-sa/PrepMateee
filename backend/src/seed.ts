import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding PlacementReady Database...');

  // 1. Seed Departments
  const deptsData = [
    { code: 'IT', name: 'Information Technology' },
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { code: 'MECH', name: 'Mechanical Engineering' },
  ];

  const deptsMap: Record<string, string> = {};
  for (const d of deptsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: { code: d.code, name: d.name },
    });
    deptsMap[d.code] = dept.id;
  }
  console.log('✅ Departments seeded (IT, CSE, AI&DS, ECE, EEE, Mechanical)');

  // 2. Seed Placement Coordinator (Admin)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'coordinator@sece.ac.in' },
    update: {},
    create: {
      email: 'coordinator@sece.ac.in',
      passwordHash: adminPassword,
      fullName: 'Dr. R. Placement Coordinator',
      registerNumber: 'COORD001',
      role: 'COORDINATOR',
      departmentId: deptsMap['IT'],
    },
  });
  console.log('✅ Placement Coordinator account created: coordinator@sece.ac.in / admin123');

  console.log('🎉 Database seeding complete!');
}

seed()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
