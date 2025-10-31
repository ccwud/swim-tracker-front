"use client";

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import Pagination from '@/components/Pagination'
import Button from '@/components/Button'
import { api } from '@/lib/api'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

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
          <div className="overflow-x-auto table-container border-gradient-soft">
            <Table className="table min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.recordDate}</TableCell>
                    <TableCell className="text-sm">{item.categoryName}</TableCell>
                    <TableCell className="text-sm">
                      <span className={`badge ${item.categoryType === 'INCOME' ? 'badge--income' : 'badge--expense'}`}> 
                        {item.categoryType === 'INCOME' ? '收入' : '支出'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={`amount ${item.categoryType === 'INCOME' ? 'amount--income' : 'amount--expense'}`}>¥{item.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{item.description || '-'}</TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell className="table__empty" colSpan={5}>暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

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