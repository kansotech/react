'use client';

import { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';

interface TenantSwitcherProps {
  currentTenantId?: string;
  isCollapsed?: boolean;
  onTenantSwitch?: (tenantId: string) => void;
}

export default function TenantSwitcher({ 
  isCollapsed = false, 
  onTenantSwitch 
}: TenantSwitcherProps) {
  const { 
    currentTenant, 
    tenants, 
    isLoading, 
    error, 
    switchTenant, 
    refreshTenants 
  } = useTenant();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTenantSwitch = async (tenantId: string) => {
    try {
      await switchTenant(tenantId);
      setIsOpen(false);
      onTenantSwitch?.(tenantId);
    } catch (err) {
      // Error is handled in the context
      console.error('Tenant switch failed:', err);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className={`p-3 border-b border-gray-200/50 dark:border-gray-700/50 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
          {!isCollapsed && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading tenants...</span>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-3 border-b border-gray-200/50 dark:border-gray-700/50 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {!isCollapsed && (
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          )}
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="p-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
          title={currentTenant ? `Current: ${currentTenant.name}` : 'Switch Tenant'}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute left-16 top-0 z-50 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Switch Tenant</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSwitch(tenant.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 ${
                    currentTenant?.id === tenant.id
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium">{tenant.name}</div>
                  {tenant.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {truncateText(tenant.description, 40)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentTenant ? currentTenant.name : 'Select Tenant'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentTenant?.description || 'No tenant selected'}
              </div>
            </div>
          </div>
          <svg 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Switch Tenant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose a tenant to switch to
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {tenants.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No tenants available
                </div>
              ) : (
                tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSwitch(tenant.id)}
                    className={`w-full text-left px-3 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      currentTenant?.id === tenant.id
                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{tenant.name}</div>
                        {tenant.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {tenant.description}
                          </div>
                        )}
                      </div>
                      {currentTenant?.id === tenant.id && (
                        <svg className="h-4 w-4 text-cyan-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={refreshTenants}
                className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1 transition-colors duration-200"
              >
                Refresh Tenants
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}