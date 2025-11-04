import {
  isRateLimitError,
  getResetDelay,
  calculateBackoffDelay,
  sleep,
  retryWithBackoff,
  formatRateLimitMessage,
  getRateLimitStatus,
  formatResetTime,
  type RateLimitInfo,
} from './rateLimit'

describe('rateLimit utils', () => {
  describe('isRateLimitError', () => {
    it('HTTP 429 상태 코드를 Rate Limit 에러로 인식해야 한다', () => {
      expect(isRateLimitError({ status: 429 })).toBe(true)
      expect(isRateLimitError({ statusCode: 429 })).toBe(true)
    })

    it('메시지에 "rate limit"이 포함된 에러를 Rate Limit 에러로 인식해야 한다', () => {
      expect(isRateLimitError({ message: 'Rate limit exceeded' })).toBe(true)
      expect(isRateLimitError({ message: 'API rate limit reached' })).toBe(true)
      expect(isRateLimitError({ message: 'RATE LIMIT ERROR' })).toBe(true)
    })

    it('Rate Limit이 아닌 에러는 false를 반환해야 한다', () => {
      expect(isRateLimitError({ status: 404 })).toBe(false)
      expect(isRateLimitError({ message: 'Network error' })).toBe(false)
      expect(isRateLimitError(null)).toBe(false)
      expect(isRateLimitError(undefined)).toBe(false)
      expect(isRateLimitError('string error')).toBe(false)
    })
  })

  describe('getResetDelay', () => {
    it('Reset 시간까지 남은 밀리초를 반환해야 한다', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 300 // 5분 후
      const delay = getResetDelay(futureTimestamp)

      expect(delay).toBeGreaterThan(290000) // 약 5분
      expect(delay).toBeLessThanOrEqual(300000)
    })

    it('과거 시간이면 0을 반환해야 한다', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 300 // 5분 전
      const delay = getResetDelay(pastTimestamp)

      expect(delay).toBe(0)
    })

    it('현재 시간이면 0을 반환해야 한다', () => {
      const nowTimestamp = Math.floor(Date.now() / 1000)
      const delay = getResetDelay(nowTimestamp)

      expect(delay).toBeLessThanOrEqual(1000) // 최대 1초 오차 허용
    })
  })

  describe('calculateBackoffDelay', () => {
    it('Exponential Backoff 지연 시간을 계산해야 한다', () => {
      expect(calculateBackoffDelay(0, 1000, 60000)).toBe(1000) // 2^0 = 1
      expect(calculateBackoffDelay(1, 1000, 60000)).toBe(2000) // 2^1 = 2
      expect(calculateBackoffDelay(2, 1000, 60000)).toBe(4000) // 2^2 = 4
      expect(calculateBackoffDelay(3, 1000, 60000)).toBe(8000) // 2^3 = 8
      expect(calculateBackoffDelay(4, 1000, 60000)).toBe(16000) // 2^4 = 16
    })

    it('최대 지연 시간을 초과하지 않아야 한다', () => {
      expect(calculateBackoffDelay(10, 1000, 60000)).toBe(60000)
      expect(calculateBackoffDelay(20, 1000, 60000)).toBe(60000)
    })

    it('baseDelay를 커스터마이징할 수 있어야 한다', () => {
      expect(calculateBackoffDelay(0, 500, 60000)).toBe(500)
      expect(calculateBackoffDelay(1, 500, 60000)).toBe(1000)
      expect(calculateBackoffDelay(2, 500, 60000)).toBe(2000)
    })
  })

  describe('sleep', () => {
    it('지정된 시간만큼 대기해야 한다', async () => {
      const start = Date.now()
      await sleep(100)
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(90) // 약간의 오차 허용
      expect(elapsed).toBeLessThan(200)
    })
  })

  describe('retryWithBackoff', () => {
    it('성공 시 결과를 반환해야 한다', async () => {
      const fn = jest.fn().mockResolvedValue('success')
      const result = await retryWithBackoff(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('Rate Limit 에러 시 재시도해야 한다', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit' })
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit' })
        .mockResolvedValue('success')

      const onRetry = jest.fn()
      const result = await retryWithBackoff(fn, {
        maxRetries: 3,
        baseDelay: 10, // 빠른 테스트를 위해 짧게
        onRetry,
      })

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
      expect(onRetry).toHaveBeenCalledTimes(2)
    })

    it('최대 재시도 횟수를 초과하면 에러를 던져야 한다', async () => {
      const fn = jest.fn().mockRejectedValue({ status: 429, message: 'Rate limit' })

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 2,
          baseDelay: 10,
        })
      ).rejects.toEqual({ status: 429, message: 'Rate limit' })

      expect(fn).toHaveBeenCalledTimes(3) // 초기 시도 + 2회 재시도
    })

    it('Rate Limit이 아닌 에러는 즉시 던져야 한다', async () => {
      const fn = jest.fn().mockRejectedValue({ status: 404, message: 'Not found' })

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 3,
          baseDelay: 10,
        })
      ).rejects.toEqual({ status: 404, message: 'Not found' })

      expect(fn).toHaveBeenCalledTimes(1) // 재시도하지 않음
    })

    it('onRetry 콜백이 호출되어야 한다', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit' })
        .mockResolvedValue('success')

      const onRetry = jest.fn()
      await retryWithBackoff(fn, {
        maxRetries: 2,
        baseDelay: 10,
        onRetry,
      })

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(
        1, // attempt
        10, // delay
        { status: 429, message: 'Rate limit' } // error
      )
    })
  })

  describe('formatRateLimitMessage', () => {
    it('남은 요청 수를 표시해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 20,
        reset: Math.floor(Date.now() / 1000) + 300,
        used: 10,
      }

      const message = formatRateLimitMessage(rateLimit)
      expect(message).toContain('20 / 30')
      expect(message).toContain('67%')
    })

    it('Rate Limit 초과 시 Reset 시간을 표시해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 120, // 2분 후
        used: 30,
      }

      const message = formatRateLimitMessage(rateLimit)
      expect(message).toContain('Rate limit exceeded')
      expect(message).toContain('2 minute')
    })

    it('1분 남았을 때 단수형을 사용해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 60, // 1분 후
        used: 30,
      }

      const message = formatRateLimitMessage(rateLimit)
      expect(message).toContain('1 minute')
      expect(message).not.toContain('minutes')
    })
  })

  describe('getRateLimitStatus', () => {
    it('남은 요청이 0이면 exceeded를 반환해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 0,
        reset: 0,
        used: 30,
      }

      expect(getRateLimitStatus(rateLimit)).toBe('exceeded')
    })

    it('남은 요청이 10% 이하면 critical을 반환해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 3, // 10%
        reset: 0,
        used: 27,
      }

      expect(getRateLimitStatus(rateLimit)).toBe('critical')

      rateLimit.remaining = 2 // 6.67%
      expect(getRateLimitStatus(rateLimit)).toBe('critical')
    })

    it('남은 요청이 30% 이하면 warning을 반환해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 9, // 30%
        reset: 0,
        used: 21,
      }

      expect(getRateLimitStatus(rateLimit)).toBe('warning')

      rateLimit.remaining = 6 // 20%
      expect(getRateLimitStatus(rateLimit)).toBe('warning')
    })

    it('남은 요청이 30% 초과면 ok를 반환해야 한다', () => {
      const rateLimit: RateLimitInfo = {
        limit: 30,
        remaining: 20, // 66.67%
        reset: 0,
        used: 10,
      }

      expect(getRateLimitStatus(rateLimit)).toBe('ok')

      rateLimit.remaining = 10 // 33.33%
      expect(getRateLimitStatus(rateLimit)).toBe('ok')
    })
  })

  describe('formatResetTime', () => {
    it('분과 초를 표시해야 한다', () => {
      const resetTimestamp = Math.floor(Date.now() / 1000) + 150 // 2분 30초 후

      const formatted = formatResetTime(resetTimestamp)
      expect(formatted).toMatch(/2m \d{1,2}s/)
    })

    it('1분 미만이면 초만 표시해야 한다', () => {
      const resetTimestamp = Math.floor(Date.now() / 1000) + 30 // 30초 후

      const formatted = formatResetTime(resetTimestamp)
      expect(formatted).toMatch(/\d{1,2}s/)
      expect(formatted).not.toContain('m')
    })

    it('과거 시간이면 "now"를 반환해야 한다', () => {
      const resetTimestamp = Math.floor(Date.now() / 1000) - 60 // 1분 전

      const formatted = formatResetTime(resetTimestamp)
      expect(formatted).toBe('now')
    })

    it('현재 시간이면 "now"를 반환해야 한다', () => {
      const resetTimestamp = Math.floor(Date.now() / 1000)

      const formatted = formatResetTime(resetTimestamp)
      expect(formatted).toMatch(/now|\d{1}s/)
    })
  })
})
