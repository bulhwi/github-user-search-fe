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
    if (min !== undefined) {
      this.qualifiers.push(`repos:>=${min}`)
    }
    if (max !== undefined) {
      this.qualifiers.push(`repos:<=${max}`)
    }
    return this
  }

  /**
   * Feature #4: 위치
   */
  location(location: string): this {
    if (location) {
      this.qualifiers.push(`location:"${location}"`)
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
    if (min !== undefined) {
      this.qualifiers.push(`followers:>=${min}`)
    }
    if (max !== undefined) {
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
