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
import { PlusIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FacultyGroupsPage() {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ name: "", description: "" });

	const { data: groups, isLoading, refetch } = api.group.getAll.useQuery();

	const create = api.group.create.useMutation({
		onSuccess: () => { setOpen(false); setForm({ name: "", description: "" }); void refetch(); toast.success("Group created!"); },
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-3xl text-[#1a3a5c]">Groups</h1>
					<p className="mt-1 text-sm text-muted-foreground">Create and manage study groups</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> Create Group
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="font-serif text-xl text-[#1a3a5c]">Create Group</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<Label>Group Name</Label>
								<Input placeholder="e.g. OS Study Group" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label>Description (optional)</Label>
								<Textarea placeholder="What is this group about?" className="resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
							</div>
							<Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2a5580]" disabled={!form.name.trim() || create.isPending} onClick={() => create.mutate(form)}>
								{create.isPending ? "Creating..." : "Create Group"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
				</div>
			) : groups?.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No groups yet</p>
					<p className="text-xs text-muted-foreground/70">Create a study group for students</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{groups?.map((g) => (
						<Link key={g.id} href={`/Faculty/groups/${g.id}`}>
							<Card className="h-full cursor-pointer border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
								<CardContent className="p-5">
									<div className="mb-3 flex items-start justify-between">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
											<UsersIcon className="h-5 w-5 text-blue-600" />
										</div>
										<Badge className="border-0 bg-[#f2f0eb] text-[#6b6b80] hover:bg-[#f2f0eb]">{g.members?.length ?? 0} members</Badge>
									</div>
									<h3 className="font-semibold text-[#1a1a2e]">{g.name}</h3>
									{g.description && <p className="mt-1 line-clamp-2 text-sm text-[#6b6b80]">{g.description}</p>}
									<p className="mt-3 text-xs text-muted-foreground">Created by {g.createdBy.name}</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}