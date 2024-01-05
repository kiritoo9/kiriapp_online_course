import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const superAdminId = uuidv4();
    await prisma.roles.upsert({
        where: { id: superAdminId },
        update: {},
        create: {
            id: superAdminId,
            name: "super_admin",
            description: "Super Admin",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });

    const adminId = uuidv4();
    await prisma.roles.upsert({
        where: { id: adminId },
        update: {},
        create: {
            id: adminId,
            name: "admin",
            description: "Admin",
            deleted: false,
            created_at: new Date(),
            created_by: "SEEDER"
        }
    });
}

export { main }