/**
 * 인메모리 아바타 캐시 (LRU 방식)
 *
 * Feature #10: Canvas + WASM 아바타 렌더링 최적화
 * - 최적화된 아바타 이미지를 메모리에 캐싱
 * - LRU (Least Recently Used) 방식으로 메모리 관리
 * - 페이지 새로고침 시 자동 초기화
 */

interface CacheEntry {
  blob: Blob
  timestamp: number
}

class AvatarCache {
  private cache = new Map<string, CacheEntry>()
  private readonly maxSize: number
  private readonly maxAge: number // 밀리초

  constructor(maxSize = 100, maxAgeMinutes = 30) {
    this.maxSize = maxSize
    this.maxAge = maxAgeMinutes * 60 * 1000
  }

  /**
   * 캐시에 아바타 저장
   * - 최대 크기 초과 시 가장 오래된 항목 제거 (LRU)
   */
  set(url: string, blob: Blob): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string | undefined
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(url, {
      blob,
      timestamp: Date.now(),
    })
  }

  /**
   * 캐시에서 아바타 가져오기
   * - 만료된 항목은 자동 삭제 후 undefined 반환
   */
  get(url: string): Blob | undefined {
    const entry = this.cache.get(url)

    if (!entry) {
      return undefined
    }

    // 만료 확인
    const age = Date.now() - entry.timestamp
    if (age > this.maxAge) {
      this.cache.delete(url)
      return undefined
    }

    return entry.blob
  }

  /**
   * 캐시에 항목이 있는지 확인
   */
  has(url: string): boolean {
    return this.get(url) !== undefined
  }

  /**
   * 캐시 초기화
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 캐시 크기 반환
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now()
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(url)
      }
    }
  }
}

// 싱글톤 인스턴스
export const avatarCache = new AvatarCache(100, 30)

// 10분마다 만료된 캐시 정리 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  setInterval(() => {
    avatarCache.cleanup()
  }, 10 * 60 * 1000)
}
