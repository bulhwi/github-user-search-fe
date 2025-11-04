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

## Development Workflow

### Feature 개발 프로세스

우리가 사용하는 체계적인 개발 워크플로우입니다:

#### 1. Issue 확인 및 분석
```bash
gh issue view <issue_number>
```
- Issue의 요구사항 파악
- Acceptance Criteria 확인
- 관련 API 문서 확인

#### 2. TODO 리스트 작성
TodoWrite 도구를 사용하여 작업 계획 수립:
```
1. 타입 정의 확인/추가
2. Query Builder 메서드 확인/구현
3. UI 컴포넌트 구현 (TDD)
4. Redux/Hooks 통합
5. FilterPanel 통합
6. E2E 테스트 추가
7. 전체 테스트 실행
8. Issue 닫기 및 문서화
```

#### 3. TDD (Test-Driven Development)
**반드시 테스트를 먼저 작성합니다**:

1. **단위 테스트 작성** (`*.test.tsx`)
   ```typescript
   // 예: FollowersFilter.test.tsx
   - 렌더링 테스트
   - 사용자 상호작용 테스트
   - 유효성 검증 테스트
   - Edge Cases 테스트
   - 접근성 테스트
   ```

2. **컴포넌트 구현**
   - 테스트가 통과하도록 구현
   - ReposFilter, LanguageFilter 등 기존 패턴 참고

3. **E2E 테스트 추가** (`cypress/e2e/filter-flow.cy.ts`)
   ```typescript
   - 필터 표시 확인
   - 입력 및 검색 실행
   - API 쿼리 파라미터 검증
   - 다른 필터와의 조합 테스트
   ```

#### 4. 통합 (Integration)

각 레이어별 순차적 통합:

1. **Application Layer**: `useFilters` hook에 필터 함수 추가
2. **Presentation Layer**: `FilterPanel`에 컴포넌트 추가
3. **Template Layer**: `page.tsx`에서 연결

#### 5. 테스트 실행 및 검증

```bash
# 단위 테스트
pnpm test

# TypeScript 체크
pnpm tsc

# Production 빌드
pnpm build
```

**테스트 통과 기준**:
- 모든 단위 테스트 통과
- TypeScript 컴파일 성공
- Production 빌드 성공
- E2E 테스트 시나리오 추가

#### 6. Issue 완료 및 문서화

```bash
# Issue 닫기 (상세한 요약과 함께)
gh issue close <number> --comment "✅ Feature #X 구현 완료
## 구현 내용
...
## 테스트 결과
...
"

# 프롬프트 문서화
# prompts/used_prompts.md에 추가
```

#### 7. Commit & Push

```bash
git add .
git commit -m "feat: implement <feature name> (Feature #X)

<상세 설명>

## 구현 내용
- 컴포넌트 구현
- 테스트 추가
- 통합

## 테스트 결과
- X tests passed (이전 → 현재, +증가)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"

git push
```

### 개발 패턴

#### Component 구조 (Atomic Design)
```typescript
// 1. Props Interface 정의
export interface FilterProps {
  value: Type
  onChange: (value: Type) => void
  className?: string
}

// 2. Component 구현
export function Filter({ value, onChange, className }: FilterProps) {
  // 유효성 검증
  // 이벤트 핸들러
  // JSX 반환
}
```

#### Test 구조
```typescript
describe('ComponentName', () => {
  // Helper functions
  const getElement = () => screen.getByLabelText(...)

  describe('렌더링', () => {
    it('기본 요소들이 표시되어야 한다', () => {})
  })

  describe('사용자 상호작용', () => {
    it('값을 입력할 수 있어야 한다', async () => {
      // ControlledComponent 패턴 사용
    })
  })

  describe('유효성 검증', () => {
    it('에러 상태를 표시해야 한다', () => {})
  })

  describe('Edge Cases', () => {})
  describe('접근성', () => {})
})
```

#### Redux Integration 패턴
```typescript
// 1. useFilters hook에 함수 추가
const setFilter = useCallback(
  (filter: Type) => {
    dispatch(setFilters({ filter }))
    dispatch(searchUsers({ query, page: 1 }))
  },
  [dispatch, query]
)

// 2. FilterPanel Props 확장
interface FilterPanelProps {
  filter: Type
  onFilterChange: (filter: Type) => void
}

// 3. page.tsx에서 연결
const { filters, setFilter } = useFilters()
<FilterPanel filter={filters.filter} onFilterChange={setFilter} />
```

### 주요 원칙

1. **DRY (Don't Repeat Yourself)**
   - RangeFilter 타입 재사용 (ReposFilter, FollowersFilter)
   - 컴포넌트 패턴 재사용

2. **일관성 (Consistency)**
   - 모든 필터가 동일한 구조
   - 테스트 패턴 통일
   - 에러 메시지 형식 통일

3. **접근성 (Accessibility)**
   - aria-label 속성 추가
   - label-input 연결
   - 키보드 네비게이션 지원

4. **문서화 (Documentation)**
   - 모든 프롬프트 기록 (`prompts/used_prompts.md`)
   - 코드 주석으로 의도 명확화
   - README 업데이트

### 성능 최적화

1. **Debouncing**: 텍스트 입력 필터 (Location 500ms)
2. **Controlled Components**: React 상태 관리
3. **useCallback**: 불필요한 리렌더링 방지
4. **Bundle Size**: First Load JS 모니터링

### 문제 해결 패턴

#### userEvent.type() 이슈
```typescript
// ❌ 잘못된 방법
await user.type(input, '100')
expect(handleChange).toHaveBeenCalledWith({ min: 100 })

// ✅ 올바른 방법 (ControlledComponent 사용)
function ControlledComponent() {
  const [value, setValue] = useState({})
  return <Component value={value} onChange={setValue} />
}
await user.type(input, '100')
expect(input).toHaveValue(100)
```

#### MUI DatePicker 테스트
```typescript
// ❌ getByLabelText - 중복 요소 에러
expect(screen.getByLabelText(/created after/i))

// ✅ getAllByText - 존재 확인
expect(screen.getAllByText('Created After').length).toBeGreaterThan(0)

// ✅ getElementById - 특정 요소
const input = document.getElementById('created-after-filter')
```

## Submission Checklist

- [x] 실행 가능한 전체 소스코드
- [x] README.md (실행/테스트 방법, 구현 스펙)
- [x] prompts/used_prompts.md (모든 AI 프롬프트)
- [x] 테스트 코드 (필수 항목 모두 커버)
- [x] MUI + Tailwind 주의사항 문서화
- [x] 프로젝트가 정상 실행되는지 최종 확인
- [x] Feature #1-7 구현 완료 (296 tests passing)
- [x] Clean Architecture + Modularity 적용
- [x] TDD 방식으로 모든 컴포넌트 개발