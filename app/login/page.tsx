"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { PawPrint } from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginPending, loginError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    login({ email, password });
  };

  return (
    <LoginPage />
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawPrint className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-white">PetFood Admin</h1>
          </div>
          <p className="text-slate-400">Shop Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {/* Error Messages */}
          {(error || loginError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error || loginError?.message || "Login failed"}
            </div>
          )}

          {/* Redirect Message */}
          {searchParams.get("redirect") && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
              You need to login to access this page
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-slate-700 rounded border border-slate-600">
            <p className="text-slate-300 text-xs font-semibold mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-slate-400 text-xs">
              <p>Email: admin@petfood.com</p>
              <p>Password: admin123</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@petfood.com"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                disabled={loginPending}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                disabled={loginPending}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginPending}
              className="w-full mt-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
            >
              {loginPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Admin Dashboard • Protected Access
        </p>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
