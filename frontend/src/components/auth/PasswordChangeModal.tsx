"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface PasswordChangeModalProps {
  userEmail: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

type Step = 'otp-request' | 'otp-verify' | 'password-change' | 'success';

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  userEmail,
  onComplete,
  onError,
}) => {
  const [step, setStep] = useState<Step>('otp-request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp-verify' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/send-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTimeLeft(120); // 2 minutes
        setCanResend(false);
        setStep('otp-verify');
        setSuccess('OTP sent to your email address');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/verify-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          otp_code: otpCode 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setSessionToken(data.session_token);
        setStep('password-change');
        setSuccess('OTP verified successfully');
      } else {
        setError(data.message || 'Invalid OTP code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_token: sessionToken,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('success');
        setSuccess('Password changed successfully! Please login again.');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtpCode('');
    setError('');
    setSuccess('');
    handleSendOTP();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'otp-request':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-[#6096ba] rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#274c77] mb-2">
                Verify Your Email
              </h3>
              <p className="text-gray-600">
                We need to verify your email address before you can change your password.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Email: <span className="font-medium">{userEmail}</span>
              </p>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-[#6096ba] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#4a7ba7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        );

      case 'otp-verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#a3cef1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#274c77]" />
              </div>
              <h3 className="text-xl font-semibold text-[#274c77] mb-2">
                Enter Verification Code
              </h3>
              <p className="text-gray-600">
                We've sent a 6-digit code to your email address.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full p-4 border-2 border-[#a3cef1] rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#6096ba] focus:border-transparent"
                  maxLength={6}
                />
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>
              )}

              {canResend && (
                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-[#6096ba] hover:text-[#4a7ba7] font-medium disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-[#6096ba] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#4a7ba7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        );

      case 'password-change':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#274c77] mb-2">
                Create New Password
              </h3>
              <p className="text-gray-600">
                Please create a strong password for your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 border-2 border-[#a3cef1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6096ba] focus:border-transparent"
                />
                <PasswordStrengthIndicator password={newPassword} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-3 border-2 border-[#a3cef1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6096ba] focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-[#6096ba] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#4a7ba7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#274c77] mb-2">
                Password Changed Successfully!
              </h3>
              <p className="text-gray-600">
                Your password has been updated. You will be redirected to login.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#274c77] mb-2">
              Change Password Required
            </h2>
            <p className="text-gray-600">
              For security reasons, you must change your password before accessing the system.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Progress Indicator */}
          <div className="mt-8 flex justify-center space-x-2">
            {['otp-request', 'otp-verify', 'password-change', 'success'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full ${
                  step === stepName
                    ? 'bg-[#6096ba]'
                    : ['otp-request', 'otp-verify', 'password-change', 'success'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
