import { Queue } from "bullmq";

import { redis } from "../../redis/redis";
import { QUEUE_KEY } from "./types";

export const expiredReminderQueue = new Queue(QUEUE_KEY, {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    },
});
