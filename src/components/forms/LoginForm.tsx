'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Placeholder auth flow; integrate actual API later.
    await new Promise((resolve) => setTimeout(resolve, 800));

    router.push("/dashboard/feeds");
    setIsSubmitting(false);
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
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Access restricted to SNFYI IP addresses.
      </p>
    </form>
  );
}

