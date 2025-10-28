import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// FIX: Import the initialized auth instance and the firebase namespace from the central config file.
import { auth, firebase } from '../firebaseConfig';

interface AuthContextType {
  // FIX: Use the imported firebase namespace to correctly resolve the User type.
  // FIX: Changed firebase.auth.User to firebase.User. The User type is located on the top-level firebase namespace with the compat library.
  // Fix: Corrected the Firebase User type. The User type is on the top-level firebase namespace with the compat library.
  user: firebase.User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // FIX: Use the imported firebase namespace to correctly resolve the User type.
  // FIX: Changed firebase.auth.User to firebase.User. The User type is located on the top-level firebase namespace with the compat library.
  // Fix: Corrected the Firebase User type. The User type is on the top-level firebase namespace with the compat library.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth não foi inicializado. Verifique sua configuração.");
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth não está disponível.");
    return auth.signInWithEmailAndPassword(email, pass);
  };

  const logout = () => {
    if (!auth) throw new Error("Firebase Auth não está disponível.");
    return auth.signOut();
  };

  const value = { user, loading, login, logout };

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