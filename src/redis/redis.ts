import Redis from "ioredis";
import { ConfigService } from "../dotenv";

const { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = ConfigService;

export const redis = new Redis({
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
});

redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
    process.exit(-1);
});
redis.on("ready", () => {
    console.log("✅ Redis is ready to use");
});
