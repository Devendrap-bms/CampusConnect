"use client";

import {
	ArrowLeftIcon,
	DownloadIcon,
	ExternalLinkIcon,
	SendIcon,
	StarIcon,
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

function openFile(fileUrl: string, title: string) {
	if (fileUrl.startsWith("data:")) {
		// base64 — convert to blob and open
		const arr = fileUrl.split(",");
		const mimeMatch = arr[0]?.match(/:(.*?);/);
		const mime = mimeMatch?.[1] ?? "application/octet-stream";
		const bstr = atob(arr[1] ?? "");
		const n = bstr.length;
		const u8arr = new Uint8Array(n);
		for (let i = 0; i < n; i++) {
			u8arr[i] = bstr.charCodeAt(i);
		}
		const blob = new Blob([u8arr], { type: mime });
		const blobUrl = URL.createObjectURL(blob);
		window.open(blobUrl, "_blank");
	} else {
		// regular URL — open directly
		window.open(fileUrl, "_blank");
	}
}

export default function ResourceDetailPage({ params }: Props) {
	const { id } = use(params);
	const [comment, setComment] = useState("");
	const [hoveredStar, setHoveredStar] = useState(0);
	const [selectedRating, setSelectedRating] = useState(0);

	const {
		data: resource,
		isLoading,
		refetch,
	} = api.resource.getById.useQuery({ id });

	const addComment = api.resource.addComment.useMutation({
		onSuccess: () => {
			setComment("");
			void refetch();
			toast.success("Comment added!");
		},
		onError: (e) => toast.error(e.message),
	});

	const addRating = api.resource.addRating.useMutation({
		onSuccess: () => {
			setSelectedRating(0);
			void refetch();
			toast.success("Rating submitted!");
		},
		onError: (e) => toast.error(e.message),
	});

	const incrementDownload = api.resource.incrementDownload.useMutation();

	const avgRating = resource?.ratings.length
		? (
				resource.ratings.reduce((a, b) => a + b.rating, 0) /
				resource.ratings.length
			).toFixed(1)
		: null;

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-40 w-full rounded-xl" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
		);
	}

	if (!resource) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-muted-foreground text-sm">Resource not found</p>
				<Button asChild className="mt-3" size="sm" variant="outline">
					<Link href="/Student/resources">Go back</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center gap-3">
				<Button asChild className="border-black/10" size="sm" variant="outline">
					<Link href="/Student/resources">
						<ArrowLeftIcon className="h-4 w-4" />
						Back
					</Link>
				</Button>
			</div>

			{/* RESOURCE CARD */}
			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] capitalize hover:bg-[#f2f0eb]">
									{resource.fileType}
								</Badge>
								{avgRating && (
									<div className="flex items-center gap-1 text-amber-500 text-sm">
										<StarIcon className="h-4 w-4 fill-amber-500" />
										<span className="font-semibold">{avgRating}</span>
										<span className="text-muted-foreground">
											({resource.ratings.length} ratings)
										</span>
									</div>
								)}
							</div>
							<h1 className="font-serif text-2xl text-[#1a3a5c]">
								{resource.title}
							</h1>
							<p className="mt-1 text-muted-foreground text-sm">
								Uploaded by{" "}
								<span className="font-medium text-[#1a1a2e]">
									{resource.uploadedBy.name}
								</span>
								{" · "}
								{new Date(resource.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</p>
							{resource.description && (
								<p className="mt-3 text-[#6b6b80] text-sm leading-relaxed">
									{resource.description}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<Button
								className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
								onClick={() => {
									incrementDownload.mutate({ id: resource.id });
									const a = document.createElement("a");
									a.href = resource.fileUrl;
									a.download = resource.title;
									a.target = "_blank";
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
								}}
							>
								<DownloadIcon className="mr-2 h-4 w-4" />
								Download
							</Button>
							<Button
								variant="outline"
								className="border-black/10"
								onClick={() => openFile(resource.fileUrl, resource.title)}
							>
								<ExternalLinkIcon className="mr-2 h-4 w-4" />
								Open Link
							</Button>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-4 border-black/[0.05] border-t pt-4 text-muted-foreground text-xs">
						<span className="flex items-center gap-1.5">
							<DownloadIcon className="h-3.5 w-3.5" />
							{resource.downloadCount} downloads
						</span>
						<span>{resource.comments.length} comments</span>
					</div>
				</CardContent>
			</Card>

			{/* RATING */}
			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-5">
					<p className="mb-3 font-semibold text-[#1a1a2e] text-sm">
						Rate this Resource
					</p>
					<div className="flex items-center gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								className="transition hover:scale-110"
								key={star}
								onClick={() => setSelectedRating(star)}
								onMouseEnter={() => setHoveredStar(star)}
								onMouseLeave={() => setHoveredStar(0)}
								type="button"
							>
								<StarIcon
									className={`h-7 w-7 ${star <= (hoveredStar || selectedRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
								/>
							</button>
						))}
						{selectedRating > 0 && (
							<Button
								className="ml-3 bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
								disabled={addRating.isPending}
								onClick={() =>
									addRating.mutate({ resourceId: id, rating: selectedRating })
								}
								size="sm"
							>
								Submit Rating
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* COMMENTS */}
			<div>
				<h2 className="mb-4 font-semibold text-[#1a1a2e] text-sm">
					Comments ({resource.comments.length})
				</h2>
				<Card className="mb-4 border-black/[0.07] bg-white">
					<CardContent className="p-4">
						<Textarea
							className="mb-3 min-h-[80px] resize-none border-black/10 text-sm"
							onChange={(e) => setComment(e.target.value)}
							placeholder="Share your thoughts on this resource..."
							value={comment}
						/>
						<div className="flex justify-end">
							<Button
								className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
								disabled={!comment.trim() || addComment.isPending}
								onClick={() =>
									addComment.mutate({ resourceId: id, content: comment })
								}
								size="sm"
							>
								<SendIcon className="mr-1.5 h-3.5 w-3.5" />
								Comment
							</Button>
						</div>
					</CardContent>
				</Card>
				<div className="space-y-3">
					{resource.comments.map((c) => (
						<Card className="border-black/[0.07] bg-white" key={c.id}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3a5c]/10 font-semibold text-[#1a3a5c] text-xs">
											{c.author.name.slice(0, 2).toUpperCase()}
										</div>
										<p className="font-semibold text-[#1a1a2e] text-sm">
											{c.author.name}
										</p>
									</div>
									<p className="text-[11px] text-muted-foreground">
										{new Date(c.createdAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})}
									</p>
								</div>
								<p className="mt-2 text-[#444] text-sm leading-relaxed">
									{c.content}
								</p>
							</CardContent>
						</Card>
					))}
					{resource.comments.length === 0 && (
						<p className="py-6 text-center text-muted-foreground text-sm">
							No comments yet. Be the first!
						</p>
					)}
				</div>
			</div>
		</div>
	);
}