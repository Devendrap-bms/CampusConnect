import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { profile, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
	// Get current user's profile
	get: protectedProcedure.query(async ({ ctx }) => {
		const existingProfile = await ctx.db.query.profile.findFirst({
			where: eq(profile.userId, ctx.session.user.id),
		});
		const currentUser = await ctx.db.query.user.findFirst({
			where: eq(user.id, ctx.session.user.id),
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
				role: true,
				studentId: true,
				facultyId: true,
				createdAt: true,
			},
		});
		return { profile: existingProfile ?? null, user: currentUser ?? null };
	}),

	// Create or update profile
	upsert: protectedProcedure
		.input(z.object({
			bio: z.string().max(500).optional(),
			phone: z.string().max(20).optional(),
			department: z.string().max(100).optional(),
			avatarUrl: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.profile.findFirst({
				where: eq(profile.userId, ctx.session.user.id),
			});

			if (existing) {
				await ctx.db.update(profile)
					.set({
						bio: input.bio ?? null,
						phone: input.phone ?? null,
						department: input.department ?? null,
						avatarUrl: input.avatarUrl ?? existing.avatarUrl,
						updatedAt: new Date(),
					})
					.where(eq(profile.userId, ctx.session.user.id));
			} else {
				await ctx.db.insert(profile).values({
					id: nanoid(),
					userId: ctx.session.user.id,
					bio: input.bio ?? null,
					phone: input.phone ?? null,
					department: input.department ?? null,
					avatarUrl: input.avatarUrl ?? null,
				});
			}
		}),

	// Update display name
	updateName: protectedProcedure
		.input(z.object({ name: z.string().min(1).max(100) }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.update(user)
				.set({ name: input.name, updatedAt: new Date() })
				.where(eq(user.id, ctx.session.user.id));
		}),

	// Delete profile (anonymize)
	delete: protectedProcedure.mutation(async ({ ctx }) => {
		const existing = await ctx.db.query.profile.findFirst({
			where: eq(profile.userId, ctx.session.user.id),
		});
		if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
		await ctx.db.delete(profile).where(eq(profile.userId, ctx.session.user.id));
	}),
});