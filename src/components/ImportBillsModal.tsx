import { useEffect, useRef, useState } from 'react'
import Button from '@/components/Button'
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
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [longRunning, setLongRunning] = useState(false)
  const longTimerRef = useRef<number | null>(null)


  const resetAndClose = () => {
    // 如有进行中的请求，主动中断
    abortRef.current?.abort()
    abortRef.current = null
    if (longTimerRef.current) {
      window.clearTimeout(longTimerRef.current)
      longTimerRef.current = null
    }
    setSourceType('WECHAT')
    setFile(null)
    setSubmitting(false)
    setError(null)
    setLongRunning(false)
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
    // axios 风格错误对象可能包含 response.data（string 或 json）
    const respData = (e as { response?: { data?: unknown } })?.response?.data
    if (typeof respData === 'string') return respData || '导入失败，请稍后重试'
    if (respData && typeof respData === 'object' && typeof (respData as { error?: unknown }).error === 'string') {
      return (respData as { error: string }).error
    }
    if (typeof (e as { message?: unknown }).message === 'string') {
      return (e as { message: string }).message
    }
    return '导入失败，请稍后重试'
  }

  const acceptBySource = (): string => {
    const excelMimes = 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (sourceType === 'ALIPAY') return `${excelMimes},text/csv,.xls,.xlsx,.csv`
    return `${excelMimes},.xls,.xlsx`
  }

  const allowedExtensions = (): string[] => (sourceType === 'ALIPAY' ? ['.xls', '.xlsx', '.csv'] : ['.xls', '.xlsx'])

  const validateFileKind = (f: File): boolean => {
    const name = f.name.toLowerCase()
    return allowedExtensions().some(ext => name.endsWith(ext))
  }

  const onPickFile = (f: File | null) => {
    if (!f) {
      setFile(null)
      return
    }
    if (!validateFileKind(f)) {
      setError(`不支持的文件类型，请选择 ${allowedExtensions().join(' / ')}`)
      return
    }
    setError(null)
    setFile(f)
  }

  const onDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer?.files?.[0]
    onPickFile(f ?? null)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragActive) setDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleImport = async () => {
    if (!validate()) return
    if (!file) return
    setSubmitting(true)
    setError(null)
    setLongRunning(false)
    // 启动长时任务阈值计时（8s 提示）
    if (longTimerRef.current) window.clearTimeout(longTimerRef.current)
    longTimerRef.current = window.setTimeout(() => setLongRunning(true), 8000)

    // 创建可取消的控制器
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const resp = await api.bills.importBills(file, sourceType, {
        timeoutMs: 120000,
        signal: controller.signal,
      })
      const msg = typeof resp.data === 'string' ? resp.data : '导入成功'
      onImported(msg)
      resetAndClose()
    } catch (e: unknown) {
      // 识别主动取消
      const isCanceled =
        (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'ERR_CANCELED') ||
        (e instanceof DOMException && e.name === 'AbortError')
      if (isCanceled) {
        setError('已取消导入')
      } else {
        setError(parseErrorMessage(e))
      }
    } finally {
      abortRef.current = null
      if (longTimerRef.current) {
        window.clearTimeout(longTimerRef.current)
        longTimerRef.current = null
      }
      setSubmitting(false)
    }
  }

  // 组件卸载时，避免悬挂请求
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (longTimerRef.current) window.clearTimeout(longTimerRef.current)
    }
  }, [])

  const stopImport = () => {
    if (submitting) {
      abortRef.current?.abort()
    }
  }

  const isUnsupported = sourceType === 'BANK_STATEMENT'
  if (!isOpen) return null

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
            <div
              className={`border-2 rounded-md p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300 hover:border-blue-400'}`}
              onDrop={onDropFile}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              aria-label="拖拽或点击选择账单文件"
            >
              {file ? (
                <div className="text-sm text-gray-700">
                  已选择文件：<span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  将文件拖拽到此处，或<span className="text-blue-600"> 点击选择文件</span>
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {sourceType === 'ALIPAY' ? '支持 .xls / .xlsx / .csv' : '支持 .xls / .xlsx'}
              </div>
            </div>
            {/* 隐藏的原生 file input，用于点击选择 */}
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptBySource()}
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={resetAndClose} disabled={submitting}>取消</Button>
          {submitting && (
            <Button variant="secondary" onClick={stopImport}>
              停止导入
            </Button>
          )}
          <Button variant="primary" onClick={handleImport} disabled={submitting || isUnsupported || !file}>
            {submitting ? '导入中...' : '导入'}
          </Button>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner text="正在导入，请稍候..." />
              {longRunning && (
                <p className="text-xs text-gray-600">文件较大或服务器繁忙，可能需要 1-2 分钟</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}