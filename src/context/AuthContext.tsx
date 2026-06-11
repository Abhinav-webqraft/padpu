import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  role: Role;
  login: (r: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(() => {
    return localStorage.getItem('userRole') as Role;
  });

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('userRole', newRole);
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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
