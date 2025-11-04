'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { optimizeAvatar } from '@/shared/utils/imageOptimizer'

export interface UserAvatarProps {
  src: string
  alt: string
  size?: number
  className?: string
}

/**
 * UserAvatar Component (Feature #10)
 *
 * HTML5 Canvas + WebAssembly 기반 아바타 렌더링
 * - WASM으로 이미지 최적화 (리사이징 + WebP 변환)
 * - Canvas API로 고품질 렌더링
 * - 메모리 캐싱으로 성능 향상
 * - Fallback 이미지 처리
 */
export function UserAvatar({ src, alt, size = 48, className = '' }: UserAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const processedRef = useRef(false)

  // 크기 검증 (0 이하면 기본값 48)
  const validSize = size > 0 ? size : 48

  const renderImage = useCallback(async () => {
    // 중복 렌더링 방지
    if (processedRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // src가 비어있으면 에러 처리
    if (!src || src.trim() === '') {
      setError(true)
      setLoading(false)
      return
    }

    try {
      processedRef.current = true
      setLoading(true)
      setError(false)

      // WASM으로 이미지 최적화
      const { blob } = await optimizeAvatar(src, {
        width: validSize,
        height: validSize,
        quality: 80,
      })

      // Blob을 이미지로 변환
      const url = URL.createObjectURL(blob)
      const img = new Image()

      img.onload = () => {
        // Canvas 초기화
        ctx.clearRect(0, 0, validSize, validSize)

        // 원형 클리핑 경로
        ctx.save()
        ctx.beginPath()
        ctx.arc(validSize / 2, validSize / 2, validSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, validSize, validSize)
        ctx.restore()

        // 메모리 정리
        URL.revokeObjectURL(url)
        setLoading(false)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        throw new Error('이미지 로딩 실패')
      }

      img.src = url
    } catch (err) {
      console.error('[UserAvatar] 렌더링 실패:', err)
      setError(true)
      setLoading(false)
      processedRef.current = false

      // Fallback: 회색 원 그리기
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#e0e0e0'
        ctx.beginPath()
        ctx.arc(validSize / 2, validSize / 2, validSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [src, validSize])

  useEffect(() => {
    processedRef.current = false
    renderImage()
  }, [renderImage])

  return (
    <canvas
      ref={canvasRef}
      width={validSize}
      height={validSize}
      role="img"
      aria-label={alt}
      data-loading={loading}
      data-error={error}
      className={`${className} ${loading ? 'opacity-70' : ''}`}
      style={{
        borderRadius: '50%',
        backgroundColor: loading ? '#f5f5f5' : 'transparent',
      }}
    />
  )
}
