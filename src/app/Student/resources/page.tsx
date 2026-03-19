"use client";

import {
	BookOpenIcon,
	DownloadIcon,
	FileTextIcon,
	ImageIcon,
	LinkIcon,
	StarIcon,
	UploadIcon,
	VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

type FileType = "document" | "pdf" | "image" | "video" | "link";

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
	pdf: <FileTextIcon className="h-5 w-5 text-red-500" />,
	document: <FileTextIcon className="h-5 w-5 text-blue-500" />,
	image: <ImageIcon className="h-5 w-5 text-green-500" />,
	video: <VideoIcon className="h-5 w-5 text-purple-500" />,
	link: <LinkIcon className="h-5 w-5 text-orange-500" />,
};

const ACCEPT_MAP: Record<string, string> = {
	pdf: "application/pdf",
	document: ".doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx",
	image: "image/png,image/jpeg,image/jpg,image/webp,image/gif",
};

const URL_TYPES: FileType[] = ["video", "link"];
const UPLOAD_TYPES: FileType[] = ["pdf", "image", "document"];

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export default function ResourcesPage() {
	const [open, setOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [selectedFileName, setSelectedFileName] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [form, setForm] = useState({
		title: "",
		description: "",
		fileUrl: "",
		fileType: "document" as FileType,
	});

	const {
		data: resources,
		isLoading,
		refetch,
	} = api.resource.getAll.useQuery();

	const uploadMutation = api.resource.upload.useMutation({
		onSuccess: () => {
			setOpen(false);
			setForm({
				title: "",
				description: "",
				fileUrl: "",
				fileType: "document",
			});
			setSelectedFileName("");
			void refetch();
			toast.success("Resource uploaded!");
		},
		onError: (e) => toast.error(e.message),
	});

	const incrementDownload = api.resource.incrementDownload.useMutation();

	function getAvgRating(ratings: { rating: number }[]) {
		if (!ratings.length) return null;
		return (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(
			1,
		);
	}

	function handleTypeChange(v: string) {
		setForm((p) => ({ ...p, fileType: v as FileType, fileUrl: "" }));
		setSelectedFileName("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			toast.error("File size must be under 5MB");
			return;
		}

		setUploading(true);
		try {
			const base64 = await fileToBase64(file);
			setForm((p) => ({ ...p, fileUrl: base64 }));
			setSelectedFileName(file.name);
		} catch {
			toast.error("Failed to read file");
		} finally {
			setUploading(false);
		}
	}

	const isUrlType = URL_TYPES.includes(form.fileType);
	const isUploadType = UPLOAD_TYPES.includes(form.fileType);
	const canSubmit =
		form.title.trim() &&
		form.fileUrl &&
		!uploadMutation.isPending &&
		!uploading;

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Resources</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Access and share study materials
					</p>
				</div>

				<Dialog onOpenChange={setOpen} open={open}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<UploadIcon className="mr-2 h-4 w-4" />
							Upload Resource
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="font-serif text-[#1a3a5c] text-xl">
								Upload Resource
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-2">
							{/* TITLE */}
							<div className="space-y-1.5">
								<Label>Title</Label>
								<Input
									onChange={(e) =>
										setForm((p) => ({ ...p, title: e.target.value }))
									}
									placeholder="e.g. OS Chapter 4 Notes"
									value={form.title}
								/>
							</div>

							{/* DESCRIPTION */}
							<div className="space-y-1.5">
								<Label>Description (optional)</Label>
								<Textarea
									className="resize-none"
									onChange={(e) =>
										setForm((p) => ({ ...p, description: e.target.value }))
									}
									placeholder="Brief description..."
									value={form.description}
								/>
							</div>

							{/* FILE TYPE — select this first */}
							<div className="space-y-1.5">
								<Label>File Type</Label>
								<Select onValueChange={handleTypeChange} value={form.fileType}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pdf">PDF</SelectItem>
										<SelectItem value="document">Document</SelectItem>
										<SelectItem value="image">Image</SelectItem>
										<SelectItem value="video">Video (URL)</SelectItem>
										<SelectItem value="link">Link (URL)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* CONDITIONAL — URL input for video & link */}
							{isUrlType && (
								<div className="space-y-1.5">
									<Label>
										{form.fileType === "video" ? "Video URL" : "Link URL"}
									</Label>
									<Input
										onChange={(e) =>
											setForm((p) => ({ ...p, fileUrl: e.target.value }))
										}
										placeholder={
											form.fileType === "video"
												? "https://youtube.com/..."
												: "https://..."
										}
										value={form.fileUrl}
									/>
									<p className="text-[11px] text-muted-foreground">
										{form.fileType === "video"
											? "Paste a YouTube, Vimeo, or any video link"
											: "Paste any shareable link"}
									</p>
								</div>
							)}

							{/* CONDITIONAL — file picker for pdf, image, document */}
							{isUploadType && (
								<div className="space-y-1.5">
									<Label>Upload File</Label>
									<Button
										className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-black/[0.1] border-dashed bg-[#f9f7f4] px-6 py-10 transition hover:border-[#1a3a5c]/30 hover:bg-[#f2f0eb]"
										onClick={() => fileInputRef.current?.click()}
									>
										{selectedFileName ? (
											<>
												<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
													{FILE_TYPE_ICONS[form.fileType]}
												</div>
												<p className="mt-2 font-medium text-[#1a1a2e] text-sm">
													{selectedFileName}
												</p>
												<p className="text-[#1a3a5c] text-xs hover:underline">
													Click to change
												</p>
											</>
										) : (
											<>
												<UploadIcon className="mb-2 h-8 w-8 text-muted-foreground/40" />
												<p className="font-medium text-[#1a1a2e] text-sm">
													Click to select file
												</p>
												<p className="mt-0.5 text-[11px] text-muted-foreground">
													{form.fileType === "pdf" &&
														"PDF files only · Max 5MB"}
													{form.fileType === "image" &&
														"PNG, JPG, WEBP, GIF · Max 5MB"}
													{form.fileType === "document" &&
														"DOC, DOCX, PPT, XLS, TXT · Max 5MB"}
												</p>
											</>
										)}
									</Button>

									<input
										accept={ACCEPT_MAP[form.fileType]}
										className="hidden"
										onChange={handleFileSelect}
										ref={fileInputRef}
										type="file"
									/>
								</div>
							)}

							{/* SUBMIT */}
							<Button
								className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
								disabled={!canSubmit}
								onClick={() => uploadMutation.mutate(form)}
							>
								{uploading
									? "Reading file..."
									: uploadMutation.isPending
										? "Uploading..."
										: "Upload Resource"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* RESOURCES GRID */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton className="h-44 rounded-xl" key={i} />
					))}
				</div>
			) : resources?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.1] border-dashed bg-white py-20">
					<BookOpenIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="font-medium text-muted-foreground text-sm">
						No resources yet
					</p>
					<p className="text-muted-foreground/70 text-xs">
						Be the first to share a study material!
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{resources?.map((r) => {
						const avgRating = getAvgRating(r.ratings);
						return (
							<Link href={`/Student/resources/${r.id}`} key={r.id}>
								<Card className="h-full cursor-pointer border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between gap-2">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f0eb]">
												{FILE_TYPE_ICONS[r.fileType]}
											</div>
											<Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] capitalize hover:bg-[#f2f0eb]">
												{r.fileType}
											</Badge>
										</div>
										<h3 className="mt-3 font-semibold text-[#1a1a2e]">
											{r.title}
										</h3>
										<p className="text-muted-foreground text-xs">
											by {r.uploadedBy.name}
										</p>
									</CardHeader>
									<CardContent>
										{r.description && (
											<p className="mb-3 line-clamp-2 text-[#6b6b80] text-sm">
												{r.description}
											</p>
										)}
										<div className="flex items-center justify-between text-muted-foreground text-xs">
											<button
												className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-[#f2f0eb] hover:text-[#1a3a5c]"
												onClick={(e) => {
													e.preventDefault();
													incrementDownload.mutate({ id: r.id });
													const a = document.createElement("a");
													a.href = r.fileUrl;
													a.download = r.title;
													a.target = "_blank";
													document.body.appendChild(a);
													a.click();
													document.body.removeChild(a);
												}}
												type="button"
											>
												<DownloadIcon className="h-3.5 w-3.5" />
												{r.downloadCount} downloads
											</button>
											{avgRating && (
												<div className="flex items-center gap-1 text-amber-500">
													<StarIcon className="h-3.5 w-3.5 fill-amber-500" />
													{avgRating} ({r.ratings.length})
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
