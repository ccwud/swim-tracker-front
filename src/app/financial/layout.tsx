'use client'

import type { ReactNode } from 'react'
import AuthGuard from '@/components/AuthGuard'

export default function FinancialLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}