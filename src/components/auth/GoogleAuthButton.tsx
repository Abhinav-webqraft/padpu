import { useEffect, useRef, useState } from 'react';

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
            }
          ) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  useEffect(() => {
    // Check if script is loaded
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGsi()) return;

    const interval = setInterval(() => {
      if (checkGsi()) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isGsiLoaded || !clientId || !containerRef.current) return;

    try {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else {
            onError('Google did not return a credential.');
          }
        },
      });

      // Render official Google button inside our container
      containerRef.current.innerHTML = '';
      window.google?.accounts.id.renderButton(containerRef.current, {
        theme: 'filled_black',
        size: 'large',
        text,
        shape: 'pill',
        width: 320,
      });
    } catch (err: any) {
      console.error('Error rendering Google button:', err);
    }
  }, [isGsiLoaded, clientId, text, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (!clientId) {
      onError('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError('Google Identity Services is still loading. Please check your internet connection.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden/rendered official GIS button container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      />

      {/* Fallback button if GIS button container is empty or pending */}
      {(!clientId || !isGsiLoaded) && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
