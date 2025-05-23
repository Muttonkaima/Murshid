'use client';

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onOtpChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function OtpInput({
  length = 6,
  onOtpChange,
  onComplete,
  disabled = false,
  className = '',
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value === '') {
      // Allow backspace
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onOtpChange?.(newOtp.join(''));
      return;
    }

    // Update current input
    const newOtp = [...otp];
    newOtp[index] = value[value.length - 1]; // Only take the last character
    setOtp(newOtp);
    
    const otpString = newOtp.join('');
    onOtpChange?.(otpString);

    // Move to next input or submit if complete
    if (index < length - 1 && value) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (otpString.length === length) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Move to previous input on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move left with arrow key
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Move right with arrow key
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key >= '0' && e.key <= '9' && index < length - 1 && otp[index]) {
      // Auto move to next on number input when current is filled
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
    
    if (pastedData) {
      const newOtp = [...otp];
      let i = 0;
      
      // Fill the OTP array with pasted data
      for (i = 0; i < Math.min(pastedData.length, length); i++) {
        newOtp[i] = pastedData[i];
      }
      
      setOtp(newOtp);
      const otpString = newOtp.join('');
      onOtpChange?.(otpString);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(i, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (otpString.length === length) {
        onComplete?.(otpString);
      }
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-16 text-2xl text-center rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all duration-200 text-gray-900 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          autoComplete="one-time-code"
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}
