import TelegramBot from "node-telegram-bot-api";
import { BOT_COMMANDS, REDIS_STEP } from "../../types";
import { redisService } from "../../redis";

export const onCommand = <Key extends keyof typeof BOT_COMMANDS>(
    bot: TelegramBot,
    command: Key,
    listener: (message: TelegramBot.Message) => void | Promise<void>,
    redis?: { setRedisState?: REDIS_STEP }
) => {
    bot.onText(BOT_COMMANDS[command], async (message) => {
        if (redis?.setRedisState) {
            await redisService.setState(message.chat.id, {
                step: redis.setRedisState,
            });
        }
        listener(message);
    });
};
