'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const consultationId = searchParams.get('consultationId');
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // Security check: Ensure we have a valid consultation or booking ID
    if (!consultationId && !bookingId) {
      toast.error('Invalid payment request');
      router.push('/profile/bookings');
      return;
    }

    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    fetchPaymentDetails();
    fetchUserEmail();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [consultationId, bookingId]);

  const fetchUserEmail = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.user.email);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      let response;
      if (consultationId) {
        response = await fetch(`/api/consultation-bookings?id=${consultationId}`);
      } else if (bookingId) {
        response = await fetch(`/api/bookings?id=${bookingId}`);
      }

      if (response && response.ok) {
        const data = await response.json();

        // Verify payment is still pending
        if (data.paymentStatus !== 'PENDING') {
          toast.error('This payment has already been processed');
          router.push('/profile/bookings');
          return;
        }

        setPaymentDetails(data);

        // Get the correct amount from the database
        if (consultationId) {
          setAmount(Number(data.feeEstimate) || 0);
        } else if (bookingId) {
          setAmount(Number(data.totalAmount) || 0);
        }
      } else {
        toast.error('Payment details not found');
        router.push('/profile/bookings');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey || paystackKey === '' || paystackKey === 'pk_test_xxxx') {
      toast.error('Payment system not configured. Please contact support.');
      console.error('Paystack public key not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your .env.local file');
      return;
    }

    // Security check: Verify amount is valid
    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount. Please contact support.');
      return;
    }

    if (!userEmail) {
      toast.error('User email not found. Please try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: userEmail,
      amount: Math.round(Number(amount) * 100), // Convert to kobo (Paystack uses smallest currency unit)
      currency: 'GHS', // or 'NGN', 'USD', etc.
      ref: `${consultationId ? 'CONS' : 'BOOK'}-${Date.now()}`, // Generate unique reference
      metadata: {
        consultationId: consultationId || undefined,
        bookingId: bookingId || undefined,
        custom_fields: [
          {
            display_name: 'Payment Type',
            variable_name: 'payment_type',
            value: consultationId ? 'Consultation' : 'Booking',
          },
        ],
      },
      onClose: function() {
        toast.info('Payment window closed');
      },
      callback: function(response: any) {
        verifyPayment(response.reference);
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference: string) => {
    setProcessing(true);
    try {
      const endpoint = consultationId
        ? '/api/consultation-bookings/payment/verify'
        : '/api/bookings/payment/verify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          consultationId: consultationId || undefined,
          bookingId: bookingId || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Payment successful!');
        setTimeout(() => {
          if (consultationId) {
            router.push('/profile/bookings?tab=consultations');
          } else {
            router.push('/profile/bookings');
          }
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">
              Secure payment powered by Paystack
            </p>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
            <p className="text-sm opacity-90 mb-2">Amount to Pay</p>
            <p className="text-4xl font-bold">GHS {Number(amount).toFixed(2)}</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment For</p>
              <p className="text-lg font-semibold text-foreground">
                {consultationId
                  ? paymentDetails.service?.title || 'Consultation Service'
                  : paymentDetails.service?.title || paymentDetails.event?.title || 'Booking Service'}
              </p>
            </div>

            {consultationId && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Travelers</p>
                    <p className="font-medium text-foreground">{paymentDetails.travelerCount} Person(s)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Travel Dates</p>
                    <p className="font-medium text-foreground">
                      {new Date(paymentDetails.travelStartDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Amount verified from database</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure payment with Paystack</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Your payment information is encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processing || amount <= 0}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
        >
          {processing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              Pay GHS {Number(amount).toFixed(2)}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-semibold mb-1">Secure Payment</p>
              <p>Your payment is processed securely through Paystack. We do not store your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
