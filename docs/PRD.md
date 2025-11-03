# Product Requirements Document (PRD)
# GitHub User Search Application

**버전**: 1.0.0
**작성일**: 2025-11-03
**프로젝트 기한**: 3일

---

## 1. 개요 (Overview)

### 1.1 목적
GitHub REST API를 활용하여 사용자를 검색하고, 다양한 필터 조건으로 결과를 정렬 및 탐색할 수 있는 웹 애플리케이션을 개발합니다.

### 1.2 목표
- GitHub 사용자 검색 기능 구현 (8가지 필터)
- 반응형 UI/UX 제공 (다크모드 지원)
- SSR/CSR 하이브리드 렌더링
- 테스트 커버리지 확보 (Unit + E2E)
- AI 활용 개발 과정 문서화

### 1.3 범위
- **포함**: 사용자 검색, 필터링, 정렬, 페이징, 다크모드, 반응형 디자인
- **제외**: 사용자 인증, 즐겨찾기, 검색 히스토리 저장

---

## 2. 기술 스택 (Tech Stack)

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (ES2023)
- **UI Library**: Material-UI (MUI) v6
- **Styling**: Tailwind CSS v3
- **State Management**: Redux Toolkit
- **HTTP Client**: Native Fetch API
- **Design Pattern**: Atomic Design

### 2.2 Testing
- **Unit Test**: Jest + React Testing Library
- **E2E Test**: Cypress

### 2.3 Development Tools
- **Package Manager**: pnpm
- **Build Tool**: Turbo
- **Linting**: ESLint
- **Formatting**: Prettier

### 2.4 API
- **GitHub REST API**: Search Users Endpoint
- **Authentication**: Personal Access Token (서버 라우트)

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 핵심 기능

#### 3.1.1 검색 기능 (8가지)
| # | 기능 | GitHub API Qualifier | 예시 |
|---|------|---------------------|------|
| 1 | 사용자/조직 타입 검색 | `type:user` or `type:org` | `type:user` |
| 2 | 계정 이름/성명/메일 검색 | `in:login`, `in:name`, `in:email` | `tom in:name` |
| 3 | 리포지토리 수 검색 | `repos:>n`, `repos:<n` | `repos:>100` |
| 4 | 위치별 검색 | `location:"Seoul"` | `location:Korea` |
| 5 | 사용 언어 검색 | `language:javascript` | `language:python` |
| 6 | 계정 생성일 검색 | `created:>YYYY-MM-DD` | `created:>2020-01-01` |
| 7 | 팔로워 수 검색 | `followers:>n`, `followers:<n` | `followers:>1000` |
| 8 | 후원 가능 여부 검색 | `is:sponsorable` | `is:sponsorable` |

#### 3.1.2 정렬 기능
- **Best match** (기본값)
- **Followers** (팔로워 수)
- **Repositories** (리포지토리 수)
- **Joined** (가입일)
- 모든 정렬은 DESC (내림차순) 지원

#### 3.1.3 페이징
- **첫 페이지**: SSR (Server-Side Rendering)
- **이후 페이지**: CSR (Client-Side Rendering)
- **무한 스크롤** 방식

#### 3.1.4 사용자 카드
각 검색 결과는 다음 정보를 포함:
- 아바타 이미지 (Canvas + WebAssembly 렌더링)
- 사용자명 (login)
- 이름 (name)
- 위치 (location)
- 팔로워 수 (followers)
- 리포지토리 수 (public_repos)
- 가입일 (created_at)
- 후원 가능 여부 (is_sponsorable)

---

### 3.2 비기능 요구사항 (Non-Functional Requirements)

#### 3.2.1 UI/UX
- **다크모드**: 시스템 설정 자동 감지 (`prefers-color-scheme`)
- **반응형**: SM(600px) / MD(900px) / LG(1200px) / XL(1536px)
- **디자인 시스템**: Material Design 칼라 팔레트
- **폰트**: Apple 기본 폰트 → Noto Sans 폴백

