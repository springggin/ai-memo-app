import { supabase } from './supabase'
import { Memo, MemoFormData } from '@/types/memo'

interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

const rowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const memoService = {
  async getMemos(): Promise<Memo[]> {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MemoRow[]).map(rowToMemo)
  },

  async createMemo(formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .insert({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
      })
      .select()
      .single()

    if (error) throw error
    return rowToMemo(data as MemoRow)
  },

  async updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
    const { data, error } = await supabase
      .from('memos')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return rowToMemo(data as MemoRow)
  },

  async deleteMemo(id: string): Promise<void> {
    const { error } = await supabase.from('memos').delete().eq('id', id)
    if (error) throw error
  },
}
