import { and, asc, desc, eq, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { group, groupMember, message, notification } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const groupRouter = createTRPCRouter({
	// ── READ (both roles) ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.group.findMany({
			orderBy: [desc(group.createdAt)],
			with: {
				createdBy: { columns: { name: true } },
				members: true,
			},
		});
	}),

	getJoined: protectedProcedure.query(async ({ ctx }) => {
		const memberships = await ctx.db.query.groupMember.findMany({
			where: eq(groupMember.userId, ctx.session.user.id),
			with: {
				group: {
					with: {
						createdBy: { columns: { name: true } },
						members: true,
					},
				},
			},
		});
		return memberships.map((m) => m.group);
	}),

	join: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.groupMember.findFirst({
				where: and(
					eq(groupMember.groupId, input.groupId),
					eq(groupMember.userId, ctx.session.user.id),
				),
			});
			if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already a member" });
			await ctx.db.insert(groupMember).values({
				id: nanoid(),
				groupId: input.groupId,
				userId: ctx.session.user.id,
			});
		}),

	leave: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(groupMember).where(
				and(
					eq(groupMember.groupId, input.groupId),
					eq(groupMember.userId, ctx.session.user.id),
				),
			);
		}),

	getMessages: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields from BetterAuth config
			const isFaculty = (ctx.session.user.role as string) === "faculty";

			if (!isFaculty) {
				const isMember = await ctx.db.query.groupMember.findFirst({
					where: and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, ctx.session.user.id),
					),
				});
				if (!isMember) {
					throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this group" });
				}
			}

			return ctx.db.query.message.findMany({
				where: eq(message.groupId, input.groupId),
				orderBy: [asc(message.createdAt)],
				with: { sender: { columns: { name: true, image: true } } },
			});
		}),

	sendMessage: protectedProcedure
		.input(z.object({ groupId: z.string(), content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields from BetterAuth config
			const isFaculty = (ctx.session.user.role as string) === "faculty";

			if (!isFaculty) {
				const isMember = await ctx.db.query.groupMember.findFirst({
					where: and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, ctx.session.user.id),
					),
				});
				if (!isMember) {
					throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this group" });
				}
			}

			await ctx.db.insert(message).values({
				id: nanoid(),
				groupId: input.groupId,
				senderId: ctx.session.user.id,
				content: input.content,
			});

			// Notify all other group members
			const otherMembers = await ctx.db.query.groupMember.findMany({
				where: and(
					eq(groupMember.groupId, input.groupId),
					ne(groupMember.userId, ctx.session.user.id),
				),
				columns: { userId: true },
			});

			if (otherMembers.length > 0) {
				const grp = await ctx.db.query.group.findFirst({
					where: eq(group.id, input.groupId),
					columns: { name: true },
				});

				await ctx.db.insert(notification).values(
					otherMembers.map((m) => ({
						id: nanoid(),
						userId: m.userId,
						type: "group_activity" as const,
						title: `New message in ${grp?.name ?? "group"}`,
						message: `${ctx.session.user.name}: ${input.content.slice(0, 60)}${input.content.length > 60 ? "..." : ""}`,
						link: null,
					})),
				);
			}
		}),

	// ── FACULTY ONLY ──
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1), description: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields from BetterAuth config
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can create groups" });
			}
			const newGroup = await ctx.db.insert(group).values({
				id: nanoid(),
				name: input.name,
				description: input.description ?? null,
				createdById: ctx.session.user.id,
			}).returning();

			// Auto-join creator
			await ctx.db.insert(groupMember).values({
				id: nanoid(),
				groupId: newGroup[0]!.id,
				userId: ctx.session.user.id,
			});
		}),
});