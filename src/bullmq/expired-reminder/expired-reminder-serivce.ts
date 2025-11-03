import dayjs from "dayjs";
import { expiredReminderQueue } from "./expired-reminder-queue";
import { expiredReminderWorker } from "./expired-reminder-worker";
import { ExpiredReminderPayload, QUEUE_KEY } from "./types";
import TelegramBot from "node-telegram-bot-api";

async function createExpiredReminder(payload: ExpiredReminderPayload) {
    try {
        const delay = dayjs(payload.expireDate).diff(dayjs(), "milliseconds");
        if (delay <= 0) {
            throw new Error("Negative delay");
        }
        const reminder = await expiredReminderQueue.add(QUEUE_KEY, payload, {
            delay,
        });
        if (!reminder || !reminder.id) {
            reminder.remove();
            throw new Error("createExpiredReminder not created");
        }
        return reminder.id;
    } catch (error) {
        throw error;
    }
}

async function deleteExpiredReminder(id: string): Promise<void> {
    const reminder = await getExpiredReminderById(id);
    if (reminder) await reminder.remove();
}

async function getExpiredReminderById(id: string) {
    return expiredReminderQueue.getJob(id);
}

function getWorkerInstance(bot: TelegramBot) {
    return expiredReminderWorker(bot);
}

async function getAllExpiredReminder() {
    return expiredReminderQueue.getJobs();
}

export const expiredReminderService = {
    createExpiredReminder,
    deleteExpiredReminder,
    getAllExpiredReminder,
    getWorkerInstance,
};
