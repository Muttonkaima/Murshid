'use client';

import { useEffect } from 'react';

export default function DebugEnv() {
  useEffect(() => {
    console.log('Environment Variables:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV,
    });
  }, []);

  return null; // This component doesn't render anything
}
