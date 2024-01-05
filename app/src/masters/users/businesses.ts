import { Request } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function listing(req: Request) {
    let page: any = req.query?.page !== undefined ? req.query.page : 1;
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: string = req.query?.keywords !== undefined ? req.query.keywords.toString().toLowerCase() : "";
    let orderBy: string = req.query?.orderBy !== undefined ? req.query.orderBy.toString() : "";

    let defaultOrder: any = {
        created_at: "asc"
    }
    if(orderBy) {
        const arrOrder = orderBy.split(":");
        if(arrOrder.length >= 1) {
            if(arrOrder[0] !== "null" && arrOrder[1] !== "null") {
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
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    fullname: {
                        contains: keywords
                    }
                }
            ]
        }
    });
    return data;
}

async function counts(req: Request) {
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: string = req.query?.keywords !== undefined ? req.query.keywords.toString().toLowerCase() : "";

    let count = await prisma.users.count({
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    fullname: {
                        contains: keywords
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

export {
    listing,
    counts
}