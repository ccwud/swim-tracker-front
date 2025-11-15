'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ChoicePage() {
  const { user } = useAuth()
  const router = useRouter()

  const go = (path: string) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(path)}`)
      return
    }
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">选择功能</h1>
          <p className="text-muted-foreground">请选择您要使用的功能</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer transition hover:shadow-md" onClick={() => go('/dashboard')}>
            <CardHeader>
              <CardTitle>游泳打卡</CardTitle>
              <CardDescription>记录游泳训练并追踪进度</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="primary" fullWidth>进入</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition hover:shadow-md" onClick={() => go('/financial')}>
            <CardHeader>
              <CardTitle>记账系统</CardTitle>
              <CardDescription>管理收支记录与统计</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="primary" fullWidth>进入</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
