'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Plane } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      // Handle email verification flow (token-based)
      if (token) {
        setMessage('Verifying your email...');
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (response.ok) {
            setStatus('success');
            setMessage(data.message || 'Email verified successfully!');

            // Redirect to login page after 3 seconds
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
          } else {
            setStatus('error');
            setMessage(data.error || 'Email verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage('An error occurred during verification');
        }
        return;
      }

      // No valid parameters
      setStatus('error');
      setMessage('Invalid verification link');
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Verification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border-2 border-border rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <img
              src="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_124,h_104,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png"
              alt="Godfirst Education and Tours"
              className="h-20 w-auto"
            />
          </motion.div>

          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
            className="mb-6"
          >
            {status === 'loading' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full"
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full"
              >
                <XCircle className="w-10 h-10 text-red-500" />
              </motion.div>
            )}
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
            <p className="text-muted-foreground mb-6">{message}</p>

            {status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Redirecting you to login page in 3 seconds...
              </p>
            )}

            {status === 'error' && (
              <div className="space-y-3 mt-6">
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all"
                >
                  Try Signing Up Again
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full py-3 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-all"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
