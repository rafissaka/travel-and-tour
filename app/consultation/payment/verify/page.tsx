'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationPaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [consultationId, setConsultationId] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const id = searchParams.get('consultationId');

    if (!reference || !id) {
      setStatus('error');
      setMessage('Missing payment information. Please try again.');
      return;
    }

    setConsultationId(id);
    verifyPayment(reference, id);
  }, [searchParams]);

  const verifyPayment = async (reference: string, consultationId: string) => {
    try {
      const response = await fetch(
        `/api/consultation-bookings/payment/verify?reference=${reference}&consultationId=${consultationId}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Payment verified successfully! Your consultation request has been confirmed.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        {status === 'loading' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Verifying Payment...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your payment with Paystack.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6">
                <CheckCircle2 className="w-20 h-20 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                What happens next?
              </h2>
              <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Our team will contact you within 24 hours via phone or WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>We'll send you a detailed travel proposal tailored to your preferences</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/profile/bookings`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                View My Bookings
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Browse Services
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6">
                <XCircle className="w-20 h-20 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                Need Help?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you believe this is an error or if your payment was deducted, please contact our support team with your payment reference.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:support@godfirsteducation.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="https://wa.me/233123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Go Back
              </button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
