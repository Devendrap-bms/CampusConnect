"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MegaphoneIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

type FormState = { title: string; content: string };
const EMPTY: FormState = { title: "", content: "" };

export default function FacultyAnnouncementsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState("");
	const [form, setForm] = useState<FormState>(EMPTY);
	const [editForm, setEditForm] = useState<FormState>(EMPTY);

	const { data: announcements, isLoading, refetch } = api.announcement.getAll.useQuery();

	const create = api.announcement.create.useMutation({
		onSuccess: () => { setCreateOpen(false); setForm(EMPTY); void refetch(); toast.success("Announcement posted!"); },
		onError: (e) => toast.error(e.message),
	});
	const update = api.announcement.update.useMutation({
		onSuccess: () => { setEditOpen(false); void refetch(); toast.success("Announcement updated!"); },
		onError: (e) => toast.error(e.message),
	});
	const remove = api.announcement.delete.useMutation({
		onSuccess: () => { void refetch(); toast.success("Announcement deleted!"); },
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Announcements</h1>
					<p className="mt-1 text-sm text-muted-foreground">Post and manage campus announcements</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> New Announcement
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Post Announcement</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<Label>Title</Label>
								<Input placeholder="Announcement title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label>Content</Label>
								<Textarea placeholder="Write details..." className="min-h-[120px] resize-none" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} />
							</div>
							<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!form.title.trim() || !form.content.trim() || create.isPending} onClick={() => create.mutate(form)}>
								{create.isPending ? "Posting..." : "Post Announcement"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Edit Announcement</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label>Title</Label>
							<Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
						</div>
						<div className="space-y-1.5">
							<Label>Content</Label>
							<Textarea className="min-h-[120px] resize-none" value={editForm.content} onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))} />
						</div>
						<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!editForm.title.trim() || !editForm.content.trim() || update.isPending} onClick={() => update.mutate({ id: editId, ...editForm })}>
							{update.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{isLoading ? (
				<div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
			) : announcements?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<MegaphoneIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No announcements yet</p>
				</div>
			) : (
				<div className="space-y-3">
					{announcements?.map((a) => (
						<Card key={a.id} className="border-black/[0.07] bg-white">
							<CardContent className="p-5">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<Badge className="border-0 bg-blue-50 text-blue-700 hover:bg-blue-50">Announcement</Badge>
											<span className="text-[11px] text-muted-foreground">
												{new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
											</span>
										</div>
										<h3 className="font-semibold text-[#1a1a2e]">{a.title}</h3>
										<p className="mt-1 text-sm leading-relaxed text-[#6b6b80]">{a.content}</p>
										<p className="mt-2 text-xs text-muted-foreground">By {a.author.name}</p>
									</div>
									{a.author.id === a.authorId && (
										<div className="flex shrink-0 gap-2">
											<Button variant="outline" size="sm" className="border-black/10" onClick={() => { setEditId(a.id); setEditForm({ title: a.title, content: a.content }); setEditOpen(true); }}>
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
														<AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
														<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => remove.mutate({ id: a.id })}>Delete</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}