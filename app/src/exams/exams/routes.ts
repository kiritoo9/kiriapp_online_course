import { Router } from "express";

import {
    list,
    detail,
    insert,
    update,
    remove,
    listQuestions,
    insertQuestions,
    removeQuestion,
    assigns
} from "./resolvers";

class ExamsRoute {
    public router = Router();

    constructor() {
        this.routes();
    }

    public routes() {
        /**
         * Exams - Master
         */
        this.router.get("/", list);
        this.router.get("/:id", detail);
        this.router.post("/", insert);
        this.router.put("/:id", update);
        this.router.delete("/:id", remove);

        /**
         * Exams - Question
         */
        this.router.get("/questions/:exam_id", listQuestions);
        this.router.post("/questions/:exam_id", insertQuestions);
        this.router.put("/questions/:id", removeQuestion);

        /**
         * Exams - Assign
         */
        this.router.get("/assigns/:exam_id", assigns);
    }

}

const exams = new ExamsRoute().router;
export {
    exams
}