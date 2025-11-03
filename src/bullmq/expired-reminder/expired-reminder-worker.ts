import { Worker } from "bullmq";
import TelegramBot from "node-telegram-bot-api";

import { redis } from "../../redis/redis";
import { prismaClient } from "../../db";
import { ExpiredReminderPayload, QUEUE_KEY } from "./types";

export const expiredReminderWorker = (bot: TelegramBot) => {
    const worker = new Worker<ExpiredReminderPayload>(
        QUEUE_KEY,
        async (job) => {
            try {
                const reminder = await prismaClient.reminders.delete({
                    where: { jobKey: job.id },
                    select: { product: { select: { name: true } } },
                });
                const { chatId, productId } = job.data;

                bot.sendMessage(
                    chatId,
                    `⏰ Напоминание: "${reminder.product.name}" истёк!`
                );

                await prismaClient.product.update({
                    where: { id: productId },
                    data: { isExpired: true },
                });
            } catch {
            } finally {
            }
        },
        {
            connection: redis,
            limiter: { max: 30, duration: 1000 },
        }
    );
    console.log("✅ ExpiredReminder worker is ready to use");
    return worker;
};
