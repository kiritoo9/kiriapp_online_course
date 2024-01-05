import { Request, Response } from "express";
import {
    listing,
    counts
} from "./businesses";

async function list(req: Request, res: Response) {
    try {
        const data = await listing(req);
        const totalPage = await counts(req);

        res.status(200).json({ data, totalPage });
    } catch (error) {
        res.status(400).json({ error });
    }
}

export {
    list
}