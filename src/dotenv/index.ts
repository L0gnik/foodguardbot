import dotenv from "dotenv";

dotenv.config();

export const ConfigService = {
    BOT_SECRET_TOKEN: process.env.BOT_SECRET_TOKEN!,

    REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
    REDIS_USERNAME: process.env.REDIS_USERNAME!,
    REDIS_HOST: process.env.REDIS_HOST!,
    REDIS_PORT: process.env.REDIS_PORT!,

    DB_USER: process.env.DB_USER!,
    DB_HOST: process.env.DB_HOST!,
    DB_NAME: process.env.DB_NAME!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_PORT: process.env.DB_PORT!,
    DATABASE_URL: process.env.DATABASE_URL!,
};

const errors = Object.entries(ConfigService).reduce(
    (acc: Array<string>, [key, value]: [string, string | undefined]) => {
        if (value === undefined || value === "") {
            acc.push(`❌ ${key}: provided: ${value}`);
        }
        return acc;
    },
    []
);

if (errors.length) {
    throw new Error(
        `Invalid environment variables provided: \n${errors.join("\n")}`
    );
}
