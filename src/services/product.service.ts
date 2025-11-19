import { upcomingReminderService } from "../bullmq";
import { prismaClient, Product, User } from "../db";

class ProductService {
    async createFromAddLogic(data: {
        productName: string;
        productExpireDate: Date;
        remindAt: Date;
        telegramUserId: number;
        chatId: number;
    }): Promise<{ product: Product; user: User }> {
        try {
            const user = await prismaClient.user.findUnique({
                where: { telegramId: data.telegramUserId },
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                            reminders: { select: { jobKey: true } },
                        },
                    },
                },
            });
            if (!user) throw `Пользователь не найден`;
            if (user.products.length > 20)
                throw `Пользователь может иметь не больше 20 продуктов`;
            const reminderId =
                await upcomingReminderService.createUpcomingReminder({
                    timezone: user.timezone,
                    chatId: data.chatId,
                    remindAt: data.remindAt,
                });
            const isProductExists = user.products.find(
                (i) => i.name === data.productName
            );
            if (!isProductExists) {
                const product = await prismaClient.product.create({
                    data: {
                        expireDate: data.productExpireDate,
                        name: data.productName,
                        userId: user.id,
                        reminders: {
                            create: {
                                userId: user.id,
                                remindAt: data.remindAt,
                                jobKey: reminderId,
                            },
                        },
                    },
                });
                return { product, user };
            }

            const product = await prismaClient.product.update({
                where: { id: isProductExists.id },
                data: {
                    expireDate: data.productExpireDate,
                    isExpired: false,
                    reminders: {
                        create: {
                            jobKey: reminderId,
                            remindAt: data.remindAt,
                            userId: user.id,
                        },
                    },
                },
            });
            if (user.products[0].reminders) {
                const items = user.products[0].reminders.map((i) => i.jobKey);
                await prismaClient.reminders.deleteMany({
                    where: { jobKey: { in: items } },
                });
                items.forEach(
                    async (item) =>
                        await upcomingReminderService.deleteUpcomingReminder(
                            item
                        )
                );
            }
            return { product, user };
        } catch (error) {
            throw error;
        }
    }

    getLastUserProducts(
        telegramId: number,
        count: number = 16
    ): Promise<{ name: string; id: number }[]> {
        return prismaClient.product.findMany({
            where: { user: { telegramId } },
            select: { name: true, id: true },
            orderBy: { createdAt: "desc" },
            take: count,
        });
    }

    async getUserProductForList(telegramId: number) {
        const list = await prismaClient.product.findMany({
            where: { user: { telegramId } },
            select: {
                user: { select: { timezone: true } },
                name: true,
                isExpired: true,
                expireDate: true,
                reminders: {
                    orderBy: { remindAt: "asc" },
                    select: {
                        jobKey: true,
                        remindAt: true,
                    },
                },
            },
        });
        return list;
    }

    async deleteProduct(productId: number): Promise<{ name: string }> {
        return prismaClient.product.delete({
            where: { id: productId },
            select: { name: true },
        });
    }
}

export const productService = new ProductService();
