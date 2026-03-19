"use client";

import {
	AlertCircleIcon,
	BellIcon,
	BellOffIcon,
	CalendarIcon,
	CheckCheckIcon,
	MegaphoneIcon,
	MessageSquareIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

type TypeConfigValue = { icon: React.ReactNode; color: string; bg: string };

const TYPE_CONFIG: Record<string, TypeConfigValue> = {
	announcement: {
		icon: <MegaphoneIcon className="h-4 w-4" />,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	event_reminder: {
		icon: <CalendarIcon className="h-4 w-4" />,
		color: "text-orange-600",
		bg: "bg-orange-50",
	},
	forum_activity: {
		icon: <MessageSquareIcon className="h-4 w-4" />,
		color: "text-green-600",
		bg: "bg-green-50",
	},
	group_activity: {
		icon: <MessageSquareIcon className="h-4 w-4" />,
		color: "text-purple-600",
		bg: "bg-purple-50",
	},
	system_alert: {
		icon: <AlertCircleIcon className="h-4 w-4" />,
		color: "text-red-600",
		bg: "bg-red-50",
	},
};

const FALLBACK_CONFIG: TypeConfigValue = {
	icon: <BellIcon className="h-4 w-4" />,
	color: "text-gray-600",
	bg: "bg-gray-50",
};

function getConfig(type: string): TypeConfigValue {
	return TYPE_CONFIG[type] ?? FALLBACK_CONFIG;
}

export default function NotificationsPage() {
	const {
		data: notifications,
		isLoading,
		refetch,
	} = api.notification.getAll.useQuery();

	const markRead = api.notification.markRead.useMutation({
		onSuccess: () => void refetch(),
	});

	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => {
			void refetch();
			toast.success("All notifications marked as read");
		},
	});

	const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Notifications</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						{unreadCount > 0
							? `${unreadCount} unread notifications`
							: "All caught up!"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<Badge className="bg-[#e8734a] px-3 py-1 text-white hover:bg-[#e8734a]">
							{unreadCount} Unread
						</Badge>
					)}
					<Button
						className="border-black/10 text-[#444]"
						disabled={unreadCount === 0 || markAllRead.isPending}
						onClick={() => markAllRead.mutate()}
						size="sm"
						variant="outline"
					>
						<CheckCheckIcon className="mr-1.5 h-4 w-4" />
						Mark all read
					</Button>
				</div>
			</div>

			{/* LIST */}
			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton className="h-20 rounded-xl" key={i} />
					))}
				</div>
			) : notifications?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-24">
					<BellOffIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="font-medium text-muted-foreground text-sm">
						No notifications yet
					</p>
					<p className="text-muted-foreground/70 text-xs">
						You will be notified about announcements, events, and forum activity
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{notifications?.map((n) => {
						const config = getConfig(n.type);
						return (
							<Card
								className={`border-black/[0.07] transition hover:shadow-sm ${!n.isRead ? "bg-white" : "bg-[#f9f7f4]"}`}
								key={n.id}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div
											className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}
										>
											{config.icon}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<div>
													<p
														className={`font-semibold text-sm ${!n.isRead ? "text-[#1a1a2e]" : "text-[#6b6b80]"}`}
													>
														{n.title}
													</p>
													<p className="mt-0.5 text-[#6b6b80] text-sm">
														{n.message}
													</p>
												</div>
												<div className="flex shrink-0 items-center gap-2">
													{!n.isRead && (
														<span className="h-2 w-2 rounded-full bg-[#e8734a]" />
													)}
													<p className="text-[11px] text-muted-foreground">
														{new Date(n.createdAt ?? "").toLocaleDateString(
															"en-US",
															{
																month: "short",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															},
														)}
													</p>
												</div>
											</div>
											{!n.isRead && (
												<button
													className="mt-2 flex items-center gap-1 font-medium text-[#1a3a5c] text-[11px] hover:underline"
													onClick={() => markRead.mutate({ id: n.id })}
													type="button"
												>
													<BellIcon className="h-3 w-3" />
													Mark as read
												</button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
