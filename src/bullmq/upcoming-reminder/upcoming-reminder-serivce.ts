import dayjs from "dayjs";
import TelegramBot from "node-telegram-bot-api";
import { upcomingReminderQueue } from "./upcoming-reminder-queue";
import { QUEUE_KEY, UpcomingReminderPayload } from "./types";
import { upcomingReminderWorker } from "./upcoming-reminder-worker";

async function createUpcomingReminder(payload: UpcomingReminderPayload) {
    try {
        const delay = dayjs(payload.remindAt).diff(dayjs(), "milliseconds");
        if (delay <= 0) {
            throw new Error("Negative delay");
        }
        const reminder = await upcomingReminderQueue.add(QUEUE_KEY, payload, {
            delay,
        });
        if (!reminder || !reminder.id) {
            reminder.remove();
            throw new Error("createUpcomingReminder not created");
        }
        return reminder.id;
    } catch (error) {
        throw error;
    }
}

async function deleteUpcomingReminder(id: string): Promise<void> {
    const reminder = await getUpcomingReminderById(id);
    if (reminder) await reminder.remove();
}

async function getUpcomingReminderById(id: string) {
    return upcomingReminderQueue.getJob(id);
}

function getWorkerInstance(bot: TelegramBot) {
    return upcomingReminderWorker(bot);
}

export const upcomingReminderService = {
    createUpcomingReminder,
    getWorkerInstance,
    deleteUpcomingReminder,
    getUpcomingReminderById,
};
