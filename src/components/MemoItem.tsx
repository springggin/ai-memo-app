'use client'

import { useState } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import { summarizationService } from '@/utils/summarizationService'

interface MemoItemProps {
  memo: Memo
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
  onView: (memo: Memo) => void
}

export default function MemoItem({ memo, onEdit, onDelete, onView }: MemoItemProps) {
  const [summary, setSummary] = useState<string | null>(memo.summary || null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (summary) {
      setShowSummary(!showSummary)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await summarizationService.summarizeMemo(memo.title, memo.content)
      setSummary(result)
      setShowSummary(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '요약 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const stripMarkdown = (text: string) =>
    text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_~`>]/g, '')
      .replace(/^[-+]\s+/gm, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim()

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 cursor-pointer" onClick={() => onView(memo)}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                memo.category}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(memo.updatedAt)}
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="요약"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => onEdit(memo)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="편집"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                onDelete(memo.id)
              }
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="mb-4 cursor-pointer" onClick={() => onView(memo)}>
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-900 transition-colors">
          {stripMarkdown(memo.content)}
        </p>
      </div>

      {/* 요약 */}
      {showSummary && summary && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-purple-700">AI 요약</span>
            <button
              onClick={handleSummarize}
              className="text-purple-500 hover:text-purple-700"
              title="닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            요약 생성 실패: {error}
          </p>
        </div>
      )}

      {/* 태그 */}
      {memo.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap cursor-pointer" onClick={() => onView(memo)}>
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
