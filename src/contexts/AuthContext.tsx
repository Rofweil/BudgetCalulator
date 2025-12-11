import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedInUser');
    if (loggedUser && loggedUser !== 'null' && loggedUser !== 'undefined') {
      setUser(loggedUser);
    }
  }, []);

  const login = (username: string) => {
    localStorage.setItem('loggedInUser', username);
    setUser(username);
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
