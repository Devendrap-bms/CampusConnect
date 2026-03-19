import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notification } from "@/server/db/schema";

export const notificationRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.notification.findMany({
			where: eq(notification.userId, ctx.session.user.id),
			orderBy: [desc(notification.createdAt)],
		});
	}),

	getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
		const unread = await ctx.db.query.notification.findMany({
			where: and(
				eq(notification.userId, ctx.session.user.id),
				eq(notification.isRead, false),
			),
		});
		return { count: unread.length };
	}),

	markRead: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(notification)
				.set({ isRead: true })
				.where(
					and(
						eq(notification.id, input.id),
						eq(notification.userId, ctx.session.user.id),
					),
				);
		}),

	markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(notification)
			.set({ isRead: true })
			.where(eq(notification.userId, ctx.session.user.id));
	}),
});
