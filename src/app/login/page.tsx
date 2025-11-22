import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white font-semibold">
            SN
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            SNFYI Admin Access
          </h1>
          <p className="text-sm text-zinc-500">
            Secure IP-restricted login for feed management.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

