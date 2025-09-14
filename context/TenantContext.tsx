'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantContext as SDKTenantContext, TenantResponse, AuthTowerSDK } from '@auth-tower/sdk';
import { useAuthTowerSDK } from '../hooks/useAuthTowerSDK';

interface TenantContextType {
  // SDK instance and state
  sdk: AuthTowerSDK | null;
  sdkReady: boolean;
  sdkLoading: boolean;
  sdkError: string | null;
  
  // Tenant-specific state
  currentTenant: SDKTenantContext | null;
  tenants: TenantResponse[];
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
  has: (permission: string) => boolean;
  
  // Subscription utilities
  hasFeature: (featureName: string) => boolean;
  canAddMore: (resourceType: string) => boolean;
  getUsage: (resourceType?: string) => any;
  getConstraints: (featureName?: string) => any;
  getSubscriptionId: () => string | undefined;
  getSubscriptionClassId: () => string | undefined;
  getCurrentUsage: (resourceType: string) => number;
  getLimit: (resourceType: string) => number | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  initialTenantId?: string;
}

export function TenantProvider({ children, initialTenantId }: TenantProviderProps) {
  // Initialize SDK using the hook
  const { sdk, isReady: sdkReady, isLoading: sdkLoading, error: sdkError } = useAuthTowerSDK({
    tenantId: initialTenantId || undefined,
    baseURL: "https://www.api.auth-tower.com",
  });

  const [currentTenant, setCurrentTenant] = useState<SDKTenantContext | null>(null);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and fetch tenants on mount, but only when SDK is ready
  useEffect(() => {
    if (sdkReady && sdk) {
      refreshTenants();
    }
  }, [sdkReady, sdk]);

  // Set initial tenant when tenants are loaded
  useEffect(() => {
    if (initialTenantId && tenants.length > 0 && !currentTenant && sdk) {
      switchTenant(initialTenantId).catch(console.error);
    }
  }, [initialTenantId, tenants, currentTenant, sdk]);

  const refreshTenants = async (): Promise<void> => {
    if (!sdk) {
      setError('SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await sdk.getTenants();
      setTenants(response.data || []);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setError('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string): Promise<void> => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    try {
      setError(null);
      
      // Use SDK to switch tenant
      await sdk.switchTenant(tenantId);
      
      // Fetch complete tenant context with permissions and roles
      const tenantContext = await sdk.getTenant(tenantId);
      setCurrentTenant(tenantContext);
      
    } catch (err) {
      console.error('Failed to switch tenant:', err);
      setError('Failed to switch tenant');
      throw err; // Re-throw to allow components to handle the error
    }
  };

  /**
   * Check if the current user has a specific permission for the current tenant
   * @param permission - The permission to check (e.g., "user:read", "role:create")
   * @returns boolean - true if user has the permission, false otherwise
   */
  const has = (permission: string): boolean => {
    if (!currentTenant || !currentTenant.role || !currentTenant.role.permissions) {
      console.warn('No current tenant or role permissions available for permission check');
      return false;
    }

    // Check if the permission exists in the current tenant's role permissions
    return currentTenant.role.permissions.some(p => p.name === permission);
  };

  /**
   * Check if a feature is available based on subscription constraints
   * @param featureName - The name of the feature to check
   * @returns boolean - true if feature is available, false otherwise
   */
  const hasFeature = (featureName: string): boolean => {
    if (!currentTenant || !currentTenant.constraints) {
      return false;
    }

    const constraint = currentTenant.constraints[featureName];
    if (constraint === undefined) {
      return false;
    }

    // If constraint is boolean, return directly
    if (typeof constraint === 'boolean') {
      return constraint;
    }

    // If constraint is an object with enabled property
    if (typeof constraint === 'object' && constraint !== null) {
      return constraint.enabled === true;
    }

    return false;
  };

  /**
   * Check if more items of a resource type can be added based on current usage and limits
   * @param resourceType - The type of resource (e.g., "users", "roles", "permissions")
   * @returns boolean - true if more can be added, false otherwise
   */
  const canAddMore = (resourceType: string): boolean => {
    if (!currentTenant || !currentTenant.usage || !currentTenant.constraints) {
      return false;
    }

    const currentUsage = getCurrentUsage(resourceType);
    const limit = getLimit(resourceType);

    // If no limit is set, assume unlimited
    if (limit === null) {
      return true;
    }

    return currentUsage < limit;
  };

  /**
   * Get usage data for a specific resource type or all usage data
   * @param resourceType - Optional: specific resource type to get usage for
   * @returns usage data - number for specific resource, object for all usage
   */
  const getUsage = (resourceType?: string): any => {
    if (!currentTenant || !currentTenant.usage) {
      return resourceType ? 0 : {};
    }

    if (resourceType) {
      return currentTenant.usage[resourceType] || 0;
    }

    return currentTenant.usage;
  };

  /**
   * Get constraint data for a specific feature or all constraints
   * @param featureName - Optional: specific feature to get constraints for
   * @returns constraint data - any for specific feature, object for all constraints
   */
  const getConstraints = (featureName?: string): any => {
    if (!currentTenant || !currentTenant.constraints) {
      return featureName ? null : {};
    }

    if (featureName) {
      return currentTenant.constraints[featureName] || null;
    }

    return currentTenant.constraints;
  };

  /**
   * Get the current subscription ID
   * @returns string | undefined - subscription ID if available
   */
  const getSubscriptionId = (): string | undefined => {
    return currentTenant?.subscription_id;
  };

  /**
   * Get the current subscription class ID
   * @returns string | undefined - subscription class ID if available
   */
  const getSubscriptionClassId = (): string | undefined => {
    return currentTenant?.subscription_class_id;
  };

  /**
   * Get current usage count for a specific resource type
   * @param resourceType - The type of resource
   * @returns number - current usage count
   */
  const getCurrentUsage = (resourceType: string): number => {
    if (!currentTenant || !currentTenant.usage) {
      return 0;
    }

    const usage = currentTenant.usage[resourceType];
    return typeof usage === 'number' ? usage : 0;
  };

  /**
   * Get the limit for a specific resource type from constraints
   * @param resourceType - The type of resource
   * @returns number | null - limit if set, null if unlimited
   */
  const getLimit = (resourceType: string): number | null => {
    if (!currentTenant || !currentTenant.constraints) {
      return null;
    }

    const constraint = currentTenant.constraints[resourceType];
    
    if (typeof constraint === 'number') {
      return constraint;
    }

    if (typeof constraint === 'object' && constraint !== null) {
      if (typeof constraint.limit === 'number') {
        return constraint.limit;
      }
      if (typeof constraint.max === 'number') {
        return constraint.max;
      }
    }

    return null;
  };

  const contextValue: TenantContextType = {
    // SDK state
    sdk,
    sdkReady,
    sdkLoading,
    sdkError,
    
    // Tenant state
    currentTenant,
    tenants,
    isLoading,
    error,
    switchTenant,
    refreshTenants,
    has,
    hasFeature,
    canAddMore,
    getUsage,
    getConstraints,
    getSubscriptionId,
    getSubscriptionClassId,
    getCurrentUsage,
    getLimit,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export default TenantContext;