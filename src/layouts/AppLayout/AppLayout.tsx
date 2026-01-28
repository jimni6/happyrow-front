import React from 'react';
import type { User, AuthRepository } from '@/features/auth';
import './AppLayout.css';

interface AppLayoutProps {
  user: User;
  authRepository: AuthRepository;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app">
      <main className="app-main">{children}</main>
    </div>
  );
};
