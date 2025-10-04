// 用户相关类型
export interface User {
  id: string
  username: string
  email?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  email?: string
}

// 游泳记录相关类型
export interface SwimmingRecord {
  id: string
  userId: string
  date: string
  rounds: number
  meters: number
  createdAt: string
}

export interface PunchData {
  rounds: number
  meters?: number
  date?: string
}

// 报告相关类型
export interface ReportData {
  interval: 'weekly' | 'monthly' | 'all'
  records: SwimmingRecord[]
  weeklyReports?: WeeklyReport[]
  monthlyReports?: MonthlyReport[]
  statistics: {
    totalSessions: number
    totalMeters: number
    averageMetersPerSession: number
  }
}

export interface WeeklyReport {
  week: string
  weekStart?: string
  weekEnd?: string
  sessions: number
  totalMeters: number
}

export interface MonthlyReport {
  month: string
  year?: string
  sessions: number
  totalMeters: number
}

// 配置相关类型
export interface SwimmingConfig {
  roundMeters: number
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}