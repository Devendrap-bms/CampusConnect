import { desc, eq, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { event, notification, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const eventRouter = createTRPCRouter({
	// ── READ (both roles) ──
	getAll: protectedProcedure
		.input(z.object({ category: z.string().optional() }).optional())
		.query(async ({ ctx, input }) => {
			const events = await ctx.db.query.event.findMany({
				orderBy: [desc(event.eventDate)],
				with: { author: { columns: { id: true, name: true } } },
			});
			if (input?.category) {
				return events.filter((e) => e.category === input.category);
			}
			return events;
		}),

	getUpcoming: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.event.findMany({
			where: gte(event.eventDate, new Date()),
			orderBy: [desc(event.eventDate)],
			with: { author: { columns: { id: true, name: true } } },
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.event.findFirst({
				where: eq(event.id, input.id),
				with: { author: { columns: { id: true, name: true } } },
			});
		}),

	// ── FACULTY ONLY ──
	create: protectedProcedure
		.input(z.object({
			title: z.string().min(1),
			description: z.string().optional(),
			venue: z.string().optional(),
			category: z.string().optional(),
			eventDate: z.date(),
		}))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can create events" });
			}

			await ctx.db.insert(event).values({
				id: nanoid(),
				title: input.title,
				description: input.description ?? null,
				venue: input.venue ?? null,
				category: input.category ?? null,
				eventDate: input.eventDate,
				authorId: ctx.session.user.id,
			});

			// Notify all students
			const students = await ctx.db.query.user.findMany({
				where: eq(user.role, "student"),
				columns: { id: true },
			});

			if (students.length > 0) {
				const venueText = input.venue ? ` at ${input.venue}` : "";
				const dateText = input.eventDate.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				});
				await ctx.db.insert(notification).values(
					students.map((s) => ({
						id: nanoid(),
						userId: s.id,
						type: "event_reminder" as const,
						title: `New Event: ${input.title}`,
						message: `Scheduled for ${dateText}${venueText}.`,
						link: null,
					})),
				);
			}
		}),

	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1),
			description: z.string().optional(),
			venue: z.string().optional(),
			category: z.string().optional(),
			eventDate: z.date(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.event.findFirst({ where: eq(event.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.authorId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own events" });
			}
			await ctx.db.update(event)
				.set({
					title: input.title,
					description: input.description ?? null,
					venue: input.venue ?? null,
					category: input.category ?? null,
					eventDate: input.eventDate,
					updatedAt: new Date(),
				})
				.where(eq(event.id, input.id));
		}),

	cancel: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.event.findFirst({ where: eq(event.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.authorId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only cancel your own events" });
			}

			await ctx.db.update(event)
				.set({ isCancelled: true, updatedAt: new Date() })
				.where(eq(event.id, input.id));

			// Notify all students about cancellation
			const students = await ctx.db.query.user.findMany({
				where: eq(user.role, "student"),
				columns: { id: true },
			});

			if (students.length > 0) {
				await ctx.db.insert(notification).values(
					students.map((s) => ({
						id: nanoid(),
						userId: s.id,
						type: "event_reminder" as const,
						title: `Event Cancelled: ${existing.title}`,
						message: `The event "${existing.title}" has been cancelled.`,
						link: null,
					})),
				);
			}
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.event.findFirst({ where: eq(event.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.authorId !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own events" });
			}
			await ctx.db.delete(event).where(eq(event.id, input.id));
		}),
});