import TelegramBot from "node-telegram-bot-api";
import { prismaClient, User } from "../db/prisma";
import { getTimezoneByCountry } from "../utils";

class UserSerivce {
    async create(from: TelegramBot.User): Promise<User> {
        const user = await prismaClient.user.findUnique({
            where: { telegramId: from.id },
        });
        if (!user) {
            return prismaClient.user.create({
                data: {
                    telegramId: from.id,
                    firstName: from.first_name,
                    username: from.username,
                },
            });
        }
        return user;
    }

    async setUserTimezone(telegramId: number, timezone: string) {
        return prismaClient.user.update({
            where: { telegramId },
            data: { timezone },
        });
    }

    async getUserTimezone(telegramId: number) {
        const user = await prismaClient.user.findUnique({
            where: { telegramId },
            select: { timezone: true },
        });
        return user?.timezone || "Europe/Moscow";
    }
}

export const userService = new UserSerivce();
