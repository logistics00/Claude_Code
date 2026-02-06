"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSignUp = searchParams.get("mode") === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const options = {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (ctx: { error: { message?: string } }) => {
        setError(ctx.error.message || "Authentication failed");
        setIsLoading(false);
      },
    };

    if (isSignUp) {
      await signUp.email({ email, password, name: email.split("@")[0] }, options);
    } else {
      await signIn.email({ email, password }, options);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Loading..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link
                href="/authenticate"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/authenticate?mode=signup"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function Authenticate() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
