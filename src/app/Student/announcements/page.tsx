"use client";

import { CalendarIcon, MegaphoneIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function AnnouncementsPage() {
	const { data: announcements, isLoading } = api.announcement.getAll.useQuery();

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Announcements</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Stay updated with the latest campus news
					</p>
				</div>
				<Badge className="bg-[#1a3a5c] px-3 py-1 text-white hover:bg-[#1a3a5c]">
					{announcements?.length ?? 0} Total
				</Badge>
			</div>

			{/* LIST */}
			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-32 w-full rounded-xl" key={i} />
					))}
				</div>
			) : announcements?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-20">
					<MegaphoneIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="font-medium text-muted-foreground text-sm">
						No announcements yet
					</p>
					<p className="text-muted-foreground/70 text-xs">
						Check back later for updates from faculty
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{announcements?.map((item, idx) => (
						<Card
							className="border-black/[0.07] bg-white transition hover:shadow-md"
							key={item.id}
						>
							<CardHeader className="pb-2">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-start gap-3">
										<div
											className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${idx % 3 === 0 ? "bg-blue-50" : idx % 3 === 1 ? "bg-orange-50" : "bg-green-50"}`}
										>
											<MegaphoneIcon
												className={`h-4 w-4 ${idx % 3 === 0 ? "text-blue-600" : idx % 3 === 1 ? "text-orange-600" : "text-green-600"}`}
											/>
										</div>
										<div>
											<h2 className="font-semibold text-[#1a1a2e] text-base">
												{item.title}
											</h2>
											<div className="mt-1 flex items-center gap-3 text-muted-foreground text-xs">
												<span className="flex items-center gap-1">
													<UserIcon className="h-3 w-3" />
													{item.author.name}
												</span>
												<span className="flex items-center gap-1">
													<CalendarIcon className="h-3 w-3" />
													{new Date(item.createdAt).toLocaleDateString(
														"en-US",
														{ year: "numeric", month: "short", day: "numeric" },
													)}
												</span>
											</div>
										</div>
									</div>
									<Badge className="shrink-0 border-0 bg-blue-50 text-blue-700 hover:bg-blue-50">
										New
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-[#444] text-sm leading-relaxed">
									{item.content}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
