import { Request } from "express";
import * as jose from "jose";
import { configs } from "../configs/configs";

async function getToken(req: Request, specificField: string = "") {
    let response: any = null;
    let authorize = req.get('authorization');
    if (authorize) {
        const token = authorize.slice(7);
        const SECRET_KEY = new TextEncoder().encode(configs.SECRET_KEY);
        try {
            const { payload, protectedHeader } = await jose.jwtVerify(token, SECRET_KEY);
            if (specificField !== "") {
                Object.keys(payload).map((k: any, v: any) => {
                    if(k === specificField) {
                        response = payload[k];
                        return false;
                    }
                });
            } else {
                response = payload;
            }
        } catch (error) {
            console.error("Error while decoding token", error);
        }
    }
    return response;
}

export {
    getToken
}