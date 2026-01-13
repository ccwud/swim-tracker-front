'use client';

import { ReactNode, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && user && (
        <nav className="topnav sticky top-0 z-50">
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

              {/* 桌面端导航 */}
              <div className="hidden md:flex flex-1 items-center justify-center">
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

              {/* 桌面端右侧操作 */}
              <div className="hidden md:flex topnav__actions">
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

              {/* 移动端菜单按钮 */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">打开主菜单</span>
                  <svg
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <svg
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200 bg-white`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="px-3 py-2 text-sm text-gray-700">
                欢迎，{user.username}
              </div>
              <Button
                onClick={() => {
                  router.push('/dashboard');
                  setMobileMenuOpen(false);
                }}
                variant={(pathname?.startsWith('/dashboard') || pathname === '/report') ? 'primary' : 'secondary'}
                className="w-full justify-start"
              >
                游泳打卡
              </Button>
              <Button
                onClick={() => {
                  router.push('/financial');
                  setMobileMenuOpen(false);
                }}
                variant={pathname?.startsWith('/financial') ? 'primary' : 'secondary'}
                className="w-full justify-start"
              >
                记账系统
              </Button>
              <Button
                onClick={() => {
                  router.push(isFinancialContext ? '/financial/report' : '/report');
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start"
              >
                报告
              </Button>
              <Button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                variant="secondary"
                className="w-full justify-start"
              >
                注销
              </Button>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-0 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}