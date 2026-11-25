import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { resetHeroSession } from '../utils/heroSession';

type Role = 'admin' | 'user' | null;

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phonenumber: string | null;
  location: string | null;
  avatar?: string | null;
  role: Role;
  created_at?: string;
}

export interface GoogleAuthResult {
  requiresLink?: boolean;
  requiresPhone?: boolean;
  email?: string;
  name?: string;
  role?: Role;
  message?: string;
}

interface AuthContextType {
  role: Role;
  user: UserProfile | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<Role>;
  loginWithToken: (token: string, role?: Role, user?: UserProfile) => void;
  googleAuth: (credential: string) => Promise<GoogleAuthResult>;
  linkGoogleAccount: (credential: string, password: string) => Promise<Role>;
  register: (name: string, phonenumber: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (r: unknown): Role => {
  if (typeof r !== 'string') return null;
  const lower = r.trim().toLowerCase();
  return lower === 'admin' || lower === 'user' ? (lower as Role) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<Role>(() =>
    localStorage.getItem('token') ? normalizeRole(localStorage.getItem('userRole')) : null
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const HERO_INTRO_SEEN_KEY = 'padpuHeroIntroSeen';

  // Fetch profile when token changes
  useEffect(() => {
    if (!token) {
      setRole(null);
      setUser(null);
      localStorage.removeItem('userRole');
      return;
    }

    fetch('http://localhost:5000/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    })
    .then(data => {
      const cleanRole = normalizeRole(data.role) || 'user';
      setUser({ ...data, role: cleanRole });
      setRole(cleanRole);
      localStorage.setItem('userRole', cleanRole);
    })
    .catch(err => {
      console.error(err);
      logout();
    });
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    const cleanRole = normalizeRole(data.role) || 'user';
    setToken(data.token);
    setRole(cleanRole);
    if (data.user) setUser({ ...data.user, role: cleanRole });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', cleanRole);
    resetHeroSession();
    return cleanRole;
  };

  const googleAuth = async (credential: string): Promise<GoogleAuthResult> => {
    const res = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google authentication failed');

    if (data.requiresLink) {
      return {
        requiresLink: true,
        email: data.email,
        name: data.name,
        message: data.message
      };
    }

    const cleanRole = normalizeRole(data.role) || 'user';
    setToken(data.token);
    setRole(cleanRole);
    if (data.user) setUser({ ...data.user, role: cleanRole });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', cleanRole);
    resetHeroSession();

    return {
      requiresPhone: data.requiresPhone,
      role: cleanRole,
      email: data.user?.email,
      name: data.user?.name
    };
  };

  const linkGoogleAccount = async (credential: string, password: string): Promise<Role> => {
    const res = await fetch('http://localhost:5000/api/auth/google/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Account linking failed');

    const cleanRole = normalizeRole(data.role) || 'user';
    setToken(data.token);
    setRole(cleanRole);
    if (data.user) setUser({ ...data.user, role: cleanRole });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', cleanRole);
    resetHeroSession();
    return cleanRole;
  };

  const loginWithToken = (newToken: string, newRole: Role = 'user', newUser?: UserProfile) => {
    const cleanRole = normalizeRole(newRole) || 'user';
    setToken(newToken);
    setRole(cleanRole);
    if (newUser) setUser({ ...newUser, role: cleanRole });
    localStorage.setItem('token', newToken);
    if (cleanRole) localStorage.setItem('userRole', cleanRole);
    resetHeroSession();
  };

  const register = async (name: string, phonenumber: string, email: string, password: string) => {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phonenumber, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
  };

  const updateProfile = async (updateData: Partial<UserProfile> & { password?: string }) => {
    const res = await fetch('http://localhost:5000/api/user/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');
    
    setUser(data);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem(HERO_INTRO_SEEN_KEY);
    resetHeroSession();
  };

  return (
    <AuthContext.Provider value={{
      role,
      user,
      token,
      login,
      loginWithToken,
      googleAuth,
      linkGoogleAccount,
      register,
      updateProfile,
      logout
    }}>
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
