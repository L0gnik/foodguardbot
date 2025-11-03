import TelegramBot from "node-telegram-bot-api";
import { BOT_COMMANDS, REDIS_STEP } from "../../types";
import { redisService } from "../../redis";
import { validateString } from "../../utils";

export const onMessage = <Key extends REDIS_STEP>(
    bot: TelegramBot,
    key: Key,
    listener: (message: TelegramBot.Message) => void | Promise<void>,
    options?: { setRedisStep?: Key; textValidator?: (text: string) => string }
) => {
    bot.on("message", async (message) => {
        const text = message.text;
        if (text) {
            try {
                validateString(text);
                const isCommand = Object.values(BOT_COMMANDS).some((regex) =>
                    regex.test(text)
                );
                if (isCommand) return;
                const state = await redisService.getState(message.chat.id);
                if (state?.step === key) {
                    options?.textValidator?.(text);
                    await listener(message);
                    await redisService.clearState(message.chat.id);
                    if (options?.setRedisStep) {
                        await redisService.setState(message.chat.id, {
                            step: options?.setRedisStep,
                        });
                    }
                }
            } catch (error) {
                bot.sendMessage(
                    message.chat.id,
                    typeof error === "string"
                        ? error
                        : "Произошла ошибка на сервере, попробуйте снова."
                );
            }
        }
    });
};
