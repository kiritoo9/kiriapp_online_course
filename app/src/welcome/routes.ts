import { Router } from "express";
import {
    greeting
} from "./resolvers";

class WelcomeRoute {
    public router = Router();

    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", greeting);
    }
}

const welcome = new WelcomeRoute().router;
export {
    welcome
}