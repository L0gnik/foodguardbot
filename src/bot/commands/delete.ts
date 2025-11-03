import TelegramBot from "node-telegram-bot-api";
import { onCallbackQuery, onCommand } from "../handlers";
import { CALLBACK_QUERY_ACTION } from "../../types";
import { inlineKeyboard } from "../keyboards";
import { productService } from "../../services";

export const deleteCommand = (bot: TelegramBot) => {
    onCommand(bot, "DELETE", async (message) => {
        const chatId = message.chat.id;
        const telegramId = message?.from?.id;
        if (telegramId) {
            const productNames = await productService.getLastUserProducts(
                telegramId
            );
            bot.sendMessage(chatId, "Выбери, что хочешь удалить:", {
                reply_markup: {
                    inline_keyboard: inlineKeyboard.list(
                        CALLBACK_QUERY_ACTION.DELETE_PRODUCT,
                        productNames.map((i) => ({
                            productName: i.name,
                            id: String(i.id),
                        })),
                        "productName"
                    ),
                },
            });
        }
    });

    onCallbackQuery(
        bot,
        CALLBACK_QUERY_ACTION.DELETE_PRODUCT,
        async (query, callbackDate) => {
            const { id } = callbackDate;
            const message_id = query.message?.message_id;
            const chat_id = query.message?.chat.id;

            if (message_id && chat_id) {
                const deletedProduct = await productService.deleteProduct(
                    Number(id)
                );
                bot.editMessageText(
                    `Продукт "${deletedProduct.name}" успешно удалён!`,
                    { message_id, chat_id }
                );
            }
        }
    );
};
