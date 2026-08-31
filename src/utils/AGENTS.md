# Utils - AI Agent 지침서

## 모듈 역할

순수 유틸리티 함수 및 헬퍼 집합. 비즈니스 로직과 독립적인 재사용 가능한 기능을 제공한다.

## 의존성 관계

- `@/types/memo` — Memo, MemoFormData 타입
- `@supabase/supabase-js` — Supabase 클라이언트

## 유틸리티 목록

| 파일 | 역할 |
|------|------|
| `supabase.ts` | Supabase 클라이언트 인스턴스 생성 |
| `memoService.ts` | Supabase `memos` 테이블 CRUD 래퍼 |

## supabase.ts 구조

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수로 클라이언트를 생성해 `supabase` 인스턴스를 export한다.

## memoService.ts 구조

```typescript
const memoService = {
  getMemos(): Promise<Memo[]>                          // 전체 메모 조회 (최신순)
  createMemo(formData): Promise<Memo>                  // 메모 생성
  updateMemo(id, formData): Promise<Memo>              // 메모 수정
  deleteMemo(id): Promise<void>                        // 메모 삭제
}
```

DB row(snake_case: `created_at`, `updated_at`)와 앱 내부 `Memo` 타입(camelCase) 간 매핑은 `memoService.ts` 내부의 `rowToMemo`가 전담한다.

## Implementation Patterns

### SSR 안전한 브라우저 API 접근

```typescript
export const browserUtil = {
  doSomething: (): ReturnType => {
    // SSR 환경 체크 필수
    if (typeof window === 'undefined') return defaultValue

    try {
      // 브라우저 API 사용
      return window.someApi()
    } catch (error) {
      console.error('Error:', error)
      return defaultValue
    }
  },
}
```

### 새 유틸리티 파일 작성 템플릿

```typescript
// 타입 import
import { SomeType } from '@/types/someType'

// 상수 정의
const STORAGE_KEY = 'app-key'

// 객체 형태로 관련 함수 그룹화
export const utilName = {
  method1: (param: ParamType): ReturnType => {
    // 구현
  },

  method2: (param: ParamType): ReturnType => {
    // 구현
  },
}
```

## Local Golden Rules

### Do's

- 모든 유틸리티는 순수 함수로 작성 (사이드 이펙트 최소화)
- Supabase 호출은 항상 `memoService`를 통해서만 수행
- 에러는 호출부(훅)로 throw하여 상위에서 처리하도록 위임
- 비동기 함수는 async/await로 작성

### Don'ts

- React 훅 사용 금지 (유틸리티는 훅이 아님)
- 전역 상태 변경 금지
- 컴포넌트/훅에서 `supabase` 클라이언트 직접 호출 금지 (`memoService` 경유)
- 비동기 함수에서 에러 무시 금지 (catch 후 반드시 재throw 또는 로깅)

## Supabase 스키마

`memos` 테이블 (스키마 정의: `supabase/schema.sql`):
- `id` (uuid, PK), `title`, `content`, `category`, `tags` (text[])
- `created_at`, `updated_at` (timestamptz)
- RLS 활성화, 로그인 기능이 없으므로 anon 키에 대해 public CRUD 정책 적용

## 테스트 고려사항

유틸리티 함수는 단위 테스트하기 용이함:
- 순수 함수는 입력 -> 출력 테스트
- `memoService`는 Supabase 클라이언트 모킹 필요
