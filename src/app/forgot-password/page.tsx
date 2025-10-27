'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await api.forgotPassword(email)
      setMessage('如果该邮箱存在，重置密码邮件已发送')
      setIsSuccess(true)
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number } }
        if (axiosError.response?.status === 400) {
          setMessage('发送重置邮件失败，请稍后重试')
        } else {
          setMessage('网络错误，请检查网络连接后重试')
        }
      } else {
        setMessage('网络错误，请检查网络连接后重试')
      }
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            忘记密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            输入您的邮箱地址，我们将发送重置密码的链接
          </p>
        </div>
        
        {!isSuccess ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                fullWidth
                placeholder="请输入您的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {message && (
              <div className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                fullWidth
                variant="primary"
              >
                {loading ? '发送中...' : '发送重置邮件'}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                返回登录
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">邮件已发送</h3>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                请检查您的邮箱（包括垃圾邮件文件夹），点击邮件中的链接重置密码。
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <Button
                onClick={() => {
                  setIsSuccess(false)
                  setMessage('')
                  setEmail('')
                }}
                variant="ghost"
                className="text-sm"
              >
                重新发送
              </Button>
              <div>
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  返回登录
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}