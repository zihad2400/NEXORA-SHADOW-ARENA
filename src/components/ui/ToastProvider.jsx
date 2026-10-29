'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        // Default styling (Dark Theme)
        style: {
          background: '#12182A', // bg-card
          color: '#F8FAFC',      // text-primary
          border: '1px solid rgba(148,163,184,0.15)', // border
          borderRadius: '1rem',
          padding: '16px 20px',
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-body), sans-serif',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#34D399', // success green
            secondary: '#12182A',
          },
          style: {
            border: '1px solid rgba(52,211,153,0.3)',
            boxShadow: '0 0 24px -4px rgba(52,211,153,0.15)',
          },
        },
        error: {
          iconTheme: {
            primary: '#FB7185', // error rose
            secondary: '#12182A',
          },
          style: {
            border: '1px solid rgba(251,113,133,0.3)',
            boxShadow: '0 0 24px -4px rgba(251,113,133,0.15)',
          },
        },
      }}
    />
  );
}
