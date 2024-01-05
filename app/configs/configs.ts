import dotenv from "dotenv";

dotenv.config({
    path: ".env"
});

class Configs {

    public APP_NAME: any = process.env.APP_NAME;
    public APP_VER: any = process.env.APP_VER;
    public APP_PORT: any = process.env.APP_PORT;
    public APP_ENV: any = process.env.APP_ENV;

    public DB_HOST: any = process.env.DB_HOST;
    public DB_USER: any = process.env.DB_USER;
    public DB_PASS: any = process.env.DB_PASS;
    public DB_PORT: any = process.env.DB_PORT;
    public DB_NAME: any = process.env.DB_NAME;

    public SECRET_KEY: any = process.env.SECRET_KEY;
}

const configs = new Configs();
export {
    configs
}