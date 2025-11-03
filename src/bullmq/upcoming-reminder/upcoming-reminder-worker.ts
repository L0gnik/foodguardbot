import { Worker } from "bullmq";
import TelegramBot from "node-telegram-bot-api";
import dayjs from "dayjs";

import { redis } from "../../redis/redis";
import { prismaClient } from "../../db";
import { QUEUE_KEY, UpcomingReminderPayload } from "./types";
import { expiredReminderService } from "../expired-reminder";

export const upcomingReminderWorker = (bot: TelegramBot) => {
    const worker = new Worker<UpcomingReminderPayload>(
        QUEUE_KEY,
        async (job) => {
            try {
                const deletedReminder = await prismaClient.reminders.delete({
                    where: { jobKey: job.id },
                    select: {
                        user: {
                            select: {
                                id: true,
                            },
                        },
                        product: {
                            select: {
                                name: true,
                                expireDate: true,
                                id: true,
                            },
                        },
                    },
                });
                const { chatId, timezone } = job.data;

                const hoursLeft = dayjs(
                    deletedReminder.product.expireDate
                ).diff(dayjs(), "h");

                bot.sendMessage(
                    chatId,
                    `⏰ Напоминание: "${deletedReminder.product.name}" истекает через ${hoursLeft} час(-ов)`
                );

                const expiredReminderId =
                    await expiredReminderService.createExpiredReminder({
                        chatId,
                        expireDate: deletedReminder.product.expireDate,
                        timezone,
                        productId: deletedReminder.product.id,
                    });
                await prismaClient.reminders.create({
                    data: {
                        jobKey: expiredReminderId,
                        remindAt: deletedReminder.product.expireDate,
                        productId: deletedReminder.product.id,
                        userId: deletedReminder.user.id,
                    },
                });
            } catch (error) {
                throw error;
            }
        },
        {
            connection: redis,
            limiter: { max: 30, duration: 1000 },
        }
    );
    console.log("✅ UpcomingReminder worker is ready to use");
    return worker;
};
