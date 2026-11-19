import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner';
  pgName: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  loginDemo: () => void;
  register: (name: string, email: string, pgName: string, phone: string, pass: string) => boolean;
  logout: () => void;
  forgotPassword: (email: string) => { success: boolean; message: string };
}

const AUTH_STORAGE_KEY = 'staysync_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default to logged-in demo owner for instant access or ready demo!
    return {
      id: 'owner-1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@staysync.in',
      role: 'owner',
      pgName: 'Sri Sai Balaji Executive PG & Co-Living',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, _pass: string) => {
    // In our local engine, accept owner email or demo credentials
    const authUser: AuthUser = {
      id: 'owner-1',
      name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 'Rajesh Kumar',
      email,
      role: 'owner',
      pgName: 'Sri Sai Balaji Executive PG & Co-Living',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
    setUser(authUser);
    return true;
  };

  const loginDemo = () => {
    const demoUser: AuthUser = {
      id: 'owner-1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@staysync.in',
      role: 'owner',
      pgName: 'Sri Sai Balaji Executive PG & Co-Living',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
    setUser(demoUser);
  };

  const register = (name: string, email: string, pgName: string, _phone: string, _pass: string) => {
    const newUser: AuthUser = {
      id: 'owner-' + Date.now(),
      name,
      email,
      role: 'owner',
      pgName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const forgotPassword = (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid registered email address.' };
    }
    return {
      success: true,
      message: `Password reset instructions sent to ${email}. (Demo: Use 'demo123' to sign in anytime).`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginDemo,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
