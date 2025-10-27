import { useState } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { api } from '@/lib/api'

interface CategoryShape {
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
  iconName?: string
  colorCode?: string
}

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (category: CategoryShape) => void
}

export default function AddCategoryModal({ isOpen, onClose, onCreated }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [description, setDescription] = useState('')
  const [iconName, setIconName] = useState('')
  const [colorCode, setColorCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const validate = () => {
    if (!name.trim()) {
      setError('请填写分类名称')
      return false
    }
    if (name.trim().length > 50) {
      setError('分类名称最大50字符')
      return false
    }
    if (description && description.length > 200) {
      setError('描述最大200字符')
      return false
    }
    if (iconName && iconName.length > 50) {
      setError('图标名称最大50字符')
      return false
    }
    if (colorCode && colorCode.length > 7) {
      setError('颜色代码最大7字符，例如 #FF5722')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        iconName: iconName.trim() || undefined,
        colorCode: colorCode.trim() || undefined,
      }
      const resp = await api.categories.create(payload)
      const raw = resp.data?.data ?? resp.data
      const created: CategoryShape = {
        id: Number(raw?.id ?? raw?.categoryId ?? Date.now()),
        name: raw?.name ?? payload.name,
        type: (raw?.type ?? raw?.categoryType ?? payload.type) as 'INCOME' | 'EXPENSE',
        iconName: raw?.iconName ?? payload.iconName,
        colorCode: raw?.colorCode ?? payload.colorCode,
      }
      onCreated(created)
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '创建分类失败，请稍后重试'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">新建分类</h3>
          <button
            type="button"
            aria-label="关闭"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：餐饮、工资"
              fullWidth
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              fullWidth
              required
            >
              <option value="INCOME">收入</option>
              <option value="EXPENSE">支出</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选：该分类的说明"
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标名称</label>
            <Input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="可选：示例 restaurant"
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">颜色代码</label>
            <Input
              type="text"
              value={colorCode}
              onChange={(e) => setColorCode(e.target.value)}
              placeholder="可选：示例 #FF5722"
              fullWidth
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '创建中...' : '创建'}
          </Button>
        </div>
      </div>
    </div>
  )
}