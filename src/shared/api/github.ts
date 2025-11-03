/**
 * GitHub API Client (Infrastructure Layer)
 *
 * GitHub REST API 호출을 담당하는 클라이언트
 * - searchUsers: 사용자 검색
 */

import { httpClient } from './client'
import type { GitHubSearchResponse } from '@/types'

export interface SearchUsersParams {
  query: string
  page?: number
  perPage?: number
  sort?: 'followers' | 'repositories' | 'joined'
  order?: 'asc' | 'desc'
}

export interface SearchUsersResponse extends GitHubSearchResponse {
  page: number
  rateLimit?: {
    limit: number
    remaining: number
    reset: number
  }
}

class GitHubApiClient {
  /**
   * 사용자 검색
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

    const response = await httpClient.get<SearchUsersResponse>(
      `/api/search?${searchParams.toString()}`
    )

    return {
      ...response,
      page: params.page || 1,
    }
  }
}

export const githubApi = new GitHubApiClient()
