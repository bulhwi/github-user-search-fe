import { SearchQueryBuilder, buildSearchQuery } from './queryBuilder'
import type { SearchFilters } from '@/types'

describe('SearchQueryBuilder', () => {
  describe('기본 쿼리', () => {
    it('빈 쿼리를 처리해야 함', () => {
      const builder = new SearchQueryBuilder('')
      expect(builder.build()).toBe('')
    })

    it('기본 쿼리를 반환해야 함', () => {
      const builder = new SearchQueryBuilder('john')
      expect(builder.build()).toBe('john')
    })

    it('공백을 trim 처리해야 함', () => {
      const builder = new SearchQueryBuilder('  john  ')
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #1: 타입 필터', () => {
    it('user 타입을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').type('user')
      expect(builder.build()).toBe('john type:user')
    })

    it('org 타입을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('github').type('org')
      expect(builder.build()).toBe('github type:org')
    })

    it('null 타입은 무시해야 함', () => {
      const builder = new SearchQueryBuilder('john').type(null)
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #2: 검색 필드', () => {
    it('단일 필드를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').searchIn(['login'])
      expect(builder.build()).toBe('john in:login')
    })

    it('여러 필드를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').searchIn([
        'login',
        'name',
        'email',
      ])
      expect(builder.build()).toBe('john in:login,name,email')
    })

    it('빈 배열은 무시해야 함', () => {
      const builder = new SearchQueryBuilder('john').searchIn([])
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #3: 리포지토리 수', () => {
    it('최소값을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').repos(10)
      expect(builder.build()).toBe('john repos:>=10')
    })

    it('최대값을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').repos(undefined, 100)
      expect(builder.build()).toBe('john repos:<=100')
    })

    it('범위를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').repos(10, 100)
      expect(builder.build()).toBe('john repos:>=10 repos:<=100')
    })
  })

  describe('Feature #4: 위치', () => {
    it('위치를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul')
      expect(builder.build()).toBe('john location:"Seoul"')
    })

    it('공백이 있는 위치를 처리해야 함', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul, Korea')
      expect(builder.build()).toBe('john location:"Seoul, Korea"')
    })

    it('빈 문자열은 무시해야 함', () => {
      const builder = new SearchQueryBuilder('john').location('')
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #5: 언어', () => {
    it('언어를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').language('javascript')
      expect(builder.build()).toBe('john language:javascript')
    })

    it('빈 문자열은 무시해야 함', () => {
      const builder = new SearchQueryBuilder('john').language('')
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #6: 계정 생성일', () => {
    it('이후 날짜를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').created('2020-01-01')
      expect(builder.build()).toBe('john created:>2020-01-01')
    })

    it('이전 날짜를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').created(
        undefined,
        '2023-12-31'
      )
      expect(builder.build()).toBe('john created:<2023-12-31')
    })

    it('날짜 범위를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').created(
        '2020-01-01',
        '2023-12-31'
      )
      expect(builder.build()).toBe('john created:>2020-01-01 created:<2023-12-31')
    })
  })

  describe('Feature #7: 팔로워 수', () => {
    it('최소값을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').followers(100)
      expect(builder.build()).toBe('john followers:>=100')
    })

    it('최대값을 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').followers(undefined, 1000)
      expect(builder.build()).toBe('john followers:<=1000')
    })

    it('범위를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').followers(100, 1000)
      expect(builder.build()).toBe('john followers:>=100 followers:<=1000')
    })
  })

  describe('Feature #8: 후원 가능 여부', () => {
    it('후원 가능 필터를 추가해야 함', () => {
      const builder = new SearchQueryBuilder('john').sponsorable(true)
      expect(builder.build()).toBe('john is:sponsorable')
    })

    it('false는 무시해야 함', () => {
      const builder = new SearchQueryBuilder('john').sponsorable(false)
      expect(builder.build()).toBe('john')
    })
  })

  describe('복합 쿼리', () => {
    it('여러 필터를 조합해야 함', () => {
      const builder = new SearchQueryBuilder('john')
        .type('user')
        .location('Seoul')
        .followers(100)

      expect(builder.build()).toBe('john type:user location:"Seoul" followers:>=100')
    })

    it('모든 필터를 조합해야 함', () => {
      const builder = new SearchQueryBuilder('react')
        .type('user')
        .searchIn(['name', 'email'])
        .repos(10, 100)
        .location('Korea')
        .language('javascript')
        .created('2020-01-01')
        .followers(100, 1000)
        .sponsorable(true)

      const result = builder.build()
      expect(result).toContain('react')
      expect(result).toContain('type:user')
      expect(result).toContain('in:name,email')
      expect(result).toContain('repos:>=10')
      expect(result).toContain('repos:<=100')
      expect(result).toContain('location:"Korea"')
      expect(result).toContain('language:javascript')
      expect(result).toContain('created:>2020-01-01')
      expect(result).toContain('followers:>=100')
      expect(result).toContain('followers:<=1000')
      expect(result).toContain('is:sponsorable')
    })
  })

  describe('buildSearchQuery 헬퍼 함수', () => {
    it('SearchFilters 객체로 쿼리를 생성해야 함', () => {
      const filters: SearchFilters = {
        type: 'user',
        searchIn: ['login', 'name'],
        location: 'Seoul',
        language: 'javascript',
        repos: { min: 10, max: 100 },
        followers: { min: 100 },
        created: { after: '2020-01-01' },
        sponsorable: true,
      }

      const query = buildSearchQuery('react', filters)

      expect(query).toContain('react')
      expect(query).toContain('type:user')
      expect(query).toContain('in:login,name')
      expect(query).toContain('location:"Seoul"')
      expect(query).toContain('language:javascript')
      expect(query).toContain('repos:>=10')
      expect(query).toContain('repos:<=100')
      expect(query).toContain('followers:>=100')
      expect(query).toContain('created:>2020-01-01')
      expect(query).toContain('is:sponsorable')
    })

    it('빈 필터는 무시해야 함', () => {
      const filters: SearchFilters = {
        type: null,
        searchIn: [],
        location: '',
        language: '',
        repos: {},
        followers: {},
        created: {},
        sponsorable: false,
      }

      const query = buildSearchQuery('john', filters)
      expect(query).toBe('john')
    })
  })
})
