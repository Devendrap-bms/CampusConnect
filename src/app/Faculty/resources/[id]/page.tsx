"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, DownloadIcon, ExternalLinkIcon, StarIcon } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

function openFile(fileUrl: string, title: string) {
	if (fileUrl.startsWith("data:")) {
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
		window.open(fileUrl, "_blank");
	}
}

export default function FacultyResourceDetailPage({ params }: Props) {
	const { id } = use(params);
	const { data: resource, isLoading } = api.resource.getById.useQuery({ id });
	const incrementDownload = api.resource.incrementDownload.useMutation();

	const avgRating = resource?.ratings.length
		? (resource.ratings.reduce((a, b) => a + b.rating, 0) / resource.ratings.length).toFixed(1)
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
				<p className="text-sm text-muted-foreground">Resource not found</p>
				<Button asChild variant="outline" size="sm" className="mt-3">
					<Link href="/Faculty/resources">Go back</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center gap-3">
				<Button asChild variant="outline" size="sm" className="border-black/10">
					<Link href="/Faculty/resources">
						<ArrowLeftIcon className="h-4 w-4" /> Back
					</Link>
				</Button>
			</div>

			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<Badge className="border-0 bg-[#f2f0eb] capitalize text-[#6b6b80] hover:bg-[#f2f0eb]">
									{resource.fileType}
								</Badge>
								{avgRating && (
									<div className="flex items-center gap-1 text-sm text-amber-500">
										<StarIcon className="h-4 w-4 fill-amber-500" />
										<span className="font-semibold">{avgRating}</span>
										<span className="text-muted-foreground">
											({resource.ratings.length} ratings)
										</span>
									</div>
								)}
							</div>
							<h1 className="font-serif text-2xl text-[#1a3a5c]">{resource.title}</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								Uploaded by{" "}
								<span className="font-medium text-[#1a1a2e]">{resource.uploadedBy.name}</span>
								{" · "}
								{new Date(resource.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</p>
							{resource.description && (
								<p className="mt-3 text-sm leading-relaxed text-[#6b6b80]">{resource.description}</p>
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
								<DownloadIcon className="mr-2 h-4 w-4" /> Download
							</Button>
							<Button
								variant="outline"
								className="border-black/10"
								onClick={() => openFile(resource.fileUrl, resource.title)}
							>
								<ExternalLinkIcon className="mr-2 h-4 w-4" /> Open Link
							</Button>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-4 border-t border-black/[0.05] pt-4 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<DownloadIcon className="h-3.5 w-3.5" /> {resource.downloadCount} downloads
						</span>
						<span>{resource.comments.length} comments</span>
						<span>{resource.ratings.length} ratings</span>
					</div>
				</CardContent>
			</Card>

			{/* STUDENT COMMENTS — read only */}
			<div>
				<h2 className="mb-4 text-sm font-semibold text-[#1a1a2e]">
					Student Comments ({resource.comments.length})
				</h2>
				{resource.comments.length === 0 ? (
					<p className="rounded-xl border border-dashed border-black/[0.1] bg-white py-10 text-center text-sm text-muted-foreground">
						No comments from students yet
					</p>
				) : (
					<div className="space-y-3">
						{resource.comments.map((c) => (
							<Card key={c.id} className="border-black/[0.07] bg-white">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2.5">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3a5c]/10 text-xs font-semibold text-[#1a3a5c]">
												{c.author.name.slice(0, 2).toUpperCase()}
											</div>
											<p className="text-sm font-semibold text-[#1a1a2e]">{c.author.name}</p>
										</div>
										<p className="text-[11px] text-muted-foreground">
											{new Date(c.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
									</div>
									<p className="mt-2 text-sm leading-relaxed text-[#444]">{c.content}</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}