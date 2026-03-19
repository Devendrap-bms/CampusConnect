"use client";

import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, BellIcon, BellOffIcon, CheckCheckIcon, MessageSquareIcon } from "lucide-react";
import { toast } from "sonner";

type TypeConfigValue = { icon: React.ReactNode; color: string; bg: string };

const TYPE_CONFIG: Record<string, TypeConfigValue> = {
	announcement: { icon: <BellIcon className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50" },
	forum_activity: { icon: <MessageSquareIcon className="h-4 w-4" />, color: "text-green-600", bg: "bg-green-50" },
	group_activity: { icon: <MessageSquareIcon className="h-4 w-4" />, color: "text-purple-600", bg: "bg-purple-50" },
	system_alert: { icon: <AlertCircleIcon className="h-4 w-4" />, color: "text-red-600", bg: "bg-red-50" },
};

const FALLBACK: TypeConfigValue = { icon: <BellIcon className="h-4 w-4" />, color: "text-gray-600", bg: "bg-gray-50" };

function getConfig(type: string): TypeConfigValue {
	return TYPE_CONFIG[type] ?? FALLBACK;
}

export default function FacultyNotificationsPage() {
	const { data: notifications, isLoading, refetch } = api.notification.getAll.useQuery();

	const markRead = api.notification.markRead.useMutation({ onSuccess: () => void refetch() });
	const markAllRead = api.notification.markAllRead.useMutation({
		onSuccess: () => { void refetch(); toast.success("All marked as read"); },
	});

	const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Notifications</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && <Badge className="bg-[#e8734a] px-3 py-1 text-white hover:bg-[#e8734a]">{unreadCount} Unread</Badge>}
					<Button variant="outline" size="sm" className="border-black/10 text-[#444]" disabled={unreadCount === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
						<CheckCheckIcon className="mr-1.5 h-4 w-4" /> Mark all read
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
			) : notifications?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-24">
					<BellOffIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
					<p className="text-xs text-muted-foreground/70">Forum activity and system alerts will appear here</p>
				</div>
			) : (
				<div className="space-y-2">
					{notifications?.map((n) => {
						const config = getConfig(n.type);
						return (
							<Card key={n.id} className={`border-black/[0.07] transition hover:shadow-sm ${!n.isRead ? "bg-white" : "bg-[#f9f7f4]"}`}>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
											{config.icon}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-2">
												<div>
													<p className={`text-sm font-semibold ${!n.isRead ? "text-[#1a1a2e]" : "text-[#6b6b80]"}`}>{n.title}</p>
													<p className="mt-0.5 text-sm text-[#6b6b80]">{n.message}</p>
												</div>
												<div className="flex shrink-0 items-center gap-2">
													{!n.isRead && <span className="h-2 w-2 rounded-full bg-[#e8734a]" />}
													<p className="text-[11px] text-muted-foreground">
														{new Date(n.createdAt ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
													</p>
												</div>
											</div>
											{!n.isRead && (
												<button type="button" onClick={() => markRead.mutate({ id: n.id })} className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#1a3a5c] hover:underline">
													<BellIcon className="h-3 w-3" /> Mark as read
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