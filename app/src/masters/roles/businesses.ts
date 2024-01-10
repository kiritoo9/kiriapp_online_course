import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getRoleById(id: string) {
    return await prisma.roles.findFirst({
        where: {
            deleted: false,
            id
        },
        select: {
            id: true,
            name: true
        }
    });
}

export {
    getRoleById
}