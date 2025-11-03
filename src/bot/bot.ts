import TelegramBot from "node-telegram-bot-api";
import { ConfigService } from "../dotenv";

import {
    addCommand,
    listCommand,
    echoCommand,
    settingCommand,
    startCommand,
    deleteCommand,
} from "./commands";

export const initTelegramBot = (): TelegramBot => {
    const { BOT_SECRET_TOKEN } = ConfigService;

    const bot = new TelegramBot(BOT_SECRET_TOKEN, {
        polling: true,
        filepath: false,
    });

    startCommand(bot);
    addCommand(bot);
    listCommand(bot);
    settingCommand(bot);
    deleteCommand(bot);
    echoCommand(bot);

    console.log("✅ Bot is ready to use");

    return bot;
};
