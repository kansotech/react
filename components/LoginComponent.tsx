'use client';

import React, { useState } from 'react';
import { FaGoogle, FaGithub, FaEnvelope, FaApple, FaFacebook, FaTwitter, FaLinkedin, FaDiscord } from 'react-icons/fa';

export interface LoginProvider {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  icon?: string;
  color: string;
  textColor: string;
}

interface LoginComponentProps {
  providers: LoginProvider[];
  tenantName?: string;
  previewMode?: boolean;
  onProviderClick?: (provider: LoginProvider) => void;
  className?: string;
}

export default function LoginComponent({ 
  providers, 
  tenantName = 'Auth Tower', 
  previewMode = false, 
  onProviderClick,
  className = ''
}: LoginComponentProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Separate email provider from other providers
  const regularProviders = providers.filter(p => p.enabled && p.provider !== 'email');
  const hasEmailProvider = providers.some(p => p.enabled && p.provider === 'email');

  const handleProviderClick = (provider: LoginProvider) => {
    if (onProviderClick) {
      onProviderClick(provider);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode) {
      console.log('Preview mode: Email OTP would be sent to', email);
      return;
    }
    setLoading(true);
    // Handle actual email submission
    setTimeout(() => setLoading(false), 2000);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <FaGoogle className="w-5 h-5" />;
      case 'github':
        return <FaGithub className="w-5 h-5" />;
      case 'microsoft':
        return <FaEnvelope className="w-5 h-5" />; // Using envelope as placeholder
      case 'facebook':
        return <FaFacebook className="w-5 h-5" />;
      case 'twitter':
        return <FaTwitter className="w-5 h-5" />;
      case 'linkedin':
        return <FaLinkedin className="w-5 h-5" />;
      case 'apple':
        return <FaApple className="w-5 h-5" />;
      case 'discord':
        return <FaDiscord className="w-5 h-5" />;
      default:
        return <FaEnvelope className="w-5 h-5" />;
    }
  };

  const isValidEmail = email.includes("@") && email.includes(".");

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Log in to your account
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Connect to {tenantName} with:
          </p>
        </div>

        {/* Social Providers */}
        {regularProviders.length > 0 && (
          <div className="space-y-3 mb-8">
            <div className={`grid ${regularProviders.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {regularProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderClick(provider)}
                  className="flex items-center justify-center gap-3 py-4 px-4 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 border border-gray-300/50 dark:border-gray-600/50 hover:border-gray-400 dark:hover:border-gray-500 group cursor-pointer shadow-md hover:shadow-lg"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200 text-gray-700 dark:text-gray-300">
                    {getProviderIcon(provider.provider)}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider - only show if we have both regular providers and email */}
        {regularProviders.length > 0 && hasEmailProvider && (
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">OR LOG IN WITH OTP</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          </div>
        )}

        {/* Email Login - only show if email provider is enabled */}
        {hasEmailProvider && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium mb-3">
                <FaEnvelope className="w-4 h-4" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter your email address"
                  className={`w-full p-4 rounded-lg bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                    focused 
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  required
                />
                {email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidEmail ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidEmail}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                loading || !isValidEmail
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <FaEnvelope className="w-4 h-4" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          This will create an account if you don&apos;t have one yet.
        </div>

        {/* Preview Mode Indicator */}
        {previewMode && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-700">
              <span>👁️</span>
              <span>Preview Mode</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}