import { Router } from "express";

import {
    list,
    detail,
    insert,
    update,
    remove
} from "./resolvers";

class QuestionsRoute {
    public router = Router();

    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", list);
        this.router.get("/:id", detail);
        this.router.post("/", insert);
        this.router.put("/:id", update);
        this.router.delete("/:id", remove);
    }
}

const questions = new QuestionsRoute().router;
export {
    questions
}