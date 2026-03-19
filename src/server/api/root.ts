import { announcementRouter } from "@/server/api/routers/announcement";
import { eventRouter } from "@/server/api/routers/event";
import { forumRouter } from "@/server/api/routers/forum";
import { groupRouter } from "@/server/api/routers/group";
import { notificationRouter } from "@/server/api/routers/notification";
import { resourceRouter } from "@/server/api/routers/resource";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { profileRouter } from "@/server/api/routers/profile";

export const appRouter = createTRPCRouter({
	announcement: announcementRouter,
	event: eventRouter,
	forum: forumRouter,
	group: groupRouter,
	resource: resourceRouter,
	notification: notificationRouter,
	profile: profileRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
