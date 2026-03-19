import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/server/better-auth/server";

type Props = {
	children: React.ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
	const session = await getSession();

	if (!session?.user) {
		redirect("/login");
	}

	const user = {
		name: session.user.name,
		email: session.user.email,
		avatar: session.user.image ?? "",

		role: (session.user.role as string) ?? "student",
	};

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-black/[0.07] border-b bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1 text-muted-foreground hover:text-[#1a3a5c]" />
						<Separator
							className="mr-2 data-vertical:h-4 data-vertical:self-auto"
							orientation="vertical"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage className="font-semibold text-[#1a1a2e] text-sm">
										Campus Connect
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<main className="flex flex-1 flex-col bg-[#f9f7f4] p-6">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
