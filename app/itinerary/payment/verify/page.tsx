'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ItineraryPaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const itineraryId = searchParams.get('itineraryId');

      if (!reference || !itineraryId) {
        setError('Missing payment information');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/itinerary-bookings/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference,
            itineraryId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment verification failed');
        }

        setSuccess(true);
        toast.success('Payment verified successfully!');

        // Redirect to bookings page after 3 seconds
        setTimeout(() => {
          router.push('/profile/bookings');
        }, 3000);

      } catch (error: any) {
        console.error('Payment verification error:', error);
        setError(error.message || 'Failed to verify payment');
        toast.error(error.message || 'Payment verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-border rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center">
          {verifying && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verifying Payment
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            </>
          )}

          {!verifying && success && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your itinerary planning request has been confirmed.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your bookings...
              </p>
            </>
          )}

          {!verifying && error && (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <XCircle className="w-16 h-16 text-red-500" />
                </motion.div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Payment Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <button
                onClick={() => router.push('/profile/bookings')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Bookings
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
