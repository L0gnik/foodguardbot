import { initTelegramBot } from "./bot/bot";
import {
    BullMqDashboard,
    expiredReminderService,
    upcomingReminderService,
} from "./bullmq";

(async () => {
    const bot = initTelegramBot();
    upcomingReminderService.getWorkerInstance(bot);
    expiredReminderService.getWorkerInstance(bot);
    BullMqDashboard();
})();
