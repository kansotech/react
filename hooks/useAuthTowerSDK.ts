import { useState, useEffect, useRef } from 'react';
import { AuthTowerSDK } from "@auth-tower/sdk";

interface UseAuthTowerSDKOptions {
  baseURL?: string;
  tenantId?: string;
}

interface UseAuthTowerSDKReturn {
  sdk: AuthTowerSDK | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuthTowerSDK(options?: UseAuthTowerSDKOptions): UseAuthTowerSDKReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sdkRef = useRef<AuthTowerSDK | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeSDK() {
      try {
        setIsLoading(true);
        setError(null);

        // Create SDK instance if it doesn't exist
        if (!sdkRef.current) {
          // Handle environment variables for both browser and Node.js environments
          const getEnvVar = (key: string, fallback: string = "") => {
            // Browser environment (Next.js or React with env variables)
            if (typeof window !== 'undefined') {
              return (window as any)[key] || fallback;
            }
            // Node.js environment
            if (typeof process !== 'undefined' && process.env) {
              return process.env[key] || fallback;
            }
            return fallback;
          };

          sdkRef.current = new AuthTowerSDK({
            baseURL: options?.baseURL || getEnvVar('NEXT_PUBLIC_AUTH_TOWER_URL', "https://www.api.auth-tower.com"),
            tenantId: options?.tenantId || getEnvVar('NEXT_PUBLIC_AUTH_TOWER_TENANT_ID', ""),
          });
        }

        // Initialize the client (only in browser)
        if (typeof window !== 'undefined') {
          await sdkRef.current.initializeClient();
        }

        if (isMounted) {
          setIsReady(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize SDK');
          setIsLoading(false);
        }
      }
    }

    initializeSDK();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [options?.baseURL, options?.tenantId]);

  return {
    sdk: sdkRef.current,
    isReady,
    isLoading,
    error,
  };
}