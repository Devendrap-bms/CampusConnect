"use client";

import { ArrowRightIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function GroupsPage() {
	const { data: groups, isLoading, refetch } = api.group.getAll.useQuery();
	const { data: joined } = api.group.getJoined.useQuery();

	const joinMutation = api.group.join.useMutation({
		onSuccess: () => {
			toast.success("Joined group!");
			void refetch();
		},
		onError: (e) => toast.error(e.message),
	});
	const leaveMutation = api.group.leave.useMutation({
		onSuccess: () => {
			toast.success("Left group");
			void refetch();
		},
		onError: (e) => toast.error(e.message),
	});

	const joinedIds = new Set(joined?.map((g) => g.id));

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Study Groups</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Collaborate with peers in focused groups
					</p>
				</div>
				<Badge className="bg-[#1a3a5c] px-3 py-1 text-white hover:bg-[#1a3a5c]">
					{groups?.length ?? 0} Groups
				</Badge>
			</div>

			{/* JOINED GROUPS */}
			{joined && joined.length > 0 && (
				<div>
					<h2 className="mb-3 font-semibold text-[#1a1a2e] text-sm">
						Your Groups
					</h2>
					<div className="flex flex-wrap gap-2">
						{joined.map((g) => (
							<Link href={`/Student/groups/${g.id}`} key={g.id}>
								<div className="flex items-center gap-2 rounded-full border border-[#1a3a5c]/20 bg-[#1a3a5c]/5 px-4 py-1.5 font-medium text-[#1a3a5c] text-sm transition hover:bg-[#1a3a5c]/10">
									<UsersIcon className="h-3.5 w-3.5" />
									{g.name}
									<ArrowRightIcon className="h-3 w-3" />
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* ALL GROUPS */}
			<div>
				<h2 className="mb-3 font-semibold text-[#1a1a2e] text-sm">
					All Groups
				</h2>
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton className="h-40 rounded-xl" key={i} />
						))}
					</div>
				) : groups?.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-20">
						<UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
						<p className="font-medium text-muted-foreground text-sm">
							No groups available yet
						</p>
						<p className="text-muted-foreground/70 text-xs">
							Faculty will create study groups for collaboration
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{groups?.map((g) => {
							const isJoined = joinedIds.has(g.id);
							return (
								<Card
									className="border-black/[0.07] bg-white transition hover:shadow-md"
									key={g.id}
								>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
												<UsersIcon className="h-5 w-5 text-blue-600" />
											</div>
											{isJoined && (
												<Badge className="border-0 bg-green-50 text-green-700 hover:bg-green-50">
													Joined
												</Badge>
											)}
										</div>
										<h3 className="mt-3 font-semibold text-[#1a1a2e]">
											{g.name}
										</h3>
										<p className="text-muted-foreground text-xs">
											Created by {g.createdBy.name}
										</p>
									</CardHeader>
									<CardContent>
										{g.description && (
											<p className="mb-3 text-[#6b6b80] text-sm">
												{g.description}
											</p>
										)}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
												<UsersIcon className="h-3.5 w-3.5" />
												{g.members.length} members
											</div>
											<div className="flex gap-2">
												{isJoined ? (
													<>
														<Button
															asChild
															className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
															size="sm"
														>
															<Link href={`/Student/groups/${g.id}`}>
																<MessageSquareIcon className="mr-1 h-3.5 w-3.5" />{" "}
																Chat
															</Link>
														</Button>
														<Button
															className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
															disabled={leaveMutation.isPending}
															onClick={() =>
																leaveMutation.mutate({ groupId: g.id })
															}
															size="sm"
															variant="outline"
														>
															Leave
														</Button>
													</>
												) : (
													<Button
														className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
														disabled={joinMutation.isPending}
														onClick={() =>
															joinMutation.mutate({ groupId: g.id })
														}
														size="sm"
													>
														Join Group
													</Button>
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
		</div>
	);
}
