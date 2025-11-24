import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { CryptoService } from '../utils/crypto/encryption';

interface User {
  id: string;
  email: string;
  security_settings: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  masterKey: string | null;
  temporaryMasterKey: string | null;
  login: (email: string, authKeyHash: string, masterPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  setTemporaryMasterKey: (key: string) => void;
  clearTemporaryMasterKey: () => void;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Memory security helper
class SecureMemory {
  private static keys: Map<string, string> = new Map();
  private static timeoutIds: Map<string, NodeJS.Timeout> = new Map();

  static store(key: string, value: string, ttl: number = 30 * 60 * 1000): void {
    this.keys.set(key, value);
    
    // Auto-clear after TTL
    const timeoutId = setTimeout(() => {
      this.clear(key);
    }, ttl);
    
    this.timeoutIds.set(key, timeoutId);
  }

  static get(key: string): string | null {
    return this.keys.get(key) || null;
  }

  static clear(key: string): void {
    const value = this.keys.get(key);
    if (value) {
      CryptoService.clearSensitiveData(value);
      this.keys.delete(key);
    }
    
    const timeoutId = this.timeoutIds.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(key);
    }
  }

  static clearAll(): void {
    this.keys.forEach((value, key) => {
      CryptoService.clearSensitiveData(value);
    });
    this.keys.clear();
    
    this.timeoutIds.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeoutIds.clear();
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const masterKeyRef = useRef<string | null>(null);
  const temporaryKeyRef = useRef<string | null>(null);

  // Secure state setters that also update refs
  const setMasterKey = (key: string | null) => {
    if (masterKeyRef.current) {
      CryptoService.clearSensitiveData(masterKeyRef.current);
    }
    masterKeyRef.current = key;
  };

  const setTemporaryMasterKey = (key: string) => {
    if (temporaryKeyRef.current) {
      CryptoService.clearSensitiveData(temporaryKeyRef.current);
    }
    temporaryKeyRef.current = key;
    // Store in secure memory with 30min TTL
    SecureMemory.store('temp_master_key', key, 30 * 60 * 1000);
  };

  const clearTemporaryMasterKey = () => {
    if (temporaryKeyRef.current) {
      CryptoService.clearSensitiveData(temporaryKeyRef.current);
      temporaryKeyRef.current = null;
    }
    SecureMemory.clear('temp_master_key');
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup on unmount
    return () => {
      secureCleanup();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const userInfo = await apiService.getCurrentUser();
          setUser(userInfo.user);
        } catch (error) {
          console.log('Token invalid, logging out...');
          await secureLogout();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await secureLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, authKeyHash: string, masterPassword: string) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.login({
        email,
        auth_key_hash: authKeyHash
      });

      setUser(response.user);
      setMasterKey(masterPassword);
      
      // Store only non-sensitive data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
    } catch (error: any) {
      // DON'T call secureLogout here - just rethrow the error
      // This prevents clearing auth state on login failure
      console.error('Login error in AuthContext:', error);
      throw error; // Re-throw the error so LoginForm can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const secureCleanup = () => {
    setMasterKey(null);
    clearTemporaryMasterKey();
    SecureMemory.clearAll();
  };

  const secureLogout = async () => {
    try {
      // Try to call logout API, but don't wait for it if it fails
      await apiService.logout();
    } catch (error) {
      console.log('Logout API call failed, continuing with local cleanup...');
    } finally {
      // Always perform local cleanup
      secureCleanup();
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_api_key');
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await secureLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    masterKey: masterKeyRef.current,
    temporaryMasterKey: temporaryKeyRef.current,
    login,
    logout,
    setTemporaryMasterKey,
    clearTemporaryMasterKey,
    isLoading,
    isLoggingOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};