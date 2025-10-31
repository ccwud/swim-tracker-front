'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Textarea from '@/components/Textarea'

// 分类类型
type CategoryType = 'INCOME' | 'EXPENSE'

// 分类数据模型（与 API 文档对齐）
interface Category {
  id: number
  name: string
  type: CategoryType
  description?: string
  iconName?: string
  colorCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 创建/编辑表单数据
interface CategoryFormData {
  name: string
  type: CategoryType
  description: string
  iconName: string
  colorCode: string
}

export default function CategoryManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [filterType, setFilterType] = useState<'ALL' | CategoryType>('ALL')
  const [showInactive, setShowInactive] = useState(false)

  // 新建/编辑弹窗
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'EXPENSE',
    description: '',
    iconName: '',
    colorCode: '#4CAF50',
  })

  // 初始化：认证检查 + 加载（目前使用本地模拟数据）
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    // 初始加载（无后端对接，使用空列表或默认）
    setCategories([])
  }, [user, authLoading, router])

  // 统计计数
  const stats = useMemo(() => {
    const active = categories.filter(c => c.isActive)
    return {
      total: active.length,
      income: active.filter(c => c.type === 'INCOME').length,
      expense: active.filter(c => c.type === 'EXPENSE').length,
    }
  }, [categories])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const typeOk = filterType === 'ALL' ? true : c.type === filterType
      const activeOk = showInactive ? true : c.isActive
      return typeOk && activeOk
    })
  }, [categories, filterType, showInactive])

  // 校验函数（对齐 API 文档的约束）
  const validateForm = (data: CategoryFormData, isEdit = false): string | null => {
    if (!data.name.trim()) return '分类名称为必填项'
    if (data.name.length > 50) return '分类名称不能超过50字符'
    if (!isEdit && !data.type) return '分类类型为必填项'
    if (data.description && data.description.length > 200) return '描述不能超过200字符'
    if (data.iconName && data.iconName.length > 50) return '图标名称不能超过50字符'
    if (data.colorCode && data.colorCode.length > 7) return '颜色代码不能超过7字符'
    // 名称唯一（同一用户下不重复，这里按全局唯一模拟）
    const nameExists = categories.some(c => c.name.trim() === data.name.trim() && (!editingCategory || c.id !== editingCategory.id))
    if (nameExists) return '分类名称已存在'
    return null
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({ name: '', type: 'EXPENSE', description: '', iconName: '', colorCode: '#4CAF50' })
  }

  const openCreateModal = () => {
    resetForm()
    setShowFormModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
      iconName: category.iconName || '',
      colorCode: category.colorCode || '#4CAF50',
    })
    setShowFormModal(true)
  }

  const closeModal = () => {
    setShowFormModal(false)
    setEditingCategory(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateForm(formData, !!editingCategory)
    if (error) {
      setMessage({ type: 'error', text: error })
      return
    }

    setLoading(true)
    try {
      if (editingCategory) {
        // 编辑（类型不可修改）
        const updated: Category = {
          ...editingCategory,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          iconName: formData.iconName.trim() || undefined,
          colorCode: formData.colorCode.trim() || undefined,
          updatedAt: new Date().toISOString(),
        }
        setCategories(prev => prev.map(c => (c.id === editingCategory.id ? updated : c)))
        setMessage({ type: 'success', text: '分类更新成功' })
      } else {
        // 新建
        const now = new Date().toISOString()
        const nextId = (categories.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
        const newCategory: Category = {
          id: nextId,
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || undefined,
          iconName: formData.iconName.trim() || undefined,
          colorCode: formData.colorCode.trim() || undefined,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }
        setCategories(prev => [newCategory, ...prev])
        setMessage({ type: 'success', text: '分类创建成功' })
      }
      closeModal()
    } catch {
      setMessage({ type: 'error', text: '操作失败，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleSoftDelete = (category: Category) => {
    if (!category.isActive) return
    setCategories(prev => prev.map(c => (c.id === category.id ? { ...c, isActive: false, updatedAt: new Date().toISOString() } : c)))
    setMessage({ type: 'success', text: '分类已软删除（停用）' })
  }

  const handleActivate = (category: Category) => {
    if (category.isActive) return
    setCategories(prev => prev.map(c => (c.id === category.id ? { ...c, isActive: true, updatedAt: new Date().toISOString() } : c)))
    setMessage({ type: 'success', text: '分类已重新启用' })
  }

  const initializeDefaults = () => {
    const defaults: Array<Pick<Category, 'name' | 'type' | 'iconName' | 'colorCode'>> = [
      // 收入
      { name: '工资', type: 'INCOME', iconName: 'salary', colorCode: '#4CAF50' },
      { name: '奖金', type: 'INCOME', iconName: 'bonus', colorCode: '#2196F3' },
      { name: '投资收益', type: 'INCOME', iconName: 'investment', colorCode: '#9C27B0' },
      { name: '其他收入', type: 'INCOME', iconName: 'other_income', colorCode: '#795548' },
      // 支出
      { name: '餐饮', type: 'EXPENSE', iconName: 'restaurant', colorCode: '#FF5722' },
      { name: '交通', type: 'EXPENSE', iconName: 'transport', colorCode: '#FF9800' },
      { name: '购物', type: 'EXPENSE', iconName: 'shopping', colorCode: '#4CAF50' },
      { name: '娱乐', type: 'EXPENSE', iconName: 'entertainment', colorCode: '#9C27B0' },
      { name: '医疗', type: 'EXPENSE', iconName: 'medical', colorCode: '#E91E63' },
      { name: '教育', type: 'EXPENSE', iconName: 'education', colorCode: '#3F51B5' },
      { name: '住房', type: 'EXPENSE', iconName: 'housing', colorCode: '#607D8B' },
      { name: '其他支出', type: 'EXPENSE', iconName: 'other_expense', colorCode: '#795548' },
    ]

    const now = new Date().toISOString()
    let nextId = (categories.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1

    const toAdd: Category[] = []
    for (const d of defaults) {
      // 跳过已有名称
      const exists = categories.some(c => c.name === d.name)
      if (exists) continue
      toAdd.push({
        id: nextId++,
        name: d.name,
        type: d.type,
        description: '',
        iconName: d.iconName,
        colorCode: d.colorCode,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    if (toAdd.length === 0) {
      setMessage({ type: 'error', text: '默认分类已存在或无需初始化' })
      return
    }

    setCategories(prev => [...toAdd, ...prev])
    setMessage({ type: 'success', text: '默认分类初始化成功' })
  }

  if (authLoading) {
    return <LoadingSpinner text="正在验证身份..." />
  }

  if (!user) {
    return <LoadingSpinner text="正在跳转到登录..." />
  }

  return (
    <Layout showNavigation>
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">记账分类管理</h1>
            <p className="text-sm text-gray-600 mt-1">仅前端模拟：创建、编辑、停用分类，符合文档约束</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={initializeDefaults}
              variant="secondary"
              className="text-sm"
            >
              初始化默认分类
            </Button>
            <Button
              onClick={openCreateModal}
              variant="primary"
              className="text-sm"
            >
              新建分类
            </Button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>{message.text}</div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">总有效分类</h3>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">收入分类</h3>
            <p className="text-2xl font-bold text-green-900">{stats.income}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">支出分类</h3>
            <p className="text-2xl font-bold text-purple-900">{stats.expense}</p>
          </div>
        </div>

        {/* 筛选区 */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={() => setFilterType('ALL')}
            variant={filterType === 'ALL' ? 'primary' : 'secondary'}
            className="text-sm"
          >全部</Button>
          <Button
            onClick={() => setFilterType('INCOME')}
            variant={filterType === 'INCOME' ? 'primary' : 'secondary'}
            className="text-sm"
          >收入</Button>
          <Button
            onClick={() => setFilterType('EXPENSE')}
            variant={filterType === 'EXPENSE' ? 'primary' : 'secondary'}
            className="text-sm"
          >支出</Button>
          <label className="ml-4 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            显示已停用
          </label>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无分类</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredCategories.map(c => (
                <li key={c.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: c.colorCode || '#e5e7eb' }}
                      title={c.colorCode}
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${c.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {c.type === 'INCOME' ? '收入' : '支出'}
                        </span>
                        {!c.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">已停用</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{c.description || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">图标: {c.iconName || '—'} · 创建: {new Date(c.createdAt).toLocaleString()} · 更新: {new Date(c.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openEditModal(c)}
                      variant="secondary"
                      className="text-sm"
                    >编辑</Button>
                    {c.isActive ? (
                      <Button
                        onClick={() => handleSoftDelete(c)}
                        variant="secondary"
                        className="text-sm"
                      >停用</Button>
                    ) : (
                      <Button
                        onClick={() => handleActivate(c)}
                        variant="secondary"
                        className="text-sm"
                      >启用</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 弹窗 */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/25" onClick={closeModal} />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingCategory ? '编辑分类' : '新建分类'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类名称 *</label>
                    <Input
                       value={formData.name}
                       onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      fullWidth
                      placeholder="如：餐饮、工资"
                      maxLength={50}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类类型 *</label>
                    <Select
                      value={formData.type}
                      onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as CategoryType }))}
                      fullWidth
                      disabled={!!editingCategory}
                      required
                    >
                      <option value="INCOME">收入</option>
                      <option value="EXPENSE">支出</option>
                    </Select>
                    {editingCategory && (
                      <p className="text-xs text-gray-500 mt-1">分类类型创建后不可修改</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      fullWidth
                      placeholder="最多200字符"
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">图标名称</label>
                      <Input
                        value={formData.iconName}
                        onChange={e => setFormData(prev => ({ ...prev, iconName: e.target.value }))}
                       fullWidth
                        placeholder="如：restaurant、salary"
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">颜色代码</label>
                      <Input
                        value={formData.colorCode}
                        onChange={e => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                       fullWidth
                        placeholder="#FF5722"
                        maxLength={7}
                      />
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <span>预览:</span>
                        <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: formData.colorCode || '#e5e7eb' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button type="button" onClick={closeModal} variant="secondary">取消</Button>
                  <Button type="submit" disabled={loading} variant="primary">{editingCategory ? '保存' : '创建'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}