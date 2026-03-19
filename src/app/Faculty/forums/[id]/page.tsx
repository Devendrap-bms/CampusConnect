"use client";

import { use, useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeftIcon, FlagIcon, MessageSquareIcon, SendIcon, ShieldIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Props = { params: Promise<{ id: string }> };

export default function FacultyForumDetailPage({ params }: Props) {
	const { id } = use(params);
	const [newPost, setNewPost] = useState("");
	const [comments, setComments] = useState<Record<string, string>>({});

	const { data: forum, isLoading, refetch } = api.forum.getById.useQuery({ id });

	const addPost = api.forum.createPost.useMutation({
		onSuccess: () => { setNewPost(""); void refetch(); toast.success("Post added!"); },
		onError: (e) => toast.error(e.message),
	});
	const addComment = api.forum.addComment.useMutation({
		onSuccess: (_, vars) => { setComments((p) => ({ ...p, [vars.postId]: "" })); void refetch(); },
		onError: (e) => toast.error(e.message),
	});
	const flagPost = api.forum.flagPost.useMutation({
		onSuccess: () => { void refetch(); toast.success("Post flagged!"); },
		onError: (e) => toast.error(e.message),
	});
	const deletePost = api.forum.deletePost.useMutation({
		onSuccess: () => { void refetch(); toast.success("Post deleted!"); },
		onError: (e) => toast.error(e.message),
	});

	if (isLoading) {
		return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;
	}

	if (!forum) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-sm text-muted-foreground">Forum not found</p>
				<Button asChild variant="outline" size="sm" className="mt-3"><Link href="/Faculty/forums">Go back</Link></Button>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center gap-3">
				<Button asChild variant="outline" size="sm" className="border-black/10">
					<Link href="/Faculty/forums"><ArrowLeftIcon className="h-4 w-4" /> Back</Link>
				</Button>
			</div>

			<div className="rounded-2xl border border-black/[0.07] bg-white p-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
						<MessageSquareIcon className="h-5 w-5 text-green-600" />
					</div>
					<div className="flex-1">
						<h1 className="font-serif text-2xl text-[#1a3a5c]">{forum.title}</h1>
						{forum.description && <p className="text-sm text-muted-foreground">{forum.description}</p>}
					</div>
					<div className="flex items-center gap-1 text-xs font-medium text-[#e8734a]">
						<ShieldIcon className="h-4 w-4" /> Moderator View
					</div>
				</div>
			</div>

			{/* POST AS FACULTY */}
			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-4">
					<p className="mb-3 text-sm font-semibold text-[#1a1a2e]">Post a Message</p>
					<Textarea placeholder="Write something to the forum..." className="mb-3 min-h-[80px] resize-none border-black/10 text-sm" value={newPost} onChange={(e) => setNewPost(e.target.value)} />
					<div className="flex justify-end">
						<Button size="sm" className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!newPost.trim() || addPost.isPending} onClick={() => addPost.mutate({ forumId: id, content: newPost })}>
							<SendIcon className="mr-1.5 h-3.5 w-3.5" /> Post
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* ALL POSTS — faculty sees flagged too */}
			<div className="space-y-4">
				{!forum.posts?.length ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-16">
						<MessageSquareIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
						<p className="text-sm text-muted-foreground">No posts yet</p>
					</div>
				) : (
					forum.posts.map((p) => (
						<Card key={p.id} className={`border-black/[0.07] bg-white ${p.isFlagged ? "border-red-200 bg-red-50/30" : ""}`}>
							<CardContent className="p-5">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-start gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a3a5c]/10 text-xs font-semibold text-[#1a3a5c]">
											{p.author.name.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-semibold text-[#1a1a2e]">{p.author.name}</span>
												<span className="text-[11px] text-muted-foreground">
													{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
												</span>
												{p.isFlagged && <Badge className="border-0 bg-red-100 text-red-600 hover:bg-red-100">Flagged</Badge>}
											</div>
											<p className="mt-1 text-sm leading-relaxed text-[#444]">{p.content}</p>
										</div>
									</div>
									<div className="flex shrink-0 gap-1">
										{!p.isFlagged && (
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50" onClick={() => flagPost.mutate({ postId: p.id })}>
												<FlagIcon className="h-3.5 w-3.5" />
											</Button>
										)}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
													<Trash2Icon className="h-3.5 w-3.5" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete this post?</AlertDialogTitle>
													<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deletePost.mutate({ postId: p.id })}>Delete</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>

								{/* COMMENTS */}
								{p.comments?.length > 0 && (
									<div className="ml-11 mt-3 space-y-2 border-l-2 border-black/[0.05] pl-3">
										{p.comments.map((c) => (
											<div key={c.id} className="flex items-start gap-2">
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f2f0eb] text-[10px] font-semibold text-[#6b6b80]">
													{c.author.name.slice(0, 2).toUpperCase()}
												</div>
												<div>
													<span className="text-xs font-semibold text-[#1a1a2e]">{c.author.name}</span>
													<span className="ml-1.5 text-[11px] text-muted-foreground">
														{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
													</span>
													<p className="text-xs text-[#444]">{c.content}</p>
												</div>
											</div>
										))}
									</div>
								)}

								{/* REPLY */}
								<div className="ml-11 mt-3 flex gap-2">
									<input
										type="text"
										placeholder="Reply as faculty..."
										value={comments[p.id] ?? ""}
										onChange={(e) => setComments((prev) => ({ ...prev, [p.id]: e.target.value }))}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey && comments[p.id]?.trim()) {
												e.preventDefault();
												addComment.mutate({ postId: p.id, content: comments[p.id] ?? "" });
											}
										}}
										className="flex-1 rounded-lg border border-black/[0.07] bg-[#f9f7f4] px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-[#1a3a5c]/30"
									/>
									<Button size="sm" className="h-8 bg-[#1a3a5c] px-3 text-white hover:bg-[#2a5580]" disabled={!comments[p.id]?.trim()} onClick={() => addComment.mutate({ postId: p.id, content: comments[p.id] ?? "" })}>
										<SendIcon className="h-3 w-3" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}