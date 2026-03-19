import { desc, eq, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { announcement, notification, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const announcementRouter = createTRPCRouter({
	// ── READ (both roles) ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.announcement.findMany({
			orderBy: [desc(announcement.createdAt)],
			with: { author: { columns: { id: true, name: true, email: true } } },
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.announcement.findFirst({
				where: eq(announcement.id, input.id),
				with: { author: { columns: { id: true, name: true, email: true } } },
			});
		}),

	// ── FACULTY ONLY ──
	create: protectedProcedure
		.input(z.object({ title: z.string().min(1), content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can post announcements" });
			}

			await ctx.db.insert(announcement).values({
				id: nanoid(),
				title: input.title,
				content: input.content,
				authorId: ctx.session.user.id,
			});

			// Notify all students
			const students = await ctx.db.query.user.findMany({
				where: eq(user.role, "student"),
				columns: { id: true },
			});

			if (students.length > 0) {
				await ctx.db.insert(notification).values(
					students.map((s) => ({
						id: nanoid(),
						userId: s.id,
						type: "announcement" as const,
						title: `New Announcement: ${input.title}`,
						message: `${ctx.session.user.name} posted a new announcement.`,
						link: null,
					})),
				);
			}
		}),

	update: protectedProcedure
		.input(z.object({ id: z.string(), title: z.string().min(1), content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.announcement.findFirst({
				where: eq(announcement.id, input.id),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.authorId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own announcements" });
			}
			await ctx.db.update(announcement)
				.set({ title: input.title, content: input.content, updatedAt: new Date() })
				.where(eq(announcement.id, input.id));
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.announcement.findFirst({
				where: eq(announcement.id, input.id),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.authorId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own announcements" });
			}
			await ctx.db.delete(announcement).where(eq(announcement.id, input.id));
		}),
});