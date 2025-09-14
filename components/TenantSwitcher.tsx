'use client';

import { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';

interface TenantSwitcherProps {
  currentTenantId?: string;
  isCollapsed?: boolean;
  onTenantSwitch?: (tenantId: string) => void;
}

// CSS-in-JS styles
const styles = {
  // Loading state
  loadingContainer: {
    padding: '12px',
    borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingContainerCollapsed: {
    padding: '8px',
  },
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #06b6d4',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  
  // Error state
  errorContainer: {
    padding: '12px',
    borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorContainerCollapsed: {
    padding: '8px',
  },
  errorIcon: {
    width: '16px',
    height: '16px',
    color: '#ef4444',
  },
  errorText: {
    fontSize: '14px',
    color: '#dc2626',
  },
  
  // Collapsed state
  collapsedContainer: {
    padding: '8px',
    borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
  },
  collapsedButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    color: '#9ca3af',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '40px',
  },
  collapsedButtonHover: {
    color: '#06b6d4',
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  collapsedIcon: {
    width: '20px',
    height: '20px',
  },
  
  // Dropdown overlay for collapsed
  collapsedDropdown: {
    position: 'absolute' as const,
    left: '64px',
    top: '0',
    zIndex: 50,
    width: '256px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  collapsedDropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid #374151',
  },
  collapsedDropdownTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  
  // Main container (expanded)
  mainContainer: {
    padding: '12px',
    borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
    position: 'relative' as const,
  },
  
  // Main button (expanded)
  mainButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  mainButtonDark: {
    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    border: '1px solid #4b5563',
  },
  mainButtonHover: {
    borderColor: '#06b6d4',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  
  // Main button content
  mainButtonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '0',
    flex: '1',
  },
  tenantIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #06b6d4 0%, #1d4ed8 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tenantIconSvg: {
    width: '16px',
    height: '16px',
    color: '#ffffff',
  },
  tenantInfo: {
    minWidth: '0',
    flex: '1',
  },
  tenantName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  tenantNameDark: {
    color: '#ffffff',
  },
  tenantDescription: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  tenantDescriptionDark: {
    color: '#9ca3af',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
    transition: 'transform 0.2s ease',
  },
  chevronIconRotated: {
    transform: 'rotate(180deg)',
  },
  
  // Dropdown
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 50,
  },
  dropdownDark: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
  },
  dropdownHeader: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  dropdownHeaderDark: {
    borderBottom: '1px solid #374151',
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0',
  },
  dropdownTitleDark: {
    color: '#ffffff',
  },
  dropdownSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  dropdownSubtitleDark: {
    color: '#9ca3af',
  },
  
  // Tenant list
  tenantList: {
    maxHeight: '256px',
    overflowY: 'auto' as const,
  },
  emptyState: {
    padding: '12px',
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
  },
  emptyStateDark: {
    color: '#9ca3af',
  },
  
  // Tenant item
  tenantItem: {
    width: '100%',
    textAlign: 'left' as const,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'block',
  },
  tenantItemDark: {
    borderBottom: '1px solid #374151',
  },
  tenantItemLast: {
    borderBottom: 'none',
  },
  tenantItemHover: {
    backgroundColor: '#f9fafb',
  },
  tenantItemHoverDark: {
    backgroundColor: '#374151',
  },
  tenantItemActive: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
  },
  tenantItemActiveDark: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    color: '#06b6d4',
  },
  tenantItemContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tenantItemInfo: {
    minWidth: '0',
    flex: '1',
  },
  tenantItemName: {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0',
  },
  tenantItemNameDark: {
    color: '#e5e7eb',
  },
  tenantItemDesc: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  tenantItemDescDark: {
    color: '#9ca3af',
  },
  checkIcon: {
    width: '16px',
    height: '16px',
    color: '#10b981',
    flexShrink: 0,
    marginLeft: '8px',
  },
  checkIconDark: {
    color: '#06b6d4',
  },
  
  // Footer
  footer: {
    padding: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  footerDark: {
    borderTop: '1px solid #374151',
  },
  refreshButton: {
    width: '100%',
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  refreshButtonDark: {
    color: '#9ca3af',
  },
  refreshButtonHover: {
    color: '#374151',
  },
  refreshButtonHoverDark: {
    color: '#e5e7eb',
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
  const [hoveredTenant, setHoveredTenant] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    
    checkDarkMode();
    window.addEventListener('storage', checkDarkMode);
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      window.removeEventListener('storage', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  // Inject spinner keyframes
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = spinKeyframes;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

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
      <div style={{
        ...styles.loadingContainer,
        ...(isCollapsed ? styles.loadingContainerCollapsed : {}),
      }}>
        <div style={styles.loadingSpinner} />
        {!isCollapsed && (
          <span style={styles.loadingText}>Loading tenants...</span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...styles.errorContainer,
        ...(isCollapsed ? styles.errorContainerCollapsed : {}),
      }}>
        <svg style={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {!isCollapsed && (
          <span style={{
            ...styles.errorText,
            ...(isDarkMode ? { color: '#f87171' } : {}),
          }}>{error}</span>
        )}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div style={styles.collapsedContainer}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.collapsedButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.collapsedButton)}
          style={styles.collapsedButton}
          title={currentTenant ? `Current: ${currentTenant.name}` : 'Switch Tenant'}
        >
          <svg style={styles.collapsedIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </button>
        
        {isOpen && (
          <div style={styles.collapsedDropdown}>
            <div style={styles.collapsedDropdownHeader}>
              <h3 style={styles.collapsedDropdownTitle}>Switch Tenant</h3>
            </div>
            <div style={styles.tenantList}>
              {tenants.map((tenant, index) => (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSwitch(tenant.id)}
                  onMouseEnter={() => setHoveredTenant(tenant.id)}
                  onMouseLeave={() => setHoveredTenant(null)}
                  style={{
                    ...styles.tenantItem,
                    ...styles.tenantItemDark,
                    ...(index === tenants.length - 1 ? styles.tenantItemLast : {}),
                    ...(hoveredTenant === tenant.id ? styles.tenantItemHoverDark : {}),
                    ...(currentTenant?.id === tenant.id ? styles.tenantItemActiveDark : {}),
                  }}
                >
                  <div style={styles.tenantItemContent}>
                    <div style={styles.tenantItemInfo}>
                      <div style={{
                        ...styles.tenantItemName,
                        ...styles.tenantItemNameDark,
                        ...(currentTenant?.id === tenant.id ? { color: '#06b6d4' } : {}),
                      }}>
                        {tenant.name}
                      </div>
                      {tenant.description && (
                        <div style={{
                          ...styles.tenantItemDesc,
                          ...styles.tenantItemDescDark,
                        }}>
                          {truncateText(tenant.description, 40)}
                        </div>
                      )}
                    </div>
                    {currentTenant?.id === tenant.id && (
                      <svg style={styles.checkIconDark} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.mainContainer} ref={dropdownRef}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, {
            ...styles.mainButton,
            ...(isDarkMode ? styles.mainButtonDark : {}),
            ...styles.mainButtonHover,
          })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
            ...styles.mainButton,
            ...(isDarkMode ? styles.mainButtonDark : {}),
          })}
          style={{
            ...styles.mainButton,
            ...(isDarkMode ? styles.mainButtonDark : {}),
          }}
        >
          <div style={styles.mainButtonContent}>
            <div style={styles.tenantIcon}>
              <svg style={styles.tenantIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div style={styles.tenantInfo}>
              <div style={{
                ...styles.tenantName,
                ...(isDarkMode ? styles.tenantNameDark : {}),
              }}>
                {currentTenant ? currentTenant.name : 'Select Tenant'}
              </div>
              <div style={{
                ...styles.tenantDescription,
                ...(isDarkMode ? styles.tenantDescriptionDark : {}),
              }}>
                {currentTenant?.description || 'No tenant selected'}
              </div>
            </div>
          </div>
          <svg 
            style={{
              ...styles.chevronIcon,
              ...(isOpen ? styles.chevronIconRotated : {}),
            }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div style={{
            ...styles.dropdown,
            ...(isDarkMode ? styles.dropdownDark : {}),
          }}>
            <div style={{
              ...styles.dropdownHeader,
              ...(isDarkMode ? styles.dropdownHeaderDark : {}),
            }}>
              <h3 style={{
                ...styles.dropdownTitle,
                ...(isDarkMode ? styles.dropdownTitleDark : {}),
              }}>
                Switch Tenant
              </h3>
              <p style={{
                ...styles.dropdownSubtitle,
                ...(isDarkMode ? styles.dropdownSubtitleDark : {}),
              }}>
                Choose a tenant to switch to
              </p>
            </div>
            <div style={styles.tenantList}>
              {tenants.length === 0 ? (
                <div style={{
                  ...styles.emptyState,
                  ...(isDarkMode ? styles.emptyStateDark : {}),
                }}>
                  No tenants available
                </div>
              ) : (
                tenants.map((tenant, index) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSwitch(tenant.id)}
                    onMouseEnter={() => setHoveredTenant(tenant.id)}
                    onMouseLeave={() => setHoveredTenant(null)}
                    style={{
                      ...styles.tenantItem,
                      ...(isDarkMode ? styles.tenantItemDark : {}),
                      ...(index === tenants.length - 1 ? styles.tenantItemLast : {}),
                      ...(hoveredTenant === tenant.id ? 
                          (isDarkMode ? styles.tenantItemHoverDark : styles.tenantItemHover) : {}),
                      ...(currentTenant?.id === tenant.id ? 
                          (isDarkMode ? styles.tenantItemActiveDark : styles.tenantItemActive) : {}),
                    }}
                  >
                    <div style={styles.tenantItemContent}>
                      <div style={styles.tenantItemInfo}>
                        <div style={{
                          ...styles.tenantItemName,
                          ...(isDarkMode ? styles.tenantItemNameDark : {}),
                          ...(currentTenant?.id === tenant.id ? 
                              (isDarkMode ? { color: '#06b6d4' } : { color: '#059669' }) : {}),
                        }}>
                          {tenant.name}
                        </div>
                        {tenant.description && (
                          <div style={{
                            ...styles.tenantItemDesc,
                            ...(isDarkMode ? styles.tenantItemDescDark : {}),
                          }}>
                            {tenant.description}
                          </div>
                        )}
                      </div>
                      {currentTenant?.id === tenant.id && (
                        <svg style={{
                          ...styles.checkIcon,
                          ...(isDarkMode ? styles.checkIconDark : {}),
                        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div style={{
              ...styles.footer,
              ...(isDarkMode ? styles.footerDark : {}),
            }}>
              <button
                onClick={refreshTenants}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, 
                  isDarkMode ? styles.refreshButtonHoverDark : styles.refreshButtonHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                  ...styles.refreshButton,
                  ...(isDarkMode ? styles.refreshButtonDark : {}),
                })}
                style={{
                  ...styles.refreshButton,
                  ...(isDarkMode ? styles.refreshButtonDark : {}),
                }}
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