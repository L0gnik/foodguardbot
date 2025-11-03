import { RedisClientState } from "../types";
import { redis } from "./redis";

const setState = async (
    chatId: number,
    stateData: RedisClientState,
    ttl: number = 600
) => {

    await redis.set(`${chatId}`, JSON.stringify(stateData), "EX", ttl);
};

const getState = async (chatId: number): Promise<RedisClientState | null> => {
    const data = await redis.get(chatId.toString());
    return data ? JSON.parse(data) : null;
};

const clearState = async (chatId: number) => {
    await redis.del(chatId.toString());
};

export const redisService = {
    setState,
    getState,
    clearState,
};
