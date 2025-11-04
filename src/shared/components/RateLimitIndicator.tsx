'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  LinearProgress,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import {
  getRateLimitStatus,
  formatResetTime,
  type RateLimitInfo,
} from '@/shared/utils/rateLimit'
import type { RateLimit } from '@/types'

export interface RateLimitIndicatorProps {
  rateLimit: RateLimit | null | undefined
  className?: string
}

export function RateLimitIndicator({
  rateLimit,
  className = '',
}: RateLimitIndicatorProps) {
  const [resetTimeLeft, setResetTimeLeft] = useState<string>('')

  // Reset 시간 카운트다운 (1초마다 업데이트)
  useEffect(() => {
    if (!rateLimit) return

    const updateResetTime = () => {
      setResetTimeLeft(formatResetTime(rateLimit.reset))
    }

    updateResetTime()
    const interval = setInterval(updateResetTime, 1000)

    return () => clearInterval(interval)
  }, [rateLimit])

  // Rate Limit 정보가 없거나 유효하지 않으면 렌더링하지 않음
  if (!rateLimit || rateLimit.limit === 0) {
    return null
  }

  const { limit, remaining, reset } = rateLimit
  const rateLimitInfo: RateLimitInfo = rateLimit

  // 남은 요청 비율 계산
  const percentage = Math.min(Math.round((remaining / limit) * 100), 100)

  // 상태 확인
  const status = getRateLimitStatus(rateLimitInfo)

  // Progress Bar 색상
  const progressColor =
    status === 'ok'
      ? 'success'
      : status === 'warning'
        ? 'warning'
        : status === 'critical'
          ? 'warning'
          : 'error'

  return (
    <Box className={className} sx={{ width: '100%', maxWidth: 400 }}>
      {/* 경고 메시지 (Rate Limit 초과 시) */}
      {status === 'exceeded' && (
        <Alert severity="error" role="alert" sx={{ mb: 1 }}>
          Rate limit exceeded. Resets in {resetTimeLeft}
        </Alert>
      )}

      {/* Critical 경고 메시지 */}
      {status === 'critical' && remaining > 0 && (
        <Alert severity="warning" role="alert" sx={{ mb: 1 }}>
          Critical: Only {remaining} requests remaining
        </Alert>
      )}

      {/* Rate Limit 정보 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>
            {remaining} / {limit}
          </strong>{' '}
          requests remaining ({percentage}%)
        </Typography>

        {/* Reset 카운트다운 */}
        <Tooltip title={`Resets at ${new Date(reset * 1000).toLocaleTimeString()}`}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              ml: 'auto',
            }}
          >
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {resetTimeLeft}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={progressColor}
        aria-label={`API Rate Limit: ${remaining} of ${limit} requests remaining`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  )
}
