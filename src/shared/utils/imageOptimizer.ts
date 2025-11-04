/**
 * Canvas 기반 이미지 최적화
 *
 * Feature #10: Canvas 아바타 렌더링
 * - Canvas API를 사용한 이미지 리사이징
 * - 클라이언트 사이드 최적화
 * - 성능 측정 포함
 */

import { avatarCache } from './avatarCache'

interface OptimizeOptions {
  width: number
  height: number
  quality?: number
}

interface PerformanceMetrics {
  downloadTime: number
  optimizeTime: number
  totalTime: number
  originalSize: number
  optimizedSize: number
}

/**
 * 아바타 이미지 최적화
 * - Canvas API로 리사이징
 * - 캐시에서 먼저 확인
 */
export async function optimizeAvatar(
  imageUrl: string,
  options: OptimizeOptions = { width: 48, height: 48, quality: 80 }
): Promise<{ blob: Blob; metrics: PerformanceMetrics }> {
  const startTime = performance.now()

  // 캐시 확인
  const cached = avatarCache.get(imageUrl)
  if (cached) {
    return {
      blob: cached,
      metrics: {
        downloadTime: 0,
        optimizeTime: 0,
        totalTime: performance.now() - startTime,
        originalSize: 0,
        optimizedSize: cached.size,
      },
    }
  }

  try {
    // 1. 이미지 다운로드
    const downloadStart = performance.now()
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const downloadTime = performance.now() - downloadStart
    const originalSize = arrayBuffer.byteLength

    // 2. Canvas로 리사이징
    const optimizeStart = performance.now()
    const blob = await resizeImageWithCanvas(arrayBuffer, options)
    const optimizeTime = performance.now() - optimizeStart

    // 캐시에 저장
    avatarCache.set(imageUrl, blob)

    return {
      blob,
      metrics: {
        downloadTime,
        optimizeTime,
        totalTime: performance.now() - startTime,
        originalSize,
        optimizedSize: blob.size,
      },
    }
  } catch (error) {
    console.error('[imageOptimizer] 최적화 실패:', error)
    throw error
  }
}

/**
 * Canvas를 사용한 이미지 리사이징
 */
async function resizeImageWithCanvas(
  arrayBuffer: ArrayBuffer,
  options: OptimizeOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer])
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      try {
        // Canvas 생성
        const canvas = document.createElement('canvas')
        canvas.width = options.width
        canvas.height = options.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Canvas context not available')
        }

        // 리사이징
        ctx.drawImage(img, 0, 0, options.width, options.height)

        // Blob으로 변환
        canvas.toBlob(
          (resultBlob) => {
            URL.revokeObjectURL(url)
            if (resultBlob) {
              resolve(resultBlob)
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          },
          'image/webp',
          (options.quality ?? 80) / 100
        )
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }

    img.src = url
  })
}

/**
 * 정리 함수 (호환성 유지)
 */
export async function cleanup(): Promise<void> {
  // Canvas 방식에서는 특별히 정리할 것이 없음
}
