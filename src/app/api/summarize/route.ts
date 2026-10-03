import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.error('Anthropic API Key is not set in environment variables')
}

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API Key is not configured' },
        { status: 500 }
      )
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const client = new Anthropic({
      apiKey,
      defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
        ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
        : {},
    })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `다음 메모를 개조식으로 요약해줘.
- 핵심 내용만 3~5개 항목으로 정리하고, 각 항목은 한 줄로 작성
- 각 줄은 "- "로 시작하고, 문장형 어미 대신 명사형/개조식 어미로 끝낼 것 (예: "~함", "~필요", "~예정")
- 제목, 서두, 맺음말 없이 항목만 출력하고, 그 외 마크다운 형식은 사용하지 마

제목: ${title}

내용:
${content}`,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    const summary = textContent.text.trim()

    return NextResponse.json({
      summary,
    })
  } catch (error) {
    console.error('Error summarizing memo:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '요약 생성에 실패했습니다.',
      },
      { status: 500 }
    )
  }
}
