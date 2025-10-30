"use client";

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import Pagination from '@/components/Pagination'
import Button from '@/components/Button'
import { api } from '@/lib/api'

interface FinancialRecordItem {
  id: number
  categoryId: number
  categoryName: string
  categoryType: 'INCOME' | 'EXPENSE'
  amount: number
  recordDate: string
  description?: string
}

export default function FinancialDateRangePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''
  const month = searchParams.get('month') || ''

  const [page, setPage] = useState<number>(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p >= 0 ? p : 0
  })
  const [size, setSize] = useState<number>(() => {
    const s = Number(searchParams.get('size'))
    return Number.isFinite(s) && s > 0 ? s : 20
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<FinancialRecordItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState<number | undefined>(undefined)

  const title = useMemo(() => {
    if (month) return `${month} 明细`
    if (startDate && endDate) return `明细（${startDate} ~ ${endDate}）`
    return '日期范围明细'
  }, [month, startDate, endDate])

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setError('缺少开始或结束日期')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await api.financialRecords.getByDateRange(startDate, endDate, { page, size })
      const raw = resp.data
      const payload = raw?.data ?? raw
      const content = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : []
      const pageNumber = payload?.pageable?.pageNumber
      const pageSize = payload?.pageable?.pageSize
      const tp = Number(payload?.totalPages ?? 1)
      const te = typeof payload?.totalElements === 'number' ? Number(payload.totalElements) : undefined

      const mapItem = (r: any): FinancialRecordItem => ({
        id: Number(r.id ?? Date.now()),
        categoryId: Number(r.categoryId ?? 0),
        categoryName: r.categoryName ?? '',
        categoryType: (r.categoryType ?? r.type ?? 'EXPENSE') as 'INCOME' | 'EXPENSE',
        amount: Number(r.amount ?? 0),
        recordDate: r.recordDate ?? r.date ?? new Date().toISOString().slice(0, 10),
        description: r.description ?? r.remark ?? ''
      })

      setItems(content.map(mapItem))
      setTotalPages(tp > 0 ? tp : 1)
      setTotalElements(te)
      if (Number.isFinite(pageNumber)) setPage(Number(pageNumber))
      if (Number.isFinite(pageSize)) setSize(Number(pageSize))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '加载失败'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, page, size])

  const updateQuery = (next: { page?: number; size?: number }) => {
    const usp = new URLSearchParams(searchParams.toString())
    if (typeof next.page === 'number') usp.set('page', String(next.page))
    if (typeof next.size === 'number') usp.set('size', String(next.size))
    router.replace(`/financial/date-range?${usp.toString()}`)
  }

  return (
    <Layout showNavigation>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <Button type="button" variant="secondary" onClick={() => router.back()}>返回</Button>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <LoadingSpinner text="加载数据..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">日期</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">分类</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">类型</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">金额</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.recordDate}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.categoryName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.categoryType === 'INCOME' ? '收入' : '支出'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">¥{item.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.description || '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>暂无数据</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              page={page}
              pageSize={size}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(p) => { setPage(p); updateQuery({ page: p }) }}
              onPageSizeChange={(s) => { setSize(s); updateQuery({ size: s, page: 0 }) }}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}