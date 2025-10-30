import React from 'react'
import Button from './Button'

export interface PaginationProps {
  page: number // 0-based
  pageSize: number
  totalPages: number
  totalElements?: number
  onPageChange: (nextPage: number) => void
  onPageSizeChange?: (nextSize: number) => void
}

export default function Pagination({
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const canPrev = page > 0
  const canNext = page + 1 < totalPages

  return (
    <div className="mt-4 p-3 rounded-lg border-gradient-soft flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
        >上一页</Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
        >下一页</Button>
        <span className="text-sm text-gray-600 ml-2">第 {page + 1} / {Math.max(totalPages || 1, 1)} 页</span>
        {typeof totalElements === 'number' && (
          <span className="text-sm text-gray-600 ml-2">共 {totalElements} 条</span>
        )}
      </div>
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">每页</span>
          <select
            className="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 20, 50].map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}