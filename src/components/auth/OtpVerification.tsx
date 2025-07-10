
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OtpVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const OtpVerification = ({ email, onVerified, onBack }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOtp, resendOtp } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOtp(email, otp);
      
      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          toast.error('Invalid or expired code. Please try again.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Email verified successfully!');
        onVerified();
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await resendOtp(email);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification code sent to your email');
        setOtp('');
      }
    } catch (err) {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-gray-300">
          We've sent a 6-digit code to <span className="text-blue-400">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Verification Code
          </label>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 text-center text-lg tracking-widest"
            maxLength={6}
            autoFocus
          />
        </div>

        <Button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-gray-400 text-sm">Didn't receive the code?</p>
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={resending}
          className="text-blue-400 hover:text-blue-300"
        >
          {resending ? 'Resending...' : 'Resend Code'}
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full text-gray-400 hover:text-white"
      >
        ← Back to Sign Up
      </Button>
    </div>
  );
};
