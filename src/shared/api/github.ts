/**
 * GitHub API Client (Infrastructure Layer)
 *
 * GitHub REST API 호출을 담당하는 클라이언트
 * - searchUsers: 사용자 검색
 * - Rate Limit 정보 처리 (Feature #13)
 */

import { httpClient } from './client'
import { retryWithBackoff } from '@/shared/utils/rateLimit'
import type { GitHubSearchResponse, RateLimit } from '@/types'

export interface SearchUsersParams {
  query: string
  page?: number
  perPage?: number
  sort?: 'followers' | 'repositories' | 'joined'
  order?: 'asc' | 'desc'
}

export interface SearchUsersResponse extends GitHubSearchResponse {
  page: number
  rateLimit?: RateLimit
}

class GitHubApiClient {
  /**
   * 사용자 검색 (Rate Limit 자동 재시도 포함)
   * @see https://docs.github.com/en/rest/search/search#search-users
   */
  async searchUsers(params: SearchUsersParams): Promise<SearchUsersResponse> {
    const searchParams = new URLSearchParams({
      q: params.query,
      page: (params.page || 1).toString(),
      per_page: (params.perPage || 30).toString(),
    })

    if (params.sort) {
      searchParams.append('sort', params.sort)
    }

    if (params.order) {
      searchParams.append('order', params.order)
    }

    // Rate Limit 자동 재시도 래핑
    const response = await retryWithBackoff(
      () =>
        httpClient.get<SearchUsersResponse>(
          `/api/search?${searchParams.toString()}`
        ),
      {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt, delay, error) => {
          console.log(
            `[GitHubApiClient] Rate limit retry ${attempt}/3 after ${delay}ms:`,
            error.message
          )
        },
      }
    )

    return {
      ...response,
      page: params.page || 1,
    }
  }
}

export const githubApi = new GitHubApiClient()
