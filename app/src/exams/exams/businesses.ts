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

    let data = await prisma.exams.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: defaultOrder,
        include: {
            lessons: {
                select: {
                    name: true,
                    description: true
                }
            }
        },
        where: {
            OR: [
                {
                    deleted: false,
                    title: {
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

    let count = await prisma.exams.count({
        where: {
            OR: [
                {
                    deleted: false,
                    title: {
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

async function getExamById(id: any) {
    try {
        return await prisma.exams.findFirst({
            where: {
                deleted: false,
                id
            },
            include: {
                lessons: {
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

async function getClassByExam(exam_id: any) {
    try {
        return await prisma.exam_classes.findMany({
            where: {
                exam_id: exam_id,
                deleted: false
            },
            include: {
                classes: {
                    select: {
                        name: true
                    }
                }
            }
        });
    } catch (error) {
        throw error;
    }
}

async function insertExam(data: any = {}) {
    try {
        return await prisma.exams.create({
            data
        });
    } catch (error) {
        throw error;
    }
}

async function updateExam(data: any = {}) {
    try {
        return await prisma.exams.update({
            where: {
                id: data?.id
            },
            data
        });
    } catch (error) {
        throw error;
    }
}

async function insertExamClass(data: any = {}) {
    try {
        return await prisma.exam_classes.create({ data });
    } catch (error) {
        throw error;
    }
}

async function updateExamClassByExam(data: any = {}) {
    try {
        return await prisma.exam_classes.updateMany({
            where: {
                exam_id: data?.exam_id
            },
            data
        });
    } catch (error) {
        throw error;
    }
}

async function deleteClassExamById(id: any) {
    try {
        return await prisma.exam_classes.update({
            where: {
                id
            },
            data: {
                deleted: true
            }
        });
    } catch (error) {
        throw error;
    }
}

export {
    lists,
    counts,
    getExamById,
    getClassByExam,
    insertExam,
    updateExam,
    insertExamClass,
    updateExamClassByExam,
    deleteClassExamById
}