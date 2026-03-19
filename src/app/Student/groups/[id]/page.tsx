"use client";

import { ArrowLeftIcon, SendIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

type Props = { params: Promise<{ id: string }> };

export default function GroupChatPage({ params }: Props) {
	const { id } = use(params);
	const [message, setMessage] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);
	const messagesLengthRef = useRef(0);

	const { data: groups } = api.group.getAll.useQuery();
	const group = groups?.find((g) => g.id === id);

	const {
		data: messages,
		isLoading,
		error,
		refetch,
	} = api.group.getMessages.useQuery(
		{ groupId: id },
		{ retry: false },
	);

	const sendMessage = api.group.sendMessage.useMutation({
		onSuccess: () => {
			setMessage("");
			void refetch();
		},
		onError: (e) => toast.error(e.message),
	});

	useEffect(() => {
		const currentLength = messages?.length ?? 0;
		if (currentLength !== messagesLengthRef.current) {
			messagesLengthRef.current = currentLength;
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages?.length]);

	function handleSend() {
		if (!message.trim()) return;
		sendMessage.mutate({ groupId: id, content: message });
	}

	return (
		<div className="flex h-[calc(100vh-80px)] w-full flex-col">
			{/* HEADER */}
			<div className="mb-4 flex items-center gap-3 rounded-xl border border-black/[0.07] bg-white px-5 py-3">
				<Button asChild className="border-black/10" size="sm" variant="outline">
					<Link href="/Student/groups">
						<ArrowLeftIcon className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
					<UsersIcon className="h-5 w-5 text-blue-600" />
				</div>
				<div>
					<h1 className="font-semibold text-[#1a1a2e]">
						{group?.name ?? "Group Chat"}
					</h1>
					<p className="text-muted-foreground text-xs">
						{group?.members?.length ?? 0} members
					</p>
				</div>
			</div>

			{/* MESSAGES */}
			<div className="flex-1 overflow-y-auto rounded-xl border border-black/[0.07] bg-white p-4">
				{error ? (
					<div className="flex h-full flex-col items-center justify-center">
						<UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
						<p className="text-sm font-medium text-muted-foreground">
							You must join this group to view messages
						</p>
						<Button asChild size="sm" className="mt-3 bg-[#1a3a5c] text-white hover:bg-[#2a5580]">
							<Link href="/Student/groups">Go Back</Link>
						</Button>
					</div>
				) : isLoading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<Skeleton className="h-12 rounded-lg" key={i} />
						))}
					</div>
				) : !messages?.length ? (
					<div className="flex h-full flex-col items-center justify-center">
						<SendIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
						<p className="font-medium text-muted-foreground text-sm">
							No messages yet
						</p>
						<p className="text-muted-foreground/70 text-xs">
							Be the first to say something!
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{messages.map((msg) => (
							<div className="flex items-start gap-3" key={msg.id}>
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a3a5c]/10 font-semibold text-[#1a3a5c] text-xs">
									{msg.sender.name.slice(0, 2).toUpperCase()}
								</div>
								<div className="flex-1">
									<div className="flex items-baseline gap-2">
										<p className="font-semibold text-[#1a1a2e] text-xs">
											{msg.sender.name}
										</p>
										<p className="text-[10px] text-muted-foreground">
											{new Date(msg.createdAt).toLocaleTimeString("en-US", {
												hour: "2-digit",
												minute: "2-digit",
											})}
											{" · "}
											{new Date(msg.createdAt).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
									</div>
									<div className="mt-0.5 inline-block rounded-lg rounded-tl-none bg-[#f9f7f4] px-3 py-2 text-[#1a1a2e] text-sm">
										{msg.content}
									</div>
								</div>
							</div>
						))}
						<div ref={bottomRef} />
					</div>
				)}
			</div>

			{/* INPUT — hide if error */}
			{!error && (
				<div className="mt-4 flex gap-3 rounded-xl border border-black/[0.07] bg-white p-3">
					<input
						className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder="Type a message..."
						type="text"
						value={message}
					/>
					<Button
						className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
						disabled={!message.trim() || sendMessage.isPending}
						onClick={handleSend}
						size="sm"
					>
						<SendIcon className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}