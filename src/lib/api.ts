import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 处理跨域请求
  withCredentials: false,
  timeout: 10000, // 10秒超时
})

// 请求拦截器 - 自动添加 JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并重定向到登录页
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
        // 只有在不是登录页面时才重定向
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// 认证相关 API
export const authAPI = {
  // 用户登录
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData: { username: string; password: string; email: string }) =>
    apiClient.post('/auth/register', userData),
  
  // Token 验证
  validate: () =>
    apiClient.post('/auth/validate'),
}

// 游泳记录管理 API
export const swimmingAPI = {
  // 游泳打卡
  punchIn: (data: { rounds: number; roundLengthMeters: number }) =>
    apiClient.post('/swimming/punch-in', data),
  
  // 获取所有游泳记录
  getRecords: () =>
    apiClient.get('/swimming/records'),
  
  // 按日期范围获取记录
  getRecordsByRange: (startDate: string, endDate: string) =>
    apiClient.get(`/swimming/records/range?startDate=${startDate}&endDate=${endDate}`),
  
  // 获取今日记录
  getTodayRecord: () =>
    apiClient.get('/swimming/records/today'),
}

// 统计报告 API
export const reportsAPI = {
  // 获取月度统计
  getMonthlyStats: () =>
    apiClient.get('/reports/monthly'),
  
  // 获取周度统计
  getWeeklyStats: () =>
    apiClient.get('/reports/weekly'),
}

// 系统健康检查 API
export const systemAPI = {
  // 健康检查
  healthCheck: () =>
    apiClient.get('/health'),
}

// 统一的 API 对象
export const api = {
  // 认证相关
  login: authAPI.login,
  register: authAPI.register,
  validateToken: authAPI.validate,
  
  // 游泳记录
  punchIn: swimmingAPI.punchIn,
  getRecords: swimmingAPI.getRecords,
  getRecordsByRange: swimmingAPI.getRecordsByRange,
  getTodayRecord: swimmingAPI.getTodayRecord,
  
  // 统计报告
  getMonthlyStats: reportsAPI.getMonthlyStats,
  getWeeklyStats: reportsAPI.getWeeklyStats,
  
  // 系统
  healthCheck: systemAPI.healthCheck,
}