"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type Props = {
	label: string;
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
};

export function NavMain({ label, items }: Props) {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
				{label}
			</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isActive = pathname === item.url;
					return (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								className={
									isActive
										? "bg-[#1a3a5c] text-white hover:bg-[#1a3a5c] hover:text-white"
										: "hover:bg-sidebar-accent"
								}
								isActive={isActive}
								tooltip={item.title}
							>
								<Link href={item.url}>
									<item.icon className="size-4" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
