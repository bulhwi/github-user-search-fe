/**
 * GitHub API Type Definitions
 * @see https://docs.github.com/en/rest/search/search#search-users
 */

/**
 * GitHub User Search API Response
 */
export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
}

/**
 * GitHub User Object
 */
export interface GitHubUser {
  login: string // Username
  id: number // User ID
  node_id: string // GraphQL Node ID
  avatar_url: string // Avatar Image URL
  gravatar_id: string | null // Gravatar ID
  url: string // API URL
  html_url: string // Profile URL
  type: 'User' | 'Organization' // Account Type
  site_admin: boolean // Site Admin Flag
  name: string | null // Full Name
  company: string | null // Company
  blog: string | null // Blog URL
  location: string | null // Location
  email: string | null // Email
  hireable: boolean | null // Hireable Flag
  bio: string | null // Biography
  twitter_username: string | null // Twitter Username
  public_repos: number // Public Repositories Count
  public_gists: number // Public Gists Count
  followers: number // Followers Count
  following: number // Following Count
  created_at: string // Account Created Date (ISO 8601)
  updated_at: string // Account Updated Date (ISO 8601)
  score: number // Search Relevance Score
}

/**
 * Rate Limit Information
 */
export interface RateLimit {
  limit: number // Maximum requests per hour
  remaining: number // Remaining requests
  reset: number // Reset timestamp (Unix epoch)
  used: number // Used requests
}

/**
 * API Error Response
 */
export interface GitHubAPIError {
  message: string
  documentation_url: string
  status: number
}
