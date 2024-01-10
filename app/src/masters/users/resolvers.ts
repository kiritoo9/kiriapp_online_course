import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import {
    listing,
    counts,
    getUserByEmail,
    getUserById,
    insertUser,
    updateUser,
    getRoleByUser,
    insertUserRole,
    updateUserRole
} from "./businesses";

import {
    getRoleById
} from "./../roles/businesses";

import Joi from "joi";
const schema = Joi.object({
    email: Joi.string().required(),
    fullname: Joi.string().required(),
    role_id: Joi.string().required(),
    phone: Joi.string().allow(null),
    address: Joi.string().allow(null),
    password: Joi.string().allow(null),
});

async function list(req: Request, res: Response) {
    try {
        const data = await listing(req);
        const totalPage = await counts(req);

        res.status(200).json({ data, totalPage });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function detail(req: Request, res: Response) {
    try {
        const id = req.params.id;

        const data = await getUserById(id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        res.status(200).json({ data });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function insert(req: Request, res: Response) {
    try {

        await schema.validateAsync(req.body);

        let body = req.body;

        /**
         * Validate password
         */
        if (!body.password) return res.status(400).json({ message: "Password cannot be null" });
        body.password = await Bun.password.hash(body.password, {
            algorithm: "bcrypt",
        });

        /**
         * Validate existing email
         */
        const exists = await getUserByEmail(body.email);
        if (exists) return res.status(400).json({ message: "Email is already exists" });

        /**
         * Check existing role_id
         */
        const role_id = body.role_id;
        delete body.role_id;
        const role_exists = await getRoleById(role_id);
        if (!role_exists) return res.status(404).json({ message: "role_id is not found or already deleted, try another one" });

        /**
         * Prepare and insert into users
         */
        let user: any = {
            id: uuidv4(),
            ...body,
            created_at: new Date(),
            created_by: "INJECTED"
        }
        await insertUser(user);

        /**
         * Prepare and insert into user_roles
         */
        let user_role = {
            id: uuidv4(),
            user_id: user.id,
            role_id,
            created_at: new Date(),
            created_by: "INJECTED"
        }
        await insertUserRole(user_role);

        /**
         * Response
         */
        res.status(201).json({
            message: "Data created",
            data: { user, user_role }
        });
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function update(req: Request, res: Response) {
    try {

        let body = req.body;
        await schema.validateAsync(body);

        let data: any = {
            id: req.params.id,
            email: body.email,
            fullname: body.fullname,
            phone: body.phone,
            address: body.address,
            updated_at: new Date(),
            updated_by: "INJECTED"
        }

        /**
         * Hash password if exists
         */
        if (req.body.password) {
            const hash = await Bun.password.hash(body.password, {
                algorithm: "bcrypt",
            });
            data['password'] = hash;
        }

        /**
         * Validate duplicate email
         */
        let exists = await getUserByEmail(data.email, data.id);
        if (!exists) {
            exists = await getUserByEmail(data.email);
            if (exists) return res.status(400).json({ "message": "Email is already registered" });
        }

        /**
         * Update user
         */
        await updateUser(data);

        /**
         * Update role_id
         */
        const role_id = body.role_id;

        const existing_role = await getRoleByUser(data.id);
        if (existing_role) {
            await updateUserRole({
                id: existing_role.id,
                role_id,
                updated_at: new Date(),
                updated_by: "INJECTED"
            });
        } else {
            await insertUserRole({
                id: uuidv4(),
                user_id: data.id,
                role_id,
                created_at: new Date(),
                created_by: "INJECTED"
            });
        }

        res.status(201).json({
            message: "Data is successfully updated",
            data
        })
    } catch (error) {
        res.status(400).json({ error });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const id = req.params.id;

        await updateUser({
            id,
            deleted: true,
            updated_at: new Date(),
            updated_by: "INJECTED"
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