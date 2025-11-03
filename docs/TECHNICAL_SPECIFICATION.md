# Technical Specification
# GitHub User Search Application

**버전**: 2.0.0
**작성일**: 2025-11-03
**최종 수정**: 2025-11-03
**상태**: Draft

> **⚠️ 중요 업데이트 (v2.0.0)**
>
> 아키텍처가 다음과 같이 변경되었습니다:
> - **상태 관리**: ~~Redux Toolkit~~ → **React Query + Context API**
> - **디자인 패턴**: ~~Clean Architecture~~ → **Atomic Design Pattern**
> - **HTTP Client**: **Axios** 추가
>
> 이 문서는 새로운 아키텍처 기준으로 업데이트되었습니다.

---

## 목차

1. [개요](#1-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [데이터 모델](#4-데이터-모델)
5. [API 설계](#5-api-설계)
6. [상태 관리](#6-상태-관리)
7. [렌더링 전략](#7-렌더링-전략)
8. [검색 쿼리 빌더](#8-검색-쿼리-빌더)
9. [이미지 처리](#9-이미지-처리)
10. [성능 최적화](#10-성능-최적화)
11. [보안](#11-보안)
12. [테스트 전략](#12-테스트-전략)
13. [배포 전략](#13-배포-전략)

---

## 1. 개요

GitHub REST API를 활용한 사용자 검색 웹 애플리케이션의 기술 명세서입니다. 본 문서는 시스템의 기술적 구현 세부사항을 정의합니다.

### 1.1 기술적 목표

- **성능**: FCP < 1.8s, TTI < 3.8s
- **확장성**: Atomic Design Pattern 기반 컴포넌트 모듈화
- **유지보수성**: TypeScript strict mode, 명확한 타입 정의
- **테스트 커버리지**: 핵심 로직 100% 커버
- **접근성**: WCAG 2.1 AA 준수
- **상태 관리**: React Query로 서버 상태와 클라이언트 상태 명확히 분리

---

## 2. 기술 스택

### 2.1 Core Framework

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14.2.15 | React Framework (App Router) |
| React | 18.3.1 | UI Library |
| TypeScript | 5.9.3 | Type Safety |

### 2.2 State Management

| 기술 | 버전 | 용도 |
|------|------|------|
| @tanstack/react-query | 5.90.6 | Server State Management & Caching |
| @tanstack/react-query-devtools | 5.90.2 | React Query DevTools |
| React Context API | Built-in | Client State Management |
| Axios | 1.13.1 | HTTP Client |

### 2.3 UI/Styling

| 기술 | 버전 | 용도 |
|------|------|------|
| Material-UI | 6.5.0 | Component Library |
| Tailwind CSS | 3.4.18 | Utility-first CSS |
| Emotion | 11.14.0 | CSS-in-JS (MUI dependency) |

### 2.4 Testing

| 기술 | 버전 | 용도 |
|------|------|------|
| Jest | 29.7.0 | Unit Testing |
| React Testing Library | 16.3.0 | Component Testing |
| Cypress | 13.17.0 | E2E Testing |

### 2.5 Development Tools

| 기술 | 버전 | 용도 |
|------|------|------|
| pnpm | 10.19.0+ | Package Manager |
| Turbo | 2.6.0 | Build System |
| ESLint | 8.57.1 | Linting |
| Prettier | 3.6.2 | Code Formatting |

---

## 3. 시스템 아키텍처

### 3.1 Architecture Pattern

**Clean Architecture + Feature-based Modularity**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components, MUI, Tailwind CSS)                  │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (Redux Slices, Thunks, Custom Hooks)                   │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│  (Business Logic, Query Builder, Data Mapping)          │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│  (GitHub API Client, Next.js Server Routes)             │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
src/
├── app/                          # Next.js App Router (Presentation)
│   ├── api/                     # Server Routes (Infrastructure)
│   │   └── search/
│   │       └── route.ts         # GitHub API Proxy
│   ├── layout.tsx               # Root Layout
│   ├── page.tsx                 # Home Page (SSR)
│   ├── providers.tsx            # Global Providers
│   └── globals.css              # Global Styles
│
├── features/                     # Feature Modules
│   ├── search/                  # 검색 기능
│   │   ├── components/          # Search UI Components
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchBar.test.tsx
│   │   ├── hooks/               # Custom Hooks
│   │   │   ├── useSearch.ts
│   │   │   └── useSearch.test.ts
│   │   └── utils/               # Search Utils
│   │       ├── queryBuilder.ts
│   │       └── queryBuilder.test.ts
│   │
│   ├── filters/                 # 필터 기능
│   │   ├── components/
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── TypeFilter.tsx
│   │   │   ├── LocationFilter.tsx
│   │   │   └── AdvancedFilters.tsx
│   │   ├── hooks/
│   │   │   └── useFilters.ts
│   │   └── types/
│   │       └── filters.ts
│   │
│   └── results/                 # 검색 결과 표시
│       ├── components/
│       │   ├── UserCard.tsx
│       │   ├── UserList.tsx
│       │   ├── InfiniteScroll.tsx
│       │   └── UserAvatar.tsx   # Canvas + WASM
│       ├── hooks/
│       │   └── useInfiniteScroll.ts
│       └── utils/
│           └── imageProcessor.ts
│
├── shared/                      # Shared Modules
│   ├── ui/                      # Reusable UI Components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Skeleton/
│   │   └── ErrorBoundary/
│   │
│   ├── api/                     # API Client (Infrastructure)
│   │   ├── client.ts            # Base HTTP Client
│   │   ├── github.ts            # GitHub API Client
│   │   └── rateLimit.ts         # Rate Limit Handler
│   │
│   ├── hooks/                   # Common Hooks
│   │   ├── useDebounce.ts
│   │   ├── useTheme.ts
│   │   └── useMediaQuery.ts
│   │
│   └── utils/                   # Utility Functions
│       ├── date.ts
│       ├── format.ts
│       └── validation.ts
│
├── store/                       # Redux Store (Application)
│   ├── index.ts                # Store Configuration
│   ├── hooks.ts                # Typed Hooks
│   └── slices/
│       ├── searchSlice.ts      # Search State
│       └── uiSlice.ts          # UI State
│
└── types/                       # TypeScript Definitions (Domain)
    ├── github.ts               # GitHub API Types
    ├── search.ts               # Search Types
    └── ui.ts                   # UI Types
```

### 3.3 Component Hierarchy

```
App (layout.tsx)
├── Providers (Redux + MUI Theme)
│   └── HomePage (page.tsx)
│       ├── SearchBar
│       │   └── TextField (MUI)
│       ├── FilterPanel
│       │   ├── TypeFilter
│       │   ├── LocationFilter
│       │   └── AdvancedFilters
│       ├── SortControl
│       ├── RateLimitIndicator
│       └── UserList
│           ├── InfiniteScroll
│           └── UserCard[]
│               ├── UserAvatar (Canvas)
│               ├── UserInfo
│               └── UserStats
```

---

## 4. 데이터 모델

### 4.1 GitHub API Response Types

```typescript
// src/types/github.ts

/**
 * GitHub User Search API Response
 * @see https://docs.github.com/en/rest/search/search#search-users
 */
export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
}

/**
 * GitHub User Object
 */
export interface GitHubUser {
  login: string                    // Username
  id: number                       // User ID
  node_id: string                  // GraphQL Node ID
  avatar_url: string               // Avatar Image URL
  gravatar_id: string | null       // Gravatar ID
  url: string                      // API URL
  html_url: string                 // Profile URL
  type: 'User' | 'Organization'    // Account Type
  site_admin: boolean              // Site Admin Flag
  name: string | null              // Full Name
  company: string | null           // Company
  blog: string | null              // Blog URL
  location: string | null          // Location
  email: string | null             // Email
  hireable: boolean | null         // Hireable Flag
  bio: string | null               // Biography
  twitter_username: string | null  // Twitter Username
  public_repos: number             // Public Repositories Count
  public_gists: number             // Public Gists Count
  followers: number                // Followers Count
  following: number                // Following Count
  created_at: string               // Account Created Date (ISO 8601)
  updated_at: string               // Account Updated Date (ISO 8601)
  score: number                    // Search Relevance Score
}

/**
 * Rate Limit Information
 */
export interface RateLimit {
  limit: number        // Maximum requests per hour
  remaining: number    // Remaining requests
  reset: number        // Reset timestamp (Unix epoch)
  used: number         // Used requests
}

/**
 * API Error Response
 */
export interface GitHubAPIError {
  message: string
  documentation_url: string
  status: number
}
```

### 4.2 Application Domain Types

```typescript
// src/types/search.ts

/**
 * Search Query Parameters
 */
export interface SearchQuery {
  q: string                    // Search query string
  sort?: SortOption            // Sort field
  order?: 'asc' | 'desc'      // Sort order
  per_page?: number            // Results per page (max 100)
  page?: number                // Page number
}

/**
 * Sort Options
 */
export type SortOption = 'best-match' | 'followers' | 'repositories' | 'joined'

/**
 * Search Filters
 */
export interface SearchFilters {
  type: AccountType | null               // User or Organization
  searchIn: SearchInField[]              // Search in fields
  location: string                       // Location filter
  language: string                       // Language filter
  repos: RangeFilter                     // Repository count range
  followers: RangeFilter                 // Followers count range
  created: DateRangeFilter               // Account creation date range
  sponsorable: boolean                   // Sponsorable accounts only
}

export type AccountType = 'user' | 'org'

export type SearchInField = 'login' | 'name' | 'email'

export interface RangeFilter {
  min?: number
  max?: number
}

export interface DateRangeFilter {
  after?: string   // YYYY-MM-DD
  before?: string  // YYYY-MM-DD
}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number
  perPage: number
  totalCount: number
  hasMore: boolean
}
```

### 4.3 UI State Types

```typescript
// src/types/ui.ts

/**
 * Loading State
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed'

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Toast Notification
 */
export interface Toast {
  id: string
  message: string
  severity: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}
```

---

## 5. API 설계

### 5.1 Server Route (Next.js API)

**Endpoint**: `/api/search`

**Purpose**: GitHub API 프록시 서버 (클라이언트에서 직접 호출 방지)

```typescript
// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const sort = searchParams.get('sort')
    const order = searchParams.get('order') || 'desc'
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '30'

    // 2. Validate parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // 3. Call GitHub API with Authorization header
    const githubUrl = new URL('https://api.github.com/search/users')
    githubUrl.searchParams.set('q', query)
    if (sort) githubUrl.searchParams.set('sort', sort)
    githubUrl.searchParams.set('order', order)
    githubUrl.searchParams.set('page', page)
    githubUrl.searchParams.set('per_page', perPage)

    const response = await fetch(githubUrl.toString(), {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    // 4. Handle rate limiting
    const rateLimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
      remaining: parseInt(
        response.headers.get('X-RateLimit-Remaining') || '0'
      ),
      reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
    }

    if (response.status === 403 && rateLimit.remaining === 0) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          rateLimit,
        },
        { status: 429 }
      )
    }

    // 5. Parse and return response
    const data = await response.json()

    return NextResponse.json({
      ...data,
      rateLimit,
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 5.2 Client API

```typescript
// src/shared/api/github.ts

import { SearchQuery, GitHubSearchResponse, RateLimit } from '@/types'

export interface SearchResult {
  data: GitHubSearchResponse
  rateLimit: RateLimit
}

export class GitHubAPIClient {
  private baseUrl = '/api/search'

  /**
   * Search GitHub Users
   */
  async searchUsers(query: SearchQuery): Promise<SearchResult> {
    const params = new URLSearchParams()
    params.set('q', query.q)
    if (query.sort) params.set('sort', query.sort)
    if (query.order) params.set('order', query.order)
    if (query.page) params.set('page', query.page.toString())
    if (query.per_page) params.set('per_page', query.per_page.toString())

    const response = await fetch(`${this.baseUrl}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }
}

export const githubAPI = new GitHubAPIClient()
```

---

## 6. 상태 관리

### 6.1 Redux Store Structure

```typescript
// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 6.2 Search Slice

```typescript
// src/store/slices/searchSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { githubAPI } from '@/shared/api/github'
import {
  GitHubUser,
  SearchFilters,
  SortOption,
  PaginationState,
  LoadingState,
} from '@/types'

export interface SearchState {
  query: string
  filters: SearchFilters
  sort: SortOption
  results: GitHubUser[]
  pagination: PaginationState
  loading: LoadingState
  error: string | null
}

const initialState: SearchState = {
  query: '',
  filters: {
    type: null,
    searchIn: ['login'],
    location: '',
    language: '',
    repos: {},
    followers: {},
    created: {},
    sponsorable: false,
  },
  sort: 'best-match',
  results: [],
  pagination: {
    page: 1,
    perPage: 30,
    totalCount: 0,
    hasMore: false,
  },
  loading: 'idle',
  error: null,
}

// Async Thunks
export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (params: { query: string; page?: number }, { getState }) => {
    const state = getState() as { search: SearchState }
    const queryString = buildQueryString(params.query, state.search.filters)

    const result = await githubAPI.searchUsers({
      q: queryString,
      sort: state.search.sort,
      order: 'desc',
      page: params.page || 1,
      per_page: state.search.pagination.perPage,
    })

    return result
  }
)

// Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSort: (state, action: PayloadAction<SortOption>) => {
      state.sort = action.payload
    },
    resetSearch: (state) => {
      state.results = []
      state.pagination.page = 1
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = 'loading'
        state.error = null
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const { data, rateLimit } = action.payload

        if (action.meta.arg.page === 1) {
          state.results = data.items
        } else {
          state.results.push(...data.items)
        }

        state.pagination = {
          ...state.pagination,
          page: action.meta.arg.page || 1,
          totalCount: data.total_count,
          hasMore: state.results.length < data.total_count,
        }
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error.message || 'Search failed'
      })
  },
})

export const { setQuery, setFilters, setSort, resetSearch } =
  searchSlice.actions
export default searchSlice.reducer

// Helper function
function buildQueryString(query: string, filters: SearchFilters): string {
  let q = query

  if (filters.type) {
    q += ` type:${filters.type}`
  }

  if (filters.searchIn.length > 0) {
    q += ` in:${filters.searchIn.join(',')}`
  }

  if (filters.location) {
    q += ` location:"${filters.location}"`
  }

  if (filters.language) {
    q += ` language:${filters.language}`
  }

  if (filters.repos.min !== undefined) {
    q += ` repos:>=${filters.repos.min}`
  }
  if (filters.repos.max !== undefined) {
    q += ` repos:<=${filters.repos.max}`
  }

  if (filters.followers.min !== undefined) {
    q += ` followers:>=${filters.followers.min}`
  }
  if (filters.followers.max !== undefined) {
    q += ` followers:<=${filters.followers.max}`
  }

  if (filters.created.after) {
    q += ` created:>${filters.created.after}`
  }
  if (filters.created.before) {
    q += ` created:<${filters.created.before}`
  }

  if (filters.sponsorable) {
    q += ` is:sponsorable`
  }

  return q.trim()
}
```

### 6.3 UI Slice

```typescript
// src/store/slices/uiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeMode, Toast, RateLimit } from '@/types'

export interface UIState {
  themeMode: ThemeMode
  rateLimit: RateLimit | null
  toasts: Toast[]
}

const initialState: UIState = {
  themeMode: 'light',
  rateLimit: null,
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
    },
    setRateLimit: (state, action: PayloadAction<RateLimit>) => {
      state.rateLimit = action.payload
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString(),
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      )
    },
  },
})

export const { setThemeMode, setRateLimit, addToast, removeToast } =
  uiSlice.actions
export default uiSlice.reducer
```

---

## 7. 렌더링 전략

### 7.1 SSR (Server-Side Rendering)

**첫 페이지만 SSR 사용**

```typescript
// src/app/page.tsx

import { githubAPI } from '@/shared/api/github'
import { SearchPage } from '@/features/search/components/SearchPage'

export default async function Home() {
  // SSR: 초기 검색 결과 가져오기
  let initialResults = null

  try {
    const result = await githubAPI.searchUsers({
      q: 'followers:>1000', // 기본 검색 쿼리
      sort: 'followers',
      order: 'desc',
      page: 1,
      per_page: 30,
    })

    initialResults = result
  } catch (error) {
    console.error('SSR Search Error:', error)
  }

  return <SearchPage initialResults={initialResults} />
}
```

### 7.2 CSR (Client-Side Rendering)

**이후 페이지는 CSR + 무한 스크롤**

```typescript
// src/features/results/hooks/useInfiniteScroll.ts

import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { searchUsers } from '@/store/slices/searchSlice'

export function useInfiniteScroll() {
  const dispatch = useAppDispatch()
  const { pagination, loading, query } = useAppSelector((state) => state.search)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (loading !== 'loading' && pagination.hasMore) {
      dispatch(
        searchUsers({
          query,
          page: pagination.page + 1,
        })
      )
    }
  }, [dispatch, loading, pagination, query])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore])

  return { observerTarget }
}
```

---

## 8. 검색 쿼리 빌더

### 8.1 Query Builder 로직

```typescript
// src/features/search/utils/queryBuilder.ts

import { SearchFilters } from '@/types'

/**
 * GitHub Search Query Builder
 *
 * @see https://docs.github.com/en/search-github/searching-on-github/searching-users
 */
export class SearchQueryBuilder {
  private query: string
  private qualifiers: string[] = []

  constructor(query: string) {
    this.query = query.trim()
  }

  /**
   * 1. 사용자 또는 조직 타입
   */
  type(type: 'user' | 'org'): this {
    if (type) {
      this.qualifiers.push(`type:${type}`)
    }
    return this
  }

  /**
   * 2. 검색 대상 필드 (계정 이름, 성명, 메일)
   */
  searchIn(fields: Array<'login' | 'name' | 'email'>): this {
    if (fields.length > 0) {
      this.qualifiers.push(`in:${fields.join(',')}`)
    }
    return this
  }

  /**
   * 3. 리포지토리 수
   */
  repos(min?: number, max?: number): this {
    if (min !== undefined) {
      this.qualifiers.push(`repos:>=${min}`)
    }
    if (max !== undefined) {
      this.qualifiers.push(`repos:<=${max}`)
    }
    return this
  }

  /**
   * 4. 위치
   */
  location(location: string): this {
    if (location) {
      this.qualifiers.push(`location:"${location}"`)
    }
    return this
  }

  /**
   * 5. 언어
   */
  language(language: string): this {
    if (language) {
      this.qualifiers.push(`language:${language}`)
    }
    return this
  }

  /**
   * 6. 계정 생성일
   */
  created(after?: string, before?: string): this {
    if (after) {
      this.qualifiers.push(`created:>${after}`)
    }
    if (before) {
      this.qualifiers.push(`created:<${before}`)
    }
    return this
  }

  /**
   * 7. 팔로워 수
   */
  followers(min?: number, max?: number): this {
    if (min !== undefined) {
      this.qualifiers.push(`followers:>=${min}`)
    }
    if (max !== undefined) {
      this.qualifiers.push(`followers:<=${max}`)
    }
    return this
  }

  /**
   * 8. 후원 가능 여부
   */
  sponsorable(enabled: boolean): this {
    if (enabled) {
      this.qualifiers.push('is:sponsorable')
    }
    return this
  }

  /**
   * Build final query string
   */
  build(): string {
    const parts = [this.query, ...this.qualifiers].filter(Boolean)
    return parts.join(' ')
  }
}

/**
 * Helper function to build query from filters
 */
export function buildSearchQuery(
  query: string,
  filters: SearchFilters
): string {
  const builder = new SearchQueryBuilder(query)

  if (filters.type) {
    builder.type(filters.type)
  }

  if (filters.searchIn.length > 0) {
    builder.searchIn(filters.searchIn)
  }

  builder.repos(filters.repos.min, filters.repos.max)
  builder.location(filters.location)
  builder.language(filters.language)
  builder.created(filters.created.after, filters.created.before)
  builder.followers(filters.followers.min, filters.followers.max)
  builder.sponsorable(filters.sponsorable)

  return builder.build()
}
```

### 8.2 Query Builder Tests

```typescript
// src/features/search/utils/queryBuilder.test.ts

import { SearchQueryBuilder, buildSearchQuery } from './queryBuilder'

describe('SearchQueryBuilder', () => {
  it('should build basic query', () => {
    const builder = new SearchQueryBuilder('john')
    expect(builder.build()).toBe('john')
  })

  it('should add type qualifier', () => {
    const builder = new SearchQueryBuilder('john').type('user')
    expect(builder.build()).toBe('john type:user')
  })

  it('should add multiple qualifiers', () => {
    const builder = new SearchQueryBuilder('john')
      .type('user')
      .location('Seoul')
      .followers(100)

    expect(builder.build()).toBe('john type:user location:"Seoul" followers:>=100')
  })

  it('should handle empty query', () => {
    const builder = new SearchQueryBuilder('').type('user')
    expect(builder.build()).toBe('type:user')
  })

  it('should build query from filters', () => {
    const query = buildSearchQuery('react', {
      type: 'user',
      searchIn: ['name', 'email'],
      location: 'Korea',
      language: 'javascript',
      repos: { min: 10 },
      followers: { min: 100, max: 1000 },
      created: { after: '2020-01-01' },
      sponsorable: true,
    })

    expect(query).toContain('react')
    expect(query).toContain('type:user')
    expect(query).toContain('in:name,email')
    expect(query).toContain('location:"Korea"')
    expect(query).toContain('language:javascript')
    expect(query).toContain('repos:>=10')
    expect(query).toContain('followers:>=100')
    expect(query).toContain('followers:<=1000')
    expect(query).toContain('created:>2020-01-01')
    expect(query).toContain('is:sponsorable')
  })
})
```

---

## 9. 이미지 처리

### 9.1 Canvas + WebAssembly Avatar Rendering

**요구사항**: HTML5 Canvas와 WebAssembly를 사용한 아바타 이미지 렌더링

```typescript
// src/features/results/utils/imageProcessor.ts

/**
 * WebAssembly를 사용한 이미지 처리 유틸리티
 *
 * Note: 실제 WASM 모듈은 별도로 컴파일 필요
 * 여기서는 Canvas API를 사용한 최적화 예시 제공
 */

export interface ImageProcessorOptions {
  width: number
  height: number
  quality?: number
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private wasmModule: any = null // WASM module placeholder

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  /**
   * Load WebAssembly module
   */
  async loadWasm(): Promise<void> {
    // TODO: Load actual WASM module
    // this.wasmModule = await import('./image-processor.wasm')
    console.log('WASM module loaded (placeholder)')
  }

  /**
   * Process image using Canvas
   */
  async processImage(
    imageUrl: string,
    options: ImageProcessorOptions
  ): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not supported')
    }

    const { width, height, quality = 0.9 } = options

    // Load image
    const img = await this.loadImage(imageUrl)

    // Set canvas size
    this.canvas.width = width
    this.canvas.height = height

    // Draw image with smoothing
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
    this.ctx.drawImage(img, 0, 0, width, height)

    // Apply circular mask
    this.applyCircularMask(width, height)

    // Convert to data URL
    return this.canvas.toDataURL('image/png', quality)
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Apply circular mask to canvas
   */
  private applyCircularMask(width: number, height: number): void {
    if (!this.ctx) return

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2

    // Create circular clipping path
    this.ctx.globalCompositeOperation = 'destination-in'
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.fill()
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.canvas = null
    this.ctx = null
  }
}

// Singleton instance
export const imageProcessor = new ImageProcessor()
```

### 9.2 Avatar Component

```typescript
// src/features/results/components/UserAvatar.tsx

'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@mui/material'
import { imageProcessor } from '../utils/imageProcessor'

interface UserAvatarProps {
  src: string
  alt: string
  size?: number
}

export function UserAvatar({ src, alt, size = 48 }: UserAvatarProps) {
  const [processedSrc, setProcessedSrc] = useState<string>(src)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function processAvatar() {
      try {
        // Load WASM module on first use
        await imageProcessor.loadWasm()

        // Process image
        const processed = await imageProcessor.processImage(src, {
          width: size * 2, // 2x for retina
          height: size * 2,
          quality: 0.8,
        })

        if (mounted) {
          setProcessedSrc(processed)
          setLoading(false)
        }
      } catch (error) {
        console.error('Avatar processing error:', error)
        // Fallback to original image
        if (mounted) {
          setProcessedSrc(src)
          setLoading(false)
        }
      }
    }

    processAvatar()

    return () => {
      mounted = false
    }
  }, [src, size])

  return (
    <Avatar
      src={processedSrc}
      alt={alt}
      sx={{
        width: size,
        height: size,
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.3s',
      }}
    />
  )
}
```

---

## 10. 성능 최적화

### 10.1 최적화 전략

| 항목 | 전략 | 도구/기법 |
|------|------|-----------|
| **번들 크기** | Code Splitting | Next.js Dynamic Import |
| **이미지 최적화** | Lazy Loading, WebP | next/image, Canvas |
| **렌더링 최적화** | Memoization | React.memo, useMemo |
| **네트워크** | Request Deduplication | SWR, React Query (optional) |
| **상태 관리** | Selective Re-rendering | Redux Toolkit, Reselect |

### 10.2 Debounced Search

```typescript
// src/shared/hooks/useDebounce.ts

import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### 10.3 Virtual Scrolling (Optional)

무한 스크롤 대신 Virtual Scrolling 사용 가능:

```typescript
// react-window 사용 예시
import { FixedSizeList } from 'react-window'

function UserList({ users }: { users: GitHubUser[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <UserCard user={users[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

---

## 11. 보안

### 11.1 보안 고려사항

| 위협 | 대응 방안 |
|------|-----------|
| **API 키 노출** | 서버 라우트에서만 사용, 환경변수 관리 |
| **XSS** | React의 자동 이스케이프, dangerouslySetInnerHTML 금지 |
| **CSRF** | Next.js 기본 보호 활용 |
| **Rate Limiting** | 서버 사이드에서 요청 제한, 재시도 로직 |

### 11.2 Environment Variables

```bash
# .env.local (Git ignored)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```typescript
// Validation at runtime
if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is required')
}
```

---

## 12. 테스트 전략

### 12.1 Unit Tests (Jest)

**Coverage Target**: 80%+ for core logic

```typescript
// src/features/search/utils/queryBuilder.test.ts
// src/store/slices/searchSlice.test.ts
// src/shared/utils/*.test.ts
```

### 12.2 Component Tests (React Testing Library)

```typescript
// src/features/search/components/SearchBar.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument()
  })

  it('should call onSearch when submitted', () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search users/i)
    fireEvent.change(input, { target: { value: 'john' } })
    fireEvent.submit(input)

    expect(onSearch).toHaveBeenCalledWith('john')
  })
})
```

### 12.3 E2E Tests (Cypress)

```typescript
// cypress/e2e/search.cy.ts

describe('GitHub User Search', () => {
  it('should search users and display results', () => {
    cy.visit('/')

    // Type search query
    cy.get('[data-testid="search-input"]').type('john')
    cy.get('[data-testid="search-button"]').click()

    // Wait for results
    cy.get('[data-testid="user-card"]').should('have.length.greaterThan', 0)

    // Check first result
    cy.get('[data-testid="user-card"]').first().should('contain', 'john')
  })

  it('should apply filters', () => {
    cy.visit('/')

    // Open filters
    cy.get('[data-testid="filter-button"]').click()

    // Select user type
    cy.get('[data-testid="type-filter"]').select('user')

    // Enter location
    cy.get('[data-testid="location-filter"]').type('Seoul')

    // Apply filters
    cy.get('[data-testid="apply-filters"]').click()

    // Verify results
    cy.get('[data-testid="user-card"]').should('exist')
  })
})
```

---

## 13. 배포 전략

### 13.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 13.2 Environment Variables (Vercel)

```
GITHUB_TOKEN=xxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 13.3 Performance Monitoring

- **Vercel Analytics**: 기본 제공
- **Web Vitals**: Next.js 내장 리포팅
- **Custom Metrics**: Google Analytics (optional)

---

## 14. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2025-11-03 | Claude Code | 초기 작성 |
| 2.0.0 | 2025-11-03 | Claude Code | 아키텍처 대규모 변경: Redux Toolkit → React Query + Context API, Clean Architecture → Atomic Design Pattern, Axios 추가 |

---

**문서 작성자**: Claude Code
**검토자**: -
**승인자**: -
