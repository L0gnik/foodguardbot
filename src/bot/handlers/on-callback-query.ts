import TelegramBot from "node-telegram-bot-api";
import {
    CALLBACK_QUERY_ACTION,
    parseCallbackData,
    CALLBACK_QUERY_DATA,
    REDIS_STEP,
} from "../../types";
import { redisService } from "../../redis";

export const onCallbackQuery = <Key extends CALLBACK_QUERY_ACTION>(
    bot: TelegramBot,
    key: Key,
    listener: (
        query: Omit<TelegramBot.CallbackQuery, "data">,
        callbackData: CALLBACK_QUERY_DATA[Key]
    ) => void | Promise<void>,
    redis?: { onRedisState?: REDIS_STEP }
) => {
    bot.on("callback_query", async (query) => {
        if (query.data) {
            const { type, callbackData } = parseCallbackData<Key>(query.data);
            if (type === key) {
                try {
                    if (redis?.onRedisState && query.message?.chat.id) {
                        const state = await redisService.getState(
                            query.message?.chat.id
                        );
                        if (state?.step === redis?.onRedisState) {
                            await listener(query, callbackData);
                            await redisService.clearState(
                                query.message?.chat.id
                            );
                            return;
                        }
                    }
                    await listener(query, callbackData);
                } catch (error) {
                    if (query.message?.chat.id)
                        bot.sendMessage(
                            query.message?.chat.id,
                            typeof error === "string"
                                ? error
                                : "Произошла ошибка на сервере, попробуйте снова."
                        );
                }
            }
        }
    });
};
