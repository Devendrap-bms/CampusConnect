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
import { MessageSquareIcon, PlusIcon, ShieldIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FacultyForumsPage() {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ title: "", description: "" });

	const { data: forums, isLoading, refetch } = api.forum.getAll.useQuery();

	const create = api.forum.create.useMutation({
		onSuccess: () => { setOpen(false); setForm({ title: "", description: "" }); void refetch(); toast.success("Forum created!"); },
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Forums</h1>
					<p className="mt-1 text-sm text-muted-foreground">Create forums and moderate student discussions</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> Create Forum
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Create Forum</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<Label>Forum Title</Label>
								<Input placeholder="e.g. Data Structures Discussion" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label>Description (optional)</Label>
								<Textarea placeholder="What is this forum about?" className="resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
							</div>
							<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!form.title.trim() || create.isPending} onClick={() => create.mutate(form)}>
								{create.isPending ? "Creating..." : "Create Forum"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
				</div>
			) : forums?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<MessageSquareIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No forums yet</p>
					<p className="text-xs text-muted-foreground/70">Create a forum for students to discuss</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{forums?.map((f) => (
						<Link key={f.id} href={`/Faculty/forums/${f.id}`}>
							<Card className="h-full cursor-pointer border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
								<CardContent className="p-5">
									<div className="mb-3 flex items-start justify-between">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
											<MessageSquareIcon className="h-5 w-5 text-green-600" />
										</div>
										<div className="flex items-center gap-2">
											<Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] hover:bg-[#f2f0eb]">{f.posts?.length ?? 0} posts</Badge>
											<div className="flex items-center gap-1 text-[11px] font-medium text-[#e8734a]">
												<ShieldIcon className="h-3 w-3" /> Moderator
											</div>
										</div>
									</div>
									<h3 className="font-semibold text-[#1a1a2e]">{f.title}</h3>
									{f.description && <p className="mt-1 line-clamp-2 text-sm text-[#6b6b80]">{f.description}</p>}
									<div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
										<UsersIcon className="h-3.5 w-3.5" /> {f.members?.length ?? 0} members
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}