#### 3.2.2 성능
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s
- **아바타 이미지**: Canvas + WebAssembly 최적화

#### 3.2.3 API Rate Limiting
- **인증된 요청**: 30 req/min
- **Rate Limit 초과 시**:
  - 자동 재시도 (exponential backoff)
  - 남은 쿼터 UI에 표시
  - 사용자에게 대기 시간 안내

#### 3.2.4 접근성
- **ARIA 레이블**: 모든 인터랙티브 요소
- **키보드 네비게이션**: Tab, Enter, Escape 지원
- **스크린 리더**: 검색 결과 카운트, 로딩 상태 안내

---

## 4. 기술 아키텍처 (Technical Architecture)

### 4.1 디자인 패턴: Atomic Design

프로젝트는 Atomic Design Pattern을 따릅니다:

- **Atoms**: 기본 UI 요소 (Button, Input, Icon 등)
- **Molecules**: Atoms의 조합 (SearchInput, FilterChip 등)
- **Organisms**: Molecules의 조합 (SearchBar, FilterPanel, UserCard 등)
- **Templates**: Organisms의 레이아웃
- **Pages**: 완전한 페이지

### 4.2 디렉토리 구조
```
github-user-search-fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Server Routes (GitHub API 호출)
│   │   │   └── search/
│   │   │       └── route.ts
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 홈 페이지
│   │   ├── providers.tsx      # Redux Provider + MUI Provider
│   │   └── globals.css
│   │
│   ├── components/            # Atomic Design 컴포넌트
│   │   ├── atoms/            # 기본 UI 요소
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Icon/
│   │   │   ├── Avatar/
│   │   │   └── Badge/
│   │   ├── molecules/        # Atoms 조합
│   │   │   ├── SearchInput/
│   │   │   ├── FilterChip/
│   │   │   ├── UserInfo/
│   │   │   └── StatCard/
│   │   ├── organisms/        # Molecules 조합
│   │   │   ├── SearchBar/
│   │   │   ├── FilterPanel/
│   │   │   ├── UserCard/
│   │   │   ├── UserList/
│   │   │   └── RateLimitIndicator/
│   │   ├── templates/        # 페이지 레이아웃
│   │   │   └── SearchPageTemplate/
│   │   └── pages/            # 완전한 페이지
│   │       └── HomePage/
│   │
│   ├── store/                # Redux Store
│   │   ├── index.ts         # Store Configuration
│   │   ├── hooks.ts         # Typed Hooks (useAppDispatch, useAppSelector)
│   │   └── slices/
│   │       ├── searchSlice.ts
│   │       └── uiSlice.ts
│   │
│   ├── hooks/                # Custom Hooks
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── services/             # API Services
│   │   ├── github.service.ts
│   │   └── query-builder.service.ts
│   │
│   ├── utils/                # Utility Functions
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   │
│   └── types/                # TypeScript 타입 정의
│       ├── github.ts
│       ├── search.ts
│       └── ui.ts
│
├── cypress/                   # E2E 테스트
│   └── e2e/
├── prompts/                   # AI 프롬프트 기록
│   └── used_prompts.md
├── docs/                      # 문서
│   ├── PRD.md                # 본 문서
│   └── TECHNICAL_SPECIFICATION.md
├── CLAUDE.md                  # Claude Code 가이드
└── README.md                  # 프로젝트 설명
```

### 4.3 데이터 플로우

```
User Input (검색어 + 필터)
    ↓
Redux Action Dispatch (setQuery, setFilters)
    ↓
Redux Thunk (searchUsers) - API 호출
    ↓
Server Route API Call (/api/search)
    ↓
GitHub REST API (with Auth Token)
    ↓
Response + Rate Limit Info
    ↓
Redux Store Update (Reducer) - 상태 업데이트
    ↓
React Component Re-render (useSelector)
    ↓
User Sees Results
```

