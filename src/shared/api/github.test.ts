import { githubApi, SearchUsersParams } from './github'
import { httpClient } from './client'
import type { GitHubUser } from '@/types'

// Mock httpClient
jest.mock('./client')
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>

describe('GitHubApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('searchUsers', () => {
    const mockUsers: GitHubUser[] = [
      {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://example.com/avatar1.png',
        html_url: 'https://github.com/testuser',
        type: 'User',
      } as GitHubUser,
    ]

    const mockResponse = {
      items: mockUsers,
      total_count: 1,
      incomplete_results: false,
    }

    describe('성공 케이스 - 기본 검색', () => {
      it('최소 파라미터로 사용자를 검색할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const params: SearchUsersParams = {
          query: 'test',
        }

        const result = await githubApi.searchUsers(params)

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          '/api/search?q=test&page=1&per_page=30'
        )
        expect(result.items).toEqual(mockUsers)
        expect(result.total_count).toBe(1)
        expect(result.page).toBe(1)
      })

      it('페이지 번호를 지정하여 검색할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const params: SearchUsersParams = {
          query: 'test',
          page: 3,
        }

        const result = await githubApi.searchUsers(params)

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          '/api/search?q=test&page=3&per_page=30'
        )
        expect(result.page).toBe(3)
      })

      it('페이지 당 결과 수를 지정할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const params: SearchUsersParams = {
          query: 'test',
          perPage: 50,
        }

        await githubApi.searchUsers(params)

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          '/api/search?q=test&page=1&per_page=50'
        )
      })

      it('모든 파라미터를 지정하여 검색할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const params: SearchUsersParams = {
          query: 'type:user location:Seoul',
          page: 2,
          perPage: 20,
          sort: 'repositories',
          order: 'desc',
        }

        await githubApi.searchUsers(params)

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          '/api/search?q=type%3Auser+location%3ASeoul&page=2&per_page=20&sort=repositories&order=desc'
        )
      })
    })

    describe('성공 케이스 - 정렬 옵션', () => {
      it('팔로워 수로 정렬할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'followers' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=followers')
        )
      })

      it('리포지토리 수로 정렬할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'repositories' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=repositories')
        )
      })

      it('가입일로 정렬할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'joined' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=joined')
        )
      })
    })

    describe('성공 케이스 - 정렬 순서', () => {
      it('오름차순으로 정렬할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({
          query: 'test',
          sort: 'followers',
          order: 'asc',
        })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('order=asc')
        )
      })

      it('내림차순으로 정렬할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({
          query: 'test',
          sort: 'repositories',
          order: 'desc',
        })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('order=desc')
        )
      })
    })

    describe('성공 케이스 - 페이지네이션', () => {
      it('페이지 기본값은 1이어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const result = await githubApi.searchUsers({ query: 'test' })

        expect(result.page).toBe(1)
      })

      it('페이지당 결과 수 기본값은 30이어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('per_page=30')
        )
      })

      it('큰 페이지 번호를 처리할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const result = await githubApi.searchUsers({ query: 'test', page: 999 })

        expect(result.page).toBe(999)
      })
    })

    describe('성공 케이스 - URL 인코딩', () => {
      it('쿼리 문자열이 URL 인코딩되어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const params: SearchUsersParams = {
          query: 'test user language:TypeScript location:Seoul, Korea',
        }

        await githubApi.searchUsers(params)

        const calledUrl = mockedHttpClient.get.mock.calls[0][0]
        expect(calledUrl).toContain('test+user')
        expect(calledUrl).toContain('language%3ATypeScript')
        expect(calledUrl).toContain('Seoul')
      })

      it('특수문자가 올바르게 인코딩되어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test@example.com' })

        const calledUrl = mockedHttpClient.get.mock.calls[0][0]
        expect(calledUrl).toContain('test%40example.com')
      })
    })

    describe('성공 케이스 - 데이터 매핑', () => {
      it('응답 데이터가 올바르게 매핑되어야 한다', async () => {
        const detailedMockResponse = {
          items: [
            {
              id: 123,
              login: 'testuser',
              avatar_url: 'https://avatars.githubusercontent.com/u/123',
              html_url: 'https://github.com/testuser',
              type: 'User',
              name: 'Test User',
              company: 'Test Company',
              blog: 'https://testuser.com',
              location: 'Seoul',
              email: null,
              bio: 'Test bio',
              public_repos: 10,
              followers: 100,
              following: 50,
            },
          ],
          total_count: 1,
          incomplete_results: false,
        }

        mockedHttpClient.get.mockResolvedValueOnce(detailedMockResponse)

        const result = await githubApi.searchUsers({ query: 'test' })

        expect(result.items[0]).toMatchObject({
          id: 123,
          login: 'testuser',
          avatar_url: 'https://avatars.githubusercontent.com/u/123',
          html_url: 'https://github.com/testuser',
          type: 'User',
          name: 'Test User',
          location: 'Seoul',
          public_repos: 10,
          followers: 100,
        })
      })

      it('rate limit 정보가 포함된 응답을 처리할 수 있어야 한다', async () => {
        const mockResponseWithRateLimit = {
          ...mockResponse,
          rateLimit: {
            limit: 60,
            remaining: 59,
            reset: 1234567890,
          },
        }

        mockedHttpClient.get.mockResolvedValueOnce(mockResponseWithRateLimit)

        const result = await githubApi.searchUsers({ query: 'test', page: 5 })

        expect(result.page).toBe(5)
        expect(result.rateLimit).toEqual({
          limit: 60,
          remaining: 59,
          reset: 1234567890,
        })
      })

      it('incomplete_results 플래그를 처리할 수 있어야 한다', async () => {
        const incompleteResponse = {
          items: mockUsers,
          total_count: 1000,
          incomplete_results: true,
        }

        mockedHttpClient.get.mockResolvedValueOnce(incompleteResponse)

        const result = await githubApi.searchUsers({ query: 'test' })

        expect(result.incomplete_results).toBe(true)
      })
    })

    describe('성공 케이스 - Edge Cases', () => {
      it('빈 검색 결과를 처리할 수 있어야 한다', async () => {
        const emptyResponse = {
          items: [],
          total_count: 0,
          incomplete_results: false,
        }

        mockedHttpClient.get.mockResolvedValueOnce(emptyResponse)

        const result = await githubApi.searchUsers({ query: 'nonexistent' })

        expect(result.items).toEqual([])
        expect(result.total_count).toBe(0)
      })

      it('매우 긴 쿼리 문자열을 처리할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const longQuery = 'test '.repeat(100)
        await githubApi.searchUsers({ query: longQuery })

        expect(mockedHttpClient.get).toHaveBeenCalled()
      })

      it('page가 없으면 기본값 1이 사용되어야 한다', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const result = await githubApi.searchUsers({ query: 'test' })

        // page가 없으면 기본값 1 사용
        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('page=1')
        )
        expect(result.page).toBe(1)
      })
    })

    describe('실패 케이스', () => {
      it('API 에러를 처리할 수 있어야 한다', async () => {
        const errorResponse = {
          error: 'Rate limit exceeded',
          status: 429,
        }

        mockedHttpClient.get.mockRejectedValueOnce(errorResponse)

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toEqual(
          errorResponse
        )
      })

      it('네트워크 에러를 처리할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockRejectedValueOnce(new Error('Network error'))

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toThrow(
          'Network error'
        )
      })

      it('400 Bad Request를 처리할 수 있어야 한다', async () => {
        const badRequestError = {
          error: 'Validation Failed',
          status: 400,
        }

        mockedHttpClient.get.mockRejectedValueOnce(badRequestError)

        await expect(githubApi.searchUsers({ query: '' })).rejects.toEqual(
          badRequestError
        )
      })

      it('401 Unauthorized를 처리할 수 있어야 한다', async () => {
        const unauthorizedError = {
          error: 'Bad credentials',
          status: 401,
        }

        mockedHttpClient.get.mockRejectedValueOnce(unauthorizedError)

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toEqual(
          unauthorizedError
        )
      })

      it('403 Forbidden (Rate Limit)을 처리할 수 있어야 한다', async () => {
        const rateLimitError = {
          error: 'API rate limit exceeded',
          status: 403,
        }

        mockedHttpClient.get.mockRejectedValueOnce(rateLimitError)

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toEqual(
          rateLimitError
        )
      })

      it('422 Unprocessable Entity를 처리할 수 있어야 한다', async () => {
        const validationError = {
          error: 'Validation Failed',
          status: 422,
        }

        mockedHttpClient.get.mockRejectedValueOnce(validationError)

        await expect(
          githubApi.searchUsers({ query: 'invalid query syntax:' })
        ).rejects.toEqual(validationError)
      })

      it('500 Internal Server Error를 처리할 수 있어야 한다', async () => {
        const serverError = {
          error: 'Internal Server Error',
          status: 500,
        }

        mockedHttpClient.get.mockRejectedValueOnce(serverError)

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toEqual(
          serverError
        )
      })

      it('타임아웃 에러를 처리할 수 있어야 한다', async () => {
        mockedHttpClient.get.mockRejectedValueOnce(new Error('Request timeout'))

        await expect(githubApi.searchUsers({ query: 'test' })).rejects.toThrow(
          'Request timeout'
        )
      })
    })
  })
})
