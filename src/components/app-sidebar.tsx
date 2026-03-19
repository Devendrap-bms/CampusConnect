"use client";

import {
	BellIcon,
	BookOpenIcon,
	CalendarDaysIcon,
	FileTextIcon,
	LayoutDashboardIcon,
	MegaphoneIcon,
	MessageSquareIcon,
	ShieldIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";

const studentNav = [
	{
		title: "Overview",
		items: [
			{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
		],
	},
	{
		title: "Campus",
		items: [
			{
				title: "Announcements",
				url: "/Student/announcements",
				icon: MegaphoneIcon,
			},
			{ title: "Events", url: "/Student/events", icon: CalendarDaysIcon },
		],
	},
	{
		title: "Community",
		items: [
			{ title: "Forums", url: "/Student/forums", icon: MessageSquareIcon },
			{ title: "Study Groups", url: "/Student/groups", icon: UsersIcon },
		],
	},
	{
		title: "Learning",
		items: [
			{ title: "Resources", url: "/Student/resources", icon: BookOpenIcon },
		],
	},
	{
		title: "Account",
		items: [
			{ title: "Notifications", url: "/Student/notifications", icon: BellIcon },
		],
	},
];

const facultyNav = [
	{
		title: "Overview",
		items: [
			{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
		],
	},
	{
		title: "Manage",
		items: [
			{ title: "Announcements", url: "/Faculty/announcements", icon: MegaphoneIcon },
			{ title: "Events", url: "/Faculty/events", icon: CalendarDaysIcon },
			{ title: "Resources", url: "/Faculty/resources", icon: FileTextIcon },
		],
	},
	{
		title: "Community",
		items: [
			{ title: "Forums", url: "/Faculty/forums", icon: ShieldIcon },
			{ title: "Groups", url: "/Faculty/groups", icon: UsersIcon },
		],
	},
	{
		title: "Account",
		items: [{ title: "Notifications", url: "/Faculty/notifications", icon: BellIcon }],
	},
];

type Props = React.ComponentProps<typeof Sidebar> & {
	user: {
		name: string;
		email: string;
		avatar: string;
		role: string;
	};
};

export function AppSidebar({ user, ...props }: Props) {
	const nav = user.role === "faculty" ? facultyNav : studentNav;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild size="lg">
							<Link href="/dashboard">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#1a3a5c] font-bold text-white text-xs">
									CC
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold text-[#1a3a5c]">
										Campus Connect
									</span>
									<span className="truncate text-muted-foreground text-xs capitalize">
										{user.role}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{nav.map((section) => (
					<NavMain
						items={section.items}
						key={section.title}
						label={section.title}
					/>
				))}
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
