import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
  GitHubUser,
  SearchFilters,
  SortOption,
  PaginationState,
  LoadingState,
} from '@/types'
import { buildSearchQuery } from '@/features/search/utils/queryBuilder'
import { githubApi } from '@/shared/api/github'

export interface SearchState {
  query: string
  filters: SearchFilters
  sort: SortOption
  order: 'asc' | 'desc'
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

// Async Thunks
export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (
    params: { query: string; page?: number },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const state = getState() as { search: SearchState }
      const queryString = buildSearchQuery(params.query, state.search.filters)

      const response = await githubApi.searchUsers({
        query: queryString,
        page: params.page || 1,
        perPage: state.search.pagination.perPage,
        sort: state.search.sort !== 'best-match' ? state.search.sort : undefined,
        order: state.search.sort !== 'best-match' ? state.search.order : undefined,
      })

      // Rate Limit 정보를 Redux에 저장 (Feature #13)
      if (response.rateLimit) {
        const { setRateLimit, addToast } = await import('../slices/uiSlice')
        const { getRateLimitStatus } = await import(
          '@/shared/utils/rateLimit'
        )

        dispatch(setRateLimit(response.rateLimit))

        // Rate Limit 경고 Toast 표시
        const status = getRateLimitStatus(response.rateLimit)

        if (status === 'exceeded') {
          dispatch(
            addToast({
              message: 'Rate limit exceeded. Please wait for reset.',
              severity: 'error',
            })
          )
        } else if (status === 'critical') {
          dispatch(
            addToast({
              message: `Only ${response.rateLimit.remaining} API requests remaining!`,
              severity: 'warning',
            })
          )
        }
      }

      return response
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Search failed')
    }
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
    setSort: (
      state,
      action: PayloadAction<{ sort: SortOption; order: 'asc' | 'desc' }>
    ) => {
      state.sort = action.payload.sort
      state.order = action.payload.order
    },
    resetSearch: (state) => {
      state.results = []
      state.pagination.page = 1
      state.pagination.totalCount = 0
      state.pagination.hasMore = false
      state.error = null
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
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
        const { items, total_count, page } = action.payload

        if (page === 1) {
          state.results = items
        } else {
          state.results.push(...items)
        }

        state.pagination = {
          ...state.pagination,
          page,
          totalCount: total_count,
          hasMore: state.results.length < total_count,
        }
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = (action.payload as string) || 'Search failed'
      })
  },
})

export const { setQuery, setFilters, setSort, resetSearch, clearFilters } =
  searchSlice.actions
export default searchSlice.reducer
