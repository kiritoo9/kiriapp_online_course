import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

/**
 * Load Configurations
 */
import { configs } from "./app/configs/configs";

/**
 * Load Routes
 */
import { welcome } from "./app/src/welcome/routes";
import { users } from "./app/src/masters/users/routes";
import { lessons } from "./app/src/masters/lessons/routes";

const app = express();

/**
 * Intiate @var __dirname because it deprecated
 */
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * app Configurations
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cors());
app.use(express.static(__dirname + "/cdn"));

/**
 * Init routes
 */
app.use("/", welcome);
app.use("/users", users);
app.use("/lessons", lessons);

/**
 * Routes error handler
 */
app.use("*", (_, res) => {
    res.status(404).json({
      "message": "Route is not found, seems like you are lost",
    });
});

/**
 * Run server
 */
app.listen(configs.APP_PORT, () => {
    console.info(`${new Date()} - Listening on port ${configs.APP_PORT}`);
});