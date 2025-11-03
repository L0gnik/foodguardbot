import TelegramBot from "node-telegram-bot-api";
import { userService } from "../../services";
import { BOT_COMMANDS } from "../../types";

export const startCommand = (bot: TelegramBot) => {
    bot.onText(BOT_COMMANDS.START, async (message) => {
        if (message.from) {
            const user = await userService.create(message.from);
            bot.sendMessage(
                message.chat.id,
                `${
                    user.firstName ? ` ${user.firstName},` : ""
                } Я буду напоминать , когда срок годности твоих продуктов истекает!\nПеред стартом, в ⚙️ Настрокйках, советую выбрать часовой пояс, в котором ты находишься, для корректного отображения времени.`,
                {
                    reply_markup: {
                        resize_keyboard: true,
                        keyboard: [
                            [{ text: "➕ Добавить" }, { text: "🗑 Удалить" }],
                            [
                                { text: "📋 Список" },
                                {
                                    text: "⚙️ Настройки",
                                },
                            ],
                        ],
                    },
                }
            );
        }
    });
};
