'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/clients';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifyingCode, setIsVerifyingCode] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Wait a bit for middleware to establish session
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mounted) return;

      // Check if we have a session (middleware should have established it)
      const { data: { session }, error } = await supabase.auth.getSession();

      console.log('Checking session:', !!session, 'Error:', error);

      if (session) {
        console.log('Recovery session found');
        setCodeValid(true);
        setIsVerifyingCode(false);
      } else {
        // Listen for auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event, 'Session:', !!session);

          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            console.log('Password recovery session established via event');
            setCodeValid(true);
            setIsVerifyingCode(false);
          }
        });

        // Timeout after 3 seconds
        setTimeout(() => {
          if (mounted && !codeValid) {
            console.log('No session after timeout');
            setError('Invalid or expired reset link. Please request a new one.');
            setIsVerifyingCode(false);
          }
        }, 3000);

        return () => {
          subscription.unsubscribe();
        };
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [supabase, codeValid]);

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Update password using the session established from the code exchange
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast.error('Failed to reset password');
        setError('Failed to reset password. Please try again.');
        return;
      }

      toast.success('Password reset successfully!');
      setIsSuccess(true);

      // Sign out to clear the session
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('An error occurred. Please try again.');
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Back to Login Link */}
      <Link
        href="/auth/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Login</span>
      </Link>

      {/* Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border-2 border-border rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <img
                src="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_124,h_104,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png"
                alt="Godfirst Education and Tours"
                className="h-20 w-auto"
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              {isVerifyingCode ? "Verifying reset link..." : isSuccess ? "Your password has been reset!" : "Enter your new password"}
            </p>
          </div>

          {isVerifyingCode ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
              />
              <p className="text-muted-foreground">Verifying your reset link...</p>
            </div>
          ) : !codeValid ? (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
              >
                <p className="text-red-500 font-semibold mb-2">Invalid Reset Link</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </motion.div>
              <Link
                href="/auth/forgot-password"
                className="block w-full py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : !isSuccess ? (
            <>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Reset Password Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full pl-12 pr-12 py-3 bg-background border-2 ${
                        errors.password ? 'border-red-500' : 'border-border'
                      } rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full pl-12 pr-12 py-3 bg-background border-2 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-border'
                      } rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">Password must:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Be at least 8 characters long</li>
                    <li>Match the confirmation password</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <p className="text-green-500 font-semibold mb-2">Password Reset Successful!</p>
                <p className="text-sm text-muted-foreground">
                  You can now log in with your new password.
                </p>
              </motion.div>

              {/* Redirect Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          {!isSuccess && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-secondary font-bold transition-colors"
              >
                Back to Login
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
