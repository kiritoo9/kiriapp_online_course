import { Request, Response, NextFunction } from 'express';
import * as jose from "jose";
import { configs } from "../configs/configs";
import { getUserById } from "../src/masters/users/businesses";

/**
 * Verify bearer token from client
 * Decoded JWT auth then check to database if user still valid or not
 */
async function verify(req: Request, res: Response, next: NextFunction) {

    let authorize = req.get('authorization');
    if (authorize) {
        const token = authorize.slice(7);
        const SECRET_KEY = new TextEncoder().encode(configs.SECRET_KEY);

        try {
            const { payload, protectedHeader } = await jose.jwtVerify(token, SECRET_KEY);

            /**
             * Check valid user
             */
            let allowed: boolean = true;
            let userId: any = "";
            if (payload?.user_id !== undefined) userId = payload.user_id;

            const user = await getUserById(userId);
            if (!user) {
                /**
                 * Can add more validation of user here
                 * Such as specifi role or another values
                 */
                allowed = false; // Set user as not valid
            }

            if (!allowed) return res.status(401).json({ message: "Invalid access token" });
        } catch (error: any) {
            return res.status(401).json({ message: "Invalid access token", detail: error?.message });
        }

    } else {
        /**
         * Handler missing bearer token
         */
        return res.status(401).json({ message: "Missing bearer authorization" });
    }
    next();

}

export {
    verify
}