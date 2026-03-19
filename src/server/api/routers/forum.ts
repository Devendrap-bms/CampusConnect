import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { comment, forum, forumMember, notification, post, reaction } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const forumRouter = createTRPCRouter({
	// ── READ (both roles) ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.forum.findMany({
			orderBy: [desc(forum.createdAt)],
			with: {
				createdBy: { columns: { name: true } },
				members: true,
				posts: true,
			},
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.forum.findFirst({
				where: eq(forum.id, input.id),
				with: {
					createdBy: { columns: { name: true } },
					members: true,
					posts: {
						orderBy: [desc(post.createdAt)],
						with: {
							author: { columns: { id: true, name: true, image: true } },
							comments: {
								with: { author: { columns: { id: true, name: true, image: true } } },
								orderBy: [desc(comment.createdAt)],
							},
							reactions: true,
						},
					},
				},
			});
		}),

	getJoined: protectedProcedure.query(async ({ ctx }) => {
		const memberships = await ctx.db.query.forumMember.findMany({
			where: eq(forumMember.userId, ctx.session.user.id),
			with: {
				forum: {
					with: {
						createdBy: { columns: { name: true } },
						members: true,
						posts: true,
					},
				},
			},
		});
		return memberships.map((m) => m.forum);
	}),

	join: protectedProcedure
		.input(z.object({ forumId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.forumMember.findFirst({
				where: and(
					eq(forumMember.forumId, input.forumId),
					eq(forumMember.userId, ctx.session.user.id),
				),
			});
			if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already a member" });
			await ctx.db.insert(forumMember).values({
				id: nanoid(),
				forumId: input.forumId,
				userId: ctx.session.user.id,
			});
		}),

	leave: protectedProcedure
		.input(z.object({ forumId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(forumMember).where(
				and(
					eq(forumMember.forumId, input.forumId),
					eq(forumMember.userId, ctx.session.user.id),
				),
			);
		}),

	getPosts: protectedProcedure
		.input(z.object({ forumId: z.string() }))
		.query(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			const isFaculty = (ctx.session.user.role as string) === "faculty";
			return ctx.db.query.post.findMany({
				where: isFaculty
					? eq(post.forumId, input.forumId)
					: and(eq(post.forumId, input.forumId), eq(post.isFlagged, false)),
				orderBy: [desc(post.createdAt)],
				with: {
					author: { columns: { id: true, name: true, image: true } },
					comments: {
						with: { author: { columns: { id: true, name: true, image: true } } },
						orderBy: [desc(comment.createdAt)],
					},
					reactions: true,
				},
			});
		}),

	createPost: protectedProcedure
		.input(z.object({ forumId: z.string(), content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			const isFaculty = (ctx.session.user.role as string) === "faculty";
			if (!isFaculty) {
				const isMember = await ctx.db.query.forumMember.findFirst({
					where: and(
						eq(forumMember.forumId, input.forumId),
						eq(forumMember.userId, ctx.session.user.id),
					),
				});
				if (!isMember) throw new TRPCError({ code: "FORBIDDEN", message: "Join the forum first" });
			}
			await ctx.db.insert(post).values({
				id: nanoid(),
				forumId: input.forumId,
				authorId: ctx.session.user.id,
				content: input.content,
			});
		}),

	createComment: protectedProcedure
		.input(z.object({
			postId: z.string(),
			content: z.string().min(1),
			parentId: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(comment).values({
				id: nanoid(),
				postId: input.postId,
				authorId: ctx.session.user.id,
				content: input.content,
				parentId: input.parentId ?? null,
			});

			// Notify post author if it's someone else replying
			const parentPost = await ctx.db.query.post.findFirst({
				where: eq(post.id, input.postId),
				columns: { authorId: true },
			});

			if (parentPost && parentPost.authorId !== ctx.session.user.id) {
				await ctx.db.insert(notification).values({
					id: nanoid(),
					userId: parentPost.authorId,
					type: "forum_activity",
					title: "New reply on your post",
					message: `${ctx.session.user.name} replied to your forum post.`,
					link: null,
				});
			}
		}),

	// Alias for addComment used in some pages
	addComment: protectedProcedure
		.input(z.object({
			postId: z.string(),
			content: z.string().min(1),
		}))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(comment).values({
				id: nanoid(),
				postId: input.postId,
				authorId: ctx.session.user.id,
				content: input.content,
				parentId: null,
			});

			// Notify post author if it's someone else replying
			const parentPost = await ctx.db.query.post.findFirst({
				where: eq(post.id, input.postId),
				columns: { authorId: true },
			});

			if (parentPost && parentPost.authorId !== ctx.session.user.id) {
				await ctx.db.insert(notification).values({
					id: nanoid(),
					userId: parentPost.authorId,
					type: "forum_activity",
					title: "New reply on your post",
					message: `${ctx.session.user.name} replied to your forum post.`,
					link: null,
				});
			}
		}),

	toggleReaction: protectedProcedure
		.input(z.object({ postId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.reaction.findFirst({
				where: and(
					eq(reaction.postId, input.postId),
					eq(reaction.userId, ctx.session.user.id),
				),
			});
			if (existing) {
				await ctx.db.delete(reaction).where(eq(reaction.id, existing.id));
				return { liked: false };
			}
			await ctx.db.insert(reaction).values({
				id: nanoid(),
				postId: input.postId,
				userId: ctx.session.user.id,
			});
			return { liked: true };
		}),

	// ── FACULTY ONLY ──
	create: protectedProcedure
		.input(z.object({ title: z.string().min(1), description: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can create forums" });
			}
			await ctx.db.insert(forum).values({
				id: nanoid(),
				title: input.title,
				description: input.description ?? null,
				createdById: ctx.session.user.id,
			});
		}),

	flagPost: protectedProcedure
		.input(z.object({ postId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can flag posts" });
			}
			await ctx.db.update(post)
				.set({ isFlagged: true })
				.where(eq(post.id, input.postId));
		}),

	deletePost: protectedProcedure
		.input(z.object({ postId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "faculty") {
				throw new TRPCError({ code: "FORBIDDEN", message: "Only faculty can delete posts" });
			}
			await ctx.db.delete(post).where(eq(post.id, input.postId));
		}),
});