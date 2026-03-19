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
import { CalendarDaysIcon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

type FormState = { title: string; description: string; venue: string; category: string; eventDate: string };
const EMPTY: FormState = { title: "", description: "", venue: "", category: "", eventDate: "" };

function FormFields({ f, setF }: { f: FormState; setF: React.Dispatch<React.SetStateAction<FormState>> }) {
	return (
		<div className="space-y-4">
			<div className="space-y-1.5">
				<Label>Title</Label>
				<Input placeholder="Event title" value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
			</div>
			<div className="space-y-1.5">
				<Label>Description</Label>
				<Textarea placeholder="Event details..." className="min-h-[80px] resize-none" value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label>Venue</Label>
					<Input placeholder="e.g. Main Auditorium" value={f.venue} onChange={(e) => setF((p) => ({ ...p, venue: e.target.value }))} />
				</div>
				<div className="space-y-1.5">
					<Label>Category</Label>
					<Input placeholder="e.g. Academic" value={f.category} onChange={(e) => setF((p) => ({ ...p, category: e.target.value }))} />
				</div>
			</div>
			<div className="space-y-1.5">
				<Label>Date & Time</Label>
				<Input type="datetime-local" value={f.eventDate} onChange={(e) => setF((p) => ({ ...p, eventDate: e.target.value }))} />
			</div>
		</div>
	);
}

export default function FacultyEventsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState("");
	const [form, setForm] = useState<FormState>(EMPTY);
	const [editForm, setEditForm] = useState<FormState>(EMPTY);

	const { data: events, isLoading, refetch } = api.event.getAll.useQuery();

	const create = api.event.create.useMutation({
		onSuccess: () => { setCreateOpen(false); setForm(EMPTY); void refetch(); toast.success("Event created!"); },
		onError: (e) => toast.error(e.message),
	});
	const update = api.event.update.useMutation({
		onSuccess: () => { setEditOpen(false); void refetch(); toast.success("Event updated!"); },
		onError: (e) => toast.error(e.message),
	});
	const cancel = api.event.cancel.useMutation({
		onSuccess: () => { void refetch(); toast.success("Event cancelled!"); },
		onError: (e) => toast.error(e.message),
	});
	const remove = api.event.delete.useMutation({
		onSuccess: () => { void refetch(); toast.success("Event deleted!"); },
		onError: (e) => toast.error(e.message),
	});

	function openEdit(e: { id: string; title: string; description: string | null; venue: string | null; category: string | null; eventDate: Date }) {
		setEditId(e.id);
		setEditForm({ title: e.title, description: e.description ?? "", venue: e.venue ?? "", category: e.category ?? "", eventDate: new Date(e.eventDate).toISOString().slice(0, 16) });
		setEditOpen(true);
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Events</h1>
					<p className="mt-1 text-sm text-muted-foreground">Create and manage campus events</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> Create Event
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Create Event</DialogTitle>
						</DialogHeader>
						<div className="py-2">
							<FormFields f={form} setF={setForm} />
							<Button className="mt-4 w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!form.title.trim() || !form.eventDate || create.isPending} onClick={() => create.mutate({ ...form, eventDate: new Date(form.eventDate) })}>
								{create.isPending ? "Creating..." : "Create Event"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Edit Event</DialogTitle>
					</DialogHeader>
					<div className="py-2">
						<FormFields f={editForm} setF={setEditForm} />
						<Button className="mt-4 w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!editForm.title.trim() || !editForm.eventDate || update.isPending} onClick={() => update.mutate({ id: editId, ...editForm, eventDate: new Date(editForm.eventDate) })}>
							{update.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{isLoading ? (
				<div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
			) : events?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<CalendarDaysIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No events yet</p>
				</div>
			) : (
				<div className="space-y-3">
					{events?.map((e) => (
						<Card key={e.id} className={`border-black/[0.07] bg-white ${e.isCancelled ? "opacity-60" : ""}`}>
							<CardContent className="p-5">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="mb-1 flex flex-wrap items-center gap-2">
											{e.isCancelled ? (
												<Badge className="border-0 bg-red-50 text-red-600 hover:bg-red-50">Cancelled</Badge>
											) : new Date(e.eventDate) >= new Date() ? (
												<Badge className="border-0 bg-green-50 text-green-700 hover:bg-green-50">Upcoming</Badge>
											) : (
												<Badge className="border-0 bg-gray-50 text-gray-600 hover:bg-gray-50">Past</Badge>
											)}
											{e.category && <Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] hover:bg-[#f2f0eb]">{e.category}</Badge>}
										</div>
										<h3 className="font-semibold text-[#1a1a2e]">{e.title}</h3>
										{e.description && <p className="mt-1 text-sm text-[#6b6b80]">{e.description}</p>}
										<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<CalendarDaysIcon className="h-3.5 w-3.5" />
												{new Date(e.eventDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
											</span>
											{e.venue && <span className="flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5" />{e.venue}</span>}
										</div>
									</div>
									<div className="flex shrink-0 gap-2">
										{!e.isCancelled && (
											<>
												<Button variant="outline" size="sm" className="border-black/10" onClick={() => openEdit(e)}>
													<PencilIcon className="h-3.5 w-3.5" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="outline" size="sm" className="border-orange-200 text-orange-500 hover:bg-orange-50">
															<XCircleIcon className="h-3.5 w-3.5" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Cancel Event?</AlertDialogTitle>
															<AlertDialogDescription>Students will be notified this event is cancelled.</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Go Back</AlertDialogCancel>
															<AlertDialogAction className="bg-orange-500 hover:bg-orange-600" onClick={() => cancel.mutate({ id: e.id })}>Cancel Event</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</>
										)}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50">
													<Trash2Icon className="h-3.5 w-3.5" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Event?</AlertDialogTitle>
													<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => remove.mutate({ id: e.id })}>Delete</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}