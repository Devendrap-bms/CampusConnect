"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/server/better-auth/client";

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "" as "student" | "faculty" | "",
		studentId: "",
		facultyId: "",
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		if (form.password !== form.confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (form.password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (!form.role) {
			setError("Please select a role.");
			return;
		}
		if (form.role === "student" && !form.studentId.trim()) {
			setError("Student ID is required.");
			return;
		}
		if (form.role === "faculty" && !form.facultyId.trim()) {
			setError("Faculty ID is required.");
			return;
		}

		setLoading(true);

		const { error } = await authClient.signUp.email({
			name: form.name,
			email: form.email,
			password: form.password,
			// @ts-expect-error — additionalFields from BetterAuth config
			role: form.role,
			studentId: form.role === "student" ? form.studentId : undefined,
			facultyId: form.role === "faculty" ? form.facultyId : undefined,
		});

		if (error) {
			setError(error.message ?? "Registration failed. Please try again.");
			setLoading(false);
			return;
		}

		router.push("/login");
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#f9f7f4] px-4 py-12">
			<div className="w-full max-w-md">
				{/* Brand top */}
				<div className="mb-8 text-center">
					<Link className="inline-flex items-center gap-2.5" href="/">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a3a5c] font-bold text-sm text-white">
							CC
						</div>
						<span className="font-serif text-2xl text-[#1a3a5c]">
							Campus Connect
						</span>
					</Link>
				</div>

				<Card className="border-black/[0.07] shadow-[#1a3a5c]/[0.07] shadow-xl">
					<CardHeader className="space-y-1 pb-4">
						<CardTitle className="font-bold text-2xl text-[#1a1a2e]">
							Create an account
						</CardTitle>
						<CardDescription className="text-[#6b6b80]">
							Join Campus Connect today
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleRegister}>
						<CardContent className="space-y-4">
							{error && (
								<div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-destructive text-sm">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									name="name"
									onChange={handleChange}
									placeholder="John Doe"
									required
									value={form.name}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									onChange={handleChange}
									placeholder="you@university.edu"
									required
									type="email"
									value={form.email}
								/>
							</div>

							{/* Role selector */}
							<div className="space-y-2">
								<Label>Role</Label>
								<Select
									onValueChange={(val) =>
										setForm((prev) => ({
											...prev,
											role: val as "student" | "faculty",
											studentId: "",
											facultyId: "",
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select your role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="student">Student</SelectItem>
										<SelectItem value="faculty">Faculty</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Conditional ID field */}
							{form.role === "student" && (
								<div className="space-y-2">
									<Label htmlFor="studentId">Student ID</Label>
									<Input
										id="studentId"
										name="studentId"
										onChange={handleChange}
										placeholder="e.g. STU2024001"
										required
										value={form.studentId}
									/>
								</div>
							)}

							{form.role === "faculty" && (
								<div className="space-y-2">
									<Label htmlFor="facultyId">Faculty ID</Label>
									<Input
										id="facultyId"
										name="facultyId"
										onChange={handleChange}
										placeholder="e.g. FAC2024001"
										required
										value={form.facultyId}
									/>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									onChange={handleChange}
									placeholder="Min. 8 characters"
									required
									type="password"
									value={form.password}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									onChange={handleChange}
									placeholder="••••••••"
									required
									type="password"
									value={form.confirmPassword}
								/>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col gap-3 pt-2">
							<Button
								className="w-full bg-[#1a3a5c] hover:bg-[#2a5580]"
								disabled={loading}
								type="submit"
							>
								{loading ? "Creating account..." : "Create Account"}
							</Button>

							<p className="text-center text-[#6b6b80] text-sm">
								Already have an account?{" "}
								<Link
									className="font-semibold text-[#1a3a5c] hover:underline"
									href="/login"
								>
									Sign in
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</main>
	);
}
