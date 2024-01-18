import { Router } from "express";

import {
    list,
    detail,
    insert,
    update,
    remove
} from "./resolvers";

class ExamsRoute {
    public router = Router();

    constructor() {
        this.routes();
    }

    public routes() {
        this.router.get("/", list);
        this.router.get("/:id", detail);
        this.router.post("/", insert);
        this.router.put("/:id", update);
        this.router.delete("/:id", remove);
    }

}

const exams = new ExamsRoute().router;
export {
    exams
}