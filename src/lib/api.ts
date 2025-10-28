import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sol-aqua.top/api'
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
// 创建 axios 实例  111 
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
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
  // 登录
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  // 注册
  register: (userData: { username: string; password: string; email: string }) =>
    apiClient.post('/auth/register', userData),
  
  // 验证token
  validate: () =>
    apiClient.post('/auth/validate'),
  
  // 忘记密码 - 发起密码重置
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  // 验证重置令牌
  validateResetToken: (token: string) =>
    apiClient.get(`/auth/validate-reset-token?token=${token}`),
  
  // 重置密码
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
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

// 账单导入 API
export const billsAPI = {
  // 导入账单文件（成功返回 text/plain）
  importBills: (
    file: File,
    sourceType: 'WECHAT' | 'ALIPAY' | 'BANK_STATEMENT',
  ) => {
    const form = new FormData()
    form.append('file', file)
    form.append('sourceType', sourceType)
    return apiClient.post('/bills/import', form, {
      headers: {
        // 让浏览器设置边界，显式指定类型避免默认 application/json 覆盖
        'Content-Type': 'multipart/form-data',
        Accept: 'text/plain',
      },
    })
  },
}

// 分类管理 API（对齐 API_CATEGORY_MODULE.md）
export const categoriesAPI = {
  list: () => apiClient.get('/categories'),
  listByType: (type: 'INCOME' | 'EXPENSE') => apiClient.get(`/categories/type/${type}`),
  income: () => apiClient.get('/categories/income'),
  expense: () => apiClient.get('/categories/expense'),
  get: (id: number) => apiClient.get(`/categories/${id}`),
  create: (payload: { name: string; type: 'INCOME' | 'EXPENSE'; description?: string; iconName?: string; colorCode?: string }) => apiClient.post('/categories', payload),
  update: (id: number, payload: { name: string; type: 'INCOME' | 'EXPENSE'; description?: string; iconName?: string; colorCode?: string }) => apiClient.put(`/categories/${id}`, payload),
  remove: (id: number) => apiClient.delete(`/categories/${id}`),
  count: () => apiClient.get('/categories/count'),
  initialize: () => apiClient.post('/categories/initialize'),
}

// 财务记录管理 API（对齐 API_FINANCIAL_RECORD_MODULE.md）
export const financialRecordsAPI = {
  create: (payload: { amount: number; categoryId: number; description?: string; recordDate: string; tags?: string[] }) => apiClient.post('/financial-records', payload),
  update: (id: number, payload: { amount: number; categoryId: number; description?: string; recordDate: string; tags?: string[] }) => apiClient.put(`/financial-records/${id}`, payload),
  remove: (id: number) => apiClient.delete(`/financial-records/${id}`),
  get: (id: number) => apiClient.get(`/financial-records/${id}`),
  list: (params?: { page?: number; size?: number; sort?: string }) => apiClient.get('/financial-records', { params }),
  getByDateRange: (startDate: string, endDate: string, params?: { page?: number; size?: number }) => apiClient.get('/financial-records/date-range', { params: { startDate, endDate, ...params } }),
  getByCategory: (categoryId: number, params?: { page?: number; size?: number }) => apiClient.get(`/financial-records/category/${categoryId}`, { params }),
  search: (keyword: string, params?: { page?: number; size?: number }) => apiClient.get('/financial-records/search', { params: { keyword, ...params } }),
  statistics: (params?: { startDate?: string; endDate?: string }) => apiClient.get('/financial-records/statistics', { params }),
  monthlyStatistics: (year: number) => apiClient.get('/financial-records/monthly-statistics', { params: { year } }),
  categoryStatistics: (params?: { startDate?: string; endDate?: string; type?: 'INCOME' | 'EXPENSE' }) => apiClient.get('/financial-records/category-statistics', { params }),
  recent: (limit?: number) => apiClient.get('/financial-records/recent', { params: { limit } }),
  batchImport: (records: Array<{ amount: number; categoryId: number; description?: string; recordDate: string; tags?: string[] }>) => apiClient.post('/financial-records/batch-import', records),
}

// 统一的 API 对象
export const api = {
  // 认证相关
  login: authAPI.login,
  register: authAPI.register,
  validateToken: authAPI.validate,
  forgotPassword: authAPI.forgotPassword,
  validateResetToken: authAPI.validateResetToken,
  resetPassword: authAPI.resetPassword,
  
  // 游泳记录相关
  punchIn: swimmingAPI.punchIn,
  getRecords: swimmingAPI.getRecords,
  getRecordsByRange: swimmingAPI.getRecordsByRange,
  getTodayRecord: swimmingAPI.getTodayRecord,
  
  // 报告相关
  getMonthlyStats: reportsAPI.getMonthlyStats,
  getWeeklyStats: reportsAPI.getWeeklyStats,
  
  // 系统相关
  healthCheck: systemAPI.healthCheck,

  // 账单导入相关
  bills: billsAPI,

  // 分类相关
  categories: categoriesAPI,

  // 财务记录相关
  financialRecords: financialRecordsAPI,
}