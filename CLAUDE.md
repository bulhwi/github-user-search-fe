# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub 사용자 검색 웹 애플리케이션 - GitHub REST API를 사용하여 사용자를 검색하고 결과를 표시하는 프론트엔드 애플리케이션입니다.

**상세 문서**: `docs/PRD.md` 참고

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (ES2023)
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI (MUI)
- **Styling**: Tailwind CSS (레이아웃)
- **Testing**: Jest (Unit), Cypress (E2E)
- **Package Manager**: pnpm
- **Build Tool**: Turbo
- **Code Quality**: ESLint + Prettier

## Development Commands

### Setup
```bash
pnpm install
```

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
```

### Testing
```bash
pnpm test         # Run Jest unit tests
pnpm test:watch   # Run Jest in watch mode
pnpm test:e2e     # Run Cypress E2E tests
pnpm test:all     # Run all tests
```

## Architecture

### Clean Architecture + Modularity

프로젝트는 Clean Architecture 원칙을 따르며 다음과 같이 구성됩니다:

```
src/
├── app/                    # Next.js App Router pages
├── features/               # Feature modules (검색, 필터, 결과 표시 등)
│   ├── search/
│   ├── filters/
│   └── results/
├── shared/                 # Shared utilities and components
│   ├── ui/                # Reusable UI components
│   ├── api/               # API client and utilities
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── store/                 # Redux store configuration
└── types/                 # TypeScript type definitions
```

## Key Features

### 8가지 검색 기능
1. 사용자/조직 타입으로 검색 (type qualifier)
2. 계정 이름/성명/메일로 검색 (in qualifier)
3. 리포지토리 수로 검색 (repos qualifier)
4. 위치로 검색 (location qualifier)
5. 언어로 검색 (language qualifier)
6. 계정 생성일로 검색 (created qualifier)
7. 팔로워 수로 검색 (followers qualifier)
8. 후원 가능 여부로 검색 (is:sponsorable)

### 정렬 옵션
- Best match (기본)
- Followers (팔로워 수)
- Repositories (리포지토리 수)
- Joined (가입일)
- 모든 정렬은 DESC(내림차순) 지원

## Implementation Requirements

### UI/UX
- **다크모드**: 시스템 설정 연동 (prefers-color-scheme)
- **반응형**: SM / MD / LG / XL 브레이크포인트 지원
- **디자인**: Material Design 칼라 팔레트
- **폰트**: Apple 기본 폰트 → Noto Sans 폴백

### Data Fetching
- **SSR**: 첫 페이지는 Server-Side Rendering
- **CSR**: 이후 페이지는 Client-Side Rendering (무한 스크롤)
- **API**: 모든 GitHub API 호출은 서버 라우트에서 수행 (Authorization token 사용)
- **Rate Limiting**:
  - Rate limit 초과 시 재시도 로직
  - 남은 쿼터 UI에 표시

### Image Processing
- **아바타 렌더링**: HTML5 Canvas + WebAssembly 사용
- 성능 최적화를 위한 이미지 처리

### Testing Requirements
- **필수 테스트 대상**:
  - 검색 쿼리 빌더 로직
  - 정렬 및 페이징 로직
  - 데이터 매핑 및 표시 안전성
  - SSR/CSR 경계 로직
- **추가 테스트**: 각 추가 테스트 건당 가산점

## MUI + Tailwind CSS 주의사항

### CSS 우선순위 충돌
- MUI의 CSS-in-JS와 Tailwind의 utility classes가 충돌할 수 있음
- MUI 컴포넌트의 기본 스타일을 Tailwind로 덮어쓸 때 `!important` 필요할 수 있음

### 권장 사용 패턴
- **MUI**: UI 컴포넌트 자체 (Button, TextField, Card 등)
- **Tailwind**: 레이아웃 및 간격 조정 (flex, grid, padding, margin 등)

### 설정
```javascript
// tailwind.config.js에서 MUI와의 충돌 방지
module.exports = {
  important: '#__next', // MUI보다 높은 우선순위
  corePlugins: {
    preflight: false, // MUI의 기본 스타일 보호
  },
}
```

## API Integration

### GitHub REST API
- **Endpoint**: `GET https://api.github.com/search/users`
- **Documentation**: https://docs.github.com/en/rest/search/search#search-users
- **Authentication**: Personal Access Token (환경변수로 관리)
- **Rate Limits**:
  - Authenticated: 30 requests/minute
  - Unauthenticated: 10 requests/minute

### Server Route Pattern
```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Authorization: token 헤더로 GitHub API 호출
  // Rate limit 처리 및 에러 핸들링
}
```

## Environment Variables

필수 환경변수:
```env
GITHUB_TOKEN=your_github_personal_access_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Prompt Tracking

**중요**: 모든 AI 프롬프트는 `prompts/used_prompts.md`에 기록해야 합니다.
- 프롬프트 링크 제출 불가
- 반드시 파일 내용으로 확인 가능해야 함

## Code Style

### TypeScript
- Strict mode 활성화
- 명시적 타입 선언 권장
- `any` 타입 사용 지양

### Components
- Functional components + hooks 사용
- Props는 interface로 명시적 정의
- 재사용 가능한 컴포넌트는 shared/ui에 배치

### State Management
- Redux Toolkit의 createSlice 사용
- Async 로직은 createAsyncThunk 사용
- 전역 상태는 최소화하고 로컬 상태 우선

## Git Workflow

### Commit Convention
- feat: 새로운 기능
- fix: 버그 수정
- test: 테스트 추가/수정
- refactor: 코드 리팩토링
- docs: 문서 수정
- style: 코드 포맷팅
- chore: 빌드/설정 변경

## Submission Checklist

- [ ] 실행 가능한 전체 소스코드
- [ ] README.md (실행/테스트 방법, 구현 스펙)
- [ ] prompts/used_prompts.md (모든 AI 프롬프트)
- [ ] 테스트 코드 (필수 항목 모두 커버)
- [ ] MUI + Tailwind 주의사항 문서화
- [ ] 프로젝트가 정상 실행되는지 최종 확인