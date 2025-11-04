/**
 * GitHub Search Query Builder
 *
 * @see https://docs.github.com/en/search-github/searching-on-github/searching-users
 */

import type { SearchFilters } from '@/types'

export class SearchQueryBuilder {
  private query: string
  private qualifiers: string[] = []

  constructor(query: string) {
    this.query = query.trim()
  }

  /**
   * Feature #1: 사용자 또는 조직 타입
   */
  type(type: 'user' | 'org' | null): this {
    if (type) {
      this.qualifiers.push(`type:${type}`)
    }
    return this
  }

  /**
   * Feature #2: 검색 대상 필드 (계정 이름, 성명, 메일)
   */
  searchIn(fields: Array<'login' | 'name' | 'email'>): this {
    if (fields.length > 0) {
      this.qualifiers.push(`in:${fields.join(',')}`)
    }
    return this
  }

  /**
   * Feature #3: 리포지토리 수
   */
  repos(min?: number, max?: number): this {
    if (min !== undefined && max !== undefined) {
      // 둘 다 있으면 범위 문법 사용: repos:min..max
      this.qualifiers.push(`repos:${min}..${max}`)
    } else if (min !== undefined) {
      // min만 있으면: repos:>=min
      this.qualifiers.push(`repos:>=${min}`)
    } else if (max !== undefined) {
      // max만 있으면: repos:<=max
      this.qualifiers.push(`repos:<=${max}`)
    }
    return this
  }

  /**
   * Feature #4: 위치
   * 공백 포함 시 자동으로 따옴표 처리
   */
  location(location: string): this {
    const trimmed = location.trim().replace(/^"|"$/g, '') // 양쪽 공백 제거 및 기존 따옴표 제거
    if (trimmed) {
      // 공백이 포함되어 있으면 따옴표로 감싸기
      if (trimmed.includes(' ')) {
        this.qualifiers.push(`location:"${trimmed}"`)
      } else {
        this.qualifiers.push(`location:${trimmed}`)
      }
    }
    return this
  }

  /**
   * Feature #5: 언어
   */
  language(language: string): this {
    if (language) {
      this.qualifiers.push(`language:${language}`)
    }
    return this
  }

  /**
   * Feature #6: 계정 생성일
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
   * Feature #7: 팔로워 수
   */
  followers(min?: number, max?: number): this {
    if (min !== undefined && max !== undefined) {
      // 둘 다 있으면 범위 문법 사용: followers:min..max
      this.qualifiers.push(`followers:${min}..${max}`)
    } else if (min !== undefined) {
      // min만 있으면: followers:>=min
      this.qualifiers.push(`followers:>=${min}`)
    } else if (max !== undefined) {
      // max만 있으면: followers:<=max
      this.qualifiers.push(`followers:<=${max}`)
    }
    return this
  }

  /**
   * Feature #8: 후원 가능 여부
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

  builder.type(filters.type)
  builder.searchIn(filters.searchIn)
  builder.repos(filters.repos.min, filters.repos.max)
  builder.location(filters.location)
  builder.language(filters.language)
  builder.created(filters.created.after, filters.created.before)
  builder.followers(filters.followers.min, filters.followers.max)
  builder.sponsorable(filters.sponsorable)

  return builder.build()
}
