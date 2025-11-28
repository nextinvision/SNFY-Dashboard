'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      
      // Verify token was stored before redirecting
      if (response && response.accessToken) {
        // Small delay to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify authentication state
        if (authApi.isAuthenticated()) {
          router.push("/dashboard/feeds");
        } else {
          setError("Authentication failed. Please try again.");
        }
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Invalid email or password");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="admin@snsfy.io"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Access restricted to SNFYI IP addresses.
      </p>
    </form>
  );
}

