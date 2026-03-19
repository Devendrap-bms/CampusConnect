"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CameraIcon, PencilIcon, SaveIcon, Trash2Icon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export default function ProfilePage() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [editing, setEditing] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);

	const [form, setForm] = useState({
		name: "",
		bio: "",
		phone: "",
		department: "",
		avatarUrl: "",
	});

	const { data, isLoading, refetch } = api.profile.get.useQuery();

	// Populate form when data loads
	useEffect(() => {
		if (data) {
			setForm({
				name: data.user?.name ?? "",
				bio: data.profile?.bio ?? "",
				phone: data.profile?.phone ?? "",
				department: data.profile?.department ?? "",
				avatarUrl: data.profile?.avatarUrl ?? data.user?.image ?? "",
			});
		}
	}, [data]);

	const upsert = api.profile.upsert.useMutation({
		onSuccess: () => {
			void refetch();
			setEditing(false);
			toast.success("Profile updated!");
		},
		onError: (e) => toast.error(e.message),
	});

	const updateName = api.profile.updateName.useMutation({
		onError: (e) => toast.error(e.message),
	});

	const deleteProfile = api.profile.delete.useMutation({
		onSuccess: async () => {
			toast.success("Profile deleted");
			await authClient.signOut();
			router.push("/login");
		},
		onError: (e) => toast.error(e.message),
	});

	async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Image must be under 2MB");
			return;
		}
		setUploadingAvatar(true);
		try {
			const base64 = await fileToBase64(file);
			setForm((p) => ({ ...p, avatarUrl: base64 }));
		} catch {
			toast.error("Failed to read image");
		} finally {
			setUploadingAvatar(false);
		}
	}

	async function handleSave() {
		if (form.name.trim() && form.name !== data?.user?.name) {
			await updateName.mutateAsync({ name: form.name });
		}
		upsert.mutate({
			bio: form.bio || undefined,
			phone: form.phone || undefined,
			department: form.department || undefined,
			avatarUrl: form.avatarUrl || undefined,
		});
	}

	const role = data?.user?.role ?? "student";
	const initials = (data?.user?.name ?? "?")
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				<Skeleton className="h-32 w-full rounded-2xl" />
				<Skeleton className="h-48 w-full rounded-2xl" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6">

			{/* PROFILE HEADER CARD */}
			<Card className="border-black/[0.07] bg-white">
				<CardContent className="p-6">
					<div className="flex flex-wrap items-center gap-6">
						{/* AVATAR */}
						<div className="relative">
							<Avatar className="h-20 w-20 rounded-2xl ring-2 ring-[#1a3a5c]/10">
								<AvatarImage src={form.avatarUrl} alt={form.name} />
								<AvatarFallback className="rounded-2xl bg-[#1a3a5c]/10 font-bold text-2xl text-[#1a3a5c]">
									{initials}
								</AvatarFallback>
							</Avatar>
							{editing && (
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3a5c] text-white shadow-md transition hover:bg-[#2a5580]"
								>
									{uploadingAvatar ? (
										<span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
									) : (
										<CameraIcon className="h-3.5 w-3.5" />
									)}
								</button>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/jpg,image/webp"
								className="hidden"
								onChange={handleAvatarChange}
							/>
						</div>

						{/* NAME + ROLE */}
						<div className="flex-1">
							{editing ? (
								<Input
									value={form.name}
									onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
									className="mb-2 text-lg font-semibold"
									placeholder="Your name"
								/>
							) : (
								<h1 className="font-serif text-2xl text-[#1a3a5c]">
									{data?.user?.name ?? "—"}
								</h1>
							)}
							<div className="mt-1 flex flex-wrap items-center gap-2">
								<Badge className={`border-0 capitalize ${role === "faculty" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
									{role}
								</Badge>
								{data?.user?.studentId && (
									<span className="text-xs text-muted-foreground">
										ID: {data.user.studentId}
									</span>
								)}
								{data?.user?.facultyId && (
									<span className="text-xs text-muted-foreground">
										ID: {data.user.facultyId}
									</span>
								)}
							</div>
							<p className="mt-1 text-sm text-muted-foreground">{data?.user?.email}</p>
						</div>

						{/* EDIT TOGGLE */}
						<div className="flex gap-2">
							{editing ? (
								<>
									<Button
										size="sm"
										className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
										disabled={upsert.isPending || updateName.isPending}
										onClick={handleSave}
									>
										<SaveIcon className="mr-1.5 h-3.5 w-3.5" />
										{upsert.isPending ? "Saving..." : "Save"}
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="border-black/10"
										onClick={() => setEditing(false)}
									>
										Cancel
									</Button>
								</>
							) : (
								<Button
									size="sm"
									variant="outline"
									className="border-black/10"
									onClick={() => setEditing(true)}
								>
									<PencilIcon className="mr-1.5 h-3.5 w-3.5" />
									Edit Profile
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* PROFILE DETAILS */}
			<Card className="border-black/[0.07] bg-white">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
						<UserIcon className="h-4 w-4" />
						Profile Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 p-6 pt-2">
					{editing ? (
						<>
							<div className="space-y-1.5">
								<Label>Bio</Label>
								<Textarea
									placeholder="Tell others about yourself..."
									className="min-h-[100px] resize-none border-black/10 text-sm"
									value={form.bio}
									onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
								/>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label>Phone</Label>
									<Input
										placeholder="+91 XXXXX XXXXX"
										value={form.phone}
										onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Department</Label>
									<Input
										placeholder="e.g. Computer Science"
										value={form.department}
										onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
									/>
								</div>
							</div>
						</>
					) : (
						<div className="space-y-4">
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</p>
								<p className="mt-1 text-sm text-[#444]">
									{data?.profile?.bio ?? <span className="text-muted-foreground/60 italic">No bio added yet</span>}
								</p>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
									<p className="mt-1 text-sm text-[#444]">
										{data?.profile?.phone ?? <span className="text-muted-foreground/60 italic">Not provided</span>}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</p>
									<p className="mt-1 text-sm text-[#444]">
										{data?.profile?.department ?? <span className="text-muted-foreground/60 italic">Not provided</span>}
									</p>
								</div>
							</div>
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Member Since</p>
								<p className="mt-1 text-sm text-[#444]">
									{data?.user?.createdAt
										? new Date(data.user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
										: "—"}
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* DANGER ZONE */}
			<Card className="border-red-200 bg-white">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-semibold text-red-600">
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 pt-2">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-[#1a1a2e]">Delete Profile</p>
							<p className="text-xs text-muted-foreground">
								Remove your profile data. Your account will still exist but profile info will be cleared.
							</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50">
									<Trash2Icon className="mr-1.5 h-3.5 w-3.5" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete your profile?</AlertDialogTitle>
									<AlertDialogDescription>
										Your bio, phone, department and avatar will be permanently removed. You will be logged out.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-red-500 hover:bg-red-600"
										onClick={() => deleteProfile.mutate()}
									>
										Delete Profile
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>

		</div>
	);
}