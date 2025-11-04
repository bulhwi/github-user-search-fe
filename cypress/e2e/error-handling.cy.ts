/// <reference types="cypress" />

describe('에러 핸들링 테스트', () => {
  beforeEach(() => {
    cy.visitHome()
  })

  describe('Rate Limit 초과 시나리오', () => {
    beforeEach(() => {
      // Rate Limit 초과 응답 Mock
      cy.intercept('GET', '/api/search*', {
        statusCode: 429,
        body: {
          error: 'Rate limit exceeded',
          rateLimit: {
            limit: 60,
            remaining: 0,
            reset: Math.floor(Date.now() / 1000) + 3600, // 1시간 후
            used: 60,
          },
          resetAt: new Date(Date.now() + 3600000).toISOString(),
        },
      }).as('rateLimitAPI')
    })

    it('Rate Limit 에러 메시지가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@rateLimitAPI')

      cy.contains(/rate limit exceeded/i).should('be.visible')
    })

    it('Rate Limit 리셋 시간이 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@rateLimitAPI')

      cy.contains(/try again|reset/i).should('be.visible')
    })

    it('Rate Limit 에러 시 검색 결과가 표시되지 않아야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@rateLimitAPI')

      cy.get('[data-testid="user-card"]').should('not.exist')
    })

    it('Rate Limit 에러 후 재시도할 수 있어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@rateLimitAPI')

      // 정상 응답으로 변경
      cy.interceptGitHubAPI('search-results.json')

      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })

    it('Rate Limit 정보가 UI에 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@rateLimitAPI')

      // Rate Limit 상태 확인
      cy.contains(/0.*remaining|no requests remaining/i).should('be.visible')
    })
  })

  describe('네트워크 에러 시나리오', () => {
    beforeEach(() => {
      // 네트워크 에러 Mock
      cy.intercept('GET', '/api/search*', {
        forceNetworkError: true,
      }).as('networkErrorAPI')
    })

    it('네트워크 에러 메시지가 표시되어야 한다', () => {
      cy.searchUsers('test')

      cy.contains(/network error|failed to fetch|connection error/i, {
        timeout: 10000,
      }).should('be.visible')
    })

    it('네트워크 에러 시 검색 결과가 표시되지 않아야 한다', () => {
      cy.searchUsers('test')

      cy.get('[data-testid="user-card"]', { timeout: 10000 }).should(
        'not.exist'
      )
    })

    it('네트워크 에러 후 재시도 버튼이 표시되어야 한다', () => {
      cy.searchUsers('test')

      cy.contains('button', /retry|try again/i, { timeout: 10000 }).should(
        'be.visible'
      )
    })

    it('재시도 버튼 클릭 시 다시 검색을 실행해야 한다', () => {
      cy.searchUsers('test')

      // 정상 응답으로 변경
      cy.interceptGitHubAPI('search-results.json')

      cy.contains('button', /retry|try again/i, { timeout: 10000 }).click()
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })
  })

  describe('서버 에러 시나리오', () => {
    beforeEach(() => {
      // 500 에러 Mock
      cy.intercept('GET', '/api/search*', {
        statusCode: 500,
        body: {
          error: 'Internal server error',
          status: 500,
        },
      }).as('serverErrorAPI')
    })

    it('서버 에러 메시지가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@serverErrorAPI')

      cy.contains(/server error|something went wrong/i).should('be.visible')
    })

    it('서버 에러 시 검색 결과가 표시되지 않아야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@serverErrorAPI')

      cy.get('[data-testid="user-card"]').should('not.exist')
    })
  })

  describe('GitHub API 에러 시나리오', () => {
    beforeEach(() => {
      // GitHub API 에러 Mock
      cy.intercept('GET', '/api/search*', {
        statusCode: 422,
        body: {
          error: 'Validation Failed',
          status: 422,
        },
      }).as('validationErrorAPI')
    })

    it('유효성 검사 에러 메시지가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@validationErrorAPI')

      cy.contains(/validation failed|invalid query/i).should('be.visible')
    })
  })

  describe('빈 검색 결과 시나리오', () => {
    beforeEach(() => {
      // 빈 결과 Mock
      cy.intercept('GET', '/api/search*', {
        statusCode: 200,
        body: {
          total_count: 0,
          incomplete_results: false,
          items: [],
          rateLimit: {
            limit: 60,
            remaining: 59,
            reset: 1699999999,
            used: 1,
          },
        },
      }).as('emptyResultsAPI')
    })

    it('빈 결과 메시지가 표시되어야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjkl')
      cy.wait('@emptyResultsAPI')

      cy.contains(/no users found|no results/i).should('be.visible')
    })

    it('빈 결과 시 사용자 카드가 표시되지 않아야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjkl')
      cy.wait('@emptyResultsAPI')

      cy.get('[data-testid="user-card"]').should('not.exist')
    })

    it('빈 결과에서 다른 검색어로 재검색할 수 있어야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjkl')
      cy.wait('@emptyResultsAPI')

      // 정상 결과로 변경
      cy.interceptGitHubAPI('search-results.json')

      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })

    it('빈 결과 시에도 필터는 계속 사용할 수 있어야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjkl')
      cy.wait('@emptyResultsAPI')

      cy.get('[data-testid="type-filter"]').click()
      cy.contains('li', 'User').click()
      cy.wait('@emptyResultsAPI')

      cy.contains(/no users found|no results/i).should('be.visible')
    })
  })

  describe('타임아웃 시나리오', () => {
    beforeEach(() => {
      // 매우 느린 응답 Mock (30초)
      cy.intercept('GET', '/api/search*', (req) => {
        req.reply((res) => {
          res.delay = 30000
        })
      }).as('slowAPI')
    })

    it('로딩 인디케이터가 장시간 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.get('[role="progressbar"]').should('be.visible')

      // 5초 후에도 여전히 로딩 중
      cy.wait(5000)
      cy.get('[role="progressbar"]').should('be.visible')
    })

    it('로딩 중에는 검색 버튼이 비활성화되어야 한다', () => {
      cy.searchUsers('test')
      cy.get('button[type="submit"]').should('be.disabled')

      cy.wait(3000)
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  describe('에러 복구 시나리오', () => {
    it('에러 후 정상 응답으로 복구되어야 한다', () => {
      // 첫 번째: 에러
      cy.intercept('GET', '/api/search*', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('errorAPI')

      cy.searchUsers('test')
      cy.wait('@errorAPI')
      cy.contains(/server error/i).should('be.visible')

      // 두 번째: 정상 응답
      cy.interceptGitHubAPI('search-results.json')

      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
      cy.contains(/server error/i).should('not.exist')
    })

    it('여러 에러를 순차적으로 처리할 수 있어야 한다', () => {
      // Rate Limit 에러
      cy.intercept('GET', '/api/search*', {
        statusCode: 429,
        body: { error: 'Rate limit exceeded' },
      }).as('rateLimitAPI')

      cy.searchUsers('test1')
      cy.wait('@rateLimitAPI')
      cy.contains(/rate limit/i).should('be.visible')

      // 네트워크 에러
      cy.intercept('GET', '/api/search*', {
        forceNetworkError: true,
      }).as('networkErrorAPI')

      cy.searchUsers('test2')
      cy.contains(/network error|failed to fetch/i, {
        timeout: 10000,
      }).should('be.visible')

      // 정상 응답
      cy.interceptGitHubAPI('search-results.json')

      cy.searchUsers('test3')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })
  })

  describe('부분적 실패 시나리오', () => {
    beforeEach(() => {
      // incomplete_results: true인 응답
      cy.intercept('GET', '/api/search*', {
        statusCode: 200,
        body: {
          total_count: 1000,
          incomplete_results: true,
          items: [
            {
              id: 1,
              login: 'partialuser',
              avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
              html_url: 'https://github.com/partialuser',
              type: 'User',
              name: 'Partial User',
              company: null,
              blog: '',
              location: null,
              email: null,
              hireable: null,
              bio: null,
              public_repos: 10,
              public_gists: 0,
              followers: 50,
              following: 20,
              created_at: '2020-01-01T00:00:00Z',
              updated_at: '2023-12-01T00:00:00Z',
            },
          ],
          rateLimit: {
            limit: 60,
            remaining: 59,
            reset: 1699999999,
            used: 1,
          },
        },
      }).as('incompleteAPI')
    })

    it('불완전한 결과 경고가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@incompleteAPI')

      cy.contains(/incomplete results|partial results/i).should('be.visible')
    })

    it('불완전한 결과에도 사용자 카드가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@incompleteAPI')

      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })
  })
})
