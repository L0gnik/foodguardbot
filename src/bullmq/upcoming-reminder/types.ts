import { Reminders, User } from "../../db";

export const QUEUE_KEY = "upcomingReminderQueue";
export type UpcomingReminderPayload = {
    chatId: number;
    timezone: User["timezone"];
    remindAt: Reminders["remindAt"];
};
