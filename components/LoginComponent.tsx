'use client';

import React, { useEffect, useState } from 'react';
import { FaGoogle, FaGithub, FaEnvelope, FaApple, FaFacebook, FaTwitter, FaLinkedin, FaDiscord } from 'react-icons/fa';
import { useTenant } from '../context/TenantContext';

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
  tenantName?: string;
  onProviderClick?: (provider: LoginProvider) => void;
  redirectURI?: string;
  className?: string;
}

// CSS-in-JS styles
const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: 'rgba(31, 41, 55, 0.95)', // dark gray with transparency
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(75, 85, 99, 0.3)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: '18px',
    marginBottom: '16px',
    fontWeight: '500',
  },
  description: {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  emailForm: {
    marginBottom: '24px',
  },
  emailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: '12px',
  },
  emailInputContainer: {
    position: 'relative' as const,
    marginBottom: '20px',
  },
  emailInput: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    border: '2px solid #4b5563',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    backdropFilter: 'blur(8px)',
  },
  emailInputFocused: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    boxShadow: '0 0 0 4px rgba(6, 182, 212, 0.1)',
  },
  validationIcon: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validIcon: {
    backgroundColor: '#10b981',
  },
  invalidIcon: {
    backgroundColor: '#ef4444',
  },
  emailButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #0891b2 0%, #1d4ed8 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px 0 rgba(8, 145, 178, 0.4)',
  },
  emailButtonHover: {
    background: 'linear-gradient(135deg, #0e7490 0%, #1e40af 100%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px 0 rgba(8, 145, 178, 0.5)',
  },
  emailButtonDisabled: {
    background: '#4b5563',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '32px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, #4b5563 50%, transparent 100%)',
  },
  dividerText: {
    margin: '0 16px',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  providersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
  },
  providerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(75, 85, 99, 0.5)',
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  providerButtonHover: {
    backgroundColor: 'rgba(75, 85, 99, 0.8)',
    borderColor: '#6b7280',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.2)',
  },
  providerIcon: {
    fontSize: '20px',
  },
  providerName: {
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center' as const,
    lineHeight: '1.2',
  },
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  previewBadge: {
    marginTop: '16px',
    textAlign: 'center' as const,
  },
  previewBadgeInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    color: '#f59e0b',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid rgba(217, 119, 6, 0.3)',
  },
};

