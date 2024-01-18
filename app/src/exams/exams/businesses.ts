import { Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function lists(req: Request) {

}

async function counts(req: Request) {

}

async function getExamById(id: any) {
    try {
        return await prisma.exams.findFirst({
            where: {
                deleted: false,
                id
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