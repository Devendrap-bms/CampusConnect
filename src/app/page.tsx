import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
	const navLinks = [
		{ label: "Features", href: "#features" },
		{ label: "For Students", href: "#roles" },
		{ label: "For Faculty", href: "#roles" },
		{ label: "About", href: "#cta" },
	];

	const stats = [
		{ num: "10K+", label: "Active Students" },
		{ num: "500+", label: "Faculty Members" },
		{ num: "25K+", label: "Resources Shared" },
		{ num: "98%", label: "Satisfaction Rate" },
	];

	const features = [
		{
			bg: "bg-blue-50",
			title: "Announcements & Events",
			desc: "Faculty post real-time announcements and event updates. Students receive instant notifications and can filter by category or date.",
		},
		{
			bg: "bg-green-50",
			title: "Discussion Forums",
			desc: "Threaded discussions, topic-based forums, and peer Q&A. Join relevant channels and stay engaged with your academic community.",
		},
		{
			bg: "bg-orange-50",
			title: "Resource Sharing",
			desc: "Upload and access notes, PDFs, videos, and study materials. Rate, comment, and bookmark resources for quick access.",
		},
		{
			bg: "bg-purple-50",
			title: "Study Groups & Chat",
			desc: "Create or join study groups. Persistent group messaging keeps all conversations organized and accessible anytime.",
		},
		{
			bg: "bg-teal-50",
			title: "Smart Notifications",
			desc: "Configurable alerts for announcements, forum activity, event reminders, and system updates — never miss what matters.",
		},
		{
			bg: "bg-pink-50",
			title: "Moderation & Safety",
			desc: "Faculty can moderate discussions, flag inappropriate content, and maintain a safe and productive academic environment.",
		},
	];

	const feedItems = [
		{
			initials: "AK",
			bg: "bg-amber-100",
			color: "text-amber-800",
			msg: "Mid-semester exam schedule has been updated. Check the events section.",
			meta: "Dr. Anita Kumar · CS301 · 10:30 AM",
		},
		{
			initials: "SM",
			bg: "bg-pink-100",
			color: "text-pink-800",
			msg: "Has anyone finished the linked list assignment? Trouble with deletion method.",
			meta: "Sneha M · Discussion Forum · 9:15 AM",
		},
		{
			initials: "RV",
			bg: "bg-green-100",
			color: "text-green-800",
			msg: "Uploaded: OS Chapter 4 - Process Scheduling.pdf",
			meta: "Rahul V · Resources · 8:50 AM",
		},
	];

	const roles = [
		{
			tag: "Student",
			tagStyle: "bg-blue-100 text-blue-800",
			accent: "bg-[#1a3a5c]",
			title: "Learn, share & connect",
			desc: "Access everything you need for your academic journey — from course announcements to peer discussions and shared study materials.",
			items: [
				"View announcements & event updates",
				"Post questions in discussion forums",
				"Upload & download study materials",
				"Join study groups & chat with peers",
				"Rate & comment on shared resources",
				"Receive smart event reminders",
			],
			dot: "bg-[#1a3a5c]",
		},
		{
			tag: "Faculty",
			tagStyle: "bg-orange-100 text-orange-800",
			accent: "bg-[#e8734a]",
			title: "Teach, manage & engage",
			desc: "Manage your course community with powerful tools for announcements, resource sharing, discussion moderation, and student engagement.",
			items: [
				"Post & manage announcements",
				"Create and update campus events",
				"Upload course materials & resources",
				"Moderate forums & manage groups",
				"Track student participation",
				"Receive forum & group notifications",
			],
			dot: "bg-[#e8734a]",
		},
	];

	const footerLinks = ["Privacy", "Terms", "Support", "Contact"];

	return (
		<div className="min-h-screen bg-[#f9f7f4] font-sans">
			{/* NAV */}
			<nav className="sticky top-0 z-50 border-black/[0.07] border-b bg-[#f9f7f4]/90 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link className="flex items-center gap-2.5" href="/">
						<div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1a3a5c] font-bold text-sm text-white">
							CC
						</div>
						<span className="font-serif text-[#1a3a5c] text-xl">
							Campus Connect
						</span>
					</Link>

					<ul className="hidden items-center gap-8 md:flex">
						{navLinks.map((item) => (
							<li key={item.label}>
								<a
									className="font-medium text-[#6b6b80] text-sm transition-colors hover:text-[#1a3a5c]"
									href={item.href}
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>

					<div className="flex items-center gap-2.5">
						<Button
							asChild
							className="border-black/10 text-[#1a3a5c] hover:bg-black/5"
							size="sm"
							variant="outline"
						>
							<Link href="/login">Sign In</Link>
						</Button>
						<Button
							asChild
							className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
							size="sm"
						>
							<Link href="/register">Get Started</Link>
						</Button>
					</div>
				</div>
			</nav>

			{/* HERO */}
			<section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2">
				<div>
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8734a]/25 bg-[#fdf0ea] px-3.5 py-1.5 font-semibold text-[#e8734a] text-xs">
						<span className="h-1.5 w-1.5 rounded-full bg-[#e8734a]" />
						Now live for all campuses
					</div>

					<h1 className="mb-5 font-serif text-5xl text-[#1a3a5c] leading-[1.15] md:text-6xl">
						Your campus, <em className="text-[#e8734a] italic">connected</em>{" "}
						&amp; in sync
					</h1>

					<p className="mb-9 max-w-lg text-[#6b6b80] text-lg leading-relaxed">
						Campus Connect brings students, faculty, and administration together
						on one unified platform — for announcements, discussions, resources,
						and real-time collaboration.
					</p>

					<div className="flex flex-wrap gap-3.5">
						<Button
							asChild
							className="bg-[#1a3a5c] text-white hover:bg-[#2a5580]"
							size="lg"
						>
							<Link href="/register">Get Started Free</Link>
						</Button>
						<Button
							asChild
							className="border-black/10 text-[#1a3a5c] hover:bg-black/5"
							size="lg"
							variant="outline"
						>
							<a href="#features">Learn More</a>
						</Button>
					</div>
				</div>

				<div className="relative">
					<div className="absolute -top-4 -right-4 z-10 flex items-center gap-2.5 rounded-xl border border-black/[0.07] bg-white px-3.5 py-2.5 shadow-lg">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800 text-xs">
							JR
						</div>
						<div>
							<p className="font-semibold text-[#1a1a2e] text-xs">
								New Resource Shared
							</p>
							<p className="text-[#6b6b80] text-[11px]">
								Data Structures Notes · 2 min ago
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[#1a3a5c]/[0.06] shadow-xl">
						<div className="mb-5 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800 text-xs">
									DR
								</div>
								<div>
									<p className="font-semibold text-[#1a1a2e] text-sm">
										Dr. Rajan&apos;s Announcements
									</p>
									<p className="text-[#6b6b80] text-xs">
										Computer Science Dept · Today
									</p>
								</div>
							</div>
							<span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-[11px] text-green-800">
								Live
							</span>
						</div>

						{feedItems.map((item, i) => (
							<div
								className={`flex gap-3 py-3 ${i < feedItems.length - 1 ? "border-black/[0.06] border-b" : ""}`}
								key={item.initials}
							>
								<div
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-[11px] ${item.bg} ${item.color}`}
								>
									{item.initials}
								</div>
								<div>
									<p className="text-[#1a1a2e] text-[13px] leading-snug">
										{item.msg}
									</p>
									<p className="mt-0.5 text-[#6b6b80] text-[11px]">
										{item.meta}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="absolute -bottom-4 -left-4 z-10 flex items-center gap-4 rounded-xl border border-black/[0.07] bg-white px-4 py-3 shadow-lg">
						<div className="text-center">
							<p className="font-bold text-[#1a3a5c] text-xl">3</p>
							<p className="text-[#6b6b80] text-[11px]">New Notifications</p>
						</div>
						<div className="h-8 w-px bg-black/[0.07]" />
						<div className="text-center">
							<p className="font-bold text-[#1a3a5c] text-xl">12</p>
							<p className="text-[#6b6b80] text-[11px]">Events This Week</p>
						</div>
					</div>
				</div>
			</section>

			{/* STATS */}
			<div className="bg-[#1a3a5c]">
				<div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
					{stats.map((s) => (
						<div className="text-center" key={s.label}>
							<p className="font-serif text-4xl text-white">{s.num}</p>
							<p className="mt-1 font-medium text-sm text-white/60">
								{s.label}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* FEATURES */}
			<section className="mx-auto max-w-7xl px-6 py-24" id="features">
				<p className="mb-3 font-semibold text-[#e8734a] text-xs uppercase tracking-widest">
					Platform Features
				</p>
				<h2 className="mb-4 font-serif text-4xl text-[#1a3a5c]">
					Everything your campus needs in one place
				</h2>
				<p className="max-w-xl text-[#6b6b80] text-base leading-relaxed">
					From real-time announcements to collaborative study groups, Campus
					Connect is built for the modern academic experience.
				</p>
				<div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((f) => (
						<div
							className="rounded-2xl border border-black/[0.07] bg-white p-7 transition hover:-translate-y-1 hover:shadow-[#1a3a5c]/[0.06] hover:shadow-lg"
							key={f.title}
						>
							<div className={`mb-5 h-11 w-11 rounded-xl ${f.bg}`} />
							<h3 className="mb-2 font-semibold text-[#1a1a2e] text-base">
								{f.title}
							</h3>
							<p className="text-[#6b6b80] text-sm leading-relaxed">{f.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ROLES */}
			<section className="bg-[#f2f0eb] py-24" id="roles">
				<div className="mx-auto max-w-7xl px-6">
					<p className="mb-3 font-semibold text-[#e8734a] text-xs uppercase tracking-widest">
						Built for Everyone
					</p>
					<h2 className="mb-4 font-serif text-4xl text-[#1a3a5c]">
						One platform, two powerful roles
					</h2>
					<p className="max-w-xl text-[#6b6b80] text-base leading-relaxed">
						Whether you&apos;re a student looking to collaborate or a faculty
						member managing your course community, Campus Connect adapts to your
						needs.
					</p>
					<div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2">
						{roles.map((role) => (
							<div
								className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-9"
								key={role.tag}
							>
								<div
									className={`absolute top-0 left-0 h-1 w-full ${role.accent}`}
								/>
								<span
									className={`mb-4 inline-block rounded-full px-3 py-1 font-semibold text-xs ${role.tagStyle}`}
								>
									{role.tag}
								</span>
								<h3 className="mb-3 font-serif text-2xl text-[#1a3a5c]">
									{role.title}
								</h3>
								<p className="mb-6 text-[#6b6b80] text-sm leading-relaxed">
									{role.desc}
								</p>
								<ul className="flex flex-col gap-2.5">
									{role.items.map((item) => (
										<li
											className="flex items-center gap-2.5 text-[#1a1a2e] text-sm"
											key={item}
										>
											<span
												className={`h-1.5 w-1.5 shrink-0 rounded-full ${role.dot}`}
											/>
											{item}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section
				className="relative overflow-hidden bg-[#1a3a5c] py-28 text-center"
				id="cta"
			>
				<div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/[0.03]" />
				<div className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-white/[0.03]" />
				<div className="relative z-10 mx-auto max-w-2xl px-6">
					<h2 className="mb-5 font-serif text-5xl text-white">
						Ready to connect your campus?
					</h2>
					<p className="mb-10 text-lg text-white/65 leading-relaxed">
						Join thousands of students and faculty already using Campus Connect
						to collaborate, share, and succeed together.
					</p>
					<div className="flex flex-wrap justify-center gap-3.5">
						<Button
							asChild
							className="bg-white text-[#1a3a5c] hover:bg-white/90"
							size="lg"
						>
							<Link href="/register">Get Started — It&apos;s Free</Link>
						</Button>
						<Button
							asChild
							className="border-white/30 bg-transparent text-white hover:bg-white/[0.08]"
							size="lg"
							variant="outline"
						>
							<Link href="/login">Sign In</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="bg-[#101828] px-6 py-12">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
					<div className="flex items-center gap-2.5 font-serif text-white text-xl">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8734a] font-bold text-white text-xs">
							CC
						</div>
						Campus Connect
					</div>
					<div className="flex gap-6">
						{footerLinks.map((l) => (
							<a
								className="text-sm text-white/40 transition hover:text-white"
								href="/"
								key={l}
							>
								{l}
							</a>
						))}
					</div>
					<p className="text-sm text-white/35">
						&copy; 2025 Campus Connect. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
