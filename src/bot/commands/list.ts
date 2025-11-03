import TelegramBot from "node-telegram-bot-api";
import { productService } from "../../services";
import { formatDateToDDMMYYYYHHmm, numberToEmoji } from "../../utils";
import { BOT_COMMANDS } from "../../types";

export const listCommand = (bot: TelegramBot) => {
    bot.onText(BOT_COMMANDS.LIST, async (message) => {
        const telegramId = message?.from?.id;
        const chatId = message.chat.id;
        if (telegramId && chatId) {
            const list = await productService.getUserProductForList(telegramId);
            let string = "Список пуст";
            if (list.length) {
                string = list
                    .map((item, index) => {
                        return `${
                            item.isExpired ? "❌" : numberToEmoji(index + 1)
                        } ${item.name} | ${formatDateToDDMMYYYYHHmm(
                            item.expireDate,
                            item.user.timezone || undefined
                        )}${item.isExpired ? "| срок истёк!" : ""}`;
                    })
                    .join("\n");
            }

            bot.sendMessage(chatId, string);
        }
    });
};
