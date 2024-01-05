import { Request, Response } from "express";
import { configs } from "../../configs/configs";

async function greeting(_: Request, res: Response) {
    return res.status(200).json({
        "APP_NAME": `Welcome to ${configs.APP_NAME} service`,
        "APP_VERSION": configs.APP_VER
    });
}

export {
    greeting
}