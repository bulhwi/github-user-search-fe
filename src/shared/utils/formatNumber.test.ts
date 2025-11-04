import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  describe('작은 숫자 (< 1000)', () => {
    it('0을 반환해야 한다', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('한 자리 숫자를 그대로 반환해야 한다', () => {
      expect(formatNumber(5)).toBe('5')
    })

    it('세 자리 숫자를 그대로 반환해야 한다', () => {
      expect(formatNumber(999)).toBe('999')
    })

    it('음수를 처리해야 한다', () => {
      expect(formatNumber(-50)).toBe('-50')
    })
  })

  describe('천 단위 (k)', () => {
    it('정확히 1000을 1.0k로 변환해야 한다', () => {
      expect(formatNumber(1000)).toBe('1.0k')
    })

    it('1234를 1.2k로 변환해야 한다', () => {
      expect(formatNumber(1234)).toBe('1.2k')
    })

    it('5678을 5.7k로 변환해야 한다', () => {
      expect(formatNumber(5678)).toBe('5.7k')
    })

    it('10000 이상은 소수점 없이 표시해야 한다', () => {
      expect(formatNumber(10000)).toBe('10k')
      expect(formatNumber(12345)).toBe('12k')
      expect(formatNumber(99999)).toBe('99k')
    })

    it('999999를 999k로 변환해야 한다', () => {
      expect(formatNumber(999999)).toBe('999k')
    })
  })

  describe('백만 단위 (M)', () => {
    it('정확히 1000000을 1.0M으로 변환해야 한다', () => {
      expect(formatNumber(1000000)).toBe('1.0M')
    })

    it('1234567을 1.2M으로 변환해야 한다', () => {
      expect(formatNumber(1234567)).toBe('1.2M')
    })

    it('5678901을 5.7M으로 변환해야 한다', () => {
      expect(formatNumber(5678901)).toBe('5.7M')
    })

    it('10000000 이상은 소수점 없이 표시해야 한다', () => {
      expect(formatNumber(10000000)).toBe('10M')
      expect(formatNumber(12345678)).toBe('12M')
    })
  })

  describe('Edge Cases', () => {
    it('null을 0으로 처리해야 한다', () => {
      expect(formatNumber(null)).toBe('0')
    })

    it('undefined를 0으로 처리해야 한다', () => {
      expect(formatNumber(undefined)).toBe('0')
    })

    it('매우 큰 숫자를 처리해야 한다', () => {
      expect(formatNumber(123456789)).toBe('123M')
    })
  })

  describe('실제 GitHub 데이터 예시', () => {
    it('일반 사용자 팔로워 수 (500)', () => {
      expect(formatNumber(500)).toBe('500')
    })

    it('인기 사용자 팔로워 수 (1.2k)', () => {
      expect(formatNumber(1234)).toBe('1.2k')
    })

    it('매우 인기 있는 사용자 팔로워 수 (50k)', () => {
      expect(formatNumber(50000)).toBe('50k')
    })

    it('유명인 팔로워 수 (1M+)', () => {
      expect(formatNumber(1500000)).toBe('1.5M')
    })

    it('일반 리포지토리 수 (45)', () => {
      expect(formatNumber(45)).toBe('45')
    })
  })
})
