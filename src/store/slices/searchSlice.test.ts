import searchReducer, {
  setQuery,
  setFilters,
  setSort,
  resetSearch,
  clearFilters,
  searchUsers,
  SearchState,
} from './searchSlice'
import type { GitHubUser, SearchFilters } from '@/types'

// Mock GitHub API
jest.mock('@/shared/api/github')

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
    order: 'desc',
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
    it('초기 상태를 반환해야 한다', () => {
      expect(searchReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    describe('setQuery', () => {
      it('검색어를 설정해야 한다', () => {
        const newQuery = 'test user'
        const actual = searchReducer(initialState, setQuery(newQuery))
        expect(actual.query).toBe(newQuery)
      })

      it('빈 문자열로 검색어를 설정할 수 있어야 한다', () => {
        const state = searchReducer(initialState, setQuery('initial'))
        const actual = searchReducer(state, setQuery(''))
        expect(actual.query).toBe('')
      })

      it('특수문자가 포함된 검색어를 설정할 수 있어야 한다', () => {
        const query = 'test@user.com language:TypeScript'
        const actual = searchReducer(initialState, setQuery(query))
        expect(actual.query).toBe(query)
      })
    })

    describe('setFilters', () => {
      it('필터를 부분적으로 업데이트해야 한다', () => {
        const filters: Partial<SearchFilters> = {
          type: 'user',
          location: 'Seoul',
        }
        const actual = searchReducer(initialState, setFilters(filters))
        expect(actual.filters.type).toBe('user')
        expect(actual.filters.location).toBe('Seoul')
        expect(actual.filters.searchIn).toEqual(['login']) // 기존 값 유지
      })

      it('여러 필터를 동시에 설정할 수 있어야 한다', () => {
        const filters: Partial<SearchFilters> = {
          type: 'org',
          location: 'Tokyo',
          language: 'JavaScript',
          repos: { min: 10 },
        }
        const actual = searchReducer(initialState, setFilters(filters))
        expect(actual.filters.type).toBe('org')
        expect(actual.filters.location).toBe('Tokyo')
        expect(actual.filters.language).toBe('JavaScript')
        expect(actual.filters.repos).toEqual({ min: 10 })
      })

      it('빈 객체로 필터를 업데이트하면 변경되지 않아야 한다', () => {
        const actual = searchReducer(initialState, setFilters({}))
        expect(actual.filters).toEqual(initialState.filters)
      })
    })

    describe('setSort', () => {
      it('정렬 옵션을 설정해야 한다', () => {
        const actual = searchReducer(
          initialState,
          setSort({ sort: 'followers', order: 'desc' })
        )
        expect(actual.sort).toBe('followers')
        expect(actual.order).toBe('desc')
      })

      it('정렬 옵션과 order를 함께 변경할 수 있어야 한다', () => {
        const actual = searchReducer(
          initialState,
          setSort({ sort: 'repositories', order: 'asc' })
        )
        expect(actual.sort).toBe('repositories')
        expect(actual.order).toBe('asc')
      })

      it('여러 정렬 옵션을 순차적으로 변경할 수 있어야 한다', () => {
        let state = searchReducer(
          initialState,
          setSort({ sort: 'repositories', order: 'desc' })
        )
        expect(state.sort).toBe('repositories')
        expect(state.order).toBe('desc')

        state = searchReducer(state, setSort({ sort: 'joined', order: 'asc' }))
        expect(state.sort).toBe('joined')
        expect(state.order).toBe('asc')

        state = searchReducer(state, setSort({ sort: 'best-match', order: 'desc' }))
        expect(state.sort).toBe('best-match')
        expect(state.order).toBe('desc')
      })
    })

    describe('resetSearch', () => {
      it('검색 결과와 페이지네이션을 초기화해야 한다', () => {
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

      it('검색어와 필터는 유지해야 한다', () => {
        const stateWithData: SearchState = {
          ...initialState,
          query: 'test query',
          filters: { ...initialState.filters, type: 'user' },
          results: [{ id: 1, login: 'test' } as GitHubUser],
        }

        const actual = searchReducer(stateWithData, resetSearch())
        expect(actual.query).toBe('test query')
        expect(actual.filters.type).toBe('user')
      })
    })

    describe('clearFilters', () => {
      it('모든 필터를 초기화해야 한다', () => {
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
  })

  describe('Async Thunks - searchUsers', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('성공 케이스', () => {
      it('검색 시작 시 로딩 상태로 변경되어야 한다', () => {
        const action = { type: searchUsers.pending.type }
        const state = searchReducer(initialState, action)

        expect(state.loading).toBe('loading')
        expect(state.error).toBeNull()
      })

      it('첫 페이지 검색 결과를 받아야 한다', () => {
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

      it('두 번째 페이지 결과를 기존 결과에 추가해야 한다 (무한 스크롤)', () => {
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

      it('마지막 페이지에서 hasMore가 false가 되어야 한다', () => {
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

      it('빈 결과를 처리할 수 있어야 한다', () => {
        const action = {
          type: searchUsers.fulfilled.type,
          payload: {
            items: [],
            total_count: 0,
            page: 1,
          },
        }

        const state = searchReducer(initialState, action)

        expect(state.results).toEqual([])
        expect(state.pagination.totalCount).toBe(0)
        expect(state.pagination.hasMore).toBe(false)
        expect(state.loading).toBe('succeeded')
      })
    })

    describe('실패 케이스', () => {
      it('검색 실패 시 에러 메시지를 설정해야 한다', () => {
        const errorMessage = 'API Error'
        const action = {
          type: searchUsers.rejected.type,
          payload: errorMessage,
        }

        const state = searchReducer(initialState, action)

        expect(state.loading).toBe('failed')
        expect(state.error).toBe(errorMessage)
      })

      it('에러 메시지 없이 실패하면 기본 메시지를 설정해야 한다', () => {
        const action = {
          type: searchUsers.rejected.type,
        }

        const state = searchReducer(initialState, action)

        expect(state.loading).toBe('failed')
        expect(state.error).toBe('Search failed')
      })

      it('네트워크 에러 메시지를 처리해야 한다', () => {
        const action = {
          type: searchUsers.rejected.type,
          payload: 'Network request failed',
        }

        const state = searchReducer(initialState, action)

        expect(state.loading).toBe('failed')
        expect(state.error).toBe('Network request failed')
      })

      it('Rate Limit 에러를 처리해야 한다', () => {
        const action = {
          type: searchUsers.rejected.type,
          payload: 'Rate limit exceeded',
        }

        const state = searchReducer(initialState, action)

        expect(state.loading).toBe('failed')
        expect(state.error).toBe('Rate limit exceeded')
      })
    })
  })

  describe('Pagination 로직', () => {
    describe('성공 케이스', () => {
      it('첫 페이지 요청 시 기존 결과를 교체해야 한다', () => {
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

      it('두 번째 이후 페이지는 결과를 추가해야 한다', () => {
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

      it('결과가 더 있을 때 hasMore가 true여야 한다', () => {
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

      it('모든 결과를 받았을 때 hasMore가 false여야 한다', () => {
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
  })

  describe('Sort 통합', () => {
    it('검색 중에도 정렬 옵션이 유지되어야 한다', () => {
      let state = searchReducer(
        initialState,
        setSort({ sort: 'followers', order: 'asc' })
      )
      expect(state.sort).toBe('followers')
      expect(state.order).toBe('asc')

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
      expect(state.order).toBe('asc') // order도 유지되어야 함
    })
  })

  describe('Filter 통합', () => {
    it('검색 중에도 필터가 유지되어야 한다', () => {
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
    it('새 검색 시작 시 이전 에러를 초기화해야 한다', () => {
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

    it('검색 실패 시 기존 결과는 유지해야 한다', () => {
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
