// AuthInitializer.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { initializeAuth } from '@/utils/api';

type AuthInitializerProps = {
  children: React.ReactNode;
};

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { logout } = useAuth();

  useEffect(() => {
    initializeAuth(logout);
  }, [logout]);

  return <>{children}</>;
};

export default AuthInitializer;
