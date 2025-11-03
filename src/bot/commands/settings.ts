import TelegramBot from "node-telegram-bot-api";
import { prismaClient } from "../../db";
import { getTimezoneByLocation, getTimezoneOffset } from "../../utils";
import {
    BOT_COMMANDS,
    buildCallbackData,
    CALLBACK_QUERY_ACTION,
    REDIS_STEP,
} from "../../types";
import { redisService } from "../../redis";
import { onCallbackQuery, onCommand, onMessage } from "../handlers";
import { userService } from "../../services";

export const settingCommand = (bot: TelegramBot) => {
    onCommand(bot, "SETTINGS", async (message) => {
        const telegramId = message?.from?.id;
        const chat_id = message.chat.id;
        if (telegramId && chat_id) {
            const user = await prismaClient.user.findUnique({
                where: { telegramId },
                select: { timezone: true },
            });
            if (!user || !user.timezone) return;
            const { timezone } = user;

            bot.sendMessage(chat_id, "⚙️ Настройки:", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Часовой пояс:`,
                                callback_data: buildCallbackData(
                                    CALLBACK_QUERY_ACTION.ECHO,
                                    {
                                        message: `Текущий часовой пояс: ${timezone}`,
                                    }
                                ),
                            },
                            {
                                text: timezone,
                                callback_data: buildCallbackData(
                                    CALLBACK_QUERY_ACTION.ECHO,
                                    {
                                        message: `Текущий часовой пояс: ${timezone}`,
                                    }
                                ),
                            },
                            {
                                text: "Изменить ✏️",
                                callback_data: buildCallbackData(
                                    CALLBACK_QUERY_ACTION.USER_CHANGE_TZ,
                                    { timezone }
                                ),
                            },
                        ],
                    ],
                },
            });
        }
    });

    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.USER_CHANGE_TZ,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            if (chat_id && message_id) {
                await redisService.setState(chat_id, {
                    step: REDIS_STEP.ASK_LOCATION_TO_SET_TIMEZONE,
                });
                bot.editMessageText(
                    "Теперь отправь мне геопозицию 🌍\n(Через вложения 📎)",
                    {
                        message_id,
                        chat_id,
                        reply_markup: { inline_keyboard: [] },
                    }
                );
            }
        }
    );

    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.USER_SET_TZ,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            const { timezone, offset } = callbackData;
            if (chat_id && message_id) {
                await redisService.clearState(chat_id);
                await userService.setUserTimezone(query.from.id, timezone);
                bot.editMessageText(
                    `Часовой пояс успешно изменён на ${timezone} (${offset})`,
                    {
                        message_id,
                        chat_id,
                        reply_markup: { inline_keyboard: [] },
                    }
                );
            }
        }
    );

    bot.on("location", async (message) => {
        const chat_id = message.chat.id;
        if (message.location && chat_id) {
            const state = await redisService.getState(chat_id);
            if (state?.step === REDIS_STEP.ASK_LOCATION_TO_SET_TIMEZONE) {
                const timezone = getTimezoneByLocation(message.location);
                const offset = getTimezoneOffset(timezone);
                bot.sendMessage(
                    chat_id,
                    `Вы выбрали ${timezone} (${offset}), верно?`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "Да✅",
                                        callback_data: buildCallbackData(
                                            CALLBACK_QUERY_ACTION.USER_SET_TZ,
                                            { offset, timezone }
                                        ),
                                    },
                                    {
                                        text: "Изменить ✏️",
                                        callback_data: buildCallbackData(
                                            CALLBACK_QUERY_ACTION.USER_CHANGE_TZ,
                                            { timezone }
                                        ),
                                    },
                                ],
                            ],
                        },
                    }
                );
            }
        }
    });
};
