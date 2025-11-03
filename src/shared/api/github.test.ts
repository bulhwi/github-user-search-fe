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

    it('should search users with minimal params', async () => {
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

    it('should search users with page parameter', async () => {
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

    it('should search users with custom perPage', async () => {
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

    it('should search users with sort parameter', async () => {
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

      const params: SearchUsersParams = {
        query: 'test',
        sort: 'followers',
      }

      await githubApi.searchUsers(params)

      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        '/api/search?q=test&page=1&per_page=30&sort=followers'
      )
    })

    it('should search users with order parameter', async () => {
      mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

      const params: SearchUsersParams = {
        query: 'test',
        order: 'desc',
      }

      await githubApi.searchUsers(params)

      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        '/api/search?q=test&page=1&per_page=30&order=desc'
      )
    })

    it('should search users with all parameters', async () => {
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

    it('should handle URL encoding in query', async () => {
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

    it('should return response with page number', async () => {
      const mockResponseWithRateLimit = {
        ...mockResponse,
        rateLimit: {
          limit: 60,
          remaining: 59,
          reset: 1234567890,
        },
      }

      mockedHttpClient.get.mockResolvedValueOnce(mockResponseWithRateLimit)

      const params: SearchUsersParams = {
        query: 'test',
        page: 5,
      }

      const result = await githubApi.searchUsers(params)

      expect(result.page).toBe(5)
      expect(result.rateLimit).toEqual({
        limit: 60,
        remaining: 59,
        reset: 1234567890,
      })
    })

    it('should handle empty results', async () => {
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

    it('should handle API errors', async () => {
      const errorResponse = {
        error: 'Rate limit exceeded',
        status: 429,
      }

      mockedHttpClient.get.mockRejectedValueOnce(errorResponse)

      await expect(githubApi.searchUsers({ query: 'test' })).rejects.toEqual(
        errorResponse
      )
    })

    it('should handle network errors', async () => {
      mockedHttpClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(githubApi.searchUsers({ query: 'test' })).rejects.toThrow(
        'Network error'
      )
    })

    describe('Sort Options', () => {
      it('should support sort by followers', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'followers' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=followers')
        )
      })

      it('should support sort by repositories', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'repositories' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=repositories')
        )
      })

      it('should support sort by joined', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test', sort: 'joined' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('sort=joined')
        )
      })
    })

    describe('Order Options', () => {
      it('should support ascending order', async () => {
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

      it('should support descending order', async () => {
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

    describe('Pagination', () => {
      it('should default to page 1', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const result = await githubApi.searchUsers({ query: 'test' })

        expect(result.page).toBe(1)
      })

      it('should default to perPage 30', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        await githubApi.searchUsers({ query: 'test' })

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          expect.stringContaining('per_page=30')
        )
      })

      it('should handle large page numbers', async () => {
        mockedHttpClient.get.mockResolvedValueOnce(mockResponse)

        const result = await githubApi.searchUsers({ query: 'test', page: 999 })

        expect(result.page).toBe(999)
      })
    })

    describe('Data Mapping', () => {
      it('should map response correctly', async () => {
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

      it('should handle incomplete results', async () => {
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
  })
})