### 4.4 State Management

#### 4.4.1 Redux Toolkit
- **전역 상태 관리**: Redux Store를 통한 중앙 집중식 상태 관리
- **Slice 기반 구조**: 기능별 Slice 분리 (search, ui)
- **RTK Query**: 서버 상태 캐싱 및 동기화 (선택사항)
- **Redux Thunk**: 비동기 작업 처리 (API 호출)
- **Immer 통합**: 불변성 자동 관리

#### 4.4.2 State 구조
- **searchSlice**: 검색 쿼리, 필터, 결과, 페이징 상태
- **uiSlice**: 다크모드, Rate Limit, Toast 알림 상태

---

## 5. API 설계

### 5.1 Server Route
**Endpoint**: `/api/search`

**Method**: `GET`

**Query Parameters**:
- `q`: 검색 쿼리 (string)
- `sort`: 정렬 기준 (string)
- `order`: 정렬 순서 (string, 기본값: desc)
- `page`: 페이지 번호 (number)
- `per_page`: 페이지당 결과 수 (number, 기본값: 30)

**Response**:
```typescript
{
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
  rate_limit: {
    limit: number
    remaining: number
    reset: number
  }
}
```

### 5.2 GitHub API
**Endpoint**: `https://api.github.com/search/users`

**Headers**:
```
Authorization: token <GITHUB_TOKEN>
Accept: application/vnd.github.v3+json
```

---

## 6. UI/UX 설계

### 6.1 화면 구성

#### 6.1.1 메인 페이지
```
┌────────────────────────────────────────────┐
│  [Logo] GitHub User Search   [Dark/Light] │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🔍 Search users...                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Filters: [Type ▼] [Location ▼] [Lang ▼] │
│           [Repos] [Followers] [Date]      │
│                                            │
│  Sort: [Best Match ▼]  Results: 1,234     │
│  Rate Limit: 28/30                         │
│                                            │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐ │
│  │ [@user] John Doe                     │ │
│  │ 📍 Seoul, Korea                      │ │
│  │ 👥 1.2K followers · 📦 45 repos      │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │ [@user2] Jane Smith                  │ │
│  │ 📍 Tokyo, Japan                      │ │
│  │ 👥 890 followers · 📦 32 repos       │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Loading more...] (infinite scroll)      │
└────────────────────────────────────────────┘
```

### 6.2 반응형 디자인

#### SM (< 600px): 모바일
- 단일 컬럼 레이아웃
- 필터는 Drawer로 표시
- 검색바 전체 너비

#### MD (600-900px): 태블릿
- 2 컬럼 그리드
- 필터는 상단에 접을 수 있는 패널

#### LG (900-1200px): 데스크톱
- 3 컬럼 그리드
- 사이드바 필터

#### XL (> 1200px): 와이드 스크린
- 4 컬럼 그리드
- 고정된 사이드바 필터

---

## 7. 테스트 전략

### 7.1 Unit Tests (Jest)

#### 필수 테스트 대상
1. **검색 쿼리 빌더**
   - 필터 조합 로직
   - Query string 생성
   - Edge cases (빈 값, 특수문자)

2. **정렬 로직**
   - 정렬 옵션 변경
   - DESC 정렬 확인

3. **페이징 로직**
   - 페이지 증가
   - hasMore 플래그
   - 무한 스크롤 트리거

4. **데이터 매핑**
   - API 응답 → UI 모델 변환
   - null/undefined 안전성
   - 날짜 포맷팅

5. **SSR/CSR 경계**
   - 첫 페이지 SSR 확인
   - 이후 페이지 CSR 확인

#### 추가 테스트 (가산점)
- Rate limit 재시도 로직
- 에러 핸들링
- Canvas 이미지 렌더링
- 다크모드 토글

### 7.2 E2E Tests (Cypress)

