import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { expiredReminderQueue } from "./expired-reminder/expired-reminder-queue";
import { upcomingReminderQueue } from "./upcoming-reminder/upcoming-reminder-queue";

export const BullMqDashboard = () => {
    const app = express();
    const serverAdapter = new ExpressAdapter();

    createBullBoard({
        queues: [
            new BullMQAdapter(expiredReminderQueue),
            new BullMQAdapter(upcomingReminderQueue),
        ],
        serverAdapter,
    });

    serverAdapter.setBasePath("/bull");

    app.use("/bull", serverAdapter.getRouter());

    app.listen(3000, () => {
        console.log("BullMQ Dashboard running on http://localhost:3000/bull");
    });
};
