export const summarizationService = {
  async summarizeMemo(title: string, content: string): Promise<string> {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '요약 생성에 실패했습니다.')
      }

      const data = await response.json()
      return data.summary
    } catch (error) {
      console.error('Error summarizing memo:', error)
      throw error
    }
  },
}