// Add keyframes for spinner animation
const spinKeyframes = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function LoginComponent({
  tenantName = 'Auth Tower',
  redirectURI,
  onProviderClick,
}: LoginComponentProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const [emailButtonHovered, setEmailButtonHovered] = useState(false);
  const { sdk, sdkReady} = useTenant();
  const [providers, setProviders] = useState<LoginProvider[]>([]);

    
  useEffect(() => {
    if (!sdkReady || !sdk) return;

    async function fetchProviders() {
      if (!sdk) return;
      
      const tenantID = sdk.config.tenantId;
      console.log('Current Tenant ID:', tenantID);
      try {
        const response = await sdk.idProviderClient.getActiveProviders(tenantID || undefined);

        // Convert API methods to LoginProvider format
        const formattedProviders: LoginProvider[] = response.providers.map((provider) => ({
          id: provider.id,
          name: getProviderDisplayName(provider.provider),
          provider: provider.provider,
          enabled: true,
          color: getProviderColor(provider.provider),
          textColor: getProviderTextColor(provider.provider),
        }));

        setProviders(formattedProviders);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [sdkReady, sdk]);

  const handleProviderClick = async (provider: LoginProvider) => {
    if (!sdk) return;
    
    try {
      const resp = await sdk.auth.initiateAuth({ 
        provider: provider.provider, 
        redirect_uri: redirectURI ?? ''
      });
      window.location.href = resp.auth_url;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  // Separate email provider from other providers
  const regularProviders = providers.filter(p => p.enabled && p.provider !== 'email');
  const hasEmailProvider = providers.some(p => p.enabled && p.provider === 'email');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find email provider and trigger click
    const emailProvider = providers.find(p => p.provider === 'email');
    if (emailProvider && onProviderClick) {
      onProviderClick({ ...emailProvider, id: email });
    }

    // Reset loading state after a delay (in real implementation, this would be handled by the parent)
    setTimeout(() => setLoading(false), 2000);
  };

  const getProviderIcon = (provider: LoginProvider) => {
    const iconStyle = {
      ...styles.providerIcon,
      color: provider.color || '#ffffff',
    };

    switch (provider.provider.toLowerCase()) {
      case 'google':
        return <FaGoogle style={iconStyle} />;
      case 'github':
        return <FaGithub style={iconStyle} />;
      case 'apple':
        return <FaApple style={iconStyle} />;
      case 'facebook':
        return <FaFacebook style={iconStyle} />;
      case 'twitter':
        return <FaTwitter style={iconStyle} />;
      case 'linkedin':
        return <FaLinkedin style={iconStyle} />;
      case 'discord':
        return <FaDiscord style={iconStyle} />;
      case 'email':
        return <FaEnvelope style={iconStyle} />;
      default:
        return <div style={{ ...iconStyle, fontSize: '16px' }}>{provider.provider.charAt(0).toUpperCase()}</div>;
    }
  };

  const isValidEmail = email.includes("@") && email.includes(".");

  // Inject spinner keyframes
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = spinKeyframes;
    document.head.appendChild(styleSheet);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Log in to your account</h1>
        <div style={styles.subtitle}>Connect to {tenantName} with:</div>
        <div style={styles.description}>This will create an account if you don't have one yet.</div>
      </div>

      {regularProviders.length > 0 && (
        <>
          <div style={styles.providersGrid}>
            {regularProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderClick(provider)}
                onMouseEnter={() => setHoveredProvider(provider.id)}
                onMouseLeave={() => setHoveredProvider(null)}
                style={{
                  ...styles.providerButton,
                  backgroundColor: provider.color || styles.providerButton.backgroundColor,
                  ...(hoveredProvider === provider.id ? styles.providerButtonHover : {}),
                }}
              >
                {getProviderIcon(provider)}
                <span
                  style={{
                    ...styles.providerName,
                    color: provider.textColor || '#ffffff',
                  }}
                >
                  {provider.name}
                </span>
              </button>
            ))}
          </div>

          {hasEmailProvider && (
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>OR LOG IN WITH OTP</span>
              <div style={styles.dividerLine} />
            </div>
          )}
        </>
      )}

      {hasEmailProvider && (
        <form style={styles.emailForm} onSubmit={handleEmailSubmit}>
          <label style={styles.emailLabel} htmlFor="email">
            <FaEnvelope />
            Email
          </label>
          <div style={styles.emailInputContainer}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter your email address"
              required
              style={{
                ...styles.emailInput,
                ...(focused ? styles.emailInputFocused : {}),
              }}
            />
            {email && (
              <div style={{
                ...styles.validationIcon,
                ...(isValidEmail ? styles.validIcon : styles.invalidIcon),
              }}>
                <svg
                  style={{ width: '12px', height: '12px', color: '#ffffff' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {isValidEmail ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !isValidEmail}
            onMouseEnter={() => setEmailButtonHovered(true)}
            onMouseLeave={() => setEmailButtonHovered(false)}
            style={{
              ...styles.emailButton,
              ...(emailButtonHovered && !loading && isValidEmail ? styles.emailButtonHover : {}),
              ...(loading || !isValidEmail ? styles.emailButtonDisabled : {}),
            }}
          >
            {loading ? (
              <>
                <div style={styles.loadingSpinner} />
                Sending OTP...
              </>
            ) : (
              <>
                <FaEnvelope />
                Send OTP
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
function getProviderDisplayName(authMethod: string): string {
  switch (authMethod.toLowerCase()) {
    case 'google':
      return 'Google';
    case 'github':
      return 'GitHub';
    case 'microsoft':
      return 'Microsoft';
    case 'facebook':
      return 'Facebook';
    case 'twitter':
      return 'Twitter';
    case 'linkedin':
      return 'LinkedIn';
    case 'apple':
      return 'Apple';
    case 'discord':
      return 'Discord';
    case 'email':
      return 'Email OTP';
    default:
      return authMethod;
  }
}

function getProviderColor(authMethod: string): string {
  switch (authMethod.toLowerCase()) {
    case 'google':
      return 'bg-white border-gray-300';
    case 'github':
      return 'bg-gray-900';
    case 'microsoft':
      return 'bg-blue-600';
    case 'facebook':
      return 'bg-blue-600';
    case 'twitter':
      return 'bg-sky-500';
    case 'linkedin':
      return 'bg-blue-700';
    case 'apple':
      return 'bg-black';
    case 'discord':
      return 'bg-indigo-600';
    case 'email':
      return 'bg-cyan-600';
    default:
      return 'bg-gray-600';
  }
}

function getProviderTextColor(authMethod: string): string {
  switch (authMethod.toLowerCase()) {
    case 'google':
      return 'text-gray-700';
    default:
      return 'text-white';
  }
}