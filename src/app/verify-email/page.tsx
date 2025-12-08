'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { getApiUrl } from '@/lib/api/config';

interface VerifyEmailResponse {
  message: string;
  accessToken: string;
  expiresIn: string;
  customer: {
    id: string;
    name: string;
    email: string;
    username: string;
    emailVerified: boolean;
    isActive: boolean;
  };
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  const redirectToMobileApp = useCallback((token: string) => {
    // Mobile app deep link scheme
    const mobileAppDeepLink = process.env.NEXT_PUBLIC_MOBILE_APP_DEEP_LINK || 'myapp://auth-callback';
    const deepLinkUrl = `${mobileAppDeepLink}?token=${encodeURIComponent(token)}&type=email_verification`;

    // Try to open mobile app
    try {
      // For mobile devices, attempt to open the app
      window.location.href = deepLinkUrl;
      
      // Fallback: If app doesn't open within 2 seconds, show message
      setTimeout(() => {
        // Check if still on the page (app didn't open)
        if (document.visibilityState === 'visible') {
          // Could show a message or copy token to clipboard
          console.log('Mobile app not detected. Token:', token);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to redirect to mobile app:', error);
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setStatus('error');
        setMessage('Verification token is missing. Please check your email and try again.');
        setShowModal(true);
      }, 0);
      return;
    }

    // Call backend API to verify email
    const verifyEmail = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/customers/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: VerifyEmailResponse = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          setAccessToken(data.accessToken);
          setShowModal(true);
          
          // Attempt to redirect to mobile app after a short delay
          setRedirectAttempted(true);
          setTimeout(() => {
            redirectToMobileApp(data.accessToken);
          }, 2000);
        } else {
          setStatus('error');
          const errorData = data as { message?: string; error?: { message?: string } };
          setMessage(errorData.message || errorData.error?.message || 'Verification failed. Please try again.');
          setShowModal(true);
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
        setShowModal(true);
      }
    };

    verifyEmail();
  }, [searchParams, redirectToMobileApp]);

  const handleCloseModal = () => {
    setShowModal(false);
    // If we have a token, try redirecting one more time
    if (accessToken && !redirectAttempted) {
      setRedirectAttempted(true);
      redirectToMobileApp(accessToken);
    }
    // Fallback: redirect to login page after a delay
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Verifying Email</h1>
            <p className="mt-2 text-zinc-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && !showModal && (
          <div>
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
            <h1 className="text-2xl font-semibold text-zinc-900">Email Verified</h1>
            <p className="mt-2 text-zinc-600">Your email has been successfully verified!</p>
          </div>
        )}

        {status === 'error' && !showModal && (
          <div>
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
            <h1 className="text-2xl font-semibold text-zinc-900">Verification Failed</h1>
            <p className="mt-2 text-zinc-600">{message}</p>
          </div>
        )}

        {/* Success Modal with Company Name */}
        {status === 'success' && (
          <Modal
            title="Email Verified Successfully"
            description=""
            confirmLabel=""
            cancelLabel=""
            open={showModal}
            onConfirm={handleCloseModal}
            onClose={handleCloseModal}
            showCancel={false}
            isLoading={false}
            confirmVariant="primary"
            hideButtons={true}
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
              <div className="mt-4 rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">Welcome to</p>
                <p className="mt-1 text-2xl font-bold text-black">SNFY</p>
              </div>
            </div>
          </Modal>
        )}

        {/* Error Modal */}
        {status === 'error' && (
          <Modal
            title="Verification Failed"
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
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Loading...</h1>
            <p className="mt-2 text-zinc-600">Preparing verification...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

