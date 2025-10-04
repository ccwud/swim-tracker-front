'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User } from '@/types'
import { authAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string, email: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // 初始状态应该是true，表示正在加载

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          await authAPI.validate();
          const user = JSON.parse(userData);
          setUser(user);
        } catch (error) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ username, password })
      
      // 根据API文档，成功响应格式为 { token, username, message }
      if (response.data.token) {
        const { token, username: returnedUsername } = response.data
        const user = { id: returnedUsername, username: returnedUsername }
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('jwt_token', token)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, password: string, email: string): Promise<boolean> => {
    try {
      const response = await authAPI.register({ username, password, email })
      
      // 根据API文档，成功响应格式为 { token, username, message }
      if (response.data.token) {
        return true
      }
      return false
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('jwt_token')
    }
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}