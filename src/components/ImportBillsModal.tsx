import { useState } from 'react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { api } from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'

type SourceType = 'WECHAT' | 'ALIPAY' | 'BANK_STATEMENT'

interface ImportBillsModalProps {
  isOpen: boolean
  onClose: () => void
  onImported: (message?: string) => void
}

export default function ImportBillsModal({ isOpen, onClose, onImported }: ImportBillsModalProps) {
  const [sourceType, setSourceType] = useState<SourceType>('WECHAT')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const resetAndClose = () => {
    setSourceType('WECHAT')
    setFile(null)
    setSubmitting(false)
    setError(null)
    onClose()
  }

  const validate = () => {
    if (!file) {
      setError('请先选择账单文件')
      return false
    }
    if (!sourceType) {
      setError('请选择账单来源')
      return false
    }
    setError(null)
    return true
  }

  const parseErrorMessage = (e: unknown): string => {
    // axios 错误对象可能包含 response.data（string 或 json）
    const anyErr = e as any
    const data = anyErr?.response?.data
    if (typeof data === 'string') return data || '导入失败，请稍后重试'
    if (data && typeof data === 'object' && typeof data.error === 'string') return data.error
    if (anyErr?.message) return anyErr.message
    return '导入失败，请稍后重试'
  }

  const handleImport = async () => {
    if (!validate()) return
    if (!file) return
    setSubmitting(true)
    setError(null)
    try {
      const resp = await api.bills.importBills(file, sourceType)
      const msg = typeof resp.data === 'string' ? resp.data : '导入成功'
      onImported(msg)
      resetAndClose()
    } catch (e: unknown) {
      setError(parseErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const isUnsupported = sourceType === 'BANK_STATEMENT'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">导入账单</h3>
          <button
            type="button"
            aria-label="关闭"
            className="text-gray-500 hover:text-gray-700"
            onClick={resetAndClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">来源类型 *</label>
            <Select value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)} fullWidth required>
              <option value="WECHAT">微信</option>
              <option value="ALIPAY">支付宝</option>
              <option value="BANK_STATEMENT">银行卡流水（暂不支持）</option>
            </Select>
            {isUnsupported && (
              <p className="mt-1 text-xs text-orange-600">当前仅支持微信、支付宝账单，银行卡流水会被后端拒绝</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账单文件 *</label>
            <Input
              type="file"
              accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              fullWidth
              required
            />
            <p className="mt-1 text-xs text-gray-500">支持微信/支付宝的 Excel（.xls/.xlsx）与支付宝 CSV</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={resetAndClose} disabled={submitting}>取消</Button>
          <Button variant="primary" onClick={handleImport} disabled={submitting || isUnsupported}>
            {submitting ? '导入中...' : '导入'}
          </Button>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
            <LoadingSpinner text="正在导入，请稍候..." />
          </div>
        )}
      </div>
    </div>
  )
}