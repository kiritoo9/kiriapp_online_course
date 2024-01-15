import { Request, Response } from "express";
import { getUserByEmail } from "../masters/users/businesses";

import { configs } from "./../../configs/configs";
import * as jose from "jose";

import Joi from 'joi';
const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

async function login(req: Request, res: Response) {
    try {
        const body = req.body;
        await loginSchema.validateAsync(body);

        /**
         * Check existing email
         */
        const user: any = await getUserByEmail(body.email);
        if (!user) return res.status(404).json({ message: "Email is not found" });

        /**
         * Check password match
         */
        const isMatch = await Bun.password.verify(body.password, user?.password);
        if (!isMatch) return res.status(400).json({ message: "Email and password does not match" });

        /**
         * Generate JWT
         */
        const SECRET_KEY = new TextEncoder().encode(configs.SECRET_KEY);
        const token = await new jose.SignJWT({
            user_id: user.id,
            usercode: user.usercode,
            fullname: user.fullname
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(SECRET_KEY);

        /**
         * Response
         */
        return res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error });
    }

}

export {
    login
}