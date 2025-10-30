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

export default function FinancialCategoryDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const categoryId = Number(searchParams.get('id') ?? NaN)
  const categoryNameQuery = searchParams.get('categoryName') || ''

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
    const titleName = categoryNameQuery ? decodeURIComponent(categoryNameQuery) : `分类 ${Number.isFinite(categoryId) ? categoryId : ''}`
    return `${titleName} 明细`
  }, [categoryNameQuery, categoryId])

  const fetchData = async () => {
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      setError('无效的分类ID')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await api.financialRecords.getByCategory(categoryId, { page, size })
      const raw = resp.data
      const payload = raw?.data ?? raw
      const content = Array.isArray(payload?.content) ? payload.content : Array.isArray(payload) ? payload : []
      const pageNumber = payload?.pageable?.pageNumber
      const pageSize = payload?.pageable?.pageSize
      const tp = Number(payload?.totalPages ?? 1)
      const te = typeof payload?.totalElements === 'number' ? Number(payload.totalElements) : undefined

      const mapItem = (r: any): FinancialRecordItem => ({
        id: Number(r.id ?? Date.now()),
        categoryId: Number(r.categoryId ?? categoryId ?? 0),
        categoryName: r.categoryName ?? (categoryNameQuery ? decodeURIComponent(categoryNameQuery) : ''),
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
  }, [categoryId, page, size])

  const updateQuery = (next: { page?: number; size?: number }) => {
    const usp = new URLSearchParams(searchParams.toString())
    if (typeof next.page === 'number') usp.set('page', String(next.page))
    if (typeof next.size === 'number') usp.set('size', String(next.size))
    router.replace(`/financial/category?${usp.toString()}`)
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
          <div className="overflow-x-auto table-container border-gradient-soft">
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>分类</th>
                  <th>类型</th>
                  <th>金额</th>
                  <th>描述</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="text-sm">{item.recordDate}</td>
                    <td className="text-sm">{item.categoryName}</td>
                    <td className="text-sm">
                      <span className={`badge ${item.categoryType === 'INCOME' ? 'badge--income' : 'badge--expense'}`}>
                        {item.categoryType === 'INCOME' ? '收入' : '支出'}
                      </span>
                    </td>
                    <td className="text-sm">
                      <span className={`amount ${item.categoryType === 'INCOME' ? 'amount--income' : 'amount--expense'}`}>¥{item.amount.toFixed(2)}</span>
                    </td>
                    <td className="text-sm text-gray-600">{item.description || '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="table__empty" colSpan={5}>暂无数据</td>
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