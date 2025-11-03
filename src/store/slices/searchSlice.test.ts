import searchReducer, {
  setQuery,
  setFilters,
  setSort,
  resetSearch,
  clearFilters,
  searchUsers,
  SearchState,
} from './searchSlice'
import type { GitHubUser, SearchFilters, SortOption } from '@/types'
import { configureStore } from '@reduxjs/toolkit'
import { githubApi } from '@/shared/api/github'

// Mock GitHub API
jest.mock('@/shared/api/github')
const mockedGithubApi = githubApi as jest.Mocked<typeof githubApi>

describe('searchSlice', () => {
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

  describe('Reducers', () => {
    it('should return the initial state', () => {
      expect(searchReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    it('should handle setQuery', () => {
      const newQuery = 'test user'
      const actual = searchReducer(initialState, setQuery(newQuery))
      expect(actual.query).toBe(newQuery)
    })

    it('should handle setFilters - partial update', () => {
      const filters: Partial<SearchFilters> = {
        type: 'user',
        location: 'Seoul',
      }
      const actual = searchReducer(initialState, setFilters(filters))
      expect(actual.filters.type).toBe('user')
      expect(actual.filters.location).toBe('Seoul')
      expect(actual.filters.searchIn).toEqual(['login']) // 기존 값 유지
    })

    it('should handle setSort', () => {
      const sort: SortOption = 'followers'
      const actual = searchReducer(initialState, setSort(sort))
      expect(actual.sort).toBe('followers')
    })

    it('should handle setSort - multiple sort changes', () => {
      let state = searchReducer(initialState, setSort('repositories'))
      expect(state.sort).toBe('repositories')

      state = searchReducer(state, setSort('joined'))
      expect(state.sort).toBe('joined')

      state = searchReducer(state, setSort('best-match'))
      expect(state.sort).toBe('best-match')
    })

    it('should handle resetSearch', () => {
      const stateWithData: SearchState = {
        ...initialState,
        results: [{ id: 1, login: 'test' } as GitHubUser],
        pagination: {
          page: 3,
          perPage: 30,
          totalCount: 100,
          hasMore: true,
        },
        error: 'Some error',
      }

      const actual = searchReducer(stateWithData, resetSearch())
      expect(actual.results).toEqual([])
      expect(actual.pagination.page).toBe(1)
      expect(actual.pagination.totalCount).toBe(0)
      expect(actual.pagination.hasMore).toBe(false)
      expect(actual.error).toBeNull()
    })

    it('should handle clearFilters', () => {
      const stateWithFilters: SearchState = {
        ...initialState,
        filters: {
          type: 'org',
          searchIn: ['login', 'name'],
          location: 'Tokyo',
          language: 'TypeScript',
          repos: { min: 10, max: 100 },
          followers: { min: 1000 },
          created: { after: '2020-01-01' },
          sponsorable: true,
        },
      }

      const actual = searchReducer(stateWithFilters, clearFilters())
      expect(actual.filters).toEqual(initialState.filters)
    })
  })

  describe('Async Thunks - searchUsers', () => {
    let store: ReturnType<typeof configureStore>

    beforeEach(() => {
      store = configureStore({
        reducer: {
          search: searchReducer,
        },
      })
      jest.clearAllMocks()
    })

    it('should handle searchUsers.pending', () => {
      const action = { type: searchUsers.pending.type }
      const state = searchReducer(initialState, action)

      expect(state.loading).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle searchUsers.fulfilled - first page', () => {
      const mockUsers: GitHubUser[] = [
        { id: 1, login: 'user1' } as GitHubUser,
        { id: 2, login: 'user2' } as GitHubUser,
      ]

      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: mockUsers,
          total_count: 100,
          page: 1,
        },
      }

      const state = searchReducer(initialState, action)

      expect(state.loading).toBe('succeeded')
      expect(state.results).toEqual(mockUsers)
      expect(state.pagination.page).toBe(1)
      expect(state.pagination.totalCount).toBe(100)
      expect(state.pagination.hasMore).toBe(true)
    })

    it('should handle searchUsers.fulfilled - subsequent pages (infinite scroll)', () => {
      const existingUsers: GitHubUser[] = [
        { id: 1, login: 'user1' } as GitHubUser,
        { id: 2, login: 'user2' } as GitHubUser,
      ]

      const stateWithData: SearchState = {
        ...initialState,
        results: existingUsers,
        pagination: {
          page: 1,
          perPage: 30,
          totalCount: 100,
          hasMore: true,
        },
      }

      const newUsers: GitHubUser[] = [
        { id: 3, login: 'user3' } as GitHubUser,
        { id: 4, login: 'user4' } as GitHubUser,
      ]

      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: newUsers,
          total_count: 100,
          page: 2,
        },
      }

      const state = searchReducer(stateWithData, action)

      expect(state.results).toEqual([...existingUsers, ...newUsers])
      expect(state.pagination.page).toBe(2)
      expect(state.pagination.hasMore).toBe(true)
    })

    it('should handle searchUsers.fulfilled - last page (no more results)', () => {
      const existingUsers: GitHubUser[] = Array.from({ length: 28 }, (_, i) => ({
        id: i + 1,
        login: `user${i + 1}`,
      })) as GitHubUser[]

      const stateWithData: SearchState = {
        ...initialState,
        results: existingUsers,
        pagination: {
          page: 1,
          perPage: 30,
          totalCount: 30,
          hasMore: true,
        },
      }

      const lastUsers: GitHubUser[] = [
        { id: 29, login: 'user29' } as GitHubUser,
        { id: 30, login: 'user30' } as GitHubUser,
      ]

      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: lastUsers,
          total_count: 30,
          page: 2,
        },
      }

      const state = searchReducer(stateWithData, action)

      expect(state.results.length).toBe(30)
      expect(state.pagination.hasMore).toBe(false)
    })

    it('should handle searchUsers.rejected', () => {
      const errorMessage = 'API Error'
      const action = {
        type: searchUsers.rejected.type,
        payload: errorMessage,
      }

      const state = searchReducer(initialState, action)

      expect(state.loading).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })

    it('should handle searchUsers.rejected - without payload', () => {
      const action = {
        type: searchUsers.rejected.type,
      }

      const state = searchReducer(initialState, action)

      expect(state.loading).toBe('failed')
      expect(state.error).toBe('Search failed')
    })
  })

  describe('Pagination Logic', () => {
    it('should replace results when page is 1', () => {
      const oldResults = [{ id: 1, login: 'old' } as GitHubUser]
      const stateWithData: SearchState = {
        ...initialState,
        results: oldResults,
      }

      const newResults = [{ id: 2, login: 'new' } as GitHubUser]
      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: newResults,
          total_count: 50,
          page: 1,
        },
      }

      const state = searchReducer(stateWithData, action)
      expect(state.results).toEqual(newResults)
      expect(state.results).not.toContain(oldResults[0])
    })

    it('should append results when page > 1', () => {
      const page1Results = [{ id: 1, login: 'user1' } as GitHubUser]
      const stateWithData: SearchState = {
        ...initialState,
        results: page1Results,
        pagination: {
          page: 1,
          perPage: 30,
          totalCount: 60,
          hasMore: true,
        },
      }

      const page2Results = [{ id: 2, login: 'user2' } as GitHubUser]
      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: page2Results,
          total_count: 60,
          page: 2,
        },
      }

      const state = searchReducer(stateWithData, action)
      expect(state.results).toHaveLength(2)
      expect(state.results[0]).toEqual(page1Results[0])
      expect(state.results[1]).toEqual(page2Results[0])
    })

    it('should calculate hasMore correctly - has more', () => {
      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: Array(30).fill({ id: 1, login: 'user' }),
          total_count: 100,
          page: 1,
        },
      }

      const state = searchReducer(initialState, action)
      expect(state.pagination.hasMore).toBe(true)
    })

    it('should calculate hasMore correctly - no more', () => {
      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: Array(30).fill({ id: 1, login: 'user' }),
          total_count: 30,
          page: 1,
        },
      }

      const state = searchReducer(initialState, action)
      expect(state.pagination.hasMore).toBe(false)
    })
  })

  describe('Sort Integration', () => {
    it('should not reset sort when searching', () => {
      let state = searchReducer(initialState, setSort('followers'))
      expect(state.sort).toBe('followers')

      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: [{ id: 1, login: 'user1' } as GitHubUser],
          total_count: 10,
          page: 1,
        },
      }

      state = searchReducer(state, action)
      expect(state.sort).toBe('followers') // sort는 유지되어야 함
    })
  })

  describe('Filter Integration', () => {
    it('should not reset filters when searching', () => {
      let state = searchReducer(
        initialState,
        setFilters({ type: 'user', location: 'Seoul' })
      )
      expect(state.filters.type).toBe('user')
      expect(state.filters.location).toBe('Seoul')

      const action = {
        type: searchUsers.fulfilled.type,
        payload: {
          items: [{ id: 1, login: 'user1' } as GitHubUser],
          total_count: 10,
          page: 1,
        },
      }

      state = searchReducer(state, action)
      expect(state.filters.type).toBe('user')
      expect(state.filters.location).toBe('Seoul')
    })
  })

  describe('Error Handling', () => {
    it('should clear error when starting new search', () => {
      const stateWithError: SearchState = {
        ...initialState,
        error: 'Previous error',
        loading: 'failed',
      }

      const action = { type: searchUsers.pending.type }
      const state = searchReducer(stateWithError, action)

      expect(state.error).toBeNull()
      expect(state.loading).toBe('loading')
    })

    it('should preserve results when search fails', () => {
      const existingResults = [{ id: 1, login: 'user1' } as GitHubUser]
      const stateWithResults: SearchState = {
        ...initialState,
        results: existingResults,
        loading: 'succeeded',
      }

      const action = {
        type: searchUsers.rejected.type,
        payload: 'Network error',
      }

      const state = searchReducer(stateWithResults, action)
      expect(state.results).toEqual(existingResults)
      expect(state.error).toBe('Network error')
    })
  })
})
