'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResetPasswordResponse {
  message: string;
}

interface ResetPasswordError {
  message?: string;
  error?: {
    message?: string;
  };
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [message, setMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    // Fix URL if it has double slashes (SecurityError prevention)
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const cleanUrl = currentUrl.replace(/([^:]\/)\/+/g, '$1');
      if (currentUrl !== cleanUrl) {
        // Use replace instead of pushState to avoid SecurityError
        window.history.replaceState({}, '', cleanUrl);
      }
    }

    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setStatus('error');
      setMessage('Reset token is missing. Please check your email and try again.');
      setShowModal(true);
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }

    // Validate password strength
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Reset token is missing. Please request a new password reset.');
      setShowModal(true);
      return;
    }

    setStatus('loading');
    setPasswordErrors([]);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${baseUrl}/customers/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data: ResetPasswordResponse | ResetPasswordError = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage((data as ResetPasswordResponse).message || 'Password has been reset successfully. You can now login with your new password.');
        setShowModal(true);
      } else {
        setStatus('error');
        const errorData = data as ResetPasswordError;
        setMessage(errorData.message || errorData.error?.message || 'Password reset failed. Please try again.');
        setShowModal(true);
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred during password reset. Please try again later.');
      setShowModal(true);
    }
  }, [token, password, confirmPassword]);

  const handleCloseModal = () => {
    setShowModal(false);
    if (status === 'success') {
      // Redirect to login page after successful password reset
      router.push('/login');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value && confirmPassword) {
      const errors = validatePassword(value);
      if (value !== confirmPassword) {
        errors.push('Passwords do not match');
      }
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value) {
      const errors = validatePassword(password);
      if (password !== value) {
        errors.push('Passwords do not match');
      }
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">Resetting Password</h1>
          <p className="mt-2 text-zinc-600">Please wait while we reset your password...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white font-semibold">
              SN
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Reset Your Password</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L12 12m-5.71-5.71L12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L12 12m-5.71-5.71L12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {passwordErrors.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!password || !confirmPassword || passwordErrors.length > 0}
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {status === 'success' && (
        <Modal
          title="Password Reset Successful"
          description=""
          confirmLabel="Go to Login"
          cancelLabel=""
          open={showModal}
          onConfirm={handleCloseModal}
          onClose={handleCloseModal}
          showCancel={false}
          hideButtons={false}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{message}</p>
          </div>
        </Modal>
      )}

      {/* Error Modal */}
      {status === 'error' && (
        <Modal
          title="Password Reset Failed"
          description=""
          confirmLabel="Close"
          cancelLabel=""
          open={showModal}
          onConfirm={handleCloseModal}
          onClose={handleCloseModal}
          showCancel={false}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{message}</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-zinc-600 hover:text-zinc-900 underline"
              >
                Request a new password reset
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Loading...</h1>
            <p className="mt-2 text-zinc-600">Preparing password reset...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

