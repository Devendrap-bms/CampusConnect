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
import { authClient } from "@/server/better-auth/client";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			setError(error.message ?? "Invalid credentials. Please try again.");
			setLoading(false);
			return;
		}

		router.push("/dashboard");
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#f9f7f4] px-4">
			{/* Brand top */}
			<div className="w-full max-w-md">
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
							Welcome back
						</CardTitle>
						<CardDescription className="text-[#6b6b80]">
							Sign in to your Campus Connect account
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleLogin}>
						<CardContent className="space-y-4">
							{error && (
								<div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-destructive text-sm">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									autoComplete="email"
									id="email"
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@university.edu"
									required
									type="email"
									value={email}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									autoComplete="current-password"
									id="password"
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
									type="password"
									value={password}
								/>
							</div>
						</CardContent>

						<CardFooter className="flex flex-col gap-3 pt-2">
							<Button
								className="w-full bg-[#1a3a5c] hover:bg-[#2a5580]"
								disabled={loading}
								type="submit"
							>
								{loading ? "Signing in..." : "Sign In"}
							</Button>

							<p className="text-center text-[#6b6b80] text-sm">
								Don&apos;t have an account?{" "}
								<Link
									className="font-semibold text-[#1a3a5c] hover:underline"
									href="/register"
								>
									Register
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</main>
	);
}