#### 시나리오
1. **기본 검색 플로우**
   - 검색어 입력
   - 결과 확인
   - 사용자 카드 클릭

2. **필터 적용**
   - 타입 필터 선택
   - 위치 필터 입력
   - 결과 필터링 확인

3. **무한 스크롤**
   - 스크롤 다운
   - 새 결과 로드 확인

4. **다크모드**
   - 모드 토글
   - 스타일 변경 확인

---

## 8. 개발 일정

### Day 1: 기반 설정 + 핵심 기능
- [x] 프로젝트 초기화
- [x] 설정 파일 작성
- [x] 디렉토리 구조 생성 (Atomic Design)
- [x] Redux Toolkit 설정
- [ ] 타입 정의
- [ ] GitHub API 클라이언트
- [ ] Redux Slices 구현
- [ ] 검색 기능 (기본)

### Day 2: UI/UX + 고급 기능
- [ ] 검색 UI 컴포넌트
- [ ] 필터 UI 컴포넌트
- [ ] 결과 표시 컴포넌트
- [ ] 무한 스크롤
- [ ] 다크모드
- [ ] 반응형 레이아웃
- [ ] Canvas 이미지 렌더링

### Day 3: 테스트 + 최적화 + 문서화
- [ ] Unit 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 성능 최적화
- [ ] Rate limit 처리
- [ ] README 작성
- [ ] 프롬프트 정리
- [ ] 최종 테스트 및 제출

---

## 9. 제출 체크리스트

### 9.1 필수 항목
- [ ] 실행 가능한 소스코드
- [ ] README.md
  - [ ] 실행 방법
  - [ ] 테스트 방법
  - [ ] 구현 스펙
  - [ ] MUI + Tailwind 주의사항
- [ ] prompts/used_prompts.md
- [ ] 테스트 코드 (필수 항목 모두 커버)
- [ ] 정상 실행 확인

### 9.2 선택 항목 (가산점)
- [ ] 추가 테스트 케이스
- [ ] 성능 최적화 문서
- [ ] 접근성 개선
- [ ] 에러 바운더리
- [ ] 로딩 스켈레톤

---

## 10. 리스크 및 대응

### 10.1 기술적 리스크
| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|-----------|
| MUI + Tailwind 충돌 | 높음 | 중간 | `important` 플래그 사용, preflight 비활성화 |
| Rate limit 초과 | 중간 | 높음 | Token 사용, 재시도 로직, 쿼터 표시 |
| Canvas WebAssembly 복잡도 | 중간 | 중간 | 기본 이미지 폴백, 점진적 개선 |
| SSR/CSR 경계 로직 | 낮음 | 높음 | Next.js 문서 참고, 철저한 테스트 |

### 10.2 일정 리스크
| 리스크 | 대응 방안 |
|--------|-----------|
| 3일 기한 촉박 | MVP 우선, 추가 기능은 시간 남을 시 |
| 테스트 작성 시간 부족 | 필수 테스트만 우선 작성 |

---

## 11. 참고 자료

### 11.1 GitHub API
- [Search Users API](https://docs.github.com/en/rest/search/search#search-users)
- [Rate Limiting](https://docs.github.com/en/rest/rate-limit)

### 11.2 Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [MUI Components](https://mui.com/material-ui/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

### 11.3 Testing
- [Jest](https://jestjs.io/docs/getting-started)
- [Cypress](https://docs.cypress.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 12. 승인 및 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-11-03 | Claude Code | 초기 작성 |
| 2.0.0 | 2025-11-03 | Claude Code | 아키텍처 변경: Clean Architecture → Atomic Design Pattern, HTTP Client: Native Fetch API |
| 3.0.0 | 2025-11-03 | Claude Code | PDF 요구사항 준수: Redux Toolkit으로 회귀, React Query 제거 |

---

**문서 작성자**: Claude Code
**검토자**: -
**승인자**: -