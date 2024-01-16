import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
    lists,
    counts,
    getClassById,
    insertClass,
    updateClass
} from "./businesses";

import Joi from 'joi';
const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null)
});

async function list(req: Request, res: Response) {
    try {
        const data = await lists(req);
        const totalPage = await counts(req);

        res.status(200).json({
            data,
            totalPage
        });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

async function detail(req: Request, res: Response) {
    try {
        const id = req.params.id;

        const data = await getClassById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        res.status(200).json({ data });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

async function insert(req: Request, res: Response) {
    try {
        const body = req.body;
        await schema.validateAsync(body);

        const data: any = {
            id: uuidv4(),
            name: body.name,
            description: body.description,
            created_at: new Date(),
            created_by: "INJECTED"
        }
        await insertClass(data);

        res.status(201).json({ message: "Data is successfully inserted", data });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

async function update(req: Request, res: Response) {
    try {

        /**
         * Check existing data
         */
        const id = req.params.id;
        const exists = await getClassById(id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        /**
         * Validate and update
         */
        const body = req.body;
        await schema.validateAsync(body);

        const data: any = {
            id,
            name: body.name,
            description: body.description,
            updated_at: new Date(),
            updated_by: "INJECTED"
        }
        await updateClass(data);

        res.status(201).json({ message: "Data is successfully updated", data });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        /**
        * Check existing data
        */
        const id = req.params.id;
        const exists = await getClassById(id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        /**
         * Validate and update
         */
        await updateClass({ id, deleted: true });

        res.status(201).json({ message: "Data is successfully deleted" });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

export {
    list,
    detail,
    insert,
    update,
    remove
}