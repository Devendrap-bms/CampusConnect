"use client";

import {
	ArrowLeftIcon,
	HeartIcon,
	MessageSquareIcon,
	ReplyIcon,
	SendIcon,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

type Props = { params: Promise<{ id: string }> };

export default function ForumDetailPage({ params }: Props) {
	const { id } = use(params);
	const [newPost, setNewPost] = useState("");
	const [replyTo, setReplyTo] = useState<{
		postId: string;
		parentId?: string;
	} | null>(null);
	const [replyContent, setReplyContent] = useState("");

	const {
		data: posts,
		isLoading,
		refetch,
	} = api.forum.getPosts.useQuery({ forumId: id });
	const { data: forums } = api.forum.getAll.useQuery();
	const forum = forums?.find((f) => f.id === id);

	const createPost = api.forum.createPost.useMutation({
		onSuccess: () => {
			setNewPost("");
			void refetch();
			toast.success("Post created!");
		},
		onError: (e) => toast.error(e.message),
	});

	const createComment = api.forum.createComment.useMutation({
		onSuccess: () => {
			setReplyContent("");
			setReplyTo(null);
			void refetch();
			toast.success("Reply added!");
		},
		onError: (e) => toast.error(e.message),
	});

	const toggleReaction = api.forum.toggleReaction.useMutation({
		onSuccess: () => void refetch(),
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center gap-3">
				<Button asChild className="border-black/10" size="sm" variant="outline">
					<Link href="/Student/forums">
						<ArrowLeftIcon className="h-4 w-4" /> Back
					</Link>
				</Button>
				<div>
					<h1 className="font-serif text-2xl text-[#1a3a5c]">
						{forum?.title ?? "Forum"}
					</h1>
					{forum?.description && (
						<p className="text-muted-foreground text-sm">{forum.description}</p>
					)}
				</div>
			</div>

			{/* NEW POST */}
			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-4">
					<p className="mb-2 font-semibold text-[#1a1a2e] text-sm">
						Start a Discussion
					</p>
					<Textarea
						className="mb-3 min-h-[80px] resize-none border-black/10 text-sm"
						onChange={(e) => setNewPost(e.target.value)}
						placeholder="Share a question, idea, or topic..."
						value={newPost}
					/>
					<div className="flex justify-end">
						<Button
							className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
							disabled={!newPost.trim() || createPost.isPending}
							onClick={() =>
								createPost.mutate({ forumId: id, content: newPost })
							}
							size="sm"
						>
							<SendIcon className="mr-1.5 h-3.5 w-3.5" /> Post
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* POSTS */}
			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Skeleton className="h-40 rounded-xl" key={i} />
					))}
				</div>
			) : posts?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-16">
					<MessageSquareIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="font-medium text-muted-foreground text-sm">
						No posts yet
					</p>
					<p className="text-muted-foreground/70 text-xs">
						Be the first to start a discussion!
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{posts?.map((p) => (
						<Card className="border-black/[0.07] bg-white" key={p.id}>
							<CardContent className="p-5">
								{/* POST HEADER */}
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3a5c]/10 font-semibold text-[#1a3a5c] text-xs">
											{p.author.name.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<p className="font-semibold text-[#1a1a2e] text-sm">
												{p.author.name}
											</p>
											<p className="text-[11px] text-muted-foreground">
												{new Date(p.createdAt).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</div>
									</div>
									<Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] hover:bg-[#f2f0eb]">
										{p.reactions.length} likes
									</Badge>
								</div>

								{/* POST CONTENT */}
								<p className="mb-4 text-[#1a1a2e] text-sm leading-relaxed">
									{p.content}
								</p>

								{/* ACTIONS */}
								<div className="flex items-center gap-3 border-black/[0.05] border-t pt-3">
									<button
										className="flex items-center gap-1.5 text-muted-foreground text-xs transition hover:text-red-500"
										onClick={() => toggleReaction.mutate({ postId: p.id })}
										type="button"
									>
										<HeartIcon className="h-3.5 w-3.5" /> {p.reactions.length}{" "}
										Like
									</button>
									<button
										className="flex items-center gap-1.5 text-muted-foreground text-xs transition hover:text-[#1a3a5c]"
										onClick={() =>
											setReplyTo(
												replyTo?.postId === p.id ? null : { postId: p.id },
											)
										}
										type="button"
									>
										<ReplyIcon className="h-3.5 w-3.5" /> Reply
									</button>
									<span className="ml-auto flex items-center gap-1.5 text-muted-foreground text-xs">
										<MessageSquareIcon className="h-3.5 w-3.5" />{" "}
										{p.comments.length} comments
									</span>
								</div>

								{/* REPLY INPUT */}
								{replyTo?.postId === p.id && (
									<div className="mt-3 flex gap-2">
										<Textarea
											className="min-h-[60px] resize-none border-black/10 text-sm"
											onChange={(e) => setReplyContent(e.target.value)}
											placeholder="Write a reply..."
											value={replyContent}
										/>
										<Button
											className="shrink-0 self-end bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
											disabled={!replyContent.trim() || createComment.isPending}
											onClick={() =>
												createComment.mutate({
													postId: p.id,
													content: replyContent,
												})
											}
											size="sm"
										>
											<SendIcon className="h-3.5 w-3.5" />
										</Button>
									</div>
								)}

								{/* COMMENTS */}
								{p.comments.length > 0 && (
									<div className="mt-4 space-y-3 border-[#1a3a5c]/10 border-l-2 pl-4">
										{p.comments.map((c) => (
											<div className="flex gap-2.5" key={c.id}>
												<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8734a]/10 font-semibold text-[#e8734a] text-[10px]">
													{c.author.name.slice(0, 2).toUpperCase()}
												</div>
												<div className="flex-1 rounded-lg bg-[#f9f7f4] px-3 py-2">
													<div className="flex items-center justify-between">
														<p className="font-semibold text-[#1a1a2e] text-xs">
															{c.author.name}
														</p>
														<p className="text-[10px] text-muted-foreground">
															{new Date(c.createdAt).toLocaleDateString(
																"en-US",
																{ month: "short", day: "numeric" },
															)}
														</p>
													</div>
													<p className="mt-0.5 text-[#444] text-xs">
														{c.content}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
