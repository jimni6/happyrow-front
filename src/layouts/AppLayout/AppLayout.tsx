import React from 'react';
import type { User, AuthRepository } from '@/features/auth';
import { AppHeader } from '@/layouts/AppHeader';
import './AppLayout.css';

interface AppLayoutProps {
  user: User;
  authRepository: AuthRepository;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  authRepository,
  children,
}) => {
  return (
    <div className="app">
      <AppHeader user={user} authRepository={authRepository} />
      <main className="app-main">{children}</main>
    </div>
  );
};
