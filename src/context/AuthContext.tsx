import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'admin' | 'user' | null;

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  location: string | null;
  role: Role;
  created_at?: string;
}

interface AuthContextType {
  role: Role;
  user: UserProfile | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<Role>;
  register: (name: string, phonenumber: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<Role>(localStorage.getItem('userRole') as Role);
  const [user, setUser] = useState<UserProfile | null>(null);

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
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', data.role);
    return data.role;
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
  };

  return (
    <AuthContext.Provider value={{ role, user, token, login, register, updateProfile, logout }}>
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
