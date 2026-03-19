"use client";

import { ArrowRightIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function ForumsPage() {
	const { data: forums, isLoading, refetch } = api.forum.getAll.useQuery();
	const { data: joined } = api.forum.getJoined.useQuery();
	const joinMutation = api.forum.join.useMutation({
		onSuccess: () => {
			toast.success("Joined forum!");
			void refetch();
		},
		onError: (e) => toast.error(e.message),
	});
	const leaveMutation = api.forum.leave.useMutation({
		onSuccess: () => {
			toast.success("Left forum");
			void refetch();
		},
		onError: (e) => toast.error(e.message),
	});

	const joinedIds = new Set(joined?.map((f) => f.id));

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">
						Discussion Forums
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Join forums to participate in academic discussions
					</p>
				</div>
				<Badge className="bg-[#1a3a5c] px-3 py-1 text-white hover:bg-[#1a3a5c]">
					{forums?.length ?? 0} Forums
				</Badge>
			</div>

			{/* JOINED FORUMS STRIP */}
			{joined && joined.length > 0 && (
				<div>
					<h2 className="mb-3 font-semibold text-[#1a1a2e] text-sm">
						Your Forums
					</h2>
					<div className="flex flex-wrap gap-2">
						{joined.map((f) => (
							<Link href={`/Student/forums/${f.id}`} key={f.id}>
								<div className="flex items-center gap-2 rounded-full border border-[#1a3a5c]/20 bg-[#1a3a5c]/5 px-4 py-1.5 font-medium text-[#1a3a5c] text-sm transition hover:bg-[#1a3a5c]/10">
									<MessageSquareIcon className="h-3.5 w-3.5" />
									{f.title}
									<ArrowRightIcon className="h-3 w-3" />
								</div>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* ALL FORUMS */}
			<div>
				<h2 className="mb-3 font-semibold text-[#1a1a2e] text-sm">
					All Forums
				</h2>
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton className="h-36 rounded-xl" key={i} />
						))}
					</div>
				) : forums?.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-20">
						<MessageSquareIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
						<p className="font-medium text-muted-foreground text-sm">
							No forums available yet
						</p>
						<p className="text-muted-foreground/70 text-xs">
							Faculty will create forums for discussions
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{forums?.map((f) => {
							const isJoined = joinedIds.has(f.id);
							return (
								<Card
									className="border-black/[0.07] bg-white transition hover:shadow-md"
									key={f.id}
								>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-start gap-3">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
													<MessageSquareIcon className="h-5 w-5 text-green-600" />
												</div>
												<div>
													<h3 className="font-semibold text-[#1a1a2e]">
														{f.title}
													</h3>
													<p className="text-muted-foreground text-xs">
														by {f.createdBy.name}
													</p>
												</div>
											</div>
											{isJoined && (
												<Badge className="border-0 bg-green-50 text-green-700 hover:bg-green-50">
													Joined
												</Badge>
											)}
										</div>
									</CardHeader>
									<CardContent>
										{f.description && (
											<p className="mb-3 text-[#6b6b80] text-sm">
												{f.description}
											</p>
										)}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
												<UsersIcon className="h-3.5 w-3.5" />
												{f.members.length} members
											</div>
											<div className="flex gap-2">
												{isJoined ? (
													<>
														<Button
															asChild
															className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
															size="sm"
														>
															<Link href={`/Student/forums/${f.id}`}>
																Open{" "}
																<ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
															</Link>
														</Button>
														<Button
															className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
															disabled={leaveMutation.isPending}
															onClick={() =>
																leaveMutation.mutate({ forumId: f.id })
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
															joinMutation.mutate({ forumId: f.id })
														}
														size="sm"
													>
														Join Forum
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
