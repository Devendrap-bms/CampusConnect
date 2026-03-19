"use client";

import {
	CalendarDaysIcon,
	CalendarIcon,
	ClockIcon,
	MapPinIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const CATEGORIES = [
	"All",
	"Academic",
	"Cultural",
	"Sports",
	"Technical",
	"Other",
];

export default function EventsPage() {
	const [activeCategory, setActiveCategory] = useState("All");
	const { data: events, isLoading } = api.event.getAll.useQuery(
		activeCategory !== "All" ? { category: activeCategory } : undefined,
	);

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Events</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Browse upcoming campus events
					</p>
				</div>
				<Badge className="bg-[#1a3a5c] px-3 py-1 text-white hover:bg-[#1a3a5c]">
					{events?.length ?? 0} Events
				</Badge>
			</div>

			{/* CATEGORY FILTER */}
			<div className="flex flex-wrap gap-2">
				{CATEGORIES.map((cat) => (
					<Button
						className={
							activeCategory === cat
								? "bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
								: "border-black/10 text-[#444] hover:bg-[#f2f0eb]"
						}
						key={cat}
						onClick={() => setActiveCategory(cat)}
						size="sm"
						variant={activeCategory === cat ? "default" : "outline"}
					>
						{cat}
					</Button>
				))}
			</div>

			{/* EVENTS GRID */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton className="h-48 w-full rounded-xl" key={i} />
					))}
				</div>
			) : events?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-20">
					<CalendarDaysIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="font-medium text-muted-foreground text-sm">
						No events found
					</p>
					<p className="text-muted-foreground/70 text-xs">
						Try a different category filter
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{events?.map((ev) => {
						const isPast = new Date(ev.eventDate) < new Date();
						return (
							<Card
								className={`border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${ev.isCancelled ? "opacity-60" : ""}`}
								key={ev.id}
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
											<CalendarIcon className="h-5 w-5 text-orange-600" />
										</div>
										<div className="flex gap-1.5">
											{ev.isCancelled && (
												<Badge className="border-0 bg-red-50 text-red-600 hover:bg-red-50">
													Cancelled
												</Badge>
											)}
											{!ev.isCancelled && isPast && (
												<Badge className="border-0 bg-gray-100 text-gray-500 hover:bg-gray-100">
													Past
												</Badge>
											)}
											{!ev.isCancelled && !isPast && (
												<Badge className="border-0 bg-green-50 text-green-700 hover:bg-green-50">
													Upcoming
												</Badge>
											)}
											{ev.category && (
												<Badge className="border-0 bg-blue-50 text-blue-700 hover:bg-blue-50">
													{ev.category}
												</Badge>
											)}
										</div>
									</div>
									<h2 className="mt-3 font-semibold text-[#1a1a2e] text-base">
										{ev.title}
									</h2>
								</CardHeader>
								<CardContent className="space-y-2">
									{ev.description && (
										<p className="line-clamp-2 text-[#6b6b80] text-sm">
											{ev.description}
										</p>
									)}
									<div className="space-y-1.5 pt-1">
										<div className="flex items-center gap-2 text-muted-foreground text-xs">
											<ClockIcon className="h-3.5 w-3.5" />
											{new Date(ev.eventDate).toLocaleDateString("en-US", {
												weekday: "short",
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
											{" · "}
											{new Date(ev.eventDate).toLocaleTimeString("en-US", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</div>
										{ev.venue && (
											<div className="flex items-center gap-2 text-muted-foreground text-xs">
												<MapPinIcon className="h-3.5 w-3.5" />
												{ev.venue}
											</div>
										)}
										<div className="flex items-center gap-2 text-muted-foreground text-xs">
											<UserIcon className="h-3.5 w-3.5" />
											{ev.author.name}
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
