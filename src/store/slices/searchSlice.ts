import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
  GitHubUser,
  SearchFilters,
  SortOption,
  PaginationState,
  LoadingState,
} from '@/types'
import { buildSearchQuery } from '@/utils/queryBuilder'

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
  async (
    params: { query: string; page?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { search: SearchState }
      const queryString = buildSearchQuery(params.query, state.search.filters)

      const searchParams = new URLSearchParams()
      searchParams.set('q', queryString)
      if (state.search.sort !== 'best-match') {
        searchParams.set('sort', state.search.sort)
      }
      searchParams.set('order', 'desc')
      searchParams.set('page', (params.page || 1).toString())
      searchParams.set('per_page', state.search.pagination.perPage.toString())

      const response = await fetch(`/api/search?${searchParams.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message || 'Search failed')
      }

      const data = await response.json()
      return {
        ...data,
        page: params.page || 1,
      }
    } catch (error) {
      return rejectWithValue('Network error')
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
    setSort: (state, action: PayloadAction<SortOption>) => {
      state.sort = action.payload
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
