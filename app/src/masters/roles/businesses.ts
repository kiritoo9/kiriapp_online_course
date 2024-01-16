import { Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function lists(req: Request) {
    let page: any = req.query?.page !== undefined ? req.query.page : 1;
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: string = req.query?.keywords !== undefined ? req.query.keywords.toString() : "";
    let orderBy: string = req.query?.orderBy !== undefined ? req.query.orderBy.toString() : "";

    let defaultOrder: any = {
        created_at: "asc"
    }
    if (orderBy) {
        const arrOrder = orderBy.split(":");
        if (arrOrder.length >= 1) {
            if (arrOrder[0] !== "null" && arrOrder[1] !== "null") {
                defaultOrder = {};
                defaultOrder[arrOrder[0]] = `${arrOrder[1]}`;
            }
        }
    }

    let offset = 0;
    if (page > 0 && limit > 0) offset = (page * limit) - limit;

    let data = await prisma.roles.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: defaultOrder,
        select: {
            id: true,
            name: true,
            description: true,
            created_at: true
        },
        where: {
            OR: [
                {
                    deleted: false,
                    name: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                },
                {
                    deleted: false,
                    description: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                }
            ]
        }
    });
    return data;
}

async function counts(req: Request) {
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: string = req.query?.keywords !== undefined ? req.query.keywords.toString() : "";

    let count = await prisma.roles.count({
        where: {
            OR: [
                {
                    deleted: false,
                    name: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                },
                {
                    deleted: false,
                    description: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                }
            ]
        }
    });
    let totalPage: number = 1;
    if (limit > 0 && count > 0) {
        totalPage = Math.ceil(count / limit);
    }
    return totalPage;
}

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

async function insertRole(data: any = {}) {
    try {
        return await prisma.roles.create({
            data
        });
    } catch (error) {
        throw error;
    }
}

async function updateRole(data: any = {}) {
    try {
        return await prisma.roles.update({
            where: {
                id: data?.id
            },
            data: data
        })
    } catch (error) {
        throw error;
    }
}

async function getAttributesByRole(role_id: any) {
    try {
        return prisma.role_attributes.findMany({
            where: {
                role_id: role_id,
                deleted: false
            },
            select: {
                id: true,
                name: true,
                description: true
            }
        })
    } catch (error) {
        throw error;
    }
}

async function insertRoleAttribute(data: any = {}) {
    try {
        return await prisma.role_attributes.create({
            data
        });
    } catch (error) {
        throw error;
    }
}

async function updateRoleAttribute(data: any = {}, byRole = false) {
    try {
        let where: any = {
            id: data?.id
        };
        if (byRole) {
            where = {
                role_id: data?.role_id
            }
        }

        return await prisma.role_attributes.updateMany({
            where: where,
            data: data
        });
    } catch (error) {
        throw error;
    }
}

async function deleteAttributeById(id: any) {
    try {
        return await prisma.role_attributes.update({
            where: {
                id
            },
            data: {
                deleted: true
            }
        })
    } catch (error) {
        throw error;
    }
}

export {
    lists,
    counts,
    getRoleById,
    insertRole,
    updateRole,
    getAttributesByRole,
    insertRoleAttribute,
    updateRoleAttribute,
    deleteAttributeById
}