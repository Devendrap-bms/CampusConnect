import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { resource, resourceComment, resourceRating } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const resourceRouter = createTRPCRouter({
	// ── READ (both roles) ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.resource.findMany({
			orderBy: [desc(resource.createdAt)],
			with: {
				uploadedBy: { columns: { id: true, name: true } },
				ratings: true,
				comments: true,
			},
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.query.resource.findFirst({
				where: eq(resource.id, input.id),
				with: {
					uploadedBy: { columns: { id: true, name: true } },
					ratings: true,
					comments: {
						orderBy: [desc(resourceComment.createdAt)],
						with: { author: { columns: { id: true, name: true } } },
					},
				},
			});
		}),

	// ── UPLOAD (both roles can upload) ──
	upload: protectedProcedure
		.input(z.object({
			title: z.string().min(1),
			description: z.string().optional(),
			fileUrl: z.string().min(1), // accepts both URLs and base64
			fileType: z.enum(["document", "pdf", "image", "video", "link"]),
		}))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(resource).values({
				id: nanoid(),
				title: input.title,
				description: input.description ?? null,
				fileUrl: input.fileUrl,
				fileType: input.fileType,
				uploadedById: ctx.session.user.id,
			});
		}),

	incrementDownload: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.update(resource)
				.set({ downloadCount: sql`${resource.downloadCount} + 1` })
				.where(eq(resource.id, input.id));
		}),

	// ── FACULTY ONLY: update & delete ──
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1),
			description: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.resource.findFirst({
				where: eq(resource.id, input.id),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.uploadedById !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own resources" });
			}
			await ctx.db.update(resource)
				.set({ title: input.title, description: input.description ?? null, updatedAt: new Date() })
				.where(eq(resource.id, input.id));
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.resource.findFirst({
				where: eq(resource.id, input.id),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.uploadedById !== ctx.session.user.id) {
				throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own resources" });
			}
			await ctx.db.delete(resource).where(eq(resource.id, input.id));
		}),

	// ── STUDENT ONLY: comment & rate ──
	addComment: protectedProcedure
		.input(z.object({ resourceId: z.string(), content: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.resourceComment.findFirst({
				where: and(
					eq(resourceComment.resourceId, input.resourceId),
					eq(resourceComment.authorId, ctx.session.user.id),
				),
			});
			if (existing) throw new TRPCError({ code: "CONFLICT", message: "You have already commented on this resource" });
			await ctx.db.insert(resourceComment).values({
				id: nanoid(),
				resourceId: input.resourceId,
				authorId: ctx.session.user.id,
				content: input.content,
			});
		}),

	addRating: protectedProcedure
		.input(z.object({ resourceId: z.string(), rating: z.number().min(1).max(5) }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.resourceRating.findFirst({
				where: and(
					eq(resourceRating.resourceId, input.resourceId),
					eq(resourceRating.userId, ctx.session.user.id),
				),
			});
			if (existing) throw new TRPCError({ code: "CONFLICT", message: "You have already rated this resource" });
			await ctx.db.insert(resourceRating).values({
				id: nanoid(),
				resourceId: input.resourceId,
				userId: ctx.session.user.id,
				rating: input.rating,
			});
		}),
});