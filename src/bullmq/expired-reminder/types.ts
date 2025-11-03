import { Product, Reminders, User } from "../../db";

export const QUEUE_KEY = "expiredReminderQueue";
export type ExpiredReminderPayload = {
    chatId: number;
    timezone: User["timezone"];
    expireDate: Product["expireDate"];
    productId: Product["id"];
};
