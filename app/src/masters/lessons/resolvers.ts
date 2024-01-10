import { Request, Response } from "express"
import { v4 as uuidv4 } from 'uuid';
import {
    lists,
    counts,
    getLessonById,
    insertLesson,
    updateLesson
} from "./businesses";

import Joi from "joi";
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
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function detail(req: Request, res: Response) {
    try {
        const id = req.params.id;

        const data = await getLessonById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        res.status(200).json({ data });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function insert(req: Request, res: Response) {
    try {
        let body = req.body;
        await schema.validateAsync(body);

        let data = {
            id: uuidv4(),
            name: body.name,
            description: body.description,
            created_at: new Date(),
            created_by: "INJECTED"
        }
        await insertLesson(data);

        res.status(201).json({ message: "Data is successfully inserted", data });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function update(req: Request, res: Response) {
    try {

        let body = req.body;
        await schema.validateAsync(body);

        const exists: any = await getLessonById(req.params.id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        let data = {
            id: exists.id,
            name: body.name,
            description: body.description,
            updated_at: new Date(),
            updated_by: "INJECTED"
        }

        await updateLesson(data);

        res.status(201).json({ message: "Data is successfully updated", data });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const exists: any = await getLessonById(req.params.id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        await updateLesson({
            id: exists.id,
            deleted: true
        });

        res.status(201).json({ message: "Data is successfully deleted" });
    } catch (error) {
        res.status(400).json({ error });
    }
}

export {
    list,
    detail,
    insert,
    update,
    remove
}