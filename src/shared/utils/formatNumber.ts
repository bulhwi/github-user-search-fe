/**
 * 숫자를 사람이 읽기 쉬운 형태로 포맷팅
 *
 * @example
 * formatNumber(500) => "500"
 * formatNumber(1234) => "1.2k"
 * formatNumber(12345) => "12k"
 * formatNumber(1234567) => "1.2M"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0'

  if (num < 1000) {
    return num.toString()
  }

  if (num < 1000000) {
    // 1,000 ~ 999,999 → k 단위
    const k = num / 1000
    return k >= 10 ? `${Math.floor(k)}k` : `${k.toFixed(1)}k`
  }

  // 1,000,000+ → M 단위
  const m = num / 1000000
  return m >= 10 ? `${Math.floor(m)}M` : `${m.toFixed(1)}M`
}
