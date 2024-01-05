import { Router } from "express";
import {
    list
} from "./resolvers";

class UsersRoute {
    public router = Router();

    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", list);
    }
}

const users = new UsersRoute().router;
export {
    users
}