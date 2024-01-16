import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import {
    lists,
    counts,
    getRoleById,
    insertRole,
    updateRole,
    getAttributesByRole,
    insertRoleAttribute,
    updateRoleAttribute,
    deleteAttributeById
} from "./businesses";

import Joi from "joi";
const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null),
    attributes: Joi.array().items(Joi.object({
        id: Joi.string().allow(null),
        name: Joi.string().required(),
        description: Joi.string().allow(null)
    }))
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
        const data = await getRoleById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        const attributes = await getAttributesByRole(id);

        res.status(200).json({ data, attributes });
    } catch (error:any) {
        res.status(400).json({ error: error?.message });
    }
}

async function insert(req: Request, res: Response) {
    try {
        const body = req.body;
        await schema.validateAsync(body);

        /**
         * Preparing data to insert
         */
        const role: any = {
            id: uuidv4(),
            name: body.name,
            description: body.description,
            created_at: new Date(),
            created_by: "INJECTED"
        }
        let attributes: any = [];
        for (let i = 0; i < body.attributes.length; i++) {
            attributes.push({
                id: uuidv4(),
                role_id: role.id,
                name: body.attributes[i].name,
                description: body.attributes[i].description,
                created_at: new Date(),
                created_by: "INJECTED"
            });
        }

        /**
         * Inserting
         */
        await insertRole(role);
        await Promise.all(attributes.map((async (v: any) => {
            await insertRoleAttribute(v);
        })));

        res.status(201).json({ message: "Data is successfully inserted", data: { role, attributes } });
    } catch (error: any) {
        res.status(400).json({ error: error?.message });
    }
}

async function update(req: Request, res: Response) {
    try {
        /**
         * Check existing data
         */
        const id = req.params.id;
        const exists = await getRoleById(id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });


        /**
         * Validate and update date
         */
        const body = req.body;
        await schema.validateAsync(body);

        const role = {
            id,
            name: body.name,
            description: body.description,
            updated_at: new Date(),
            updated_by: "INJECTED"
        }
        let attributes: any = [];
        for (let i = 0; i < body.attributes.length; i++) {
            attributes.push({
                id: body.attributes[i].id,
                role_id: role.id,
                name: body.attributes[i].name,
                description: body.attributes[i].description
            });
        }

        await updateRole(role);

        /**
         * Compare new data with existing data
         * If there is some data from existing data that not exist in new data
         * then: update deleted as true
         */
        const existing_attributes = await getAttributesByRole(role.id);
        await Promise.all(existing_attributes.map((async (v: any) => {
            const x = attributes.find((x: any) => x.id == v.id);
            if (x === undefined) await deleteAttributeById(v.id);
        })));

        /**
         * Delete if id is null
         * Insert if id is not null
         */
        await Promise.all(attributes.map((async (v: any) => {
            if (v.id) {
                v.updated_at = new Date();
                v.updated_by = "INJECTED";
                await updateRoleAttribute(v);
            } else {
                v.id = uuidv4();
                v.created_at = new Date();
                v.created_by = "INJECTED";
                await insertRoleAttribute(v);
            }
        })));

        res.status(201).json({ message: "Data is successfully updated", data: { role, attributes } });
    } catch (error:any) {
        throw error;
    }
}

async function remove(req: Request, res: Response) {
    try {
        /**
         * Check existing data
         */
        const id = req.params.id;
        const exists = await getRoleById(id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        /**
         * Update role and role_attributes
         */
        await updateRole({ id, deleted: true });
        await updateRoleAttribute({
            role_id: id,
            deleted: true
        }, true);

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