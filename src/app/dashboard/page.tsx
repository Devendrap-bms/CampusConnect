import {
	BellIcon,
	CalendarDaysIcon,
	FileTextIcon,
	MegaphoneIcon,
	MessageSquareIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSession } from "@/server/better-auth/server";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { headers } from "next/headers";

function timeAgo(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const mins = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;
	if (hours < 24) return `${hours} hr ago`;
	return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default async function DashboardPage() {
	const session = await getSession();
	if (!session?.user) redirect("/login");

	// ts-expect-error — additionalFields from BetterAuth config
	const role = (session.user.role as string) ?? "student";
	const firstName = session.user.name.split(" ")[0];

	const ctx = await createTRPCContext({ headers: await headers() });
	const caller = createCaller(ctx);

	const [announcements, events, resources, notifications, forums] =
		await Promise.all([
			caller.announcement.getAll().catch(() => []),
			caller.event.getAll().catch(() => []),
			caller.resource.getAll().catch(() => []),
			caller.notification.getAll().catch(() => []),
			caller.forum.getAll().catch(() => []),
		]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;
	const upcomingEvents = events.filter(
		(e) => !e.isCancelled && new Date(e.eventDate) >= new Date(),
	);

	type ActivityItem = {
		id: string;
		avatar: string;
		bg: string;
		color: string;
		text: string;
		time: string;
		tag: string;
		tagColor: string;
		createdAt: Date;
	};

	const activityItems: ActivityItem[] = [];

	for (const a of announcements.slice(0, 3)) {
		activityItems.push({
			id: `ann-${a.id}`,
			avatar: a.author.name.slice(0, 2).toUpperCase(),
			bg: "bg-blue-100",
			color: "text-blue-800",
			text: `${a.author.name} posted: ${a.title}`,
			time: timeAgo(new Date(a.createdAt)),
			tag: "Announcement",
			tagColor: "bg-blue-50 text-blue-700",
			createdAt: new Date(a.createdAt),
		});
	}

	for (const r of resources.slice(0, 2)) {
		activityItems.push({
			id: `res-${r.id}`,
			avatar: r.uploadedBy.name.slice(0, 2).toUpperCase(),
			bg: "bg-purple-100",
			color: "text-purple-800",
			text: `${r.uploadedBy.name} uploaded: ${r.title}`,
			time: timeAgo(new Date(r.createdAt)),
			tag: "Resource",
			tagColor: "bg-purple-50 text-purple-700",
			createdAt: new Date(r.createdAt),
		});
	}

	for (const e of upcomingEvents.slice(0, 2)) {
		activityItems.push({
			id: `evt-${e.id}`,
			avatar: e.author.name.slice(0, 2).toUpperCase(),
			bg: "bg-orange-100",
			color: "text-orange-800",
			text: `New event: ${e.title}${e.venue ? ` — ${e.venue}` : ""}`,
			time: timeAgo(new Date(e.createdAt)),
			tag: "Event",
			tagColor: "bg-orange-50 text-orange-700",
			createdAt: new Date(e.createdAt),
		});
	}

	const recentActivity = activityItems
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 5);

	const studentStats = [
		{
			label: "Announcements",
			value: String(announcements.length),
			sub: `${unreadCount} unread notifications`,
			icon: MegaphoneIcon,
			href: "/Student/announcements",
			iconBg: "bg-blue-50",
			iconColor: "text-blue-600",
			trend: announcements.length > 0 ? `${announcements.length} total` : "None yet",
		},
		{
			label: "Upcoming Events",
			value: String(upcomingEvents.length),
			sub: "Not cancelled",
			icon: CalendarDaysIcon,
			href: "/Student/events",
			iconBg: "bg-orange-50",
			iconColor: "text-orange-600",
			trend: upcomingEvents.length > 0 ? "Active" : "None yet",
		},
		{
			label: "Forums",
			value: String(forums.length),
			sub: "Available to join",
			icon: MessageSquareIcon,
			href: "/Student/forums",
			iconBg: "bg-green-50",
			iconColor: "text-green-600",
			trend: forums.length > 0 ? `${forums.length} forums` : "None yet",
		},
		{
			label: "Resources",
			value: String(resources.length),
			sub: "Shared materials",
			icon: FileTextIcon,
			href: "/Student/resources",
			iconBg: "bg-purple-50",
			iconColor: "text-purple-600",
			trend: resources.length > 0 ? `${resources.length} total` : "None yet",
		},
	];

	const facultyStats = [
		{
			label: "My Announcements",
			value: String(
				announcements.filter((a) => a.authorId === session.user.id).length,
			),
			sub: "Posted by you",
			icon: MegaphoneIcon,
			href: "/Faculty/announcements",
			iconBg: "bg-blue-50",
			iconColor: "text-blue-600",
			trend: `${announcements.length} total`,
		},
		{
			label: "Events Created",
			value: String(
				events.filter((e) => e.authorId === session.user.id).length,
			),
			sub: "Created by you",
			icon: CalendarDaysIcon,
			href: "/Faculty/events",
			iconBg: "bg-orange-50",
			iconColor: "text-orange-600",
			trend: `${upcomingEvents.length} upcoming`,
		},
		{
			label: "Forums",
			value: String(forums.length),
			sub: "Active forums",
			icon: MessageSquareIcon,
			href: "/Faculty/forums",
			iconBg: "bg-green-50",
			iconColor: "text-green-600",
			trend: `${forums.length} total`,
		},
		{
			label: "Resources",
			value: String(
				resources.filter((r) => r.uploadedById === session.user.id).length,
			),
			sub: "Uploaded by you",
			icon: FileTextIcon,
			href: "/Faculty/resources",
			iconBg: "bg-purple-50",
			iconColor: "text-purple-600",
			trend: `${resources.length} total`,
		},
	];

	const studentActions = [
		{ label: "Browse Forums", desc: "Join discussions & ask questions", href: "/Student/forums", icon: MessageSquareIcon, border: "border-l-green-400", bg: "hover:bg-green-50/50" },
		{ label: "View Resources", desc: "Access notes & study materials", href: "/Student/resources", icon: FileTextIcon, border: "border-l-purple-400", bg: "hover:bg-purple-50/50" },
		{ label: "Study Groups", desc: "Collaborate with your peers", href: "/Student/groups", icon: UsersIcon, border: "border-l-blue-400", bg: "hover:bg-blue-50/50" },
		{ label: "Notifications", desc: "Check your latest alerts", href: "/Student/notifications", icon: BellIcon, border: "border-l-orange-400", bg: "hover:bg-orange-50/50" },
	];

	const facultyActions = [
		{ label: "Post Announcement", desc: "Notify students instantly", href: "/Faculty/announcements", icon: MegaphoneIcon, border: "border-l-blue-400", bg: "hover:bg-blue-50/50" },
		{ label: "Create Event", desc: "Schedule a campus event", href: "/Faculty/events", icon: CalendarDaysIcon, border: "border-l-orange-400", bg: "hover:bg-orange-50/50" },
		{ label: "Upload Resource", desc: "Share learning materials", href: "/Faculty/resources", icon: FileTextIcon, border: "border-l-purple-400", bg: "hover:bg-purple-50/50" },
		{ label: "Moderate Forums", desc: "Review student discussions", href: "/Faculty/forums", icon: MessageSquareIcon, border: "border-l-green-400", bg: "hover:bg-green-50/50" },
	];

	const stats = role === "faculty" ? facultyStats : studentStats;
	const actions = role === "faculty" ? facultyActions : studentActions;

	return (
		<div className="w-full space-y-6">
			{/* HERO BANNER */}
			<div className="relative overflow-hidden rounded-2xl bg-[#1a3a5c] px-8 py-8">
				<div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.04]" />
				<div className="pointer-events-none absolute -bottom-8 right-32 h-32 w-32 rounded-full bg-white/[0.03]" />
				<div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
					<div>
						<p className="mb-1 text-sm font-medium text-white/60">
							{new Date().toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
						<h1 className="font-serif text-4xl text-white">
							Good morning, {firstName}
						</h1>
						<p className="mt-2 text-sm text-white/65">
							{role === "faculty"
								? "Here is an overview of your campus activity today."
								: "Here is what is happening on campus today."}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-center">
							<p className="font-serif text-3xl text-white">{unreadCount}</p>
							<p className="text-xs text-white/60">Unread</p>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-center">
							<p className="font-serif text-3xl text-white">{upcomingEvents.length}</p>
							<p className="text-xs text-white/60">Events</p>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-center">
							<p className="font-serif text-3xl capitalize text-white">{role}</p>
							<p className="text-xs text-white/60">Role</p>
						</div>
					</div>
				</div>
			</div>

			{/* STATS GRID */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{stats.map((s) => (
					<Link key={s.label} href={s.href}>
						<Card className="group cursor-pointer border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
							<CardHeader className="pb-2 pt-5">
								<div className="flex items-start justify-between">
									<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
										<s.icon className={`h-5 w-5 ${s.iconColor}`} />
									</div>
									<div className="flex items-center gap-1 text-[11px] font-medium text-green-600">
										<TrendingUpIcon className="h-3 w-3" />
										{s.trend}
									</div>
								</div>
							</CardHeader>
							<CardContent className="pb-5">
								<p className="font-serif text-4xl text-[#1a3a5c]">{s.value}</p>
								<p className="mt-1 text-sm font-medium text-[#1a1a2e]">{s.label}</p>
								<p className="text-xs text-muted-foreground">{s.sub}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{/* BOTTOM — Quick Actions + Recent Activity */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
				{/* QUICK ACTIONS */}
				<div className="lg:col-span-2">
					<h2 className="mb-4 text-sm font-semibold text-[#1a1a2e]">Quick Actions</h2>
					<div className="flex flex-col gap-3">
						{actions.map((action) => (
							<Link key={action.label} href={action.href}>
								<div className={`flex items-center gap-4 rounded-xl border border-l-4 border-black/[0.07] bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md ${action.border} ${action.bg}`}>
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f2f0eb]">
										<action.icon className="h-5 w-5 text-[#1a3a5c]" />
									</div>
									<div>
										<p className="text-sm font-semibold text-[#1a1a2e]">{action.label}</p>
										<p className="text-xs text-muted-foreground">{action.desc}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* RECENT ACTIVITY */}
				<div className="lg:col-span-3">
					<h2 className="mb-4 text-sm font-semibold text-[#1a1a2e]">Recent Activity</h2>
					<Card className="border-black/[0.07] bg-white">
						<CardContent className="divide-y divide-black/[0.05] p-0">
							{recentActivity.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12">
									<p className="text-sm text-muted-foreground">No recent activity yet</p>
									<p className="text-xs text-muted-foreground/70">
										Activity will appear here as content is added
									</p>
								</div>
							) : (
								recentActivity.map((activity) => (
									<div key={activity.id} className="flex items-start gap-4 px-5 py-4">
										<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activity.bg} ${activity.color}`}>
											{activity.avatar}
										</div>
										<div className="min-w-0 flex-1">
											<div className="mb-1.5 flex items-center gap-2">
												<Badge className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-semibold ${activity.tagColor}`}>
													{activity.tag}
												</Badge>
												<span className="text-[11px] text-muted-foreground">
													{activity.time}
												</span>
											</div>
											<p className="text-sm leading-snug text-[#1a1a2e]">
												{activity.text}
											</p>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}