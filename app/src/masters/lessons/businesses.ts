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

    let data = await prisma.lessons.findMany({
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

    let count = await prisma.lessons.count({
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

async function getLessonById(id: any) {
    try {
        return await prisma.lessons.findFirst({
            where: {
                id,
                deleted: false
            },
            select: {
                id: true,
                name: true,
                description: true,
                created_at: true
            }
        });
    } catch (error:any) {
        throw error;
    }
}

async function insertLesson(data: any = {}) {
    try {
        await prisma.lessons.create({
            data: data
        });
    } catch (error:any) {
        throw error;
    }
}

async function updateLesson(data: any = {}) {
    try {
        await prisma.lessons.update({
            where: {
                id: data.id
            },
            data: data
        })
    } catch (error:any) {
        throw error;
    }
}

export {
    lists,
    counts,
    getLessonById,
    insertLesson,
    updateLesson
}