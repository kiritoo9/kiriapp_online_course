import { Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function listing(req: Request) {
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

    let data = await prisma.users.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: defaultOrder,
        select: {
            id: true,
            email: true,
            fullname: true,
            phone: true,
            created_at: true
        },
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                },
                {
                    deleted: false,
                    fullname: {
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

    let count = await prisma.users.count({
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords,
                        mode: "insensitive"
                    }
                },
                {
                    deleted: false,
                    fullname: {
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

async function getUserByEmail(email: string, id: any = null) {
    let where: any = {
        deleted: false,
        email
    }
    if (id) where['id'] = id;

    return await prisma.users.findFirst({ where: where });
}

async function getUserById(id: any) {
    return await prisma.users.findFirst({
        where: {
            id,
            deleted: false
        },
        select: {
            id: true,
            email: true,
            fullname: true,
            phone: true,
            address: true,
            created_at: true
        }
    });
}

async function insertUser(data: any = {}) {
    try {
        return await prisma.users.create({ data: data })
    } catch (error: any) {
        throw error;
    }
}

async function updateUser(data: any = {}) {
    try {
        return await prisma.users.update({
            where: {
                id: data?.id
            },
            data: data
        });
    } catch (error: any) {
        throw error;
    }
}

async function insertUserRole(data: any = {}) {
    try {
        return await prisma.user_roles.create({ data: data });
    } catch (error: any) {
        throw error;
    }
}

async function getRoleByUser(user_id: any = {}) {
    try {
        return await prisma.user_roles.findFirst({
            where: {
                deleted: false,
                user_id
            },
            select: {
                id: true,
                user_id: true,
                role_id: true
            }
        })
    } catch (error: any) {
        throw error;
    }
}

async function updateUserRole(data: any = {}) {
    try {
        return await prisma.user_roles.update({
            data: data,
            where: {
                id: data.id
            }
        });
    } catch (error: any) {
        throw error;
    }
}

async function updateUserRoleByUser(data: any = {}) {
    try {
        return await prisma.user_roles.updateMany({
            where: {
                user_id: data?.user_id
            },
            data
        });
    } catch (error) {
        throw error;
    }
}

async function getUserValuesByUser(user_id: any) {
    try {
        return await prisma.user_values.findMany({
            where: {
                deleted: false,
                user_id
            },
            include: {
                role_attributes: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

async function getUserValueByAttribute(user_id: any, role_attribute_id: any) {
    try {
        return await prisma.user_values.findFirst({
            where: {
                deleted: false,
                user_id,
                role_attribute_id
            },
        });
    } catch (error) {
        throw error;
    }
}

async function insertUserValue(data: any = {}) {
    try {
        return await prisma.user_values.create({
            data
        });
    } catch (error: any) {
        throw error;
    }
}

async function updateUserValue(data: any = {}) {
    try {
        return await prisma.user_values.update({
            where: {
                id: data?.id
            },
            data
        })
    } catch (error) {
        throw error;
    }
}

async function updateUserValueByUser(data: any = {}) {
    try {
        return await prisma.user_values.updateMany({
            where: {
                user_id: data?.user_id
            },
            data
        })
    } catch (error) {
        throw error;
    }
}

export {
    listing,
    counts,
    getUserByEmail,
    getUserById,
    insertUser,
    updateUser,
    updateUserRoleByUser,
    getRoleByUser,
    insertUserRole,
    updateUserRole,
    getUserValuesByUser,
    getUserValueByAttribute,
    insertUserValue,
    updateUserValue,
    updateUserValueByUser
}