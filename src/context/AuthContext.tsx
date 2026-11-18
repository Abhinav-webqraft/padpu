import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<Role>(localStorage.getItem('userRole') as Role);
  const [user, setUser] = useState<UserProfile | null>(null);
  const HERO_INTRO_SEEN_KEY = 'padpuHeroIntroSeen';

  // Fetch profile when token changes
  useEffect(() => {
    if (token) {
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
        setUser(data);
        setRole(data.role);
        localStorage.setItem('userRole', data.role);
      })
      .catch(err => {
        console.error(err);
        logout();
      });
    }
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('http://localhost:5000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setToken(data.token);
    setRole(data.role);
    if (data.user) setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.role);
    return data.role;
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

    setToken(data.token);
    setRole(data.role);
    if (data.user) setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.role);

    return {
      requiresPhone: data.requiresPhone,
      role: data.role,
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

    setToken(data.token);
    setRole(data.role);
    if (data.user) setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.role);
    return data.role;
  };

  const loginWithToken = (newToken: string, newRole: Role = 'user', newUser?: UserProfile) => {
    setToken(newToken);
    setRole(newRole);
    if (newUser) setUser(newUser);
    localStorage.setItem('token', newToken);
    if (newRole) localStorage.setItem('userRole', newRole);
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
