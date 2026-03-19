"use client";

import { useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BookOpenIcon, DownloadIcon, FileTextIcon, ImageIcon, LinkIcon, PencilIcon, StarIcon, Trash2Icon, UploadIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function getAvgRating(ratings: { rating: number }[]) {
	if (!ratings.length) return null;
	return (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length).toFixed(1);
}

export default function FacultyResourcesPage() {
	const [open, setOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState("");
	const [uploading, setUploading] = useState(false);
	const [selectedFileName, setSelectedFileName] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState({ title: "", description: "", fileUrl: "", fileType: "document" as FileType });
	const [editForm, setEditForm] = useState({ title: "", description: "" });

	const { data: resources, isLoading, refetch } = api.resource.getAll.useQuery();

	const upload = api.resource.upload.useMutation({
		onSuccess: () => { setOpen(false); setForm({ title: "", description: "", fileUrl: "", fileType: "document" }); setSelectedFileName(""); void refetch(); toast.success("Resource uploaded!"); },
		onError: (e) => toast.error(e.message),
	});
	const update = api.resource.update.useMutation({
		onSuccess: () => { setEditOpen(false); void refetch(); toast.success("Resource updated!"); },
		onError: (e) => toast.error(e.message),
	});
	const remove = api.resource.delete.useMutation({
		onSuccess: () => { void refetch(); toast.success("Resource deleted!"); },
		onError: (e) => toast.error(e.message),
	});
	const incrementDownload = api.resource.incrementDownload.useMutation();

	function handleTypeChange(v: string) {
		setForm((p) => ({ ...p, fileType: v as FileType, fileUrl: "" }));
		setSelectedFileName("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
		setUploading(true);
		try {
			const base64 = await fileToBase64(file);
			setForm((p) => ({ ...p, fileUrl: base64 }));
			setSelectedFileName(file.name);
		} catch { toast.error("Failed to read file"); }
		finally { setUploading(false); }
	}

	const isUrlType = form.fileType === "video" || form.fileType === "link";
	const isUploadType = ["pdf", "image", "document"].includes(form.fileType);

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Resources</h1>
					<p className="mt-1 text-sm text-muted-foreground">Upload and manage learning materials</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<UploadIcon className="mr-2 h-4 w-4" /> Upload Resource
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Upload Resource</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<Label>Title</Label>
								<Input placeholder="Resource title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label>Description (optional)</Label>
								<Textarea placeholder="Brief description..." className="resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label>File Type</Label>
								<Select value={form.fileType} onValueChange={handleTypeChange}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="pdf">PDF</SelectItem>
										<SelectItem value="document">Document</SelectItem>
										<SelectItem value="image">Image</SelectItem>
										<SelectItem value="video">Video (URL)</SelectItem>
										<SelectItem value="link">Link (URL)</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{isUrlType && (
								<div className="space-y-1.5">
									<Label>{form.fileType === "video" ? "Video URL" : "Link URL"}</Label>
									<Input placeholder={form.fileType === "video" ? "https://youtube.com/..." : "https://..."} value={form.fileUrl} onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))} />
								</div>
							)}
							{isUploadType && (
								<div className="space-y-1.5">
									<Label>Upload File</Label>
									<button type="button" className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/[0.1] bg-[#f9f7f4] px-6 py-10 transition hover:border-[#1a3a5c]/30 hover:bg-[#f2f0eb]" onClick={() => fileInputRef.current?.click()}>
										{selectedFileName ? (
											<>
												<div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-white">{FILE_TYPE_ICONS[form.fileType]}</div>
												<p className="mt-2 text-sm font-medium text-[#1a1a2e]">{selectedFileName}</p>
												<p className="text-xs text-[#1a3a5c]">Click to change</p>
											</>
										) : (
											<>
												<UploadIcon className="mb-2 h-8 w-8 text-muted-foreground/40" />
												<p className="text-sm font-medium text-[#1a1a2e]">Click to select file</p>
												<p className="mt-0.5 text-[11px] text-muted-foreground">Max 5MB</p>
											</>
										)}
									</button>
									<input ref={fileInputRef} type="file" className="hidden" accept={ACCEPT_MAP[form.fileType]} onChange={handleFileSelect} />
								</div>
							)}
							<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!form.title.trim() || !form.fileUrl || uploading || upload.isPending} onClick={() => upload.mutate(form)}>
								{uploading ? "Reading file..." : upload.isPending ? "Uploading..." : "Upload Resource"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* EDIT DIALOG */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Edit Resource</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label>Title</Label>
							<Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
						</div>
						<div className="space-y-1.5">
							<Label>Description</Label>
							<Textarea className="resize-none" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
						</div>
						<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!editForm.title.trim() || update.isPending} onClick={() => update.mutate({ id: editId, ...editForm })}>
							{update.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
				</div>
			) : resources?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<BookOpenIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No resources yet</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{resources?.map((r) => {
						const avg = getAvgRating(r.ratings);
						const isOwner = r.uploadedBy.id === r.uploadedById;
						return (
							<Card key={r.id} className="border-black/[0.07] bg-white">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between gap-2">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f0eb]">
											{FILE_TYPE_ICONS[r.fileType]}
										</div>
										<Badge className="border-0 bg-[#f2f0eb] capitalize text-[#6b6b80] hover:bg-[#f2f0eb]">{r.fileType}</Badge>
									</div>
									<h3 className="mt-3 font-semibold text-[#1a1a2e]">{r.title}</h3>
									<p className="text-xs text-muted-foreground">by {r.uploadedBy.name}</p>
								</CardHeader>
								<CardContent>
									{r.description && <p className="mb-3 line-clamp-2 text-sm text-[#6b6b80]">{r.description}</p>}
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<button type="button" className="flex items-center gap-1 rounded px-1.5 py-0.5 transition hover:bg-[#f2f0eb] hover:text-[#1a3a5c]" onClick={() => { incrementDownload.mutate({ id: r.id }); const a = document.createElement("a"); a.href = r.fileUrl; a.download = r.title; a.target = "_blank"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}>
											<DownloadIcon className="h-3.5 w-3.5" /> {r.downloadCount}
										</button>
										{avg && (
											<div className="flex items-center gap-1 text-amber-500">
												<StarIcon className="h-3.5 w-3.5 fill-amber-500" /> {avg}
											</div>
										)}
									</div>
									<div className="mt-3 flex gap-2 border-t border-black/[0.05] pt-3">
										<Link href={`/Faculty/resources/${r.id}`} className="flex-1">
											<Button variant="outline" size="sm" className="w-full border-black/10 text-xs">View</Button>
										</Link>
										{isOwner && (
											<>
												<Button variant="outline" size="sm" className="border-black/10 text-[#444]" onClick={() => { setEditId(r.id); setEditForm({ title: r.title, description: r.description ?? "" }); setEditOpen(true); }}>
													<PencilIcon className="h-3.5 w-3.5" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50">
															<Trash2Icon className="h-3.5 w-3.5" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete Resource?</AlertDialogTitle>
															<AlertDialogDescription>Students will lose access to this resource.</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => remove.mutate({ id: r.id })}>Delete</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</>
										)}
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