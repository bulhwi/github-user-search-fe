/**
 * Rate Limit Retry 유틸리티
 *
 * Feature #13: Rate Limit 처리 및 UI 표시
 * - Exponential Backoff을 사용한 자동 재시도
 * - Rate Limit 초과 시 대기 후 재시도
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number // 밀리초
  maxDelay?: number // 밀리초
  onRetry?: (attempt: number, delay: number, error: Error) => void
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp (seconds)
  used: number
}

/**
 * Rate Limit 에러인지 확인
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const err = error as any

  // HTTP 429 상태 코드
  if (err.status === 429 || err.statusCode === 429) {
    return true
  }

  // 에러 메시지에 "rate limit" 포함
  if (
    err.message &&
    typeof err.message === 'string' &&
    err.message.toLowerCase().includes('rate limit')
  ) {
    return true
  }

  return false
}

/**
 * Reset 시간까지 남은 밀리초 계산
 */
export function getResetDelay(resetTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000) // Unix timestamp (seconds)
  const delay = (resetTimestamp - now) * 1000 // 밀리초로 변환

  return Math.max(delay, 0)
}

/**
 * Exponential Backoff 지연 시간 계산
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  return Math.min(exponentialDelay, maxDelay)
}

/**
 * 지연 실행 (Promise 기반)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Rate Limit을 고려한 재시도 래퍼
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, delay) => {
 *       console.log(`Retry ${attempt} after ${delay}ms`)
 *     }
 *   }
 * )
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 60000,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // 마지막 시도면 에러 던지기
      if (attempt === maxRetries) {
        throw lastError
      }

      // Rate Limit 에러가 아니면 즉시 실패
      if (!isRateLimitError(error)) {
        throw lastError
      }

      // Exponential Backoff 계산
      const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay)

      // 재시도 콜백 호출
      if (onRetry) {
        onRetry(attempt + 1, delay, lastError)
      }

      // 대기 후 재시도
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Rate Limit 정보를 사용자 친화적인 메시지로 변환
 */
export function formatRateLimitMessage(rateLimit: RateLimitInfo): string {
  const { remaining, limit, reset } = rateLimit
  const resetDate = new Date(reset * 1000)
  const now = new Date()

  const minutesUntilReset = Math.ceil(
    (resetDate.getTime() - now.getTime()) / 1000 / 60
  )

  if (remaining === 0) {
    return `Rate limit exceeded. Resets in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}`
  }

  const percentage = Math.round((remaining / limit) * 100)
  return `${remaining} / ${limit} requests remaining (${percentage}%)`
}

/**
 * Rate Limit 상태 확인 (경고 레벨 판단)
 */
export function getRateLimitStatus(
  rateLimit: RateLimitInfo
): 'ok' | 'warning' | 'critical' | 'exceeded' {
  const { remaining, limit } = rateLimit

  if (remaining === 0) {
    return 'exceeded'
  }

  const percentage = (remaining / limit) * 100

  if (percentage <= 10) {
    return 'critical'
  }

  if (percentage <= 30) {
    return 'warning'
  }

  return 'ok'
}

/**
 * Reset 시간을 포맷 (예: "2m 30s")
 */
export function formatResetTime(resetTimestamp: number): string {
  const delay = getResetDelay(resetTimestamp)
  const totalSeconds = Math.ceil(delay / 1000)

  if (totalSeconds <= 0) {
    return 'now'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}
