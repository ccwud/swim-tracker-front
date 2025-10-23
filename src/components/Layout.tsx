'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function Layout({ children, showNavigation = false }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && user && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/choice')}
                  className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                >
                  多功能系统
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">欢迎，{user.username}</span>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  游泳打卡
                </button>
                <button
                  onClick={() => router.push('/financial')}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  记账系统
                </button>
                <button
                  onClick={() => router.push('/report')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  报告
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  注销
                </button>
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