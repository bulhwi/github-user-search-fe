/// <reference types="cypress" />

describe('필터 플로우 테스트', () => {
  beforeEach(() => {
    cy.interceptGitHubAPI('search-results.json')
    cy.visitHome()
    cy.searchUsers('test')
    cy.wait('@searchAPI')
  })

  describe('TypeFilter 변경', () => {
    it('Type 필터가 표시되어야 한다', () => {
      cy.contains('Account Type').should('be.visible')
    })

    it('기본값은 "All"이어야 한다', () => {
      cy.get('[data-testid="type-filter"]').should('contain', 'All')
    })

    it('User 타입으로 필터링할 수 있어야 한다', () => {
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // URL 쿼리 파라미터 확인
      cy.wait('@searchAPI').its('request.url').should('include', 'type:user')
    })

    it('Organization 타입으로 필터링할 수 있어야 한다', () => {
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'Organization').click()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('include', 'type:org')
    })

    it('타입 필터 변경 후 결과가 업데이트되어야 한다', () => {
      // User로 필터링
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // 결과 확인
      cy.waitForResults()
      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })

    it('타입 필터를 여러 번 변경할 수 있어야 한다', () => {
      // User로 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // Organization으로 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'Organization').click()
      cy.wait('@searchAPI')

      // All로 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'All').click()
      cy.wait('@searchAPI')
    })
  })

  describe('SearchInFilter 변경', () => {
    it('Search In 필터가 표시되어야 한다', () => {
      cy.contains('Search In').should('be.visible')
    })

    it('Login 체크박스가 표시되어야 한다', () => {
      cy.contains('label', 'Login').should('be.visible')
    })

    it('Name 체크박스가 표시되어야 한다', () => {
      cy.contains('label', 'Name').should('be.visible')
    })

    it('Email 체크박스가 표시되어야 한다', () => {
      cy.contains('label', 'Email').should('be.visible')
    })

    it('Login 필드만 선택할 수 있어야 한다', () => {
      cy.contains('label', 'Login').find('input[type="checkbox"]').check()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('include', 'in:login')
    })

    it('여러 필드를 동시에 선택할 수 있어야 한다', () => {
      cy.contains('label', 'Login').find('input[type="checkbox"]').check()
      cy.contains('label', 'Name').find('input[type="checkbox"]').check()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('match', /in:login|in:name/)
    })

    it('선택된 필드를 해제할 수 있어야 한다', () => {
      cy.contains('label', 'Login').find('input[type="checkbox"]').check()
      cy.wait('@searchAPI')

      cy.contains('label', 'Login').find('input[type="checkbox"]').uncheck()
      cy.wait('@searchAPI')
    })
  })

  describe('ReposFilter 적용', () => {
    it('Repository Count 필터가 표시되어야 한다', () => {
      cy.contains('Repository Count').should('be.visible')
    })

    it('Min 입력 필드가 표시되어야 한다', () => {
      cy.get('#repos-min').should('be.visible')
    })

    it('Max 입력 필드가 표시되어야 한다', () => {
      cy.get('#repos-max').should('be.visible')
    })

    it('최소 리포지토리 수를 설정할 수 있어야 한다', () => {
      cy.get('#repos-min').clear().type('10')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('include', 'repos:>=10')
    })

    it('최대 리포지토리 수를 설정할 수 있어야 한다', () => {
      cy.get('#repos-max').clear().type('100')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('include', 'repos:<=100')
    })

    it('리포지토리 수 범위를 설정할 수 있어야 한다', () => {
      cy.get('#repos-min').clear().type('10')
      cy.wait('@searchAPI')

      cy.get('#repos-max').clear().type('100')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'repos:10..100')
    })

    it('Min이 Max보다 클 때 에러 메시지가 표시되어야 한다', () => {
      cy.get('#repos-min').clear().type('100')
      cy.get('#repos-max').clear().type('10')

      cy.contains('Min must be less than or equal to Max').should('be.visible')
    })

    it('리포지토리 필터 값을 지울 수 있어야 한다', () => {
      cy.get('#repos-min').clear().type('10')
      cy.wait('@searchAPI')

      cy.get('#repos-min').clear()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('not.include', 'repos:')
    })
  })

  describe('복합 필터 적용', () => {
    it('여러 필터를 동시에 적용할 수 있어야 한다', () => {
      // Type 필터
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // Repos 필터
      cy.get('#repos-min').clear().type('10')
      cy.wait('@searchAPI')

      // SearchIn 필터
      cy.contains('label', 'Login').find('input[type="checkbox"]').check()
      cy.wait('@searchAPI')

      // 최종 쿼리 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'type:user')
        .and('include', 'repos:>=10')
        .and('include', 'in:login')
    })

    it('필터를 순차적으로 적용할 수 있어야 한다', () => {
      // 첫 번째 필터
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')
      cy.waitForResults()

      // 두 번째 필터
      cy.get('#repos-min').clear().type('5')
      cy.wait('@searchAPI')
      cy.waitForResults()

      // 세 번째 필터
      cy.get('#repos-max').clear().type('50')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })

    it('필터를 초기화할 수 있어야 한다', () => {
      // 필터 적용
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      cy.get('#repos-min').clear().type('10')
      cy.wait('@searchAPI')

      // 필터 초기화
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'All').click()
      cy.wait('@searchAPI')

      cy.get('#repos-min').clear()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('not.include', 'type:')
        .and('not.include', 'repos:')
    })
  })

  describe('필터링된 결과 확인', () => {
    beforeEach(() => {
      // User만 포함된 Mock 데이터
      cy.intercept('GET', '/api/search*', {
        statusCode: 200,
        body: {
          total_count: 2,
          incomplete_results: false,
          items: [
            {
              id: 1,
              login: 'user1',
              avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
              html_url: 'https://github.com/user1',
              type: 'User',
              name: 'User One',
              company: null,
              blog: '',
              location: 'Seoul',
              email: null,
              hireable: null,
              bio: null,
              public_repos: 15,
              public_gists: 0,
              followers: 50,
              following: 20,
              created_at: '2020-01-01T00:00:00Z',
              updated_at: '2023-12-01T00:00:00Z',
            },
            {
              id: 2,
              login: 'user2',
              avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
              html_url: 'https://github.com/user2',
              type: 'User',
              name: 'User Two',
              company: null,
              blog: '',
              location: 'Tokyo',
              email: null,
              hireable: null,
              bio: null,
              public_repos: 30,
              public_gists: 5,
              followers: 100,
              following: 50,
              created_at: '2019-06-01T00:00:00Z',
              updated_at: '2023-11-15T00:00:00Z',
            },
          ],
          rateLimit: {
            limit: 60,
            remaining: 58,
            reset: 1699999999,
            used: 2,
          },
        },
      }).as('filteredAPI')
    })

    it('User 타입 필터 적용 시 User만 표시되어야 한다', () => {
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@filteredAPI')

      cy.get('[data-testid="user-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'User')
        cy.wrap($card).should('not.contain', 'Organization')
      })
    })

    it('리포지토리 수 필터 적용 후 조건에 맞는 사용자만 표시되어야 한다', () => {
      cy.get('#repos-min').clear().type('10')
      cy.get('#repos-max').clear().type('20')
      cy.wait('@filteredAPI')

      cy.get('[data-testid="user-card"]').should('have.length', 1)
    })

    it('필터링 결과 개수가 올바르게 표시되어야 한다', () => {
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@filteredAPI')

      cy.contains('2 results').should('be.visible')
    })
  })

  describe('LocationFilter 변경', () => {
    it('Location 필터가 표시되어야 한다', () => {
      cy.contains('Location').should('be.visible')
    })

    it('Location 입력 필드가 표시되어야 한다', () => {
      cy.get('input[placeholder*="Seoul"]').should('be.visible')
    })

    it('위치를 입력할 수 있어야 한다', () => {
      cy.get('input[placeholder*="Seoul"]').type('Seoul')
      cy.get('input[placeholder*="Seoul"]').should('have.value', 'Seoul')
    })

    it('위치 입력 시 검색이 실행되어야 한다 (debounced)', () => {
      cy.get('input[placeholder*="Seoul"]').type('Seoul')

      // Debounce (500ms) 대기
      cy.wait(600)
      cy.wait('@searchAPI')

      // location 파라미터 확인
      cy.wait('@searchAPI').its('request.url').should('include', 'location:Seoul')
    })

    it('공백이 포함된 위치를 입력할 수 있어야 한다', () => {
      cy.get('input[placeholder*="Seoul"]').type('San Francisco')

      cy.wait(600)
      cy.wait('@searchAPI')

      // 공백 포함 시 따옴표 처리 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'location:%22San%20Francisco%22')
    })

    it('위치를 변경할 수 있어야 한다', () => {
      // 첫 번째 위치 입력
      cy.get('input[placeholder*="Seoul"]').type('Seoul')
      cy.wait(600)
      cy.wait('@searchAPI')

      // 위치 변경
      cy.get('input[placeholder*="Seoul"]').clear().type('Tokyo')
      cy.wait(600)
      cy.wait('@searchAPI')

      cy.wait('@searchAPI').its('request.url').should('include', 'location:Tokyo')
    })

    it('위치를 지울 수 있어야 한다', () => {
      // 위치 입력
      cy.get('input[placeholder*="Seoul"]').type('Seoul')
      cy.wait(600)
      cy.wait('@searchAPI')

      // 위치 삭제
      cy.get('input[placeholder*="Seoul"]').clear()
      cy.wait(600)
      cy.wait('@searchAPI')

      // location 파라미터가 없어야 함
      cy.wait('@searchAPI').its('request.url').should('not.include', 'location:')
    })

    it('다른 필터와 함께 사용할 수 있어야 한다', () => {
      // Type 필터 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // Location 필터 추가
      cy.get('input[placeholder*="Seoul"]').type('Seoul')
      cy.wait(600)
      cy.wait('@searchAPI')

      // 두 필터 모두 적용 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'type:user')
        .and('include', 'location:Seoul')
    })
  })

  describe('LanguageFilter 변경', () => {
    it('Language 필터가 표시되어야 한다', () => {
      cy.contains('Language').should('be.visible')
    })

    it('Language 입력 필드가 표시되어야 한다', () => {
      cy.get('input[placeholder*="JavaScript"]').should('be.visible')
    })

    it('언어를 입력할 수 있어야 한다', () => {
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.get('input[placeholder*="JavaScript"]').should('have.value', 'Python')
    })

    it('언어 입력 시 검색이 실행되어야 한다', () => {
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.wait('@searchAPI')

      // language 파라미터 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'language:Python')
    })

    it('인기 언어 목록에서 선택할 수 있어야 한다', () => {
      // Autocomplete 열기
      cy.get('input[placeholder*="JavaScript"]').click()

      // JavaScript 선택
      cy.contains('li', 'JavaScript').click()
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'language:JavaScript')
    })

    it('언어를 변경할 수 있어야 한다', () => {
      // 첫 번째 언어 입력
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.wait('@searchAPI')

      // 언어 변경
      cy.get('input[placeholder*="JavaScript"]').clear().type('TypeScript')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'language:TypeScript')
    })

    it('언어를 지울 수 있어야 한다', () => {
      // 언어 입력
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.wait('@searchAPI')

      // 언어 삭제
      cy.get('input[placeholder*="JavaScript"]').clear()
      cy.wait('@searchAPI')

      // language 파라미터가 없어야 함
      cy.wait('@searchAPI')
        .its('request.url')
        .should('not.include', 'language:')
    })

    it('대소문자 구분 없이 검색되어야 한다', () => {
      cy.get('input[placeholder*="JavaScript"]').type('javascript')
      cy.wait('@searchAPI')

      // GitHub API는 대소문자 구분 없음
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'language:javascript')
    })

    it('다른 필터와 함께 사용할 수 있어야 한다', () => {
      // Type 필터 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // Language 필터 추가
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.wait('@searchAPI')

      // 두 필터 모두 적용 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'type:user')
        .and('include', 'language:Python')
    })
  })

  describe('DateRangeFilter (계정 생성일) 변경', () => {
    it('DateRangeFilter가 표시되어야 한다', () => {
      cy.contains('Created After').should('be.visible')
      cy.contains('Created Before').should('be.visible')
    })

    it('after 날짜만 설정할 수 있어야 한다', () => {
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'created:>2020-01-01')
    })

    it('before 날짜만 설정할 수 있어야 한다', () => {
      cy.get('#created-before-filter').type('2023-12-31')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'created:<2023-12-31')
    })

    it('after와 before를 모두 설정할 수 있어야 한다', () => {
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      cy.get('#created-before-filter').type('2023-12-31')
      cy.wait('@searchAPI')

      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'created:>2020-01-01')
        .and('include', 'created:<2023-12-31')
    })

    it('날짜를 지울 수 있어야 한다', () => {
      // 날짜 입력
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      // 날짜 삭제
      cy.get('#created-after-filter').clear()
      cy.wait('@searchAPI')

      // created 파라미터가 없어야 함
      cy.wait('@searchAPI')
        .its('request.url')
        .should('not.include', 'created:>')
    })

    it('다른 필터와 함께 사용할 수 있어야 한다', () => {
      // Type 필터 변경
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // DateRange 필터 추가
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      // 두 필터 모두 적용 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'type:user')
        .and('include', 'created:>2020-01-01')
    })

    it('복잡한 날짜 범위로 검색할 수 있어야 한다', () => {
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      cy.get('#created-before-filter').type('2021-12-31')
      cy.wait('@searchAPI')

      // 날짜 범위 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'created:>2020-01-01')
        .and('include', 'created:<2021-12-31')
    })

    it('여러 필터와 함께 조합할 수 있어야 한다', () => {
      // Type 필터
      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@searchAPI')

      // Language 필터
      cy.get('input[placeholder*="JavaScript"]').type('Python')
      cy.wait('@searchAPI')

      // Location 필터
      cy.get('input[placeholder*="Seoul"]').type('Korea')
      cy.wait(600) // Debounce
      cy.wait('@searchAPI')

      // DateRange 필터
      cy.get('#created-after-filter').type('2020-01-01')
      cy.wait('@searchAPI')

      // 모든 필터 확인
      cy.wait('@searchAPI')
        .its('request.url')
        .should('include', 'type:user')
        .and('include', 'language:Python')
        .and('include', 'location:Korea')
        .and('include', 'created:>2020-01-01')
    })
  })
})
