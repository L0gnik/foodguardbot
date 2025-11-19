import TelegramBot from "node-telegram-bot-api";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { productService, userService } from "../../services";
import { formatDateToDDMMYYYYHHmm, validateString } from "../../utils";
import { CALLBACK_QUERY_ACTION, REDIS_STEP } from "../../types";
import { inlineKeyboard } from "../keyboards";
import { onCallbackQuery, onCommand, onMessage } from "../handlers";

export const addCommand = (bot: TelegramBot) => {
    onCommand(
        bot,
        "ADD",
        async (message) => {
            if (message.from) {
                const productNames = await productService.getLastUserProducts(
                    message.from.id
                );
                console.log(productNames);
                await bot.sendMessage(
                    message.chat.id,
                    `Напиши что хочешь добавить${
                        productNames.length ? " или выбери:" : ":"
                    }`,
                    {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard.list(
                                CALLBACK_QUERY_ACTION.SEND_CALENDAR_FOR_PRODUCT_EXPIRE_DATE,
                                productNames.map((i) => ({
                                    productName: i.name,
                                    id: String(i.id),
                                })),
                                "productName"
                            ),
                        },
                    }
                );
            }
        },
        { setRedisState: REDIS_STEP.ASK_PRODUCT_NAME_TO_ADD }
    );

    onMessage(
        bot,
        REDIS_STEP.ASK_PRODUCT_NAME_TO_ADD,
        async (message) => {
            const productName = message.text;
            const telegramId = message.from?.id;
            const chatId = message.chat.id;
            if (productName && chatId && telegramId) {
                const userTimezone = await userService.getUserTimezone(
                    telegramId
                );

                await bot.sendMessage(
                    chatId,
                    `Теперь выбери срок годности для ${productName}:`,
                    {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard.calendar(
                                dayjs().tz(userTimezone).month(),
                                dayjs().tz(userTimezone).year(),
                                productName,
                                userTimezone
                            ),
                        },
                    }
                );
            }
        },
        {
            textValidator(text) {
                if (!/^[a-zA-Zа-яА-ЯёЁ0-9]+$/.test(text))
                    throw `Название может содержать только буквы и числа`;
                return validateString(text, 3, 24);
            },
        }
    );

    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.SEND_CALENDAR_FOR_PRODUCT_EXPIRE_DATE,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            const telegram_id = query.from.id;
            if (chat_id && message_id && telegram_id) {
                const userTimezone = await userService.getUserTimezone(
                    telegram_id
                );
                const { productName } = callbackData;

                await bot.editMessageText(
                    `Теперь выбери срок годности для ${productName}:`,
                    {
                        chat_id,
                        message_id,
                        reply_markup: {
                            inline_keyboard: inlineKeyboard.calendar(
                                dayjs().tz(userTimezone).month(),
                                dayjs().tz(userTimezone).year(),
                                productName,
                                userTimezone
                            ),
                        },
                    }
                );
            }
        },
        { onRedisState: REDIS_STEP.ASK_PRODUCT_NAME_TO_ADD }
    );
    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.CHANGE_CALENDAR_MONTH,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            if (chat_id && message_id) {
                const { previousMounth, month, year, timezone, productName } =
                    callbackData;
                if (month === previousMounth) return;
                await bot.editMessageReplyMarkup(
                    {
                        inline_keyboard: inlineKeyboard.calendar(
                            Number(month),
                            Number(year),
                            productName,
                            timezone
                        ),
                    },
                    { message_id, chat_id }
                );
            }
        }
    );
    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.ASK_PRODUCT_REMIND_DATE,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            if (chat_id && message_id) {
                const { day, month, year, productName, timezone } =
                    callbackData;
                if (Number(day) - dayjs().utc().date() === 0) {
                    return;
                }
                if (
                    dayjs().tz(timezone).hour() >= 18 &&
                    Number(day) - dayjs().utc().date() === 1
                ) {
                    return;
                }

                await bot.editMessageText(
                    `${productName} — ${day}.${
                        Number(month) + 1
                    }.${year}\nВыбери когда мне напомнить тебе:`,
                    {
                        chat_id,
                        message_id,
                        reply_markup: {
                            inline_keyboard: inlineKeyboard.remindAt({
                                day,
                                month,
                                productName,
                                timezone,
                                year,
                            }),
                        },
                    }
                );
            }
        }
    );

    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.CREATE_PRODUCT_AND_REMINDER,
        async (query, callbackData) => {
            const chat_id = query.message?.chat.id;
            const message_id = query.message?.message_id;
            if (chat_id && message_id) {
                const {
                    day,
                    month,
                    year,
                    hoursUntilExpire,
                    productName,
                    timezone,
                } = callbackData;
                const productExpireDate = dayjs()
                    .tz(timezone)
                    .date(Number(day))
                    .month(Number(month))
                    .year(Number(year))
                    .startOf("day");
                const remindAt = dayjs(productExpireDate)
                    .subtract(Number(hoursUntilExpire), "h")
                    .toDate();
                await productService.createFromAddLogic({
                    chatId: chat_id,
                    productExpireDate: productExpireDate.toDate(),
                    productName,
                    remindAt,
                    telegramUserId: query.from.id,
                });
                await bot.editMessageText(
                    `${productName}\nГоден до: ${formatDateToDDMMYYYYHHmm(
                        productExpireDate.toDate(),
                        timezone
                    )}\nНапомню: ${formatDateToDDMMYYYYHHmm(
                        remindAt,
                        timezone
                    )}`,
                    { chat_id, message_id }
                );
            }
        }
    );
};
