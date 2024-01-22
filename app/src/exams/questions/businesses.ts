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

    let data = await prisma.questions.findMany({
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
                    question: {
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

    let count = await prisma.questions.count({
        where: {
            OR: [
                {
                    deleted: false,
                    question: {
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

async function getQuestionById(id: any) {
    try {
        return await prisma.questions.findFirst({
            where: {
                id,
                deleted: false
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

async function getAnswersByQuestion(question_id: any) {
    try {
        return await prisma.answers.findMany({
            where: {
                deleted: false,
                question_id
            }
        });
    } catch (error) {
        throw error;
    }
}

async function insertQuestion(data: any = {}) {
    try {
        return await prisma.questions.create({ data });
    } catch (error) {
        throw error;
    }
}

async function insertAnswer(data: any = {}) {
    try {
        return await prisma.answers.create({ data });
    } catch (error) {
        throw error;
    }
}

async function updateQuestion(data: any = {}) {
    try {
        return await prisma.questions.update({
            where: {
                id: data?.id
            },
            data
        });
    } catch (error) {
        throw error;
    }
}

async function updateAnswersByQuestion(data: any = {}) {
    try {
        return await prisma.answers.updateMany({
            where: {
                question_id: data?.question_id
            },
            data
        });
    } catch (error) {
        throw error;
    }
}

async function updateAnswerById(data: any) {
    try {
        return await prisma.answers.update({
            where: {
                id: data?.id
            },
            data
        })
    } catch (error) {
        throw error;
    }
}

export {
    lists,
    counts,
    getQuestionById,
    getAnswersByQuestion,
    insertQuestion,
    insertAnswer,
    updateQuestion,
    updateAnswersByQuestion,
    updateAnswerById
}