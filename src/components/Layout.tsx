'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Button from '@/components/Button'

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function Layout({ children, showNavigation = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isFinancialContext = pathname?.startsWith('/financial');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && user && (
        <nav className="topnav">
          <div className="max-w-7xl mx-auto topnav__container">
            <div className="topnav__inner">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/choice')}
                  className="topnav__brand text-xl font-semibold cursor-pointer"
                >
                  多功能系统
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="topnav__group">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant={(pathname?.startsWith('/dashboard') || pathname === '/report') ? 'primary' : 'secondary'}
                    className="text-sm"
                  >
                    游泳打卡
                  </Button>
                  <Button
                    onClick={() => router.push('/financial')}
                    variant={pathname?.startsWith('/financial') ? 'primary' : 'secondary'}
                    className="text-sm"
                  >
                    记账系统
                  </Button>
                </div>
              </div>
              <div className="topnav__actions">
                <span className="text-sm text-gray-700">欢迎，{user.username}</span>
                <Button
                  onClick={() => router.push(isFinancialContext ? '/financial/report' : '/report')}
                  variant="ghost"
                  className="text-sm"
                >
                  报告
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="text-sm"
                >
                  注销
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}