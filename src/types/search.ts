/**
 * Search Query Parameters and Filter Types
 */

/**
 * Search Query Parameters
 */
export interface SearchQuery {
  q: string // Search query string
  sort?: SortOption // Sort field
  order?: 'asc' | 'desc' // Sort order
  per_page?: number // Results per page (max 100)
  page?: number // Page number
}

/**
 * Sort Options
 */
export type SortOption = 'best-match' | 'followers' | 'repositories' | 'joined'

/**
 * Search Filters
 */
export interface SearchFilters {
  type: AccountType | null // User or Organization
  searchIn: SearchInField[] // Search in fields
  location: string // Location filter
  language: string // Language filter
  repos: RangeFilter // Repository count range
  followers: RangeFilter // Followers count range
  created: DateRangeFilter // Account creation date range
  sponsorable: boolean // Sponsorable accounts only
}

/**
 * Account Type (Feature #1)
 */
export type AccountType = 'user' | 'org'

/**
 * Search In Fields (Feature #2)
 */
export type SearchInField = 'login' | 'name' | 'email'

/**
 * Range Filter (Feature #3, #7)
 */
export interface RangeFilter {
  min?: number
  max?: number
}

/**
 * Date Range Filter (Feature #6)
 */
export interface DateRangeFilter {
  after?: string // YYYY-MM-DD
  before?: string // YYYY-MM-DD
}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number
  perPage: number
  totalCount: number
  hasMore: boolean
}
