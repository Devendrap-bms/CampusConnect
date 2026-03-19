import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession();
	if (!session?.user) redirect("/login");
	// ts-expect-error — additionalFields
	const role = (session.user.role as string) ?? "student";
	if (role !== "faculty") redirect("/dashboard");

	const user = {
		name: session.user.name,
		email: session.user.email,
		avatar: session.user.image ?? "",
		role,
	};

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
					<SidebarTrigger className="-ml-1 text-muted-foreground hover:text-[#1a3a5c]" />
					<Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage className="text-sm font-semibold text-[#1a1a2e]">Campus Connect</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</header>
				<main className="flex flex-1 flex-col bg-[#f9f7f4] p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}