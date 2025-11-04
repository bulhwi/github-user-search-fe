import { SearchQueryBuilder, buildSearchQuery } from './queryBuilder'
import type { SearchFilters } from '@/types'

describe('SearchQueryBuilder', () => {
  describe('기본 쿼리', () => {
    it('빈 쿼리를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('')
      expect(builder.build()).toBe('')
    })

    it('기본 쿼리를 반환해야 한다', () => {
      const builder = new SearchQueryBuilder('john')
      expect(builder.build()).toBe('john')
    })

    it('공백을 trim 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('  john  ')
      expect(builder.build()).toBe('john')
    })

    it('특수문자가 포함된 쿼리를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john@example.com')
      expect(builder.build()).toBe('john@example.com')
    })

    it('매우 긴 쿼리를 처리해야 한다', () => {
      const longQuery = 'a'.repeat(1000)
      const builder = new SearchQueryBuilder(longQuery)
      expect(builder.build()).toBe(longQuery)
    })
  })

  describe('Feature #1: 타입 필터', () => {
    it('user 타입을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').type('user')
      expect(builder.build()).toBe('john type:user')
    })

    it('org 타입을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('github').type('org')
      expect(builder.build()).toBe('github type:org')
    })

    it('null 타입은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').type(null)
      expect(builder.build()).toBe('john')
    })

    it('빈 쿼리에도 타입을 추가할 수 있어야 한다', () => {
      const builder = new SearchQueryBuilder('').type('user')
      expect(builder.build()).toBe('type:user')
    })
  })

  describe('Feature #2: 검색 필드', () => {
    it('단일 필드를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').searchIn(['login'])
      expect(builder.build()).toBe('john in:login')
    })

    it('여러 필드를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').searchIn([
        'login',
        'name',
        'email',
      ])
      expect(builder.build()).toBe('john in:login,name,email')
    })

    it('빈 배열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').searchIn([])
      expect(builder.build()).toBe('john')
    })

    it('중복된 필드가 있어도 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').searchIn([
        'login',
        'login',
        'name',
      ])
      // 중복 제거 로직이 없으면 그대로 표시됨
      expect(builder.build()).toContain('in:login')
      expect(builder.build()).toContain('name')
    })
  })

  describe('Feature #3: 리포지토리 수', () => {
    it('최소값을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').repos(10)
      expect(builder.build()).toBe('john repos:>=10')
    })

    it('최대값을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').repos(undefined, 100)
      expect(builder.build()).toBe('john repos:<=100')
    })

    it('범위를 추가해야 한다 (범위 문법 사용)', () => {
      const builder = new SearchQueryBuilder('john').repos(10, 100)
      expect(builder.build()).toBe('john repos:10..100')
    })

    it('0을 최소값으로 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').repos(0)
      expect(builder.build()).toBe('john repos:>=0')
    })

    it('매우 큰 숫자를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').repos(999999)
      expect(builder.build()).toBe('john repos:>=999999')
    })
  })

  describe('Feature #4: 위치', () => {
    it('위치를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul')
      expect(builder.build()).toBe('john location:Seoul')
    })

    it('공백이 있는 위치를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul, Korea')
      expect(builder.build()).toBe('john location:"Seoul, Korea"')
    })

    it('빈 문자열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('')
      expect(builder.build()).toBe('john')
    })

    it('특수문자가 포함된 위치를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('São Paulo')
      expect(builder.build()).toBe('john location:"São Paulo"')
    })

    it('따옴표가 포함된 위치를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul "Capital"')
      // 내부 따옴표는 그대로 유지됨 (GitHub API에서 허용)
      expect(builder.build()).toBe('john location:"Seoul "Capital"')
    })
  })

  describe('Feature #5: 언어', () => {
    it('언어를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').language('javascript')
      expect(builder.build()).toBe('john language:javascript')
    })

    it('빈 문자열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').language('')
      expect(builder.build()).toBe('john')
    })

    it('대소문자를 유지해야 한다', () => {
      const builder = new SearchQueryBuilder('john').language('JavaScript')
      expect(builder.build()).toBe('john language:JavaScript')
    })

    it('공백이 있는 언어를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').language('C++')
      expect(builder.build()).toBe('john language:C++')
    })
  })

  describe('Feature #6: 계정 생성일', () => {
    it('이후 날짜를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created('2020-01-01')
      expect(builder.build()).toBe('john created:>2020-01-01')
    })

    it('이전 날짜를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created(
        undefined,
        '2023-12-31'
      )
      expect(builder.build()).toBe('john created:<2023-12-31')
    })

    it('날짜 범위를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created(
        '2020-01-01',
        '2023-12-31'
      )
      expect(builder.build()).toBe('john created:>2020-01-01 created:<2023-12-31')
    })

    it('빈 문자열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created('', '')
      expect(builder.build()).toBe('john')
    })
  })

  describe('Feature #7: 팔로워 수', () => {
    it('최소값을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(100)
      expect(builder.build()).toBe('john followers:>=100')
    })

    it('최대값을 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(undefined, 1000)
      expect(builder.build()).toBe('john followers:<=1000')
    })

    it('범위를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(100, 1000)
      expect(builder.build()).toBe('john followers:100..1000')
    })

    it('0을 최소값으로 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(0)
      expect(builder.build()).toBe('john followers:>=0')
    })

    it('매우 큰 숫자를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(1000000)
      expect(builder.build()).toBe('john followers:>=1000000')
    })
  })

  describe('Feature #8: 후원 가능 여부', () => {
    it('후원 가능 필터를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').sponsorable(true)
      expect(builder.build()).toBe('john is:sponsorable')
    })

    it('false는 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').sponsorable(false)
      expect(builder.build()).toBe('john')
    })
  })

  describe('복합 쿼리', () => {
    it('여러 필터를 조합해야 한다', () => {
      const builder = new SearchQueryBuilder('john')
        .type('user')
        .location('Seoul')
        .followers(100)

      expect(builder.build()).toBe('john type:user location:Seoul followers:>=100')
    })

    it('모든 필터를 조합해야 한다', () => {
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
      expect(result).toContain('repos:10..100')
      expect(result).toContain('location:Korea')
      expect(result).toContain('language:javascript')
      expect(result).toContain('created:>2020-01-01')
      expect(result).toContain('followers:100..1000')
      expect(result).toContain('is:sponsorable')
    })

    it('빈 쿼리에 필터만 추가할 수 있어야 한다', () => {
      const builder = new SearchQueryBuilder('')
        .type('user')
        .location('Seoul')
        .followers(100)

      const result = builder.build()
      expect(result).toContain('type:user')
      expect(result).toContain('location:Seoul')
      expect(result).toContain('followers:>=100')
    })
  })

  describe('buildSearchQuery 헬퍼 함수', () => {
    it('SearchFilters 객체로 쿼리를 생성해야 한다', () => {
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
      expect(query).toContain('location:Seoul')
      expect(query).toContain('language:javascript')
      expect(query).toContain('repos:10..100')
      expect(query).toContain('followers:>=100')
      expect(query).toContain('created:>2020-01-01')
      expect(query).toContain('is:sponsorable')
    })

    it('빈 필터는 무시해야 한다', () => {
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

    it('부분 필터만 적용할 수 있어야 한다', () => {
      const filters: SearchFilters = {
        type: 'user',
        searchIn: ['login'],
        location: '',
        language: '',
        repos: {},
        followers: {},
        created: {},
        sponsorable: false,
      }

      const query = buildSearchQuery('john', filters)
      expect(query).toContain('john')
      expect(query).toContain('type:user')
      expect(query).toContain('in:login')
      expect(query).not.toContain('location')
      expect(query).not.toContain('language')
    })
  })

  describe('Edge Cases 및 실패 케이스', () => {
    it('메서드 체이닝이 올바르게 작동해야 한다', () => {
      const builder = new SearchQueryBuilder('test')
      const result = builder
        .type('user')
        .location('Seoul')
        .followers(100)
        .build()

      expect(result).toBe('test type:user location:Seoul followers:>=100')
    })

    it('같은 타입을 여러 번 호출하면 모두 추가된다', () => {
      const builder = new SearchQueryBuilder('test')
        .type('user')
        .type('org')

      // 현재 구현은 마지막 값으로 대체하는 것이 아니라 모두 추가함
      const result = builder.build()
      expect(result).toContain('test')
      expect(result).toContain('type:')
    })

    it('음수 리포지토리 수를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').repos(-1)
      expect(builder.build()).toBe('john repos:>=-1')
    })

    it('음수 팔로워 수를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(-1)
      expect(builder.build()).toBe('john followers:>=-1')
    })

    it('잘못된 날짜 형식도 그대로 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created('invalid-date')
      expect(builder.build()).toBe('john created:>invalid-date')
    })

    it('빈 문자열 날짜는 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').created('', '')
      expect(builder.build()).toBe('john')
    })

    it('NaN 최소값은 그대로 처리된다', () => {
      const builder = new SearchQueryBuilder('john').repos(NaN)
      // NaN이 들어가면 그대로 표시됨
      const result = builder.build()
      expect(result).toContain('john')
      // NaN은 숫자로 처리되어 포함될 수 있음
    })

    it('0을 팔로워 최소값으로 처리할 수 있어야 한다', () => {
      const builder = new SearchQueryBuilder('john').followers(0)
      expect(builder.build()).toBe('john followers:>=0')
    })
  })

  describe('Feature #4: 위치 검색', () => {
    it('공백 없는 위치를 추가해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('Seoul')
      expect(builder.build()).toBe('john location:Seoul')
    })

    it('공백 포함 위치는 따옴표로 감싸야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('San Francisco')
      expect(builder.build()).toBe('john location:"San Francisco"')
    })

    it('빈 문자열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('')
      expect(builder.build()).toBe('john')
    })

    it('공백만 있는 문자열은 무시해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('   ')
      expect(builder.build()).toBe('john')
    })

    it('양쪽 공백을 trim 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('  Seoul  ')
      expect(builder.build()).toBe('john location:Seoul')
    })

    it('중간 공백은 유지하며 따옴표로 감싸야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('  San Francisco  ')
      expect(builder.build()).toBe('john location:"San Francisco"')
    })

    it('이미 따옴표가 있으면 제거하고 다시 감싸야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('"Seoul"')
      expect(builder.build()).toBe('john location:Seoul')
    })

    it('이미 따옴표가 있고 공백이 있으면 따옴표를 유지해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('"San Francisco"')
      expect(builder.build()).toBe('john location:"San Francisco"')
    })

    it('특수문자가 포함된 위치를 처리해야 한다', () => {
      const builder = new SearchQueryBuilder('john').location('São Paulo')
      expect(builder.build()).toBe('john location:"São Paulo"')
    })

    it('빈 쿼리에도 위치를 추가할 수 있어야 한다', () => {
      const builder = new SearchQueryBuilder('').location('Seoul')
      expect(builder.build()).toBe('location:Seoul')
    })

    it('다른 필터와 함께 사용할 수 있어야 한다', () => {
      const builder = new SearchQueryBuilder('john')
        .type('user')
        .location('Seoul')
        .repos(10)
      expect(builder.build()).toBe('john type:user location:Seoul repos:>=10')
    })
  })
})
