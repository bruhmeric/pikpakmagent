import React, { useState, useEffect, useRef } from 'react';

// This makes the grecaptcha object available from the script loaded in index.html
declare const grecaptcha: any;

interface LoginProps {
  onLogin: (credentials: { username: string; password: string; captchaToken: string; }) => Promise<void>;
}

// IMPORTANT: Replace with your Google reCAPTCHA v2 Site Key
const RECAPTCHA_SITE_KEY = '6LfyP-ErAAAAAPXtdD-LHK74QTeu-qip15iIoLXr';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderCaptcha = () => {
      if (captchaRef.current && typeof grecaptcha !== 'undefined') {
        grecaptcha.render(captchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: 'dark',
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
        });
      }
    };

    // Check if grecaptcha is ready, if not wait for it.
    if (typeof grecaptcha === 'undefined' || !grecaptcha.render) {
        const interval = setInterval(() => {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
                clearInterval(interval);
                renderCaptcha();
            }
        }, 100);
        return () => clearInterval(interval);
    } else {
        renderCaptcha();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && captchaToken) {
      setIsLoading(true);
      setError(null);
      try {
        await onLogin({ username: username.trim(), password: password.trim(), captchaToken });
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred during login.');
        }
        setIsLoading(false);
        // Reset captcha on failure
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
            setCaptchaToken(null);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
            PikPak Magnet Linker
          </h1>
          <p className="mt-4 text-gray-400">
            Please sign in with your PikPak account.
          </p>
        </header>
        <div className="bg-transparent border border-gray-800 shadow-xl shadow-black/20 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="w-full bg-black border border-gray-700 text-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                className="w-full bg-black border border-gray-700 text-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-center">
                <div ref={captchaRef}></div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim() || !captchaToken}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;